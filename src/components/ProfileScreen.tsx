import React, { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Dialog } from '../components/Dialog';
import { User, Mail, Calendar, Scale, Ruler, Target, Activity, UtensilsCrossed, Edit, LogOut, Bell, Shield } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { createClient } from '../utils/supabase/client';
import { toast } from 'sonner';

export function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notAuthenticated, setNotAuthenticated] = useState(false);
  const [noProfileFound, setNoProfileFound] = useState(false);
  
  // Edit form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dietPreference, setDietPreference] = useState('none');
  
  const supabase = createClient();
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  const loadProfile = async () => {
    setLoadingProfile(true);
    setNotAuthenticated(false);
    setNoProfileFound(false);

    try {
      console.log('🔍 Loading profile data for ProfileScreen...');
      
      // Demo mode: Try localStorage first
      if (typeof window !== 'undefined') {
        try {
          const storedProfile = localStorage.getItem('demo_profile');
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            console.log('✅ Loaded profile from localStorage:', profile);
            
            // Add email from signup prefill if available
            const storedPrefill = localStorage.getItem('signup_prefill');
            if (storedPrefill) {
              const prefill = JSON.parse(storedPrefill);
              profile.email = prefill.email || profile.email || 'demo@example.com';
            }
            
            setProfile(profile);
            
            // Initialize edit form
            setName(profile.name || '');
            setAge(profile.age ? profile.age.toString() : '');
            setGender(profile.gender || 'male');
            setHeight(profile.height ? profile.height.toString() : '');
            setWeight(profile.weight ? profile.weight.toString() : '');
            setGoal(profile.goal || 'maintain');
            setActivityLevel(profile.activityLevel || 'moderate');
            setDietPreference(profile.dietPreference || 'none');
            
            setLoadingProfile(false);
            return;
          }
        } catch (localStorageError) {
          console.warn('⚠️ Failed to load from localStorage:', localStorageError);
        }
      }
      
      // Try to get name from signup prefill as fallback
      if (typeof window !== 'undefined') {
        try {
          const storedPrefill = localStorage.getItem('signup_prefill');
          if (storedPrefill) {
            const prefill = JSON.parse(storedPrefill);
            console.log('📱 Using prefill data for profile:', prefill);
            
            const fallbackProfile = {
              name: prefill.name || 'User',
              email: prefill.email || 'demo@example.com',
              age: 25,
              gender: 'male',
              height: 170,
              weight: 70,
              goal: 'maintain',
              activityLevel: 'moderate',
              dietPreference: 'none',
              createdAt: new Date().toISOString()
            };
            
            setProfile(fallbackProfile);
            
            // Initialize edit form
            setName(fallbackProfile.name);
            setAge(fallbackProfile.age.toString());
            setGender(fallbackProfile.gender);
            setHeight(fallbackProfile.height.toString());
            setWeight(fallbackProfile.weight.toString());
            setGoal(fallbackProfile.goal);
            setActivityLevel(fallbackProfile.activityLevel);
            setDietPreference(fallbackProfile.dietPreference);
            
            setLoadingProfile(false);
            return;
          }
        } catch (prefillError) {
          console.warn('⚠️ Failed to load prefill:', prefillError);
        }
      }
      
      // Server fallback (only if localStorage fails)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              console.log('✅ Loaded profile from server:', data.profile);
              setProfile(data.profile);
              
              // Initialize edit form
              setName(data.profile.name);
              setAge(data.profile.age.toString());
              setGender(data.profile.gender);
              setHeight(data.profile.height.toString());
              setWeight(data.profile.weight.toString());
              setGoal(data.profile.goal);
              setActivityLevel(data.profile.activityLevel);
              setDietPreference(data.profile.dietPreference);
              
              setLoadingProfile(false);
              return;
            }
          }
        } catch (serverError) {
          console.warn('⚠️ Server profile load failed:', serverError);
        }
      }
      
      // Final fallback - no profile found
      console.log('📱 No profile data found, showing no profile found message');
      setNoProfileFound(true);
    } catch (error) {
      console.warn('⚠️ Profile loading failed:', error);
      setNoProfileFound(true);
    } finally {
      setLoadingProfile(false);
    }
  };

  
  const handleSaveProfile = async () => {
    if (!name || !age || !height || !weight) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // Demo mode: Save to localStorage first for frontend demo
      if (typeof window !== 'undefined') {
        try {
          const updatedProfile = {
            name,
            age: parseInt(age),
            gender,
            height: parseInt(height),
            weight: parseInt(weight),
            goal,
            activityLevel,
            dietPreference,
            updatedAt: new Date().toISOString()
          };
          
          // Get existing profile data to preserve email and other fields
          const storedProfile = localStorage.getItem('demo_profile');
          if (storedProfile) {
            const existingProfile = JSON.parse(storedProfile);
            const mergedProfile = { ...existingProfile, ...updatedProfile };
            localStorage.setItem('demo_profile', JSON.stringify(mergedProfile));
          } else {
            localStorage.setItem('demo_profile', JSON.stringify(updatedProfile));
          }
          
          console.log('✅ Updated profile in localStorage:', updatedProfile);
          toast.success('Profile updated successfully!');
          setShowEdit(false);
          loadProfile(); // Reload to update the display
          return;
        } catch (localStorageError) {
          console.warn('⚠️ localStorage save failed:', localStorageError);
        }
      }
      
      // Server fallback (only if localStorage fails)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              name,
              age: parseInt(age),
              gender,
              height: parseInt(height),
              weight: parseInt(weight),
              goal,
              activityLevel,
              dietPreference
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            console.log('✅ Updated profile via server');
            toast.success('Profile updated successfully!');
            setShowEdit(false);
            loadProfile();
            return;
          }
        } catch (serverError) {
          console.warn('⚠️ Server profile update failed:', serverError);
        }
      }
      
      // Final fallback - create profile data locally
      const fallbackProfile = {
        name,
        age: parseInt(age),
        gender,
        height: parseInt(height),
        weight: parseInt(weight),
        goal,
        activityLevel,
        dietPreference,
        updatedAt: new Date().toISOString()
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_profile', JSON.stringify(fallbackProfile));
      }
      
      console.log('✅ Created profile locally as fallback');
      toast.success('Profile saved locally!');
      setShowEdit(false);
      loadProfile();
    } catch (error) {
      console.warn('⚠️ Profile update failed:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out...');
      
      // Check if this is a demo account first
      if (typeof window !== 'undefined') {
        const demoSession = localStorage.getItem('demo_session');
        const demoUser = localStorage.getItem('demo_user');
        
        if (demoSession && demoUser) {
          // Demo account sign out - clear localStorage
          console.log('🎭 Demo account detected - clearing localStorage');
          
          localStorage.removeItem('demo_session');
          localStorage.removeItem('demo_user');
          localStorage.removeItem('demo_profile');
          localStorage.removeItem('signup_prefill');
          localStorage.removeItem('onboarding_completed');
          
          toast.success('Signed out successfully');
          console.log('✅ Demo sign out completed');
          
          // Reload to go back to auth screen
          setTimeout(() => {
            window.location.reload();
          }, 500);
          return;
        }
      }
      
      // Regular Supabase sign out
      console.log('🔑 Regular Supabase sign out');
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };
  
  const formatGoal = (goal: string) => {
    const goals: { [key: string]: string } = {
      lose: 'Lose Weight',
      gain: 'Gain Muscle',
      maintain: 'Maintain Fitness'
    };
    return goals[goal] || goal;
  };
  
  const formatActivityLevel = (level: string) => {
    const levels: { [key: string]: string } = {
      sedentary: 'Sedentary',
      light: 'Lightly Active',
      moderate: 'Moderately Active',
      very: 'Very Active'
    };
    return levels[level] || level;
  };
  
  const formatDietPreference = (diet: string) => {
    const diets: { [key: string]: string } = {
      none: 'No Preference',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      keto: 'Keto',
      paleo: 'Paleo'
    };
    return diets[diet] || diet;
  };
  
  if (loadingProfile) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-slate-500">Loading profile...</div>
      </div>
    );
  }

  if (notAuthenticated) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 mb-2">You are not signed in</p>
          <p className="text-muted mb-4">Please sign in to view and edit your profile.</p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={() => { window.location.href = '/?auth=1' }}>
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (noProfileFound) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 mb-2">No profile found</p>
          <p className="text-muted mb-4">Complete onboarding to set up your profile.</p>
          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={() => { window.location.href = '/?onboarding=1' }}>
              Start Onboarding
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      {/* Header with Personalized Avatar - Clean White Design */}
      <div className="bg-white rounded-2xl p-6 md:p-8 mb-6 shadow-lg">
        <div className="text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: '#0EA5E9' }}>
            <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <h1 className="mb-1 font-bold text-2xl md:text-3xl" style={{ color: '#0F172A' }}>{profile.name}</h1>
          <p className="text-sm md:text-base" style={{ color: '#64748B' }}>{profile.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm" style={{ color: '#94A3B8' }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
            <span>Active member since {new Date(profile.createdAt || Date.now()).getFullYear()}</span>
          </div>
        </div>
      </div>
      
      {/* Profile Information */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
            <h3 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Profile Information</h3>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowEdit(true)}
            className="shadow-lg"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Personal Info Group */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#64748B' }}>Personal Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Name</p>
                  <p className="font-semibold text-lg" style={{ color: '#0F172A' }}>{profile.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#10B981' }}>
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Email</p>
                  <p className="font-semibold text-lg" style={{ color: '#0F172A' }}>{profile.email}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Physical Stats Group */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold mb-4" style={{ color: '#64748B' }}>Physical Stats</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#F59E0B' }}>
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Age</p>
                  <p className="font-semibold" style={{ color: '#0F172A' }}>{profile.age} years</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#D946EF' }}>
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Gender</p>
                  <p className="font-semibold capitalize" style={{ color: '#0F172A' }}>{profile.gender}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#10B981' }}>
                  <Ruler className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Height</p>
                  <p className="font-semibold" style={{ color: '#0F172A' }}>{profile.height} cm</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#64748B' }}>Weight</p>
                  <p className="font-semibold" style={{ color: '#0F172A' }}>{profile.weight} kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Goals & Preferences */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#D946EF' }} />
          <h3 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Goals & Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#D946EF' }}>
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#64748B' }}>Fitness Goal</p>
              <p className="font-semibold" style={{ color: '#0F172A' }}>{formatGoal(profile.goal)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#0EA5E9' }}>
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#64748B' }}>Activity Level</p>
              <p className="font-semibold" style={{ color: '#0F172A' }}>{formatActivityLevel(profile.activityLevel)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md" style={{ backgroundColor: '#06B6D4' }}>
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#64748B' }}>Diet Preference</p>
              <p className="font-semibold" style={{ color: '#0F172A' }}>{formatDietPreference(profile.dietPreference)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 rounded-full" style={{ backgroundColor: '#0EA5E9' }} />
          <h3 className="text-2xl font-bold" style={{ color: '#0F172A' }}>Settings</h3>
        </div>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" style={{ color: '#64748B' }} />
              <span className="font-medium" style={{ color: '#0F172A' }}>Notifications</span>
            </div>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" style={{ color: '#64748B' }} />
              <span className="font-medium" style={{ color: '#0F172A' }}>Privacy & Disclaimer</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Sign Out Button */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={handleSignOut}
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sign Out
      </Button>
      
      {/* Footer */}
      <div className="text-center mt-6 text-slate-500">
        <p>Fit Kro v1.0.0</p>
        <p className="mt-1">Train Smart. Eat Smart.</p>
        <p className="mt-2">
          This app is for demonstration purposes only and not intended for medical advice.
        </p>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit Profile"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
            
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Height (cm)"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
            
            <Input
              label="Weight (kg)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          
          <Select
            label="Fitness Goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            options={[
              { value: 'lose', label: 'Lose Weight' },
              { value: 'gain', label: 'Gain Muscle' },
              { value: 'maintain', label: 'Maintain Fitness' }
            ]}
          />
          
          <Select
            label="Activity Level"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            options={[
              { value: 'sedentary', label: 'Sedentary (Little or no exercise)' },
              { value: 'light', label: 'Lightly Active (1-3 days/week)' },
              { value: 'moderate', label: 'Moderately Active (3-5 days/week)' },
              { value: 'very', label: 'Very Active (6-7 days/week)' }
            ]}
          />
          
          <Select
            label="Diet Preference"
            value={dietPreference}
            onChange={(e) => setDietPreference(e.target.value)}
            options={[
              { value: 'none', label: 'No Preference' },
              { value: 'vegetarian', label: 'Vegetarian' },
              { value: 'vegan', label: 'Vegan' },
              { value: 'keto', label: 'Keto' },
              { value: 'paleo', label: 'Paleo' }
            ]}
          />
          
          <Button
            variant="primary"
            className="w-full"
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}