import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ─── Friendly error messages ──────────────────────────────────────────────────
const friendlyError = (msg) => {
  if (!msg) return 'Something went wrong. Please try again.';
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials'))   return 'Incorrect email or password. Please try again.';
  if (m.includes('email not confirmed'))          return 'Please confirm your email before logging in.';
  if (m.includes('user already registered'))      return 'An account with this email already exists.';
  if (m.includes('password should contain'))      return 'Password must include uppercase, lowercase, number, and special character.';
  if (m.includes('email rate limit'))             return 'Too many attempts. Please wait a moment.';
  if (m.includes('sms') || m.includes('twilio')) return 'SMS service unavailable. Please use email login.';
  if (m.includes('invalid_otp'))                  return 'Invalid OTP. Please try again.';
  return msg;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // ── Safety net: if loading hasn't cleared in 4s, force it off ───────────
    // Protects against the Supabase navigator-lock "lock stolen" crash that
    // can prevent the normal setLoading(false) path from being reached.
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    // ── Fetch profile row from Supabase ────────────────────────────────────
    const fetchProfile = async (userId) => {
      if (!userId) {
        if (mounted) { setProfile(null); setLoading(false); }
        clearTimeout(safetyTimer);
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (mounted) setProfile(data ?? null);
      } catch (_) {
        if (mounted) setProfile(null);
      } finally {
        clearTimeout(safetyTimer);
        if (mounted) setLoading(false);
      }
    };

    // ── Apply session to state ─────────────────────────────────────────────
    const applySession = (newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    };

    // ── Get the current session once on mount ──────────────────────────────
    supabase.auth.getSession()
      .then(({ data: { session } }) => applySession(session))
      .catch(() => { if (mounted) setLoading(false); clearTimeout(safetyTimer); });

    // ── Listen for auth state changes (sign in, sign out, token refresh) ───
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      applySession(newSession);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ─────────────────────────────────────────────────────────

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(friendlyError(error.message));
    return data;
  };

  const signUpWithEmail = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(friendlyError(error.message));

    // session null → email confirmation is enabled in Supabase; user must verify first
    if (data.user && !data.session) {
      return { ...data, requiresConfirmation: true };
    }

    // session present → email confirmation is disabled; user is logged in immediately
    return { ...data, requiresConfirmation: false };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(friendlyError(error.message));
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // ── Simulated Phone OTP (no Twilio configured) ───────────────────────────
  const signInWithPhone = async (phone) => {
    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 30_000;
    localStorage.setItem('simulated_otp', JSON.stringify({ phone, otp, expiry }));
    console.log(`%c[SIMULATED OTP] ${otp}  (expires in 30s)`, 'color:#10b981;font-weight:bold;font-size:14px;');
    await new Promise(r => setTimeout(r, 800));
    return { simulated: true };
  };

  const verifyPhoneOtp = async (phone, token) => {
    await new Promise(r => setTimeout(r, 800));
    const stored = localStorage.getItem('simulated_otp');
    if (!stored) throw new Error('No OTP request found. Please request a new OTP.');

    const { phone: storedPhone, otp, expiry } = JSON.parse(stored);
    if (phone !== storedPhone) throw new Error('Phone number mismatch. Please try again.');
    if (Date.now() > expiry)   { localStorage.removeItem('simulated_otp'); throw new Error('OTP expired. Please request a new one.'); }
    if (token !== otp)         throw new Error('Invalid OTP. Please try again.');

    localStorage.removeItem('simulated_otp');

    const syntheticEmail    = `${phone.replace(/\D/g, '')}@phone.ballotbuddy.local`;
    const syntheticPassword = 'Ballot@Phone#2024!';

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: syntheticEmail, password: syntheticPassword,
    });
    if (!loginError) return loginData;

    if (loginError.message.toLowerCase().includes('invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: syntheticPassword,
        options: { data: { phone, username: `User_${phone.slice(-4)}` } },
      });
      if (signUpError) throw new Error(friendlyError(signUpError.message));
      return signUpData;
    }

    throw new Error(friendlyError(loginError.message));
  };

  // ─────────────────────────────────────────────────────────────────────────
  const value = {
    user,
    profile,
    setProfile,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithPhone,
    verifyPhoneOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
