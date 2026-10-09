import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ===== STATS =====
    if (action === 'stats') {
      const [users, generations, transactions] = await Promise.all([
        base44.asServiceRole.entities.User.list('-created_date', 500),
        base44.asServiceRole.entities.GenerationHistory.list('-created_date', 500),
        base44.asServiceRole.entities.CreditTransaction.list('-created_date', 500),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayMs = today.getTime();

      const totalUsers = users.length;
      const totalGenerations = generations.length;
      const totalValidated = generations.filter(g => g.validationStatus === 'valid').length;
      const failedValidation = generations.filter(g => g.barcodeStatus === 'failed' || g.validationStatus === 'invalid').length;
      const totalRevenue = transactions
        .filter(t => t.action === 'topup' && t.amountUsd)
        .reduce((sum, t) => sum + (t.amountUsd || 0), 0);
      const totalCreditsUsed = transactions
        .filter(t => t.action === 'usage')
        .reduce((sum, t) => sum + Math.abs(t.credits || 0), 0);

      const activeUsersToday = users.filter(u => u.lastLoginDate && new Date(u.lastLoginDate).getTime() >= todayMs).length;
      const todayGenerations = generations.filter(g => new Date(g.created_date).getTime() >= todayMs).length;
      const apiRequestsToday = generations.filter(g => g.source === 'api' && new Date(g.created_date).getTime() >= todayMs).length;
      const todayRevenue = transactions
        .filter(t => t.action === 'topup' && t.amountUsd && new Date(t.created_date).getTime() >= todayMs)
        .reduce((sum, t) => sum + (t.amountUsd || 0), 0);
      const todaySignups = users.filter(u => new Date(u.created_date).getTime() >= todayMs).length;

      // Visitor countries breakdown
      const countryMap = {};
      for (const u of users) {
        if (u.country) countryMap[u.country] = (countryMap[u.country] || 0) + 1;
      }
      const visitorCountries = Object.entries(countryMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily data (7 days)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - i);
        const dayMs = d.getTime();
        const nextDayMs = dayMs + 86400000;
        const genCount = generations.filter(g => {
          const ms = new Date(g.created_date).getTime();
          return ms >= dayMs && ms < nextDayMs;
        }).length;
        const apiCount = generations.filter(g => {
          const ms = new Date(g.created_date).getTime();
          return g.source === 'api' && ms >= dayMs && ms < nextDayMs;
        }).length;
        const revenue = transactions
          .filter(t => {
            const ms = new Date(t.created_date).getTime();
            return t.action === 'topup' && t.amountUsd && ms >= dayMs && ms < nextDayMs;
          })
          .reduce((sum, t) => sum + (t.amountUsd || 0), 0);
        days.push({ date: d.toISOString().split('T')[0], generations: genCount, apiRequests: apiCount, revenue: +revenue.toFixed(2) });
      }

      return Response.json({
        totalUsers,
        activeUsersToday,
        totalGenerations,
        totalValidated,
        failedValidation,
        totalRevenue: +totalRevenue.toFixed(2),
        totalCreditsUsed,
        todaySignups,
        todayGenerations,
        apiRequestsToday,
        todayRevenue: +todayRevenue.toFixed(2),
        systemHealth: 'operational',
        visitorCountries,
        dailyData: days,
      });
    }

    // ===== USERS LIST =====
    if (action === 'users') {
      const users = await base44.asServiceRole.entities.User.list('-created_date', 500);
      return Response.json({ users });
    }

    // ===== ADD BALANCE =====
    if (action === 'addBalance') {
      const { userId, credits, reason } = body;
      if (!userId || !credits) return Response.json({ error: 'Missing userId or credits' }, { status: 400 });
      const targetUser = await base44.asServiceRole.entities.User.get(userId);
      if (!targetUser) return Response.json({ error: 'User not found' }, { status: 404 });
      const newBalance = (targetUser.credits || 0) + Number(credits);
      await base44.asServiceRole.entities.User.update(userId, { credits: newBalance });
      await base44.asServiceRole.entities.CreditTransaction.create({
        action: 'admin_adjustment',
        credits: Number(credits),
        remainingBalance: newBalance,
        description: reason || `Admin balance adjustment: +${credits} credits`,
      });
      return Response.json({ success: true, userId, newBalance });
    }

    // ===== DEDUCT BALANCE =====
    if (action === 'deductBalance') {
      const { userId, credits, reason } = body;
      if (!userId || !credits) return Response.json({ error: 'Missing userId or credits' }, { status: 400 });
      const targetUser = await base44.asServiceRole.entities.User.get(userId);
      if (!targetUser) return Response.json({ error: 'User not found' }, { status: 404 });
      const newBalance = Math.max(0, (targetUser.credits || 0) - Number(credits));
      await base44.asServiceRole.entities.User.update(userId, { credits: newBalance });
      await base44.asServiceRole.entities.CreditTransaction.create({
        action: 'admin_adjustment',
        credits: -Number(credits),
        remainingBalance: newBalance,
        description: reason || `Admin balance deduction: -${credits} credits`,
      });
      return Response.json({ success: true, userId, newBalance });
    }

    // ===== SET STATUS (ban/unban/suspend) =====
    if (action === 'setStatus') {
      const { userId, status } = body;
      if (!userId || !['active', 'banned', 'suspended'].includes(status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400 });
      }
      await base44.asServiceRole.entities.User.update(userId, { status });
      return Response.json({ success: true, userId, status });
    }

    // ===== UPDATE ROLE =====
    if (action === 'updateRole') {
      const { userId, role } = body;
      if (!userId || !['admin', 'user'].includes(role)) return Response.json({ error: 'Invalid role' }, { status: 400 });
      await base44.asServiceRole.entities.User.update(userId, { role });
      return Response.json({ success: true, userId, role });
    }

    // ===== DELETE USER =====
    if (action === 'deleteUser') {
      const { userId } = body;
      if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });
      if (userId === user.id) return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
      await base44.asServiceRole.entities.User.delete(userId);
      return Response.json({ success: true, userId });
    }

    // ===== EXPORT USERS (CSV) =====
    if (action === 'exportUsers') {
      const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);
      const headers = ['Email', 'Role', 'Status', 'Credits', 'Country', 'Device', 'Browser', 'Last IP', 'Last Login', 'Joined'];
      const rows = allUsers.map(u => [
        u.email || '',
        u.role || 'user',
        u.status || 'active',
        u.credits || 0,
        u.country || '',
        u.device || '',
        u.browser || '',
        u.lastIP || '',
        u.lastLoginDate ? new Date(u.lastLoginDate).toISOString() : '',
        u.created_date ? new Date(u.created_date).toISOString() : '',
      ]);
      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      return Response.json({ success: true, csv, count: allUsers.length });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});