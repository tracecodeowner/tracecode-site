import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getJurisdiction, getFields, getHeaderDisplay, validateForm } from '@/lib/aamva';
import { generateBarcodeDataURL, downloadBarcodePNG } from '@/lib/pdf417';
import { generateTestValue } from '@/lib/aamva';
import JurisdictionSelector from '@/components/aamva/JurisdictionSelector';
import ProfileSelector from '@/components/aamva/ProfileSelector';
import FormField from '@/components/aamva/FormField';
import BarcodeResult from '@/components/aamva/BarcodeResult';
import TopUpModal from '@/components/aamva/TopUpModal';
import LoginPromptModal from '@/components/aamva/LoginPromptModal';
import { Play, Loader2, Lock, AlertCircle, Sparkles, Wand2 } from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, checkUserAuth } = useAuth();
  const [jurisdiction, setJurisdiction] = useState('NV');
  const [profile, setProfile] = useState('scandit');
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [genError, setGenError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  const jur = useMemo(() => getJurisdiction(jurisdiction), [jurisdiction]);
  const { fields } = useMemo(() => getFields(jurisdiction, profile), [jurisdiction, profile]);
  const headerDisplay = getHeaderDisplay(jurisdiction);

  const fieldRows = useMemo(() => {
    const rows = {};
    for (const field of fields) {
      const row = field.row || 1;
      if (!rows[row]) rows[row] = [];
      rows[row].push(field);
    }
    return Object.values(rows);
  }, [fields]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, state: jurisdiction, country: 'USA' }));
  }, [jurisdiction]);

  // Initialize user profile (generate API key + referral code) on first load
  useEffect(() => {
    if (isAuthenticated && user && !user.apiKey) {
      const pendingRef = localStorage.getItem('pendingReferral');
      base44.functions.invoke('setupProfile', pendingRef ? { referredByCode: pendingRef } : {})
        .then(() => {
          if (pendingRef) localStorage.removeItem('pendingReferral');
          if (checkUserAuth) checkUserAuth(true);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleFieldChange = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleAutoFill = () => {
    const filled = { state: jurisdiction, country: 'USA' };
    for (const field of fields) {
      if (field.autoFill === 'jurisdiction') { filled[field.name] = jurisdiction; continue; }
      if (field.autoFill === 'country') { filled[field.name] = 'USA'; continue; }
      const val = generateTestValue(field.fieldId, jurisdiction);
      if (val !== undefined && val !== null) filled[field.name] = val;
    }
    setFormData(filled);
  };

  const handleGenerate = async () => {
    setResult(null);
    setGenError(null);

    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    if ((user?.credits || 0) < 1) {
      setShowTopUp(true);
      return;
    }

    setGenerating(true);
    try {
      const res = await base44.functions.invoke('generateBarcode', {
        formData,
        jurisdictionCode: jurisdiction,
        profileKey: profile,
        options: { eclevel: 5, scale: 3 },
      });

      let barcodeDataURL = null;
      try {
        barcodeDataURL = generateBarcodeDataURL(res.data.payload, { eclevel: 5, scale: 3 });
      } catch (bcErr) {
        barcodeDataURL = null;
      }

      setResult({
        ...res.data,
        barcodeDataURL,
        barcodeStatus: 'generated',
      });
      if (checkUserAuth) checkUserAuth(true);
    } catch (err) {
      const errData = err?.response?.data || err;
      if (errData?.code === 'INSUFFICIENT_CREDITS' || err?.response?.status === 403) {
        setShowTopUp(true);
      } else {
        setGenError(errData?.error || err.message || 'Generation failed');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (result?.payload) downloadBarcodePNG(result.payload, { eclevel: 5, scale: 3 }, `aamva-${jurisdiction}-${profile}.png`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <JurisdictionSelector value={jurisdiction} onChange={setJurisdiction} />
          <ProfileSelector value={profile} onChange={setProfile} />
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-4xl font-heading font-bold tracking-tight">{headerDisplay.name}</h1>
          <span className="text-xs text-muted-foreground font-mono">{headerDisplay.revision}</span>
        </div>
        <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground tracking-widest">
          <span>IIN: <span className="font-mono text-accent">{headerDisplay.iin}</span></span>
          <span>AAMVA VER: <span className="font-mono text-accent">{headerDisplay.aamvaVersion}</span></span>
          <span>JUR VER: <span className="font-mono text-accent">{headerDisplay.jurisdictionVersion}</span></span>
          <span>PROFILE: <span className="font-mono text-accent uppercase">{profile}</span></span>
        </div>
      </motion.div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 mb-6">
        {fieldRows.map((rowFields, rowIdx) => (
          <div key={rowIdx} className={rowIdx > 0 ? 'mt-5 pt-5 border-t border-border/50' : ''}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rowFields.map((field) => (
                <FormField
                  key={field.fieldId}
                  field={field}
                  value={formData[field.name]}
                  onChange={handleFieldChange}
                  jurisdictionCode={jurisdiction}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 pt-5 border-t border-border flex items-center gap-4 flex-wrap">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-bold tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {generating ? 'GENERATING...' : 'CREATE'}
          </button>
          <button
            onClick={handleAutoFill}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-secondary border border-border text-sm font-bold tracking-widest hover:border-accent/30 disabled:opacity-50 transition-all"
          >
            <Wand2 className="w-4 h-4 text-accent" />
            AUTO FILL
          </button>
          {!isAuthenticated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              Login required to generate
            </div>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="font-mono text-accent">{user?.credits || 0}</span> credits available
            </div>
          )}
        </div>

        {genError && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {genError}
          </div>
        )}
      </div>

      {/* Result */}
      {result && <BarcodeResult result={result} onDownload={handleDownload} />}

      {/* Modals */}
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      <TopUpModal open={showTopUp} onClose={() => setShowTopUp(false)} />
    </div>
  );
}