import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import PaymentMethodModal from '@/components/aamva/PaymentMethodModal';

const PACKAGES = [
  { key: 'starter', credits: 2, priceUsd: 5, perCredit: '2.50' },
];

export default function TopUpModal({ open, onClose }) {
  const { user } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState(null);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-border bg-card overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-sm font-bold tracking-wider">TOP UP CREDITS</span>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <div className="text-[11px] text-muted-foreground mb-4">
                  Current balance: <span className="text-accent font-bold font-mono">{user?.credits || 0}</span> credits
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {PACKAGES.map((pkg) => (
                    <button
                      key={pkg.key}
                      onClick={() => setSelectedPkg(pkg)}
                      className="relative p-4 rounded-lg border border-accent/40 bg-accent/5 text-left transition-all hover:border-accent/60"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-heading text-accent">${pkg.priceUsd}</span>
                        <span className="text-xs text-muted-foreground font-mono">{pkg.credits} credits</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">${pkg.perCredit} / generation</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentMethodModal
        pkg={selectedPkg}
        open={!!selectedPkg}
        onClose={() => setSelectedPkg(null)}
      />
    </>
  );
}