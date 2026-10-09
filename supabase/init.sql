-- Supabase initialization SQL for aamva-tracecode
-- Run this in your Supabase SQL editor to create the necessary tables for the app.

-- Users table (stores profile & credits)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text,
  role text DEFAULT 'anon',
  status text DEFAULT 'active',
  credits integer DEFAULT 0,
  apikey text,
  referralcode text,
  referredby text,
  referralbalance numeric DEFAULT 0,
  referralcount integer DEFAULT 0,
  referralpayments integer DEFAULT 0,
  referralearned numeric DEFAULT 0,
  referralpercent integer DEFAULT 10,
  defaultjurisdiction text,
  defaultprofile text,
  defaulteclevel integer DEFAULT 5,
  defaultscale integer DEFAULT 3,
  storehistory boolean DEFAULT true,
  storerawpayloads boolean DEFAULT false,
  lastlogindate timestamptz,
  lastip text,
  device text,
  browser text,
  country text,
  created_at timestamptz DEFAULT now()
);

-- Admin-only credit adjustment. The role check and update run in the database
-- so clients cannot grant themselves credits by bypassing the admin UI.
CREATE OR REPLACE FUNCTION public.admin_adjust_user_credits(
  p_user_id uuid,
  p_delta integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  new_balance integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  IF p_user_id IS NULL OR p_delta IS NULL OR p_delta = 0 THEN
    RAISE EXCEPTION 'A user and non-zero credit adjustment are required'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.users
  SET credits = GREATEST(COALESCE(credits, 0) + p_delta, 0)
  WHERE id = p_user_id
  RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = 'P0002';
  END IF;

  RETURN new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_adjust_user_credits(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_adjust_user_credits(uuid, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_user_credits(uuid, integer) TO authenticated;

-- Trakteer payment orders and a credit ledger. Only authenticated users can
-- read their own records; order creation and settlement run through Edge Functions.
CREATE TABLE IF NOT EXISTS public.trakteer_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  package_key text NOT NULL CHECK (package_key = 'starter'),
  unit_name text NOT NULL CHECK (unit_name = '2 Barcode'),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity = 1),
  amount_idr integer NOT NULL DEFAULT 100000 CHECK (amount_idr = 100000),
  amount_usd numeric(10, 2) NOT NULL DEFAULT 5.00 CHECK (amount_usd = 5.00),
  credits integer NOT NULL DEFAULT 2 CHECK (credits = 2),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  trakteer_transaction_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.trakteer_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own Trakteer orders" ON public.trakteer_orders;
CREATE POLICY "Users can read their own Trakteer orders"
  ON public.trakteer_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
GRANT SELECT ON public.trakteer_orders TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.trakteer_orders FROM anon, authenticated;
GRANT ALL ON public.trakteer_orders TO service_role;

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('topup', 'usage', 'refund', 'admin_adjustment')),
  credits integer NOT NULL,
  remaining_balance integer NOT NULL,
  amount_usd numeric(10, 2),
  amount_idr integer,
  provider text,
  external_id text UNIQUE,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users can read their own credit transactions"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
GRANT SELECT ON public.credit_transactions TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.credit_transactions FROM anon, authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

CREATE OR REPLACE FUNCTION public.process_trakteer_payment(
  p_reference text,
  p_transaction_id text,
  p_unit text,
  p_quantity integer,
  p_price integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  payment_order public.trakteer_orders%ROWTYPE;
  new_balance integer;
BEGIN
  SELECT *
  INTO payment_order
  FROM public.trakteer_orders
  WHERE reference = p_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'unknown_order');
  END IF;

  IF payment_order.status = 'completed' THEN
    IF payment_order.trakteer_transaction_id = p_transaction_id THEN
      RETURN jsonb_build_object('status', 'already_processed');
    END IF;
    RETURN jsonb_build_object('status', 'order_already_paid');
  END IF;

  IF p_unit <> payment_order.unit_name
    OR p_quantity <> payment_order.quantity
    OR p_price <> payment_order.amount_idr
  THEN
    RETURN jsonb_build_object('status', 'payment_mismatch');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.trakteer_orders
    WHERE trakteer_transaction_id = p_transaction_id
  ) THEN
    RETURN jsonb_build_object('status', 'duplicate_transaction');
  END IF;

  UPDATE public.users
  SET credits = COALESCE(credits, 0) + payment_order.credits
  WHERE id = payment_order.user_id
  RETURNING credits INTO new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order user does not exist';
  END IF;

  UPDATE public.trakteer_orders
  SET status = 'completed',
      trakteer_transaction_id = p_transaction_id,
      completed_at = now()
  WHERE id = payment_order.id;

  INSERT INTO public.credit_transactions (
    user_id, action, credits, remaining_balance, amount_usd, amount_idr,
    provider, external_id, description
  )
  VALUES (
    payment_order.user_id, 'topup', payment_order.credits, new_balance,
    payment_order.amount_usd, payment_order.amount_idr, 'trakteer',
    p_transaction_id, 'Trakteer top-up: 2 credits'
  );

  RETURN jsonb_build_object('status', 'processed', 'remaining_balance', new_balance);
END;
$$;

REVOKE ALL ON FUNCTION public.process_trakteer_payment(text, text, text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_trakteer_payment(text, text, text, integer, integer) TO service_role;

-- Login tracking (optional)
CREATE TABLE IF NOT EXISTS public.logins (
  id bigserial PRIMARY KEY,
  user_id uuid,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Generation history (optional)
CREATE TABLE IF NOT EXISTS public.generations (
  id bigserial PRIMARY KEY,
  user_id uuid,
  payload text,
  header jsonb,
  parsed_fields jsonb,
  stats jsonb,
  created_at timestamptz DEFAULT now()
);

-- Referrals table (optional)
CREATE TABLE IF NOT EXISTS public.referrals (
  id bigserial PRIMARY KEY,
  referrer_id uuid,
  referred_id uuid,
  code text,
  credited boolean DEFAULT false,
  amount numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
