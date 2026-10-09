import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bitcoin, Wallet, ArrowRight, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// ⚠️ GANTI dengan URL Trakteer.id kamu
const TRAKTEER_URL = 'https://trakteer.id/tracecode';

export default function PaymentMethodModal({ pkg, open, onClose, onSuccess }) {
  const { user, checkUserAuth } = useAuth();
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!pkg) return null;

  const handleCrypto = async () => {
    setSelected('crypto');
    setError('Crypto payment belum tersedia. Daftar dulu di NOWPayments/CoinGate, lalu kasih API key ke saya untuk di-integrate.');
  };

  const handleTrakteer = () => {
    setSelected('trakteer');
    // Buka halaman Trakteer di tab baru — user bayar di sana
    // Setelah bayar, Trakteer webhook akan kirim notifikasi ke backend → credit otomatis masuk
    // Pass email as note/reference so webhook can identify user
    const trakteerUrl = new URL(TRAKTEER_URL);
    trakteerUrl.searchParams.set('ref', user?.email || '');
    trakteerUrl.searchParams.set('note', `${pkg.credits} credits for ${user?.email}`);
    window.open(trakteerUrl.toString(), '_blank');
    setError('Kamu akan diarahkan ke Trakteer.id untuk pembayaran. Setelah pembayaran terkonfirmasi via webhook, credit akan otomatis masuk. Invoice akan terlink dengan email Anda.');
  };

  return (
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
              <span className="text-sm font-bold tracking-wider">PILIH METODE PEMBAYARAN</span>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {/* Package summary */}
              <div className="p-4 rounded-lg bg-secondary/30 border border-border mb-5 text-center">
                <div className="text-3xl font-bold font-heading text-accent">${pkg.priceUsd}</div>
                <div className="text-sm text-muted-foreground mt-1">{pkg.credits} credits</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">${pkg.perCredit} / generation</div>
              </div>

              <div className="space-y-3">
                {/* Crypto */}
                <button
                  onClick={handleCrypto}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border border-border bg-secondary/30 hover:border-accent/30 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
                    <Bitcoin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">Crypto</div>
                    <div className="text-[10px] text-muted-foreground">BTC, USDT, ETH, dll — belum terdaftar</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>

                {/* Trakteer.id */}
                <button
                  onClick={handleTrakteer}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border border-border bg-secondary/30 hover:border-accent/30 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">Indonesian Transaction</div>
                    <div className="text-[10px] text-muted-foreground">Trakteer.id — QRIS, GoPay, OVO, Bank Transfer</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-4 text-center text-[10px] text-muted-foreground">
                Credit akan ditambahkan otomatis setelah pembayaran terkonfirmasi.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}