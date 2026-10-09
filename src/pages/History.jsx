import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { History as HistoryIcon, Loader2, Receipt, Barcode, ArrowDown, ArrowUp } from 'lucide-react';

export default function History() {
  const [tab, setTab] = useState('generations');
  const [generations, setGenerations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.GenerationHistory.list('-created_date', 50).catch(() => []),
      base44.entities.CreditTransaction.list('-created_date', 50).catch(() => []),
    ]).then(([gen, txn]) => {
      setGenerations(gen || []);
      setTransactions(txn || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">History</h1>
        <p className="text-xs text-muted-foreground">Generation logs and credit transaction records.</p>
      </motion.div>

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab('generations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
            tab === 'generations' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-muted-foreground border border-border'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" /> GENERATIONS
        </button>
        <button
          onClick={() => setTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
            tab === 'transactions' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-muted-foreground border border-border'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" /> TRANSACTIONS
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : tab === 'generations' ? (
        generations.length === 0 ? (
          <EmptyState icon={HistoryIcon} text="No generations yet. Create your first barcode." />
        ) : (
          <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                    <th className="p-3">DATE</th>
                    <th className="p-3">JURISDICTION</th>
                    <th className="p-3">PROFILE</th>
                    <th className="p-3">IIN</th>
                    <th className="p-3">OFFSET</th>
                    <th className="p-3">SUBFILE LEN</th>
                    <th className="p-3">TOTAL LEN</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {generations.map((r, i) => (
                    <motion.tr key={r.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 hover:bg-secondary/20">
                      <td className="p-3 font-mono text-muted-foreground">{new Date(r.created_date).toLocaleString()}</td>
                      <td className="p-3 font-medium">{r.jurisdictionName || r.jurisdiction}</td>
                      <td className="p-3 font-mono text-muted-foreground">{r.profile}</td>
                      <td className="p-3 font-mono text-accent">{r.iin}</td>
                      <td className="p-3 font-mono">{String(r.offset || 0).padStart(4, '0')}</td>
                      <td className="p-3 font-mono">{String(r.subfileLength || 0).padStart(4, '0')}</td>
                      <td className="p-3 font-mono">{r.payloadLength || 0}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${r.barcodeStatus === 'generated' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                          {r.barcodeStatus === 'generated' ? '✓ OK' : '✗ FAIL'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : transactions.length === 0 ? (
        <EmptyState icon={Receipt} text="No transactions yet. Purchase credits to get started." />
      ) : (
        <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                  <th className="p-3">TIMESTAMP</th>
                  <th className="p-3">ACTION</th>
                  <th className="p-3">CREDITS</th>
                  <th className="p-3">REMAINING</th>
                  <th className="p-3">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <motion.tr key={t.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="p-3 font-mono text-muted-foreground">{new Date(t.created_date).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${t.action === 'topup' ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-secondary text-muted-foreground border border-border'}`}>
                        {t.action === 'topup' ? 'TOP UP' : t.action === 'usage' ? 'USAGE' : t.action.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <span className={`flex items-center gap-1 ${t.credits > 0 ? 'text-accent' : 'text-destructive'}`}>
                        {t.credits > 0 ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                        {t.credits > 0 ? '+' : ''}{t.credits}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-accent">{t.remainingBalance}</td>
                    <td className="p-3 text-muted-foreground max-w-xs truncate">{t.description}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-12 text-center">
      <Icon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <div className="text-sm text-muted-foreground">{text}</div>
    </div>
  );
}