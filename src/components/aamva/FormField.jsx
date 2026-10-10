import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Info, Check, AlertCircle } from 'lucide-react';
import { calculateField, validateField, generateTestValue } from '@/lib/aamva';

export default function FormField({ field, value, onChange, jurisdictionCode, formData = {} }) {
  const [showHelp, setShowHelp] = useState(false);
  const [touched, setTouched] = useState(false);
  const [calculationError, setCalculationError] = useState('');

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
    const fieldId = field.aamvaFieldId || field.fieldId;
    if (fieldId === 'DCF' || fieldId === 'DCK') {
      const result = calculateField(
        jurisdictionCode,
        fieldId === 'DCF' ? 'DD' : 'ICN',
        formData
      );
      if ('error' in result) {
        setCalculationError(result.error);
        return;
      }
      setCalculationError('');
      onChange(field.name, result.value);
      for (const [relatedField, relatedValue] of Object.entries(result.related || {})) {
        onChange(relatedField === 'DD' ? 'dd' : 'icn', relatedValue);
      }
      setTouched(true);
      return;
    }

    setCalculationError('');
    let testVal;
    if (fieldId === 'DCE') {
      testVal = generateTestValue(fieldId, jurisdictionCode, formData);
    } else if (field.autoFillValue !== undefined) {
      testVal = field.autoFillValue;
    } else if (field.options?.length) {
      const options = field.options.filter((option) => option.value !== '');
      testVal = options[Math.floor(Math.random() * options.length)]?.value;
    } else if (field.notEncoded) {
      testVal = field.placeholder || '';
    } else {
      testVal = generateTestValue(fieldId, jurisdictionCode, formData);
    }
    if (testVal !== undefined && testVal !== null && testVal !== '') {
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
        <span
          className="text-[10px] text-muted-foreground font-mono px-1.5 py-0.5 rounded bg-secondary/50"
          title={field.notEncoded ? 'Source field is not encoded because it has no standard AAMVA data-element mapping.' : undefined}
        >
          {field.aamvaFieldId || field.sourceName || field.fieldId}
        </span>
        {field.helpText && (
          <span
            className="relative inline-flex"
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
          >
            <button
              type="button"
              aria-label={`Help for ${field.label}`}
              aria-describedby={showHelp ? `${field.fieldId}-help` : undefined}
              aria-expanded={showHelp}
              onFocus={() => setShowHelp(true)}
              onBlur={() => setShowHelp(false)}
              onClick={() => setShowHelp((visible) => !visible)}
              className="text-muted-foreground hover:text-accent focus-visible:text-accent"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  id={`${field.fieldId}-help`}
                  role="tooltip"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-50 top-full left-0 mt-1 p-2.5 rounded-lg bg-popover border border-border text-[11px] text-muted-foreground shadow-xl max-w-xs w-max"
                >
                  {field.helpText}
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        )}
        {field.calculator && (
          <button
            type="button"
            onClick={handleCalculate}
            className="text-muted-foreground hover:text-accent ml-auto"
            title="Generate test value"
            aria-label={`Calculate ${field.label}`}
          >
            <Calculator className="w-3.5 h-3.5" />
          </button>
        )}
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
            placeholder={field.placeholder || (field.type === 'date' ? 'MM/DD/YYYY' : '')}
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

      {calculationError && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-center gap-1.5 text-[11px] text-destructive"
        >
          <AlertCircle className="w-3 h-3 shrink-0" />
          {calculationError}
        </motion.div>
      )}

      {/* Unit conversion hints */}
      {field.fieldId === 'DAU' && value && (
        <div className="text-[10px] text-muted-foreground">{value} in ≈ {Math.round(value * 2.54)} cm</div>
      )}
      {field.fieldId === 'DAW' && value && (
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