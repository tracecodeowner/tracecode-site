import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, Search, X, FileText, ShieldCheck } from 'lucide-react';
import Inspector from '@/components/aamva/Inspector';
import { useAuth } from '@/lib/AuthContext';
import { toVisual } from '@/lib/aamva';

export default function BarcodeResult({ result, onDownload }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [copied, setCopied] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Barcode preview */}
      <div className="rounded-xl border border-border bg-card p-6 border-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${
              result.barcodeStatus === 'generated'
                ? 'bg-accent/10 border border-accent/30 text-accent'
                : 'bg-destructive/10 border border-destructive/30 text-destructive'
            }`}>
              {result.barcodeStatus === 'generated' ? '✓ VALID' : '✗ INVALID'}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">{result.stats.totalPayloadLength} bytes</div>
        </div>

        <div className="bg-white rounded-lg p-4 flex justify-center">
          {result.barcodeDataURL ? (
            <img src={result.barcodeDataURL} alt="PDF417 Barcode" className="max-w-full" />
          ) : (
            <div className="w-full h-32 flex items-center justify-center text-gray-400 text-sm">Generating barcode...</div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => onDownload()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-wider hover:opacity-90"
          >
            <Download className="w-3.5 h-3.5" />
            DOWNLOAD PNG
          </button>
          {isAdmin && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-bold tracking-wider hover:border-accent/30"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'COPY PAYLOAD'}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all ${
                showRaw ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-secondary border border-border hover:border-accent/30'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {showRaw ? 'HIDE RAW' : 'SHOW RAW'}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowInspector(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-bold tracking-wider hover:border-accent/30"
            >
              <Search className="w-3.5 h-3.5" />
              INSPECT
            </button>
          )}
        </div>

        <AnimatePresence>
          {showRaw && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <pre className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border text-[11px] font-mono whitespace-pre-wrap break-all text-foreground/80 max-h-48 overflow-y-auto scrollbar-thin">
                {toVisual(result.payload)}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Technical info */}
      {isAdmin && (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-[10px] text-muted-foreground tracking-widest mb-3">TECHNICAL INFORMATION</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'IIN', value: result.header.iin },
            { label: 'AAMVA VERSION', value: result.header.aamvaVersion },
            { label: 'JURISDICTION VER', value: result.header.jurisdictionVersion },
            { label: 'ENTRIES', value: result.header.numberOfEntries },
            { label: 'SUBFILE TYPE', value: 'DL' },
            { label: 'OFFSET', value: String(result.stats.dlOffset).padStart(4, '0') },
            { label: 'SUBFILE LENGTH', value: String(result.stats.dlSubfileLength).padStart(4, '0') },
            { label: 'TOTAL LENGTH', value: String(result.stats.totalPayloadLength).padStart(4, '0') },
          ].map((item) => (
            <div key={item.label} className="p-2.5 rounded-lg bg-secondary/30 border border-border">
              <div className="text-[9px] text-muted-foreground tracking-widest">{item.label}</div>
              <div className="font-mono font-bold mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Parsed fields table */}
      {isAdmin && (
      <div className="rounded-xl border border-border bg-card p-5 overflow-hidden">
        <div className="text-[10px] text-muted-foreground tracking-widest mb-3">PARSED FIELDS</div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                <th className="pb-2 pr-3">FIELD ID</th>
                <th className="pb-2 pr-3">FIELD NAME</th>
                <th className="pb-2 pr-3">VALUE</th>
                <th className="pb-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {result.parsedFields?.map((field, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-2 pr-3 font-mono text-accent">{field.fieldId}</td>
                  <td className="py-2 pr-3">{field.name}</td>
                  <td className="py-2 pr-3 font-mono max-w-xs truncate">{field.value}</td>
                  <td className="py-2 text-accent">✓ VALID</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <AnimatePresence>
        {showInspector && (
          <Inspector payload={result.payload} onClose={() => setShowInspector(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}