import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Info } from 'lucide-react';
import { JURISDICTIONS } from '@/lib/aamva';

export default function JurisdictionSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = useMemo(() => JURISDICTIONS.find((j) => j.code === value), [value]);

  const filtered = useMemo(
    () => JURISDICTIONS.filter((j) => j.name.toLowerCase().includes(search.toLowerCase()) || j.code.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondary/50 border border-border hover:border-accent/30 transition-all min-w-[200px]"
      >
        <MapPin className="w-4 h-4 text-accent" />
        <div className="text-left flex-1">
          <div className="text-[10px] text-muted-foreground tracking-widest">JURISDICTION</div>
          <div className="text-sm font-medium">{selected?.name || 'Select...'}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 w-80 rounded-lg border border-border bg-popover shadow-2xl overflow-hidden"
            >
              <div className="p-2 border-b border-border">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search states..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-secondary/50 border border-border rounded focus:border-accent/50 outline-none"
                />
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {filtered.map((jur) => (
                  <button
                    key={jur.code}
                    onClick={() => {
                      onChange(jur.code);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-secondary transition-colors ${
                      jur.code === value ? 'bg-accent/10 text-accent' : ''
                    }`}
                  >
                    <span className="font-medium">{jur.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{jur.iin}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}