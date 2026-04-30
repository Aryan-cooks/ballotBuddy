import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const friendlyError = (msg) => {
  if (!msg) return 'Something went wrong. Please try again.';
  const m = msg.toLowerCase();
  if (m.includes('password should contain')) return 'Password must include uppercase, lowercase, number, and special character.';
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('user already registered')) return 'An account with this email already exists.';
  if (m.includes('email not confirmed')) return 'Please confirm your email before logging in.';
  if (m.includes('email rate limit')) return 'Too many attempts. Please wait a moment.';
  if (m.includes('sms_provider_error') || m.includes('twilio')) return 'SMS service is currently unavailable. Please use email login or check your Supabase/Twilio settings.';
  if (m.includes('invalid_otp')) return 'Invalid OTP. Please try again.';
  return msg;
};

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
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
    
    // Ensure profile exists (handling case if DB trigger is absent)
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          username: username,
        }, { onConflict: 'id' });
        
      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }

    // If no session returned (email confirmation required), try to sign in directly
    if (data.user && !data.session) {
      // Attempt auto-login — will work if email confirmation is disabled
      try {
        const loginResult = await supabase.auth.signInWithPassword({ email, password });
        if (!loginResult.error) {
          return loginResult.data;
        }
      } catch (_) {
        // If auto-login fails, fall through to return signup data
      }
    }
    
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(friendlyError(error.message));
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithPhone = async (phone) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw new Error(friendlyError(error.message));
    return data;
  };

  const verifyPhoneOtp = async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw new Error(friendlyError(error.message));
    return data;
  };

  const value = {
    user,
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
