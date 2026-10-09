import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Copy, Check, DollarSign, Users, CreditCard, TrendingUp, Loader2, ArrowDownToLine } from 'lucide-react';

export default function ReferralCard() {
  const { user, checkUserAuth } = useAuth();
  const [copied, setCopied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState(null);
  const [error, setError] = useState(null);

  const referralCode = user?.referralCode || '';
  const referralLink = referralCode ? `${window.location.origin}/register?ref=${referralCode}` : '';
  const balance = user?.referralBalance || 0;
  const percent = user?.referralPercent || 10;
  const count = user?.referralCount || 0;
  const payments = user?.referralPayments || 0;
  const earned = user?.referralEarned || 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    if (balance < 0.1) return;
    setWithdrawing(true);
    setError(null);
    setWithdrawResult(null);
    try {
      const res = await base44.functions.invoke('withdrawReferral', { all: true });
      setWithdrawResult(res.data);
      if (checkUserAuth) await checkUserAuth(true);
      setTimeout(() => setWithdrawResult(null), 5000);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const creditsIfWithdrawn = Math.floor(balance * 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Users className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight">Referral Program</h2>
          <p className="text-[10px] text-muted-foreground">Earn {percent}% commission on every referral's purchase</p>
        </div>
      </div>

      {/* Referral balance */}
      <div className="rounded-lg bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-muted-foreground tracking-widest mb-1">REFERRAL BALANCE</div>
            <div className="text-3xl font-bold font-heading text-accent text-glow">
              ${balance.toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || balance < 0.1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-wider hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {withdrawing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowDownToLine className="w-3.5 h-3.5" />}
            WITHDRAW
          </button>
        </div>
        {balance >= 0.1 && (
          <div className="mt-2 text-[10px] text-muted-foreground">
            Withdraw to internal balance: <span className="text-accent font-mono font-bold">{creditsIfWithdrawn} credits</span> ($1 = 10 credits)
          </div>
        )}
        {withdrawResult && (
          <div className="mt-2 text-[11px] text-accent flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Withdrew ${withdrawResult.withdrawnUsd.toFixed(2)} → {withdrawResult.creditsAdded} credits
          </div>
        )}
        {error && <div className="mt-2 text-[11px] text-destructive">{error}</div>}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard icon={Users} label="REFERRALS" value={count} />
        <StatCard icon={CreditCard} label="PAYMENTS" value={payments} />
        <StatCard icon={TrendingUp} label="EARNED" value={`$${earned.toFixed(2)}`} />
      </div>

      {/* Referral link */}
      {referralLink && (
        <div>
          <div className="text-[10px] text-muted-foreground tracking-widest mb-2">YOUR REFERRAL LINK</div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
            <code className="flex-1 text-[11px] font-mono text-muted-foreground truncate">{referralLink}</code>
            <button onClick={handleCopyLink} className="text-muted-foreground hover:text-foreground shrink-0">
              {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">
            Share this link. When someone registers and makes a purchase, you earn {percent}% of their payment.
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border text-center">
      <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
      <div className="text-lg font-bold font-mono">{value}</div>
      <div className="text-[9px] text-muted-foreground tracking-widest">{label}</div>
    </div>
  );
}