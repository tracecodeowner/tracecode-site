import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Binary, List, Grid } from 'lucide-react';
import { toHex, toEscaped, toVisual, getByteMap, parsePayload } from '@/lib/aamva';

const TABS = [
  { key: 'raw', label: 'Raw', icon: FileText },
  { key: 'escaped', label: 'Escaped', icon: FileText },
  { key: 'hex', label: 'Hex', icon: Binary },
  { key: 'parsed', label: 'Parsed Fields', icon: List },
  { key: 'bytemap', label: 'Byte Map', icon: Grid },
];

export default function Inspector({ payload, onClose }) {
  const [tab, setTab] = useState('raw');

  const parsed = useMemo(() => parsePayload(payload), [payload]);
  const byteMap = useMemo(() => getByteMap(payload), [payload]);

  return (
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
        className="w-full max-w-4xl max-h-[85vh] rounded-xl border border-border bg-card flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="text-sm font-bold tracking-wider">PAYLOAD INSPECTOR</div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 p-3 border-b border-border overflow-x-auto scrollbar-thin">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  tab === t.key ? 'bg-accent/10 text-accent border border-accent/30' : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin p-4">
          {tab === 'raw' && (
            <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground/90 leading-relaxed">{toVisual(payload)}</pre>
          )}
          {tab === 'escaped' && (
            <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground/90 leading-relaxed">{toEscaped(payload)}</pre>
          )}
          {tab === 'hex' && (
            <div className="space-y-1">
              {toHex(payload).split(' ').reduce((acc, byte, i) => {
                if (i % 16 === 0) acc.push([]);
                acc[acc.length - 1].push(byte);
                return acc;
              }, []).map((row, i) => (
                <div key={i} className="flex gap-3 font-mono text-xs">
                  <span className="text-muted-foreground w-16">{(i * 16).toString(16).padStart(8, '0')}</span>
                  <span className="text-accent">{row.join(' ')}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'parsed' && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                  <th className="pb-2 pr-3">FIELD ID</th>
                  <th className="pb-2 pr-3">NAME</th>
                  <th className="pb-2">VALUE</th>
                </tr>
              </thead>
              <tbody>
                {parsed.fields?.map((f, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1.5 pr-3 font-mono text-accent">{f.fieldId}</td>
                    <td className="py-1.5 pr-3">{f.name}</td>
                    <td className="py-1.5 font-mono">{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'bytemap' && (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                  <th className="pb-2 pr-3">START</th>
                  <th className="pb-2 pr-3">END</th>
                  <th className="pb-2 pr-3">LEN</th>
                  <th className="pb-2">FIELD</th>
                </tr>
              </thead>
              <tbody>
                {byteMap.map((item, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-1.5 pr-3 font-mono text-accent">{String(item.start).padStart(4, '0')}</td>
                    <td className="py-1.5 pr-3 font-mono">{String(item.end).padStart(4, '0')}</td>
                    <td className="py-1.5 pr-3 font-mono">{item.length}</td>
                    <td className="py-1.5">{item.field}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}