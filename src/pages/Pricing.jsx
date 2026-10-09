import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Zap, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentMethodModal from '@/components/aamva/PaymentMethodModal';

const PACKAGES = [
  { key: 'starter', credits: 2, priceUsd: 5, perCredit: '2.50' },
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState(null);

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Credit Packages</h1>
        <p className="text-xs text-muted-foreground">
          Each barcode generation costs 1 credit. Validation is always free.
          {!isAuthenticated && ' — Login to purchase credits.'}
        </p>
        {isAuthenticated && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-accent" />
            Current balance: <span className="font-mono font-bold text-accent">{user?.credits || 0}</span> credits
          </div>
        )}
      </motion.div>

      {!isAuthenticated ? (
        <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
          <Lock className="w-10 h-10 text-accent mx-auto mb-3" />
          <div className="text-sm text-muted-foreground mb-4">Login required to purchase credits</div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-wider"
          >
            <Zap className="w-4 h-4" /> LOGIN
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={pkg.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative p-5 rounded-xl border border-accent/40 bg-accent/5 border-glow cursor-pointer hover:border-accent/60 transition-all"
              onClick={() => setSelectedPkg(pkg)}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-accent text-background text-[9px] font-bold tracking-widest">
                POPULAR
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold font-heading">${pkg.priceUsd}</div>
                <div className="text-sm text-accent font-mono mt-1">{pkg.credits} credits</div>
                <div className="text-[10px] text-muted-foreground mt-1">${pkg.perCredit} / generation</div>
              </div>
              <div className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-wider text-center hover:opacity-90">
                PURCHASE
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <PaymentMethodModal
        pkg={selectedPkg}
        open={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
      />
    </div>
  );
}