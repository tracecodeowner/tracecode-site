import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Loader2, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TRAKTEER_URL = 'http://teer.id/tracecode';

export default function PaymentMethodModal({ pkg, open, onClose }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [orderReference, setOrderReference] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setProcessing(false);
      setError(null);
      setOrderReference('');
      setCopied(false);
    }
  }, [open, pkg]);

  if (!pkg) return null;

  const handleCreateOrder = async () => {
    setProcessing(true);
    setError(null);
    setOrderReference('');
    try {
      const response = await base44.functions.invoke('createTrakteerOrder', { packageKey: pkg.key });
      const reference = response?.data?.reference;
      if (!reference) throw new Error('Server tidak mengembalikan kode order. Coba lagi.');
      setOrderReference(reference);
    } catch (requestError) {
      console.error('Gagal membuat order Trakteer:', requestError);
      setError(requestError.message || 'Order belum bisa dibuat. Coba lagi.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(orderReference);
      setCopied(true);
      setError(null);
    } catch (copyError) {
      console.error('Gagal menyalin kode order:', copyError);
      setError('Kode belum bisa disalin otomatis. Silakan pilih dan salin kode yang tampil.');
    }
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
              <span className="text-sm font-bold tracking-wider">PEMBAYARAN TRAKTEER</span>
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
                <div className="text-xs text-muted-foreground mt-2">Rp100.000 · unit “2 Barcode”</div>
              </div>

              {!orderReference ? (
                <button
                  onClick={handleCreateOrder}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-wide disabled:opacity-60"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  {processing ? 'MEMBUAT KODE ORDER...' : 'BUAT KODE & LANJUT BAYAR'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                    <div className="text-xs font-bold mb-2">Salin kode ini ke pesan dukungan Trakteer</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 select-all rounded bg-background px-3 py-2 text-sm font-mono text-accent">{orderReference}</code>
                      <button
                        onClick={handleCopyReference}
                        aria-label="Salin kode order"
                        className="rounded border border-border p-2 hover:border-accent/50"
                      >
                        {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Tempel kode persis seperti di atas pada supporter message. Jangan gunakan kode yang sama untuk order lain.
                    </p>
                  </div>
                  <a
                    href={TRAKTEER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-wide"
                  >
                    BUKA TRAKTEER <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-4 text-center text-[10px] text-muted-foreground">
                Kredit masuk otomatis setelah pembayaran dan kode order diverifikasi oleh webhook.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}