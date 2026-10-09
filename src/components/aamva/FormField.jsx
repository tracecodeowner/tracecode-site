import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Info, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { validateField, normalizeValue, generateTestValue } from '@/lib/aamva';

export default function FormField({ field, value, onChange, jurisdictionCode }) {
  const [showHelp, setShowHelp] = useState(false);
  const [touched, setTouched] = useState(false);

  const validation = useMemo(
    () => (touched || value ? validateField(field, value) : { valid: true, error: null }),
    [field, value, touched]
  );

  const displayValue = useMemo(() => {
    if (field.type === 'date' && value) {
      const digits = String(value).replace(/[^0-9]/g, '');
      if (digits.length >= 6) {
        return `${digits.substring(0, 2)}/${digits.substring(2, 4)}/${digits.substring(4, 8)}`;
      }
      return digits;
    }
    return value || '';
  }, [value, field.type]);

  const borderClass = validation.valid
    ? value
      ? 'border-accent/50'
      : 'border-border'
    : 'border-destructive';

  const StatusIcon = !validation.valid
    ? AlertCircle
    : value
    ? Check
    : null;

  const handleCalculate = () => {
    const testVal = generateTestValue(field.fieldId, jurisdictionCode);
    if (testVal) {
      onChange(field.name, testVal);
      setTouched(true);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-foreground/90 flex items-center gap-1.5">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </label>
        <span className="text-[10px] text-muted-foreground font-mono px-1.5 py-0.5 rounded bg-secondary/50">{field.fieldId}</span>
        {field.helpText && (
          <button onMouseEnter={() => setShowHelp(true)} onMouseLeave={() => setShowHelp(false)} onClick={() => setShowHelp(!showHelp)} className="text-muted-foreground hover:text-accent">
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
        {field.calculator && (
          <button onClick={handleCalculate} className="text-muted-foreground hover:text-accent ml-auto" title="Generate test value">
            <Calculator className="w-3.5 h-3.5" />
          </button>
        )}
        <AnimatePresence>
          {showHelp && field.helpText && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 mt-1 p-2.5 rounded-lg bg-popover border border-border text-[11px] text-muted-foreground shadow-xl max-w-xs"
            >
              {field.helpText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {field.type === 'select' ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(field.name, e.target.value)}
          onBlur={() => setTouched(true)}
          className={`w-full px-3 py-2 text-sm bg-secondary/30 border rounded-lg focus:border-accent/50 outline-none transition-colors ${borderClass}`}
        >
          <option value="">— Select —</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({opt.value})
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={displayValue}
            placeholder={field.placeholder || field.type === 'date' ? 'MM/DD/YYYY' : field.helpText || ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/\//g, '');
              onChange(field.name, raw);
            }}
            onBlur={() => setTouched(true)}
            maxLength={field.maxLength}
            className={`w-full px-3 py-2 text-sm bg-secondary/30 border rounded-lg focus:border-accent/50 outline-none transition-all font-mono ${borderClass} ${field.type === 'date' ? 'tracking-wider' : ''}`}
          />
          {StatusIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <StatusIcon className={`w-4 h-4 ${validation.valid ? 'text-accent' : 'text-destructive'}`} />
            </div>
          )}
        </div>
      )}

      {/* Unit conversion hints */}
      {field.fieldId === 'DAU' && value && (
        <div className="text-[10px] text-muted-foreground">{value} in ≈ {Math.round(value * 2.54)} cm</div>
      )}
      {field.fieldId === 'DDB' && value && (
        <div className="text-[10px] text-muted-foreground">{value} lb ≈ {Math.round(value * 0.453)} kg</div>
      )}

      {/* Error message */}
      <AnimatePresence>
        {!validation.valid && validation.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 text-[11px] text-destructive"
          >
            <AlertCircle className="w-3 h-3 shrink-0" />
            {validation.error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}