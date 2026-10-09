import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { Barcode, ShieldCheck, Zap, Globe, Code2, ArrowRight, Check, Terminal, Users } from 'lucide-react';
import { generatePayload } from '@/lib/aamva';
import { generateBarcodeDataURL } from '@/lib/pdf417';
import SupportButton from '@/components/SupportButton';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const barcodeDataURL = useMemo(() => {
    const { payloadString } = generatePayload({
      dlNumber: 'NV1234567',
      lastName: 'SAMPLE',
      firstName: 'JANE',
      middleName: 'A',
      address: '123 MAIN ST',
      city: 'LAS VEGAS',
      state: 'NV',
      zipCode: '89101',
      country: 'USA',
      birthDate: '01151985',
      issueDate: '07242023',
      expiryDate: '07242031',
      sex: '2',
      height: '65',
      weight: '140',
      eyeColor: 'BRO',
      hairColor: 'BRO',
      dlClass: 'D',
    }, 'NV', 'scandit');

    return generateBarcodeDataURL(payloadString, {
      columns: 9,
      eclevel: 5,
      scale: 2,
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-center">
              <Barcode className="w-5 h-5 text-accent" />
            </div>
            <span className="font-heading font-bold text-sm tracking-tight">TraceCode</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/api-docs" className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block">API Docs</Link>
            {isAuthenticated ? (
              <Link to="/generate" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-wider">
                DASHBOARD
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-wider">
                  GET STARTED
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-[11px] font-bold tracking-widest mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            AAMVA 2025 COMPLIANT
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-heading font-bold tracking-tight mb-6"
          >
            Generate <span className="text-accent text-glow">PDF417</span><br />barcodes in seconds.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            The fastest AAMVA-compliant barcode generator. All 50 US states. Scanner-verified output.
            Plus a developer API to automate your workflow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link
              to={isAuthenticated ? '/generate' : '/register'}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold tracking-wider hover:opacity-90 transition-all hover:scale-105"
            >
              <Zap className="w-4 h-4" />
              {isAuthenticated ? 'START GENERATING' : 'GET STARTED FREE'}
            </Link>
            <Link
              to="/api-docs"
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-border text-sm font-bold tracking-wider hover:border-accent/30 transition-all"
            >
              <Code2 className="w-4 h-4" />
              VIEW API DOCS
            </Link>
          </motion.div>

          {/* Floating barcode visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 relative inline-block"
          >
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl shadow-accent/10">
              <motion.img
                src={barcodeDataURL}
                alt="PDF417 barcode example"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="block w-full max-w-[320px] h-auto origin-left"
              />
            </div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-accent text-background text-[10px] font-bold tracking-widest"
            >
              ✓ SCANNABLE
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-heading font-bold tracking-tight mb-2">Everything you need</h2>
            <p className="text-sm text-muted-foreground">Built for speed, accuracy, and developers.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Globe, title: 'All 50 States', desc: 'Every US jurisdiction with correct IIN, AAMVA version, and jurisdiction version pre-configured.' },
              { icon: ShieldCheck, title: 'Scanner Verified', desc: 'Output tested against Zebra, Honeywell, and Scandit. Byte-perfect AAMVA 2025 compliance.' },
              { icon: Code2, title: 'Developer API', desc: 'Generate barcodes programmatically with a simple REST API. Copy, paste, run.' },
              { icon: Zap, title: 'Instant Generation', desc: 'From form to barcode in milliseconds. Auto-fill dummy data for testing in one click.' },
              { icon: Users, title: 'Referral Program', desc: "Earn 10% commission on every referral's purchase. Withdraw to credits anytime." },
              { icon: Terminal, title: '3 Scanner Profiles', desc: 'Scandit, Show-Me ID, FIDScan. Switch profiles for different reader environments.' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-xl border border-border bg-card/30 hover:border-accent/20 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center mb-4">
                  <feat.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-sm font-bold mb-2">{feat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-heading font-bold tracking-tight mb-2">How it works</h2>
            <p className="text-sm text-muted-foreground">Three steps to a scannable barcode.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a State', desc: 'Choose from all 50 US states. IIN and version data auto-filled.' },
              { step: '02', title: 'Fill the Form', desc: 'Enter the data or click Auto Fill for instant dummy data.' },
              { step: '03', title: 'Generate', desc: 'Get a scannable PDF417 barcode. Download as PNG instantly.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-heading font-bold text-accent/30 mb-3">{item.step}</div>
                <h3 className="text-sm font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-10 rounded-2xl border border-accent/30 bg-accent/5"
        >
          <h2 className="text-3xl font-heading font-bold tracking-tight mb-3">Ready to start?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Create an account and get your API key. Start generating barcodes in minutes.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to={isAuthenticated ? '/generate' : '/register'}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold tracking-wider hover:opacity-90"
            >
              {isAuthenticated ? 'GO TO DASHBOARD' : 'CREATE FREE ACCOUNT'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-accent" /> No credit card to start</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-accent" /> API key included</span>
            <span className="flex items-center gap-1"><Check className="w-3 h-3 text-accent" /> Referral program</span>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-center">
              <Barcode className="w-4 h-4 text-accent" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">TraceCode Site © 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <Link to="/api-docs" className="hover:text-foreground">API Docs</Link>
            <a href="https://t.me/paypalsupporrttt" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>

      <SupportButton />
    </div>
  );
}