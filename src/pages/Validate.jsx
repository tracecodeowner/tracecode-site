import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertCircle, AlertTriangle, ScanLine, Loader2 } from 'lucide-react';
import { validatePayload, unescapePayload } from '@/lib/aamva';

export default function Validate() {
  const location = useLocation();
  const [payload, setPayload] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.payload) {
      setPayload(location.state.payload);
    }
  }, [location.state]);

  const handleValidate = () => {
    if (!payload.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const raw = unescapePayload(payload);
      setResult(validatePayload(raw));
      setLoading(false);
    }, 300);
  };

  const handleClear = () => {
    setPayload('');
    setResult(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Validate Payload</h1>
        <p className="text-xs text-muted-foreground">Paste a raw AAMVA PDF417 payload to validate its structure, offsets, and fields. Free — no credits required.</p>
      </motion.div>

      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="@\nANSI 6360491000\nDL00310222\nDL\x1eDAQ...\x1eDCS...\r"
          className="w-full h-48 px-4 py-3 text-xs font-mono bg-secondary/30 border border-border rounded-lg focus:border-accent/50 outline-none resize-y scrollbar-thin"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleValidate}
            disabled={loading || !payload.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-wider hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
            VALIDATE
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            CLEAR
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Status banner */}
            <div className={`rounded-xl border p-5 flex items-center gap-4 ${
              result.valid
                ? 'border-accent/30 bg-accent/5'
                : 'border-destructive/30 bg-destructive/5'
            }`}>
              {result.valid ? (
                <ShieldCheck className="w-8 h-8 text-accent" />
              ) : (
                <ShieldAlert className="w-8 h-8 text-destructive" />
              )}
              <div>
                <div className={`text-lg font-bold tracking-wider ${result.valid ? 'text-accent' : 'text-destructive'}`}>
                  {result.valid ? 'VALID PAYLOAD' : 'INVALID PAYLOAD'}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total length: {result.totalLength} bytes · {result.errors.length} errors · {result.warnings.length} warnings
                </div>
              </div>
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="text-[10px] text-destructive tracking-widest font-bold mb-2">ERRORS</div>
                <div className="space-y-2">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-destructive">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
                <div className="text-[10px] text-yellow-500 tracking-widest font-bold mb-2">WARNINGS</div>
                <div className="space-y-2">
                  {result.warnings.map((warn, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-yellow-500">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      {warn}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Header info */}
            {result.header && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-[10px] text-muted-foreground tracking-widest mb-3">PARSED HEADER</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'FILE TYPE', value: result.header.fileType },
                    { label: 'IIN', value: result.header.iin },
                    { label: 'AAMVA VERSION', value: result.header.aamvaVersion },
                    { label: 'JURISDICTION VER', value: result.header.jurisdictionVersion },
                    { label: 'ENTRIES', value: result.header.numberOfEntries },
                    { label: 'TOTAL LENGTH', value: result.totalLength },
                  ].map((item) => (
                    <div key={item.label} className="p-2.5 rounded-lg bg-secondary/30 border border-border">
                      <div className="text-[9px] text-muted-foreground tracking-widest">{item.label}</div>
                      <div className="font-mono font-bold mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subfiles */}
            {result.subfiles.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-[10px] text-muted-foreground tracking-widest mb-3">SUBFILES</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                      <th className="pb-2 pr-3">TYPE</th>
                      <th className="pb-2 pr-3">OFFSET</th>
                      <th className="pb-2 pr-3">LENGTH</th>
                      <th className="pb-2">FIELDS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.subfiles.map((sf, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-3 font-mono text-accent">{sf.type}</td>
                        <td className="py-2 pr-3 font-mono">{String(sf.offset).padStart(4, '0')}</td>
                        <td className="py-2 pr-3 font-mono">{String(sf.length).padStart(4, '0')}</td>
                        <td className="py-2 font-mono">{sf.fields?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Parsed fields */}
            {result.fields.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-[10px] text-muted-foreground tracking-widest mb-3">PARSED FIELDS</div>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                        <th className="pb-2 pr-3">FIELD ID</th>
                        <th className="pb-2 pr-3">NAME</th>
                        <th className="pb-2">VALUE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.fields.map((f, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="py-2 pr-3 font-mono text-accent">{f.fieldId}</td>
                          <td className="py-2 pr-3">{f.name}</td>
                          <td className="py-2 font-mono">{f.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}