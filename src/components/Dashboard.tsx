import React, { useEffect, useState } from 'react';
import { Flame, Activity, Footprints, CheckCircle, Utensils, Dumbbell, Camera, MessageCircle, Lightbulb } from 'lucide-react';

interface DashboardProps {
  onNavigate: (screen: any) => void;
}

export const Dashboard = React.forwardRef<{ refresh: () => void }, DashboardProps>(({ onNavigate }, ref) => {
  const [userName, setUserName] = useState('Fitness User');
  const [greeting, setGreeting] = useState('Good Morning');
  const [stats, setStats] = useState({
    caloriesConsumed: 1250,
    caloriesBurned: 350,
    steps: 5420,
    workoutCompleted: false
  });
  const [dailyTip, setDailyTip] = useState('Stay hydrated! Drink at least 8 glasses of water today.');
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    console.log('🎯 Dashboard component mounted');
    setGreeting(getGreeting());
    setDailyTip(getDailyTip());
    
    // Try to load user data
    loadUserData();
    
    // Generate demo stats
    generateDemoStats();
    

  }, []);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  const getDailyTip = () => {
    const tips = [
      "Stay hydrated! Drink at least 8 glasses of water today.",
      "Consistency beats perfection. Small daily efforts lead to big results!",
      "Don't forget to stretch before and after your workout.",
      "Aim for 7-9 hours of sleep for optimal recovery.",
      "Protein is essential for muscle recovery. Include it in every meal!",
      "Mix up your workouts to prevent plateaus and boredom.",
      "Listen to your body. Rest days are just as important as workout days.",
      "Meal prep on Sundays to set yourself up for success all week!",
      "Track your progress with photos, not just the scale.",
      "Celebrate small wins! Every step forward is progress."
    ];
    
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return tips[dayOfYear % tips.length];
  };
  
  const loadUserData = () => {
    console.log('🔍 Loading user data...');
    
    if (typeof window !== 'undefined') {
      try {
        // Try localStorage
        const storedProfile = localStorage.getItem('demo_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          if (profile.name) {
            setUserName(profile.name);
            console.log('✅ Loaded user name from localStorage:', profile.name);
            return;
          }
        }
        
        // Try signup prefill
        const storedPrefill = localStorage.getItem('signup_prefill');
        if (storedPrefill) {
          const prefill = JSON.parse(storedPrefill);
          if (prefill.name) {
            setUserName(prefill.name);
            console.log('✅ Loaded user name from signup prefill:', prefill.name);
            return;
          }
        }
        
        console.log('⚠️ No user data found in localStorage');
      } catch (error) {
        console.error('❌ Error loading user data:', error);
      }
    }
    
    // Fallback to demo user
    setUserName('Fitness Enthusiast');
    console.log('🏷️ Using fallback user name: Fitness Enthusiast');
  };
  
  const generateDemoStats = () => {
    const currentHour = new Date().getHours();
    const isActiveTime = currentHour >= 6 && currentHour <= 22;
    
    const demoStats = {
      caloriesConsumed: isActiveTime ? Math.floor(Math.random() * 1500) + 800 : Math.floor(Math.random() * 600) + 200,
      caloriesBurned: isActiveTime ? Math.floor(Math.random() * 400) + 150 : Math.floor(Math.random() * 150) + 50,
      steps: isActiveTime ? Math.floor(Math.random() * 6000) + 2000 : Math.floor(Math.random() * 1500) + 500,
      workoutCompleted: Math.random() > 0.6
    };
    
    setStats(demoStats);
    console.log('📊 Generated demo stats:', demoStats);
  };
  
  // Expose refresh function
  React.useImperativeHandle(
    ref,
    () => ({
      refresh: () => {
        loadUserData();
        generateDemoStats();
      }
    }),
    []
  );
  

  
  // No loading state - always show content
  if (loading) {
    return (
      <div className="p-4 md:p-8 lg:p-12 pb-24 md:pb-10">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="animate-spin w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8 lg:p-12 pb-24 md:pb-10">
      <div className="container mx-auto space-y-8 lg:space-y-12">
        {/* Header - Always visible */}
        <div className="bg-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                <span className="text-sm font-medium uppercase tracking-wide leading-none" style={{ color: '#94A3B8' }}>{greeting}</span>
              </div>
              <h1 className="text-4xl font-bold mb-6" style={{ color: '#0EA5E9' }}>
                {userName}
              </h1>
              <div className="flex items-center gap-2" style={{ color: '#64748B' }}>
                <svg className="w-5 h-5" style={{ color: '#94A3B8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-green-50 rounded-2xl px-6 py-4 border border-green-200 shadow-lg">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="text-sm font-semibold leading-none" style={{ color: '#065f46' }}>Ready to train</span>
            </div>
            

          </div>
        </div>
        
        {/* Stats Cards - Always visible */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
              <h2 className="text-2xl font-semibold" style={{ color: '#0F172A' }}>Today's Progress</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <span className="leading-none">Live Data</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Calories Consumed Card */}
            <div className="bg-white card-hover rounded-2xl p-6 group cursor-pointer relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#0EA5E9' }}>
                    <Flame className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold mb-1 leading-tight" style={{ color: '#0F172A' }}>{stats.caloriesConsumed}</p>
                    <p className="text-sm font-medium uppercase tracking-wide leading-none" style={{ color: '#94A3B8' }}>kcal</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold" style={{ color: '#0F172A' }}>Calories Consumed</h3>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: '65%', backgroundColor: '#0EA5E9' }} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: '#64748B' }}>Daily Goal</span>
                      <span className="font-semibold" style={{ color: '#0EA5E9' }}>65%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Calories Burned Card */}
            <div className="bg-white card-hover rounded-2xl p-6 group cursor-pointer relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#0EA5E9' }}>
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>{stats.caloriesBurned}</p>
                    <p className="text-sm font-medium uppercase tracking-wide" style={{ color: '#94A3B8' }}>kcal</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold" style={{ color: '#0F172A' }}>Calories Burned</h3>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: '45%', backgroundColor: '#0EA5E9' }} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: '#64748B' }}>Daily Goal</span>
                      <span className="font-semibold" style={{ color: '#0EA5E9' }}>45%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Steps Card */}
            <div className="bg-white card-hover rounded-2xl p-6 group cursor-pointer relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#D946EF' }}>
                    <Footprints className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>{stats.steps.toLocaleString()}</p>
                    <p className="text-sm font-medium uppercase tracking-wide" style={{ color: '#94A3B8' }}>steps</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold" style={{ color: '#0F172A' }}>Steps Today</h3>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{
                        width: `${Math.min((stats.steps / 10000) * 100, 100)}%`,
                        backgroundColor: '#D946EF'
                      }} />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: '#64748B' }}>Daily Goal</span>
                      <span className="font-semibold" style={{ color: '#D946EF' }}>{Math.round((stats.steps / 10000) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Workout Status Card */}
            <div className="bg-white card-hover rounded-2xl p-6 group cursor-pointer relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style={{
                    backgroundColor: stats.workoutCompleted ? '#10B981' : '#06B6D4'
                  }}>
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold mb-1" style={{ color: '#0F172A' }}>
                      {stats.workoutCompleted ? '✓' : '○'}
                    </p>
                    <p className={`text-sm font-medium uppercase tracking-wide ${
                      stats.workoutCompleted ? 'text-green-600' : 'text-cyan-600'
                    }`}>
                      {stats.workoutCompleted ? 'Done' : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold" style={{ color: '#0F172A' }}>Workout Status</h3>
                  <div className={`text-sm font-bold px-4 py-3 rounded-lg ${
                    stats.workoutCompleted
                      ? 'bg-green-100 text-green-900 border-2 border-green-300'
                      : 'bg-cyan-100 text-cyan-900 border-2 border-cyan-300'
                  }`}>
                    {stats.workoutCompleted ? '🎉 Completed today!' : '💪 Ready to start'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Daily Tip - Always visible */}
        <div className="bg-white rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-56 h-56 bg-blue-50 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex items-center gap-4 mb-4 lg:mb-0">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: '#0EA5E9' }}>
                  <Lightbulb className="w-10 h-10 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-2xl font-semibold" style={{ color: '#0F172A' }}>Daily Fitness Tip</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
                    <span>Expert Advice</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 lg:pl-8 lg:border-l" style={{ borderColor: '#e2e8f0' }}>
                <blockquote className="text-base lg:text-lg leading-relaxed font-medium italic" style={{ color: '#64748B' }}>
                  "{dailyTip}"
                </blockquote>
                <div className="flex items-center gap-2 mt-4 text-sm" style={{ color: '#64748B' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Updated daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions - Always visible */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#10B981' }} />
              <h2 className="text-2xl font-semibold" style={{ color: '#0F172A' }}>Quick Actions</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
              <span>Get started</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Log Food Action */}
            <button
              type="button"
              onClick={() => onNavigate('food')}
              className="bg-white card-hover rounded-2xl p-8 text-left group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full group-hover:scale-105 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300" style={{ backgroundColor: '#0EA5E9' }}>
                    <Utensils className="w-9 h-9 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-3 group-hover:text-blue-600 transition-colors" style={{ color: '#0F172A' }}>Log Food</h4>
                <p className="leading-relaxed mb-4" style={{ color: '#94A3B8' }}>Track your meals and nutrition intake with precision</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
                  <span>AI-Powered Analysis</span>
                </div>
              </div>
            </button>
            
            {/* Start Workout Action */}
            <button
              type="button"
              onClick={() => onNavigate('workouts')}
              className="bg-white card-hover rounded-2xl p-8 text-left group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full group-hover:scale-105 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300" style={{ backgroundColor: '#0EA5E9' }}>
                    <Dumbbell className="w-9 h-9 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-3 group-hover:text-blue-600 transition-colors" style={{ color: '#0F172A' }}>Start Workout</h4>
                <p className="leading-relaxed mb-4" style={{ color: '#94A3B8' }}>Begin your personalized training session</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
                  <span>Real-time Tracking</span>
                </div>
              </div>
            </button>
            
            {/* Check Posture Action */}
            <button
              type="button"
              onClick={() => onNavigate('posture')}
              className="bg-white card-hover rounded-2xl p-8 text-left group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full group-hover:scale-105 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300" style={{ backgroundColor: '#D946EF' }}>
                    <Camera className="w-9 h-9 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-3 group-hover:text-purple-600 transition-colors" style={{ color: '#0F172A' }}>Check Posture</h4>
                <p className="leading-relaxed mb-4" style={{ color: '#94A3B8' }}>AI-powered form analysis for optimal results</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D946EF' }} />
                  <span>Computer Vision</span>
                </div>
              </div>
            </button>
            
            {/* AI Coach Action */}
            <button
              type="button"
              onClick={() => onNavigate('coach')}
              className="bg-white card-hover rounded-2xl p-8 text-left group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-50 rounded-full group-hover:scale-105 transition-transform duration-300" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300" style={{ backgroundColor: '#06B6D4' }}>
                    <MessageCircle className="w-9 h-9 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-white text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#06B6D4' }}>
                    <span>NEW</span>
                  </div>
                </div>
                <h4 className="font-bold text-xl mb-3 group-hover:text-cyan-600 transition-colors" style={{ color: '#0F172A' }}>AI Coach</h4>
                <p className="leading-relaxed mb-4" style={{ color: '#94A3B8' }}>Get personalized fitness advice and guidance</p>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#64748B' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06B6D4' }} />
                  <span>Powered by AI</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
