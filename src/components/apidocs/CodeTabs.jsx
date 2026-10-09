import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeTabs({ examples, apiKey }) {
  const [activeTab, setActiveTab] = useState(examples[0].lang);
  const [copied, setCopied] = useState(false);

  const current = examples.find(e => e.lang === activeTab) || examples[0];
  const code = current.code.replaceAll('YOUR_API_KEY', apiKey || 'YOUR_API_KEY');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg bg-secondary/30 border border-border overflow-hidden">
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          {examples.map(ex => (
            <button
              key={ex.lang}
              onClick={() => setActiveTab(ex.lang)}
              className={`px-3 py-2 text-[10px] font-bold tracking-widest transition-colors ${
                activeTab === ex.lang
                  ? 'text-accent border-b-2 border-accent bg-accent/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {ex.label || ex.lang.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} className="px-3 py-2 text-muted-foreground hover:text-foreground">
          {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 text-[11px] font-mono overflow-x-auto scrollbar-thin text-foreground/80 leading-relaxed">{code}</pre>
    </div>
  );
}