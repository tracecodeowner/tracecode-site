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
