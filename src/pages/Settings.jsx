import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { JURISDICTIONS, PROFILE_LIST } from '@/lib/aamva';
import ApiKeyCard from '@/components/ApiKeyCard';
import ReferralCard from '@/components/ReferralCard';
import { Settings as SettingsIcon, Save, Loader2, Check } from 'lucide-react';

export default function Settings() {
  const { user, checkUserAuth } = useAuth();
  const [form, setForm] = useState({
    defaultJurisdiction: 'NV',
    defaultProfile: 'scandit',
    defaultEclevel: 5,
    defaultScale: 3,
    storeHistory: true,
    storeRawPayloads: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        defaultJurisdiction: user.defaultJurisdiction || 'NV',
        defaultProfile: user.defaultProfile || 'scandit',
        defaultEclevel: user.defaultEclevel ?? 5,
        defaultScale: user.defaultScale ?? 3,
        storeHistory: user.storeHistory ?? true,
        storeRawPayloads: user.storeRawPayloads ?? false,
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      if (checkUserAuth) checkUserAuth();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="p-6 max-w-3xl mx-auto pb-20">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Profile</h1>
        <p className="text-xs text-muted-foreground">Manage your API key, referral program, and generation settings.</p>
      </motion.div>

      <div className="space-y-4 mb-6">
        <ApiKeyCard />
        <ReferralCard />
      </div>

      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-6">
        {/* Default jurisdiction */}
        <div>
          <label className="text-xs font-medium block mb-2">Default Jurisdiction</label>
          <select
            value={form.defaultJurisdiction}
            onChange={(e) => update('defaultJurisdiction', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-secondary/30 border border-border rounded-lg focus:border-accent/50 outline-none"
          >
            {JURISDICTIONS.map((j) => (
              <option key={j.code} value={j.code}>{j.name} ({j.code}) — IIN {j.iin}</option>
            ))}
          </select>
        </div>

        {/* Default profile */}
        <div>
          <label className="text-xs font-medium block mb-2">Default Profile</label>
          <select
            value={form.defaultProfile}
            onChange={(e) => update('defaultProfile', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-secondary/30 border border-border rounded-lg focus:border-accent/50 outline-none"
          >
            {PROFILE_LIST.map((p) => (
              <option key={p.key} value={p.key}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Error correction */}
          <div>
            <label className="text-xs font-medium block mb-2">PDF417 Error Correction Level</label>
            <select
              value={form.defaultEclevel}
              onChange={(e) => update('defaultEclevel', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-secondary/30 border border-border rounded-lg focus:border-accent/50 outline-none"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>

          {/* Barcode scale */}
          <div>
            <label className="text-xs font-medium block mb-2">Barcode Scale</label>
            <select
              value={form.defaultScale}
              onChange={(e) => update('defaultScale', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-secondary/30 border border-border rounded-lg focus:border-accent/50 outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((s) => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.storeHistory}
              onChange={(e) => update('storeHistory', e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <div>
              <div className="text-xs font-medium">Store generation history</div>
              <div className="text-[10px] text-muted-foreground">Save technical metadata for each generation</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.storeRawPayloads}
              onChange={(e) => update('storeRawPayloads', e.target.checked)}
              className="w-4 h-4 accent-accent"
            />
            <div>
              <div className="text-xs font-medium">Store raw payloads</div>
              <div className="text-[10px] text-destructive/70">⚠ Off by default — stores complete payload data including field values</div>
            </div>
          </label>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-wider hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'SAVING...' : saved ? 'SAVED' : 'SAVE SETTINGS'}
        </button>
      </div>
    </div>
  );
}