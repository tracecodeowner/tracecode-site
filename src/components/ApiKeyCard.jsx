import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Copy, Check, RefreshCw, Loader2, Key, Eye, EyeOff } from 'lucide-react';

export default function ApiKeyCard() {
  const { user, checkUserAuth } = useAuth();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = user?.apiKey || '';
  const referralCode = user?.referralCode || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      await base44.auth.updateMe({ apiKey: '' });
      await base44.functions.invoke('setupProfile', {});
      if (checkUserAuth) await checkUserAuth(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to regenerate');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center">
          <Key className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight">Developer API Key</h2>
          <p className="text-[10px] text-muted-foreground">Use this key to generate barcodes programmatically</p>
        </div>
      </div>

      {apiKey ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
            <code className="flex-1 text-xs font-mono text-accent break-all">
              {showKey ? apiKey : 'tc_live_••••••••••••••••••••••••••••••••'}
            </code>
            <button onClick={() => setShowKey(!showKey)} className="text-muted-foreground hover:text-foreground shrink-0">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground shrink-0">
              {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <a
              href="/api-docs"
              className="flex-1 text-center px-3 py-2 rounded-lg bg-secondary border border-border text-[11px] font-bold tracking-wider hover:border-accent/30 transition-all"
            >
              VIEW DOCS
            </a>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[11px] font-bold tracking-wider hover:border-destructive/30 hover:text-destructive disabled:opacity-50 transition-all"
            >
              {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              REGENERATE
            </button>
          </div>
          {error && <div className="text-[11px] text-destructive">{error}</div>}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground mb-3">No API key yet. Generate one to start using the API.</p>
          <GenerateKeyButton onDone={() => checkUserAuth?.(true)} />
        </div>
      )}

      {referralCode && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-[10px] text-muted-foreground tracking-widest mb-1">YOUR REFERRAL CODE</div>
          <code className="text-sm font-mono font-bold text-accent">{referralCode}</code>
        </div>
      )}
    </motion.div>
  );
}

function GenerateKeyButton({ onDone }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      await base44.functions.invoke('setupProfile', {});
      if (onDone) onDone();
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handle} disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-wider">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GENERATE API KEY'}
    </button>
  );
}