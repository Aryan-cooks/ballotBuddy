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
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async (userId) => {
      if (!userId) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (mounted) {
        setProfile(data || null); // null means no profile yet
        setLoading(false);
      }
    };

    const handleSession = (session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    };

    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoading(true);
        handleSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 30 * 1000; // 30 seconds

    localStorage.setItem('simulated_otp', JSON.stringify({ phone, otp, expiry }));
    
    console.log(`%c[SIMULATED SMS]`, 'color: #10b981; font-weight: bold; font-size: 14px;');
    console.log(`OTP sent to ${phone}: %c${otp}`, 'font-size: 16px; font-weight: bold; color: #3b82f6;');
    console.log(`This OTP will expire in 30 seconds.`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return { simulated: true };
  };

  const verifyPhoneOtp = async (phone, token) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const storedData = localStorage.getItem('simulated_otp');
    if (!storedData) throw new Error('No OTP request found. Please request a new OTP.');

    const { phone: storedPhone, otp, expiry } = JSON.parse(storedData);

    if (phone !== storedPhone) throw new Error('Phone number mismatch. Please try again.');
    if (Date.now() > expiry) {
      localStorage.removeItem('simulated_otp');
      throw new Error('OTP has expired. Please request a new one.');
    }
    if (token !== otp) throw new Error('Invalid OTP. Please try again.');

    // OTP is valid
    localStorage.removeItem('simulated_otp');

    // Attempt login/signup via email/password behind the scenes
    const email = `${phone.replace(/\D/g, '')}@phone.user`;
    const password = '12345678';

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          // User doesn't exist, sign them up
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { phone }
            }
          });
          
          if (signUpError) throw signUpError;
          
          // Upsert profile
          if (signUpData.user) {
            await supabase.from('profiles').upsert({
              id: signUpData.user.id,
              phone: phone,
              username: `User_${phone.slice(-4)}`
            }, { onConflict: 'id' });
          }
          
          return signUpData;
        }
        throw error;
      }
      return data;
    } catch (err) {
      throw new Error(friendlyError(err.message));
    }
  };

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
