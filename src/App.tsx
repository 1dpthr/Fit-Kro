import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { createClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { DebugHelper } from './utils/debug';
import { ForceDataHelper } from './utils/forceData';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { WorkoutsScreen } from './components/WorkoutsScreen';
import { FoodScreen } from './components/FoodScreen';
import { PostureScreen } from './components/PostureScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { CoachScreen } from './components/CoachScreen';
import { ProfileScreen } from './components/ProfileScreen';

import './styles/globals.css';

type AppState = 'loading' | 'auth' | 'onboarding' | 'app';
type Screen = 'dashboard' | 'workouts' | 'food' | 'progress' | 'profile' | 'posture' | 'coach';

export default function App() {
  // Default to the auth screen on startup so the app begins on the login/signup flow
  const [appState, setAppState] = useState<AppState>('auth');
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [onboardingPrefill, setOnboardingPrefill] = useState<{ email?: string; name?: string } | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState<number>(0);
  const dashboardRef = React.useRef<{ refresh: () => void }>(null);
  const supabase = createClient();
  
  useEffect(() => {
    // Initialize debug helpers
    if (typeof window !== 'undefined') {
      DebugHelper.addGlobalDebugHelpers();
      console.log('🛠️ DEBUG: Debug helpers initialized');
      
      // Initialize force data helpers
      ForceDataHelper.addGlobalHelpers();
      console.log('🛠️ FORCE: Force data helpers initialized');
      
      // Log current localStorage state
      DebugHelper.logLocalStorage();
    }
    
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      
      // DEV OVERRIDES: Force specific screens for testing
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('auth') === '1') {
          console.log('🔧 Dev override: forcing auth screen');
          setAppState('auth');
          return;
        }
        if (params.get('onboarding') === '1') {
          console.log('🔧 Dev override: forcing onboarding screen');
          setAppState('onboarding');
          return;
        }
      }

      // Check for demo account first (for demo users created with @demo emails)
      if (typeof window !== 'undefined') {
        const demoSession = localStorage.getItem('demo_session');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoSession && demoUser) {
          console.log('🎭 Demo account detected - checking onboarding status');
          
          const onboardingCompleted = localStorage.getItem('onboarding_completed');
          if (onboardingCompleted === 'true') {
            console.log('✅ Demo user onboarding completed - proceeding to app');
            setAppState('app');
            return;
          } else {
            console.log('📋 Demo user needs onboarding - proceeding to onboarding');
            setAppState('onboarding');
            return;
          }
        }
      }

      // Check Supabase session for regular accounts
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        console.log('🚨 Session error - redirecting to auth');
        setAppState('auth');
        return;
      }
      
      if (!session) {
        console.log('🚫 No active session - redirecting to auth');
        setAppState('auth');
        return;
      }
      
      console.log('✅ User authenticated with Supabase session - User ID:', session.user.id);
      
      // User is authenticated, check if they need onboarding
      try {
        console.log('🔍 Checking user profile for onboarding status...');
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/profile`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Profile check response:', data);
          
          if (data.profile && data.profile.completed) {
            console.log('✅ Profile completed - proceeding to app');
            // Mark as completed in localStorage as backup
            localStorage.setItem('onboarding_completed', 'true');
            setAppState('app');
          } else {
            console.log('📋 Profile incomplete - proceeding to onboarding');
            localStorage.setItem('onboarding_completed', 'false');
            setAppState('onboarding');
          }
        } else {
          console.warn('⚠️ Profile endpoint failed (status:', response.status, ')');
          // Check localStorage fallback
          const fallbackProfile = localStorage.getItem('onboarding_completed');
          if (fallbackProfile === 'true') {
            console.log('📱 Using localStorage fallback - profile completed');
            setAppState('app');
          } else {
            console.log('📱 Using localStorage fallback - profile incomplete');
            setAppState('onboarding');
          }
        }
      } catch (profileError) {
        console.warn('⚠️ Profile check error:', profileError);
        // Check localStorage fallback
        const fallbackProfile = localStorage.getItem('onboarding_completed');
        if (fallbackProfile === 'true') {
          console.log('📱 Using localStorage fallback after error - profile completed');
          setAppState('app');
        } else {
          console.log('📱 Using localStorage fallback after error - profile incomplete');
          setAppState('onboarding');
        }
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      console.log('🚨 Auth check failed - redirecting to auth');
      setAppState('auth');
    }
  };
  
  const handleAuthSuccess = async (opts?: { type?: 'signup' | 'signin'; prefill?: { email?: string; name?: string }; simulated?: boolean }) => {
    console.log('🎯 handleAuthSuccess called with:', opts);
    
    // If the user just signed up, immediately go to onboarding and pass prefill
    if (opts?.type === 'signup') {
      console.log('✅ Processing signup - navigating to onboarding');
      
      // Try to get prefill data from options or localStorage fallback
      let prefill = opts.prefill;
      
      if (!prefill?.email) {
        console.log('🔍 No prefill in options, checking localStorage fallback...');
        try {
          const storedPrefill = localStorage.getItem('signup_prefill');
          if (storedPrefill) {
            prefill = JSON.parse(storedPrefill);
            console.log('📱 Retrieved prefill from localStorage:', prefill);
          }
        } catch (e) {
          console.warn('⚠️ Failed to parse stored prefill:', e);
        }
      }

      // Require a valid email prefill to avoid accidental onboarding triggers
      if (!prefill?.email) {
        console.warn('⚠️ No valid prefill email found - redirecting to signin');
        setAppState('auth');
        return;
      }

      // Store prefill data in localStorage for Dashboard access
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('signup_prefill', JSON.stringify(prefill));
          console.log('💾 Stored prefill data in localStorage:', prefill);
        } catch (e) {
          console.warn('⚠️ Failed to store prefill in localStorage:', e);
        }
      }

      // For signups, always proceed to onboarding if we have prefill data
      // This removes the complex session checking that was blocking navigation
      console.log('🚀 Setting onboarding prefill and navigating to onboarding');
      setOnboardingPrefill(prefill);
      setAppState('onboarding');
      return;
    }

    // For sign-ins, check auth state and redirect appropriately
    if (opts?.type === 'signin') {
      console.log('✅ Processing signin - checking auth state');
      
      // Check if this is a demo signin
      if (typeof window !== 'undefined') {
        const demoSession = localStorage.getItem('demo_session');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoSession && demoUser) {
          console.log('🎭 Demo signin detected - checking onboarding status');
          
          const onboardingCompleted = localStorage.getItem('onboarding_completed');
          if (onboardingCompleted === 'true') {
            console.log('✅ Demo user completed onboarding - proceeding to app');
            setAppState('app');
            return;
          } else {
            console.log('📋 Demo user needs onboarding - proceeding to onboarding');
            setAppState('onboarding');
            return;
          }
        }
      }
      
      // Regular Supabase signin
      try {
        await checkAuth();
      } catch (e) {
        console.error('❌ Auth check failed after signin:', e);
        setAppState('auth');
      }
      return;
    }

    // Default fallback
    console.log('⚠️ Unknown auth success type, defaulting to auth check');
    try {
      await checkAuth();
    } catch (e) {
      setAppState('auth');
    }
  };

  
  const handleOnboardingComplete = () => {
    // Completed onboarding — mark as completed and enter the app
    console.log('🎉 Onboarding completed - entering app');
    
    if (typeof window !== 'undefined') {
      console.log('💾 Setting onboarding_completed to true in localStorage');
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.removeItem('signup_email');
      
      // Debug: Check what data we have in localStorage
      console.log('📋 localStorage keys after onboarding:', Object.keys(localStorage));
      console.log('💾 demo_profile data:', localStorage.getItem('demo_profile'));
      console.log('✅ onboarding_completed status:', localStorage.getItem('onboarding_completed'));
    }
    
    console.log('🔄 Setting app state to "app"');
    setAppState('app');
    console.log('🎯 App state transition complete');
  };
  
  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };
  
  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };
  
  // Development helper for testing auth flow
  const handleDevAuthTest = () => {
    if (typeof window !== 'undefined' && window.location.search.includes('dev=1')) {
      console.log('🧪 Development mode: Testing auth flow');
      
      // Simulate successful signup
      const testPrefill = { 
        email: 'test@example.com', 
        name: 'Test User' 
      };
      
      console.log('🎯 Simulating signup with prefill:', testPrefill);
      handleAuthSuccess({ 
        type: 'signup', 
        prefill: testPrefill,
        simulated: true 
      });
    }
  };
  
  // Add dev auth test on mount if dev mode is enabled
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('dev=1')) {
      handleDevAuthTest();
    }
  }, []);
  
  // Loading State
  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Auth Screen
  if (appState === 'auth') {
    return (
      <>
        <AuthScreen onSuccess={handleAuthSuccess} />
        <Toaster position="top-center" richColors />
      </>
    );
  }
  
  // Onboarding Screen (clean layout without sidebar)
  if (appState === 'onboarding') {
    return (
      <div className="min-h-screen bg-white">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <main id="main-content" className="min-h-screen px-4 md:px-8 py-8 overflow-y-auto">
          <div className="container mx-auto w-full">
            <Onboarding onComplete={handleOnboardingComplete} prefill={onboardingPrefill ?? undefined} />
          </div>
        </main>
        <Toaster position="top-center" richColors />
      </div>
    );
  }
  
  // Special full-screen views
  if (currentScreen === 'posture') {
    return (
      <>
        <PostureScreen onBack={handleBackToDashboard} />
        <Toaster position="top-center" richColors />
      </>
    );
  }
  
  if (currentScreen === 'coach') {
    return (
      <>
        <CoachScreen onBack={handleBackToDashboard} />
        <Toaster position="top-center" richColors />
      </>
    );
  }
  
  // Main App with Navigation
  return (
    <div className="min-h-screen bg-white">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="flex min-h-screen">
        <Sidebar currentScreen={currentScreen} onNavigate={handleNavigate} />
        <main id="main-content" className="flex-1 px-4 md:px-8 py-8 overflow-y-auto min-h-screen md:ml-56">
          <div className="container mx-auto w-full">
            {currentScreen === 'dashboard' && (
              <Dashboard 
                onNavigate={handleNavigate} 
                ref={dashboardRef}
              />
            )}
            {currentScreen === 'workouts' && (
              <WorkoutsScreen 
                onNavigate={handleNavigate} 
                refreshDashboard={() => dashboardRef.current?.refresh()}
              />
            )}
            {currentScreen === 'food' && <FoodScreen refreshDashboard={() => dashboardRef.current?.refresh()} />}
            {currentScreen === 'progress' && <ProgressScreen refreshDashboard={() => dashboardRef.current?.refresh()} />}
            {currentScreen === 'profile' && <ProfileScreen />}
          </div>
        </main>
      </div>

      <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />

      <Toaster position="top-center" richColors />
    </div>
  );
}
