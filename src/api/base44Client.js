import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { generatePayload } from '@/lib/aamva';

// Supabase configuration - prefer env vars, fallback to the provided local Supabase project
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lgxqlzfgwchkspzdvfjj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneHFsemZnd2Noa3B6ZHZmanEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NDkyNDQwNCwiZXhwIjoyMTAwNTAwNDA0fQ.oPEvyB0fZLJBQ7xS4OdUXys3w0qJSp3Wh2CmKBlWCUs';

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SUPABASE_ENABLED =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project-ref.supabase.co') &&
  SUPABASE_ANON_KEY !== 'your-anon-public-key';
const LOCAL_USERS_KEY = 'dev_users';
const LOCAL_SESSION_KEY = 'dev_session';

const loadLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const getLocalUserByEmail = (email) => {
  const users = loadLocalUsers();
  return users.find((user) => user.email?.toLowerCase() === email?.toLowerCase()) || null;
};

const updateLocalUser = (email, updates) => {
  const users = loadLocalUsers();
  const idx = users.findIndex((user) => user.email?.toLowerCase() === email?.toLowerCase());
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  saveLocalUsers(users);
  return users[idx];
};

const setLocalSession = (user) => {
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
};

const getLocalSession = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
  } catch (e) {
    return null;
  }
};

const clearLocalSession = () => {
  localStorage.removeItem(LOCAL_SESSION_KEY);
};

