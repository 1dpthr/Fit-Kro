import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

interface AuthScreenProps {
  // onSuccess may be called with an optional object indicating whether this was a signup flow
  onSuccess: (opts?: { type?: 'signup' | 'signin'; prefill?: { email?: string; name?: string } }) => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    setSignupError(null);
    
    try {
      console.log(`🔐 Attempting to ${mode} with email: ${email}`);
      
      if (mode === 'signin') {
        // Sign in flow
        console.log('🔑 Attempting sign in...');
        
        // Check if this is a demo account
        const isDemoMode = email.includes('@demo') || email.includes('@test') || email.includes('@example');
        
        if (isDemoMode) {
          // Demo mode: Check local storage
          console.log('🎭 Demo sign-in detected - checking local storage');
          
          const demoUser = localStorage.getItem('demo_user');
          const demoSession = localStorage.getItem('demo_session');
          
          if (demoUser && demoSession) {
            const userData = JSON.parse(demoUser);
            const sessionData = JSON.parse(demoSession);
            
            // Verify credentials match
            if (userData.email === email && userData.password === password) {
              console.log('✅ Demo sign-in successful!');
              toast.success('Welcome back! 🎉');
              onSuccess({ type: 'signin' });
              return;
            } else {
              console.log('❌ Demo credentials do not match');
              toast.error('Invalid email or password for demo account');
              return;
            }
          } else {
            console.log('❌ No demo account found');
            toast.error('No demo account found. Please create a demo account first.');
            return;
          }
        }
        
        // Regular Supabase sign-in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error('❌ Sign in error:', error);
          let errorMessage = 'Sign in failed';
          
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again. If you just created an account, please try signing up first.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please check your email and click the confirmation link before signing in.';
          } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Too many attempts. Please wait a moment and try again.';
          } else {
            errorMessage = `Sign in failed: ${error.message}`;
          }
          
