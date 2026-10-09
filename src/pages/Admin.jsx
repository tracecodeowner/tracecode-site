import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  Users, Barcode, DollarSign, TrendingUp, Loader2, Plus, Shield, Search,
  Minus, Ban, CheckCircle, PauseCircle, Trash2, Download, Activity,
  AlertTriangle, Globe, Server, Zap, X,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function Admin() {
  const { user, checkUserAuth } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminError, setAdminError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);
  const perPage = 10;
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceModal, setBalanceModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        base44.functions.invoke('adminAction', { action: 'stats' }),
        base44.functions.invoke('adminAction', { action: 'users' }),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
    } catch (e) {
      console.error('Failed to load admin data:', {
        message: e.message,
        status: e.status,
        code: e.code,
        name: e.name,
      });
      setAdminError(e.message || 'Failed to load admin data');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 max-w-md mx-auto pt-20 text-center">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-sm text-muted-foreground">You need admin privileges to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  // Filter + sort + paginate
  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.referralCode?.toLowerCase().includes(search.toLowerCase()) ||
    u.country?.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortBy], bVal = b[sortBy];
    if (sortBy === 'created_date' || sortBy === 'lastLoginDate') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }
    if (sortDir === 'desc') return (bVal || 0) - (aVal || 0);
    return (aVal || 0) - (bVal || 0);
  });
  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const doAction = async (action, payload) => {
    setActionLoading(true);
    setAdminError('');
    try {
      const result = await base44.functions.invoke('adminAction', { action, ...payload });
      if (result?.data?.success === false) {
        throw new Error('The admin action was not completed');
      }
      await loadData();
      await checkUserAuth(true);
      setBalanceModal(null);
      setConfirmDelete(null);
      setSelectedUser(null);
    } catch (e) {
      console.error('Admin action failed:', {
        action,
        message: e.message,
        status: e.status,
        code: e.code,
        name: e.name,
      });
      setAdminError(e.message || 'Admin action failed');
    }
    finally { setActionLoading(false); }
  };

  const handleExport = async () => {
    try {
      const res = await base44.functions.invoke('adminAction', { action: 'exportUsers' });
      const blob = new Blob([res.data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracecode-users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { /* ignore */ }
  };

  const statusBadge = (status) => {
    const styles = {
      active: 'bg-accent/10 text-accent border-accent/30',
      banned: 'bg-destructive/10 text-destructive border-destructive/30',
      suspended: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${styles[status || 'active']}`}>
        {(status || 'active').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight mb-1">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Monitor users, revenue, API usage, and system activity in real-time.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-xs font-bold tracking-wider hover:border-accent/30 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-accent" />
          EXPORT CSV
        </button>
      </motion.div>
      {adminError && (
        <div role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {adminError}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} sub={`+${stats?.todaySignups || 0} today`} />
        <StatCard icon={Activity} label="Active Today" value={stats?.activeUsersToday || 0} sub="logged in today" />
        <StatCard icon={Barcode} label="Total Generated" value={stats?.totalGenerations || 0} sub={`+${stats?.todayGenerations || 0} today`} />
        <StatCard icon={CheckCircle} label="Total Validated" value={stats?.totalValidated || 0} sub="valid payloads" />
        <StatCard icon={AlertTriangle} label="Failed Validation" value={stats?.failedValidation || 0} sub="invalid/failed" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} sub={`$${(stats?.todayRevenue || 0).toFixed(2)} today`} />
        <StatCard icon={Zap} label="API Requests Today" value={stats?.apiRequestsToday || 0} sub="via API key" />
        <StatCard icon={Server} label="System Health" value={stats?.systemHealth || 'Operational'} sub="all systems" health />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card/50 p-5">
          <div className="text-[10px] text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            TRAFFIC — GENERATIONS (7 DAYS)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats?.dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="generations" name="Generations" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="apiRequests" name="API" stroke="#3b82f6" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-border bg-card/50 p-5">
          <div className="text-[10px] text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-accent" />
            REVENUE (7 DAYS)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.dailyData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visitor Countries */}
      {stats?.visitorCountries?.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-5 mb-6">
          <div className="text-[10px] text-muted-foreground tracking-widest mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-accent" />
            VISITOR COUNTRIES
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.visitorCountries.map((c) => (
              <div key={c.country} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border text-xs">
                <span className="font-mono text-accent">{c.country}</span>
                <span className="text-muted-foreground">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management */}
      <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold tracking-wider">USER MANAGEMENT</span>
            <span className="text-[10px] text-muted-foreground">({filtered.length})</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search email, code, country..."
              className="bg-transparent text-xs outline-none w-48"
            />
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] text-muted-foreground tracking-widest border-b border-border">
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('email')}>EMAIL</th>
                <th className="p-3">ROLE</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('credits')}>CREDITS</th>
                <th className="p-3">COUNTRY</th>
                <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('lastLoginDate')}>LAST LOGIN</th>
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u, i) => (
                <motion.tr key={u.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/30 hover:bg-secondary/20">
                  <td className="p-3 font-mono cursor-pointer hover:text-accent" onClick={() => setSelectedUser(u)}>{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${u.role === 'admin' ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-secondary text-muted-foreground border border-border'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{statusBadge(u.status)}</td>
                  <td className="p-3 font-mono text-accent">{u.credits || 0}</td>
                  <td className="p-3 font-mono text-muted-foreground">{u.country || '—'}</td>
                  <td className="p-3 font-mono text-muted-foreground text-[10px]">{u.lastLoginDate ? new Date(u.lastLoginDate).toLocaleDateString() : '—'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setBalanceModal({ user: u, type: 'add', amount: 10 })} title="Add balance" className="p-1.5 rounded bg-accent/10 text-accent hover:bg-accent/20">
                        <Plus className="w-3 h-3" />
                      </button>
                      <button onClick={() => setBalanceModal({ user: u, type: 'deduct', amount: 10 })} title="Deduct balance" className="p-1.5 rounded bg-secondary text-muted-foreground hover:text-destructive">
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => doAction('setStatus', { userId: u.id, status: u.status === 'banned' ? 'active' : 'banned' })}
                        title={u.status === 'banned' ? 'Unban' : 'Ban'}
                        className={`p-1.5 rounded ${u.status === 'banned' ? 'bg-accent/10 text-accent' : 'bg-secondary text-muted-foreground hover:text-destructive'}`}
                      >
                        {u.status === 'banned' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => doAction('setStatus', { userId: u.id, status: u.status === 'suspended' ? 'active' : 'suspended' })}
                        title={u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                        className={`p-1.5 rounded ${u.status === 'suspended' ? 'bg-accent/10 text-accent' : 'bg-secondary text-muted-foreground hover:text-yellow-500'}`}
                      >
                        {u.status === 'suspended' ? <CheckCircle className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                      </button>
                      <button onClick={() => setConfirmDelete(u)} title="Delete" className="p-1.5 rounded bg-secondary text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-xs">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border text-xs">
            <span className="text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:border-accent/30">Prev</button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 rounded border border-border disabled:opacity-30 hover:border-accent/30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Balance Modal */}
      <AnimatePresence>
        {balanceModal && (
          <Modal onClose={() => setBalanceModal(null)} title={balanceModal.type === 'add' ? 'Add Balance' : 'Deduct Balance'}>
            <p className="text-xs text-muted-foreground mb-4">
              {balanceModal.type === 'add' ? 'Add credits to' : 'Deduct credits from'} <span className="font-mono text-foreground">{balanceModal.user.email}</span>
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                min="1"
                step="1"
                value={balanceModal.amount}
                onChange={(e) => setBalanceModal({ ...balanceModal, amount: Number(e.target.value) })}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary/30 border border-border text-sm outline-none focus:border-accent/50"
              />
              <span className="text-xs text-muted-foreground">credits</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setBalanceModal(null)} className="flex-1 py-2 rounded-lg border border-border text-xs font-bold">CANCEL</button>
              <button
                onClick={() => doAction(balanceModal.type === 'add' ? 'addBalance' : 'deductBalance', { userId: balanceModal.user.id, credits: balanceModal.amount })}
                disabled={actionLoading || !Number.isSafeInteger(balanceModal.amount) || balanceModal.amount <= 0}
                className={`flex-1 py-2 rounded-lg text-xs font-bold ${balanceModal.type === 'add' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'}`}
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : balanceModal.type === 'add' ? 'ADD' : 'DEDUCT'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <Modal onClose={() => setConfirmDelete(null)} title="Delete User">
            <p className="text-xs text-muted-foreground mb-4">
              Are you sure you want to delete <span className="font-mono text-foreground">{confirmDelete.email}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg border border-border text-xs font-bold">CANCEL</button>
              <button
                onClick={() => doAction('deleteUser', { userId: confirmDelete.id })}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'DELETE'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <Modal onClose={() => setSelectedUser(null)} title="User Details" wide>
            <div className="space-y-3 text-xs">
              <DetailRow label="Email" value={selectedUser.email} mono />
              <DetailRow label="Role" value={selectedUser.role} />
              <DetailRow label="Status" value={selectedUser.status || 'active'} />
              <DetailRow label="Credits" value={selectedUser.credits || 0} mono accent />
              <DetailRow label="Country" value={selectedUser.country || '—'} mono />
              <DetailRow label="Device" value={selectedUser.device || '—'} />
              <DetailRow label="Browser" value={selectedUser.browser || '—'} />
              <DetailRow label="Last IP" value={selectedUser.lastIP || '—'} mono />
              <DetailRow label="Last Login" value={selectedUser.lastLoginDate ? new Date(selectedUser.lastLoginDate).toLocaleString() : '—'} />
              <DetailRow label="Joined" value={selectedUser.created_date ? new Date(selectedUser.created_date).toLocaleString() : '—'} />
              <DetailRow label="Referral Code" value={selectedUser.referralCode || '—'} mono />
              <DetailRow label="Referred By" value={selectedUser.referredBy || '—'} mono />
              <DetailRow label="Referral Count" value={selectedUser.referralCount || 0} />
              <DetailRow label="Referral Earned" value={`$${(selectedUser.referralEarned || 0).toFixed(2)}`} accent />
              <DetailRow label="API Key" value={selectedUser.apiKey ? '✓ Generated' : '—'} />
            </div>
            <div className="mt-5 pt-4 border-t border-border flex gap-2 flex-wrap">
              <button onClick={() => { setBalanceModal({ user: selectedUser, type: 'add', amount: 10 }); }} className="flex items-center gap-1 px-3 py-1.5 rounded bg-accent/10 text-accent text-[10px] font-bold border border-accent/30">
                <Plus className="w-3 h-3" /> ADD BALANCE
              </button>
              <button onClick={() => { setBalanceModal({ user: selectedUser, type: 'deduct', amount: 10 }); }} className="flex items-center gap-1 px-3 py-1.5 rounded bg-secondary text-muted-foreground text-[10px] font-bold border border-border">
                <Minus className="w-3 h-3" /> DEDUCT
              </button>
              <button
                onClick={() => doAction('setStatus', { userId: selectedUser.id, status: selectedUser.status === 'banned' ? 'active' : 'banned' })}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-secondary text-muted-foreground text-[10px] font-bold border border-border hover:text-destructive"
              >
                <Ban className="w-3 h-3" /> {selectedUser.status === 'banned' ? 'UNBAN' : 'BAN'}
              </button>
              <button
                onClick={() => doAction('setStatus', { userId: selectedUser.id, status: selectedUser.status === 'suspended' ? 'active' : 'suspended' })}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-secondary text-muted-foreground text-[10px] font-bold border border-border hover:text-yellow-500"
              >
                <PauseCircle className="w-3 h-3" /> {selectedUser.status === 'suspended' ? 'UNSUSPEND' : 'SUSPEND'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, health }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-border bg-card/50"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${health ? 'bg-accent/10 border-accent/30' : 'bg-accent/10 border-accent/30'}`}>
          <Icon className="w-4 h-4 text-accent" />
        </div>
        {health && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
      </div>
      <div className="text-2xl font-bold font-heading capitalize">{value}</div>
      <div className="text-[10px] text-muted-foreground tracking-widest">{label}</div>
      {sub && <div className="text-[10px] text-accent mt-1">{sub}</div>}
    </motion.div>
  );
}

function Modal({ children, onClose, title, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? 'max-w-lg' : 'max-w-sm'} rounded-xl border border-border bg-card p-6 max-h-[85vh] overflow-y-auto scrollbar-thin`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function DetailRow({ label, value, mono, accent }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-border/20">
      <span className="text-muted-foreground tracking-widest text-[10px]">{label.toUpperCase()}</span>
      <span className={`text-right ${mono ? 'font-mono' : ''} ${accent ? 'text-accent' : 'text-foreground'}`}>{value}</span>
    </div>
  );
}