const ensureLocalUser = ({ email, password }) => {
  let user = getLocalUserByEmail(email);
    if (!user) {
    user = {
      id: `local_${Math.random().toString(36).slice(2, 10)}`,
      email,
      password,
      role: 'anon',
      credits: 2,
      apiKey: `local_${Math.random().toString(36).slice(2, 10)}`,
      referralCode: `R${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      referralBalance: 0,
      referralCount: 0,
      referralPayments: 0,
      referralEarned: 0,
      referralPercent: 10,
      defaultJurisdiction: 'NV',
      defaultProfile: 'scandit',
      defaultEclevel: 5,
      defaultScale: 3,
      storeHistory: true,
      storeRawPayloads: false,
      lastLoginDate: new Date().toISOString(),
    };
    const users = loadLocalUsers();
    users.push(user);
    saveLocalUsers(users);
  }
  return user;
};

const mergeUserProfile = async (authUser) => {
  if (!authUser) return null;
  if (!SUPABASE_ENABLED) return authUser;

  try {
    const { data: profileData, error } = await supabase.from('users').select('*').eq('id', authUser.id).single();
    if (!error && profileData) {
      return { ...authUser, ...profileData };
    }
  } catch (e) {
    // ignore
  }
  return authUser;
};

// Minimal compatibility shim that exposes the methods the app expects from `base44`
export const base44 = {
  auth: {
    me: async () => {
      if (SUPABASE_ENABLED) {
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            return mergeUserProfile(data.user);
          }
          } catch (e) {
          // ignore
        }
      }

      const session = getLocalSession();
      if (!session || !session.email) return null;
      const user = getLocalUserByEmail(session.email);
      return user || null;
    },
    logout: async (redirectUrl) => {
      if (SUPABASE_ENABLED) {
        try {
          await supabase.auth.signOut();
        } catch {
          // ignore
        }
      } else {
        clearLocalSession();
      }
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = `/login?next=${encodeURIComponent(redirectUrl || window.location.href)}`;
    },
    loginViaEmailPassword: async (email, password) => {
      if (SUPABASE_ENABLED) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        const user = await mergeUserProfile(data.user);
        return { user };
      }

      const user = getLocalUserByEmail(email);
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      setLocalSession(user);
      return { user };
    },
    loginWithProvider: async (provider, redirectUrl) => {
      if (SUPABASE_ENABLED) {
        await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectUrl || window.location.origin + '/generate' } });
        return;
      }
      const email = `${provider}@example.com`;
      const user = ensureLocalUser({ email, password: '' });
      setLocalSession(user);
      window.location.href = redirectUrl || '/generate';
    },
    register: async ({ email, password }) => {
      if (SUPABASE_ENABLED) {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/login' } });
        if (error) {
          throw error;
        }
        if (data?.session) {
          return data;
        }
        return { user: data.user, needsEmailConfirmation: true };
      }
      const existing = getLocalUserByEmail(email);
      if (existing) throw new Error('A user with that email already exists');
      const user = ensureLocalUser({ email, password });
      setLocalSession(user);
      return { user };
    },
    verifyOtp: async ({ email, otpCode }) => {
      if (SUPABASE_ENABLED) {
        throw new Error('OTP verification is not supported for Supabase sign-up. Please confirm your email and log in.');
      }
      const user = getLocalUserByEmail(email);
      if (!user) throw new Error('Invalid verification code');
      setLocalSession(user);
      return { access_token: 'local-token' };
    },
    setToken: () => {
      // no-op in this simplified auth shim
    },
    resendOtp: async () => {
      return;
    },
    resetPasswordRequest: async (email) => {
      if (SUPABASE_ENABLED) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' });
        if (error) throw error;
        return;
      }
      return;
    },
    resetPassword: async ({ resetToken, newPassword }) => {
      if (SUPABASE_ENABLED) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return;
      }
      const session = getLocalSession();
      if (!session || !session.email) throw new Error('Not authenticated');
      const user = updateLocalUser(session.email, { password: newPassword });
      if (!user) throw new Error('User not found');
      setLocalSession(user);
      return;
    },
    updateMe: async (updates) => {
      if (SUPABASE_ENABLED) {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          const err = new Error('Not authenticated');
          err.status = 401;
          throw err;
        }
        const userId = authData.user.id;
        const { data: updatedRows, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
        if (error) throw error;
        return { data: updatedRows };
      }
      const session = getLocalSession();
      if (!session || !session.email) throw new Error('Not authenticated');
      const updated = updateLocalUser(session.email, updates);
      setLocalSession(updated);
      return { data: updated };
    },
  },

  // functions.invoke shim: implements a few functions locally for dev (generateBarcode, setupProfile, withdrawReferral, trackLogin, adminAction)
  functions: {
    invoke: async (name, payload = {}) => {
      switch (name) {
        case 'generateBarcode': {
          const { formData, jurisdictionCode, profileKey } = payload;
          const generated = generatePayload(formData, jurisdictionCode, profileKey);
          // If Supabase enabled, attempt to deduct a credit from the current user
          if (SUPABASE_ENABLED) {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData?.user?.id;
            if (!userId) {
              const err = new Error('Not authenticated');
              err.status = 401;
              throw err;
            }
            // fetch current credits
            const { data: profile, error } = await supabase.from('users').select('credits').eq('id', userId).single();
            if (error || !profile) {
              const err = new Error('Profile not found');
              err.status = 404;
              throw err;
            }
            const credits = profile.credits || 0;
            if (credits < 1) {
              const err = new Error('Insufficient credits');
              err.response = { data: { code: 'INSUFFICIENT_CREDITS' } };
              err.status = 403;
              throw err;
            }
            const { error: updErr } = await supabase.from('users').update({ credits: credits - 1 }).eq('id', userId);
            if (updErr) {
              const err = new Error('Failed to deduct credits');
              err.status = 500;
              throw err;
            }
          }

          return { data: { payload: generated.payloadString, header: generated.header, parsedFields: generated.parsedFields, stats: generated.stats } };
        }
        case 'setupProfile': {
          if (SUPABASE_ENABLED) {
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;
            if (!user) {
              const err = new Error('Not authenticated');
              err.status = 401;
              throw err;
            }
            const apiKey = `local_${Math.random().toString(36).slice(2, 10)}`;
            const referralCode = `R${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
            const credits = 2;
            const payloadToUpsert = {
              id: user.id,
              email: user.email,
              apiKey,
              referralCode,
              credits,
              role: 'anon',
            };
            const { data: up, error } = await supabase.from('users').upsert(payloadToUpsert, { returning: 'representation' });
            if (error) {
              const err = new Error('Failed to create profile');
              err.status = 500;
              throw err;
            }
            return { data: { profile: up?.[0] || payloadToUpsert } };
          }

          const existing = JSON.parse(localStorage.getItem('dev_user') || 'null');
          const profile = existing || {};
          profile.apiKey = profile.apiKey || `local_${Math.random().toString(36).slice(2, 10)}`;
          profile.credits = profile.credits || 2;
          profile.referralCode = profile.referralCode || `R${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          localStorage.setItem('dev_user', JSON.stringify(profile));
          return { data: { profile } };
        }
        case 'withdrawReferral': {
          if (SUPABASE_ENABLED) {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData?.user?.id;
            if (!userId) {
              const err = new Error('Not authenticated');
              err.status = 401;
              throw err;
            }
            const { data: profile, error } = await supabase.from('users').select('credits').eq('id', userId).single();
            if (error || !profile) {
              const err = new Error('Profile not found');
              err.status = 404;
              throw err;
            }
            const credits = (profile.credits || 0) + (payload.credits || 0);
            await supabase.from('users').update({ credits }).eq('id', userId);
            return { data: { withdrawn: true } };
          }
          return { data: { withdrawn: true } };
        }
        case 'trackLogin': {
          if (SUPABASE_ENABLED) {
            const { data: authData } = await supabase.auth.getUser();
            const userId = authData?.user?.id;
            if (userId) {
              await supabase.from('logins').insert({ user_id: userId, meta: JSON.stringify(payload || {}) });
            }
          }
          return { data: { ok: true } };
        }
        case 'adminAction': {
          const action = payload.action;
          if (SUPABASE_ENABLED) {
            if (action === 'stats') {
              const { data } = await supabase.from('users').select('id', { count: 'exact' });
              return { data: { users: data?.length || 0 } };
            }
            if (action === 'users') {
              const { data: users } = await supabase.from('users').select('*').limit(100);
              return { data: { users: users || [] } };
            }
            if (action === 'exportUsers') {
              const { data: users } = await supabase.from('users').select('id,email,credits');
              const csv = (users || []).map((u) => `${u.id},${u.email || ''},${u.credits || 0}`).join('\n');
              return { data: { csv: `id,email,credits\n${csv}` } };
            }
            if (action === 'addBalance' || action === 'deductBalance') {
              const amount = Number(payload.credits);
              if (!payload.userId || !Number.isSafeInteger(amount) || amount <= 0) {
                const err = new Error('Enter a positive whole number of credits');
                err.status = 400;
                throw err;
              }

              const { data: newBalance, error } = await supabase.rpc('admin_adjust_user_credits', {
                p_user_id: payload.userId,
                p_delta: action === 'addBalance' ? amount : -amount,
              });
              if (error) throw error;
              return { data: { success: true, userId: payload.userId, newBalance } };
            }
          } else {
            if (action === 'stats') return { data: { users: 1, generated: 0 } };
            if (action === 'users') {
              const u = JSON.parse(localStorage.getItem('dev_user') || 'null');
              return { data: { users: u ? [u] : [] } };
            }
            if (action === 'exportUsers') return { data: { csv: 'id,email,credits\n1,dev@example.com,10' } };
            if (action === 'addBalance' || action === 'deductBalance') {
              const session = getLocalSession();
              const users = loadLocalUsers();
              const index = users.findIndex((item) => item.id === payload.userId);
              if (!session || session.role !== 'admin') {
                const err = new Error('Admin access required');
                err.status = 403;
                throw err;
              }
              if (index === -1) {
                const err = new Error('User not found');
                err.status = 404;
                throw err;
              }
              const amount = Number(payload.credits);
              if (!Number.isSafeInteger(amount) || amount <= 0) {
                const err = new Error('Enter a positive whole number of credits');
                err.status = 400;
                throw err;
              }
              const delta = action === 'addBalance' ? amount : -amount;
              users[index].credits = Math.max(0, (users[index].credits || 0) + delta);
              saveLocalUsers(users);
              return { data: { success: true, userId: payload.userId, newBalance: users[index].credits } };
            }
          }
          throw new Error(`Admin action "${action}" is not implemented for this backend`);
        }
        default:
          throw new Error(`Function ${name} not implemented in local shim`);
      }
    },
  },
};