          toast.error(errorMessage);
          return;
        }
        
        if (data.session && data.user) {
          console.log('✅ Sign in successful! User ID:', data.user.id);
          toast.success('Welcome back! 🎉');
          onSuccess({ type: 'signin' });
        } else {
          console.log('⚠️ Sign in completed but missing data:', { session: !!data.session, user: !!data.user });
          toast.error('Sign in completed but session was not created. Please try again.');
        }
      } else {
        // Signup flow - Demo bypass for email limits
        console.log('📝 Attempting signup...');
        
        // Check if we should use demo mode to bypass email limits
        const isDemoMode = email.includes('@demo') || email.includes('@test') || email.includes('@example');
        
        if (isDemoMode) {
          // Demo mode: Skip Supabase signup and use local storage
          console.log('🎭 Demo mode detected - using local storage auth');
          
          // Store demo user data
          const demoUser = {
            email,
            password,
            name: email.split('@')[0],
            created_at: new Date().toISOString(),
            isDemo: true
          };
          
          localStorage.setItem('demo_user', JSON.stringify(demoUser));
          localStorage.setItem('demo_session', JSON.stringify({
            access_token: 'demo_token_' + Date.now(),
            user: demoUser
          }));
          
          // Create prefill data for onboarding
          const prefill = { email, name: email.split('@')[0] };
          localStorage.setItem('signup_prefill', JSON.stringify(prefill));
          
          toast.success('Demo account created! 🎉 Let\'s get you set up!');
          setTimeout(() => onSuccess({ type: 'signup', prefill }), 900);
          return;
        }
        
        // Regular signup with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0]
            },
            emailRedirectTo: undefined // Disable email confirmation for demo
          }
        });
        
        if (error) {
          console.error('❌ Signup error:', error);
          let errorMessage = 'Sign up failed';
          
          if (error.message.includes('User already registered') || error.message.includes('already registered')) {
            errorMessage = 'An account with this email already exists. Please sign in instead.';
            setSignupError(errorMessage);
            toast.error(errorMessage);
            setTimeout(() => setMode('signin'), 2000);
            return;
          } else if (error.message.includes('rate limit') || error.message.includes('mail limit') || error.message.includes('email limit') || error.message.includes('email sending limit')) {
            errorMessage = 'Email sending limit reached. For demo purposes, please use an email like "user@demo.com" to bypass email limits and create a demo account instantly.';
          } else if (error.message.includes('Password should be')) {
            errorMessage = 'Password must be at least 6 characters long.';
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Please enter a valid email address.';
          } else if (error.message.includes('Signup requires a valid password')) {
            errorMessage = 'Please enter a valid password (minimum 6 characters).';
          } else {
            errorMessage = `Sign up failed: ${error.message}`;
          }
          
          setSignupError(errorMessage);
          toast.error(errorMessage);
          return;
        }
        
        if (data.user) {
          console.log('✅ Signup successful! User ID:', data.user.id);
          
          // Always create prefill data for onboarding
          const prefill = { email, name: email.split('@')[0] };
          
          if (data.session) {
            // User is immediately signed in (email confirmation disabled)
            console.log('📧 Immediate sign-in after signup - session created');
            toast.success('Account created! 🎉 Welcome to Fit Kro!');
            // Store prefill in localStorage as backup
            localStorage.setItem('signup_prefill', JSON.stringify(prefill));
            setTimeout(() => onSuccess({ type: 'signup', prefill }), 900);
          } else {
            // For front-end only project, proceed to onboarding even without email confirmation
            console.log('📧 Proceeding to onboarding without email confirmation (front-end only)');
            toast.success('Account created! 🎉 Let\'s get you set up!');
            // Store prefill in localStorage as backup
            localStorage.setItem('signup_prefill', JSON.stringify(prefill));
            setTimeout(() => onSuccess({ type: 'signup', prefill }), 900);
          }
        } else {
          console.log('⚠️ Signup completed but no user returned');
          toast.error('Account creation failed. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('❌ Unexpected authentication error:', error);
      toast.error('An unexpected error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error('Google sign-in failed.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Subtle background orbs (non-distracting) */}
      <div className="absolute top-0 left-0 w-[520px] h-[520px] orb-subtle orb-small bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 orb-no-anim" />
      <div className="absolute bottom-0 right-0 w-[520px] h-[520px] orb-subtle orb-small bg-purple-200 rounded-full translate-x-1/2 translate-y-1/2 orb-no-anim" />
      <div className="absolute top-1/2 left-1/2 w-[360px] h-[360px] orb-small bg-cyan-200 rounded-full -translate-x-1/2 -translate-y-1/2 orb-no-anim" />
      
      <div className="w-full max-w-md lg:max-w-lg relative z-10">
        {/* Enhanced Logo Section */}
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl mb-8 shadow-2xl animate-float-slow border border-default" style={{ backgroundColor: '#0369A1' }}>
            <Dumbbell className="w-14 h-14 text-white" />
          </div>
          <h1 className="heading-xl mb-4">Fit Kro</h1>
          <p className="text-body-lg font-medium leading-relaxed">Train Smart. Eat Smart. Live Better.</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 status-dot bg-success rounded-full" />
            <span className="text-sm text-muted font-medium">Secure & Private</span>
          </div>
        </div>
        
        {/* Professional Auth Card */}
        <div className="glass rounded-3xl p-8 lg:p-10 shadow-2xl border border-default">
          {/* Enhanced Tab Navigation */}
          <div className="flex gap-1 mb-8 bg-surface-secondary p-1.5 rounded-2xl border border-default">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-4 px-6 rounded-xl transition-all duration-300 font-semibold text-base ${
                mode === 'signin' 
                  ? 'bg-surface text-primary shadow-lg scale-105 ring-1 ring-default' 
                  : 'text-secondary hover:text-primary hover:bg-surface-secondary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-4 px-6 rounded-xl transition-all duration-300 font-semibold text-base ${
                mode === 'signup' 
                  ? 'bg-surface text-primary shadow-lg scale-105 ring-1 ring-default' 
                  : 'text-secondary hover:text-primary hover:bg-surface-secondary'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <Input
              type="text"
              label="Email Address"
              placeholder="user@demo.com (use @demo for instant demo account)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="default"
              size="lg"
              className="text-base"
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="default"
              size="lg"
              showPasswordToggle
              className="text-base"
            />
            {signupError && (
              <div>
                <p className="text-sm text-red-600 mt-2" role="alert">{signupError}</p>
              </div>
            )}
            
            {/* Enhanced Mode Toggle Links */}
            {mode === 'signin' && (
              <div className="text-center">
                <p className="text-slate-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="link-primary font-semibold"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            )}
            
            {mode === 'signup' && (
              <div className="text-center">
                <p className="text-slate-600 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="link-primary font-semibold"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign In to Fit Kro' : 'Create Account'}
            </Button>
          </form>


          
          {/* Enhanced Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-default" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-surface text-muted text-sm font-medium">Or continue with</span>
            </div>
          </div>
          
          {/* Enhanced Google Sign In */}
          <Button
            variant="outline"
            size="lg"
            className="w-full text-base font-semibold border-2 hover:border-default hover:bg-surface-secondary"
            onClick={handleGoogleAuth}
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          
          {/* Enhanced Footer */}
          <div className="text-center mt-10 pt-8 border-t border-default">
            <p className="text-muted text-xs leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="link-primary cursor-pointer font-medium">Terms of Service</span>
              {' '}and{' '}
              <span className="link-primary cursor-pointer font-medium">Privacy Policy</span>.<br />
              <span className="text-muted">This app is for demonstration purposes only.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
