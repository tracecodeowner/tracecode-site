import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Barcode, ShieldCheck, History, Settings, CreditCard, LogOut, Zap, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SupportButton from '@/components/SupportButton';

const NAV_ITEMS = [
  { path: '/generate', label: 'Generator', icon: Barcode },
  { path: '/api-docs', label: 'API Docs', icon: Code2 },
  { path: '/pricing', label: 'Top Up', icon: CreditCard },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Profile', icon: Settings },
];

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const credits = user?.credits || 0;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-60 fixed left-0 top-0 h-full border-r border-border bg-card/40 backdrop-blur-xl flex flex-col z-50">
        <div className="p-5 border-b border-border">
          <Link to={isAuthenticated ? '/generate' : '/'} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-center border-glow">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm tracking-tight">TraceCode</div>
              <div className="text-[10px] text-muted-foreground tracking-widest">SITE</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r"
                  />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                location.pathname === '/admin'
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Admin
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-border space-y-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground tracking-widest">CREDITS</div>
                  <div className="font-mono font-bold text-xl text-accent text-glow leading-none mt-0.5">{credits}</div>
                </div>
                <Link
                  to="/pricing"
                  className="text-[10px] px-2.5 py-1.5 rounded bg-accent text-background font-bold tracking-wider hover:opacity-90"
                >
                  TOP UP
                </Link>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] text-muted-foreground truncate flex-1">{user?.email}</div>
                <button onClick={() => logout()} className="text-muted-foreground hover:text-foreground shrink-0">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Link
                to="/login"
                className="block text-center text-[11px] px-3 py-2 rounded bg-primary text-primary-foreground font-bold tracking-wider"
              >
                LOGIN
              </Link>
              <Link
                to="/register"
                className="block text-center text-[11px] px-3 py-2 rounded border border-border text-muted-foreground hover:text-foreground tracking-wider"
              >
                REGISTER
              </Link>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 ml-60 min-h-screen">
        <div className="grid-bg min-h-full">
          <Outlet />
        </div>
      </main>
      <SupportButton />
    </div>
  );
}