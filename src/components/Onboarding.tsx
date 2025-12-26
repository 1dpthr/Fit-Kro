import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { toast } from 'sonner';
import { projectId } from '../utils/supabase/info';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { createClient } from '../utils/supabase/client';

interface OnboardingProps {
  onComplete: () => void;
  prefill?: { email?: string; name?: string; age?: number; height?: number; weight?: number };
}

export function Onboarding({ onComplete, prefill }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [name, setName] = useState(prefill?.name ?? '');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState(prefill?.age ? String(prefill.age) : '');
  const [height, setHeight] = useState(prefill?.height ? String(prefill.height) : '');
  const [weight, setWeight] = useState(prefill?.weight ? String(prefill.weight) : '');
  const [goal, setGoal] = useState('maintain');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [dietPreference, setDietPreference] = useState('none');

  // If prefill changes, update fields
  React.useEffect(() => {
    if (prefill?.name) setName(prefill.name);
    if (typeof prefill?.age !== 'undefined') setAge(String(prefill.age));
    if (typeof prefill?.height !== 'undefined') setHeight(String(prefill.height));
    if (typeof prefill?.weight !== 'undefined') setWeight(String(prefill.weight));
  }, [prefill]);
  
  const validateStep = () => {
    if (step === 1) {
      if (!name || !gender || !age) {
        toast.error('Please fill in all fields');
        return false;
      }
      if (parseInt(age) < 13 || parseInt(age) > 100) {
        toast.error('Please enter a valid age between 13 and 100');
        return false;
      }
    }
    
    if (step === 2) {
      if (!height || !weight) {
        toast.error('Please fill in all fields');
        return false;
      }
      if (parseInt(height) < 100 || parseInt(height) > 250) {
        toast.error('Please enter a valid height between 100-250 cm');
        return false;
      }
      if (parseInt(weight) < 30 || parseInt(weight) > 300) {
        toast.error('Please enter a valid weight between 30-300 kg');
        return false;
      }
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    setStep(step - 1);
  };
  
  const handleComplete = async () => {
    if (!validateStep()) return;

    setLoading(true);

    console.log('🚀 Starting onboarding completion process...');
    console.log('📋 Form data:', { name, gender, age, height, weight, goal, activityLevel, dietPreference });

    // Demo mode: prioritize localStorage fallback for frontend demo
    if (typeof window !== 'undefined') {
      try {
        console.log('💾 Saving profile data to localStorage (demo mode)');
        
        // Save profile data to localStorage for demo purposes
        const profileData = {
          name,
          gender,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseInt(weight),
          goal,
          activityLevel,
          dietPreference,
          completed: true,
          timestamp: new Date().toISOString()
        };
        
        console.log('🔄 Saving to localStorage:', profileData);
        
        // Clear any existing data first
        localStorage.removeItem('demo_profile');
        localStorage.removeItem('onboarding_completed');
        
        // Save new data
        localStorage.setItem('demo_profile', JSON.stringify(profileData));
        localStorage.setItem('onboarding_completed', 'true');
        
        // Verify the data was saved
        const savedData = localStorage.getItem('demo_profile');
        const completedData = localStorage.getItem('onboarding_completed');
        
        console.log('✅ Verification - demo_profile saved:', savedData);
        console.log('✅ Verification - onboarding_completed saved:', completedData);
        
        // Debug: List all localStorage keys
        console.log('📋 All localStorage keys:', Object.keys(localStorage));
        
        // Parse and verify the saved data
        if (savedData) {
          const parsed = JSON.parse(savedData);
          console.log('✅ Parsed saved data:', parsed);
          console.log('✅ User name in saved data:', parsed.name);
        }
        
        console.log('✅ Profile saved to localStorage successfully');
        toast.success('🎉 Profile saved successfully! Welcome to Fit Kro!');
        
        // Small delay to show success message before transitioning
        setTimeout(() => {
          console.log('🎯 Calling onComplete callback...');
          onComplete();
        }, 500);
        return;
      } catch (localStorageError) {
        console.error('❌ localStorage failed completely:', localStorageError);
        
        // Try alternative localStorage methods
        try {
          console.log('🔄 Trying alternative localStorage method...');
          const profileData = {
            name,
            gender,
            age: parseInt(age),
            height: parseInt(height),
            weight: parseInt(weight),
            goal,
            activityLevel,
            dietPreference,
            completed: true,
            timestamp: new Date().toISOString()
          };
          
          // Try sessionStorage as alternative
          sessionStorage.setItem('demo_profile', JSON.stringify(profileData));
          console.log('✅ Data saved to sessionStorage as fallback');
          
        } catch (sessionError) {
          console.error('❌ Both localStorage and sessionStorage failed:', sessionError);
          toast.error('Storage failed - dashboard may not display properly');
        }
      }
    }

    // Server fallback (only if localStorage fails)
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.warn('⚠️ No session found, using localStorage only');
        toast.success('🎉 Profile saved locally! Welcome to Fit Kro!');
        setTimeout(() => {
          onComplete();
        }, 500);
        return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-d4a017ee/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name,
          gender,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseInt(weight),
          goal,
          activityLevel,
          dietPreference
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn('⚠️ Server profile save failed, using localStorage fallback');
        // Still save to localStorage as fallback
        const fallbackProfile = {
          name,
          gender,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseInt(weight),
          goal,
          activityLevel,
          dietPreference,
          completed: true,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('demo_profile', JSON.stringify(fallbackProfile));
        localStorage.setItem('onboarding_completed', 'true');
        toast.success('🎉 Profile saved locally! Welcome to Fit Kro!');
      } else {
        console.log('✅ Server profile save successful');
        toast.success('🎉 Profile saved successfully! Welcome to Fit Kro!');
      }

      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (error: any) {
      console.warn('⚠️ Server call failed, using localStorage fallback:', error);
      
      // Final fallback to localStorage
      if (typeof window !== 'undefined') {
        const fallbackProfile = {
          name,
          gender,
          age: parseInt(age),
          height: parseInt(height),
          weight: parseInt(weight),
          goal,
          activityLevel,
          dietPreference,
          completed: true,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('demo_profile', JSON.stringify(fallbackProfile));
        localStorage.setItem('onboarding_completed', 'true');
        toast.success('🎉 Profile saved locally! Welcome to Fit Kro!');
      }
      
      setTimeout(() => {
        onComplete();
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full blur-3xl opacity-25 translate-x-1/3 -translate-y-1/3 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-200 rounded-full blur-3xl opacity-25 -translate-x-1/3 translate-y-1/3 animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-slate-500">Step {step} of 3</span>
              <h3 className="text-slate-900 mt-1">Let's Get Started</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl text-slate-900">{Math.round((step / 3) * 100)}%</span>
              <p className="text-sm text-slate-500">Complete</p>
            </div>
          </div>
          <div className="h-3 bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full transition-all duration-700 ease-out shadow-lg"
              style={{ 
                width: `${(step / 3) * 100}%`,
                backgroundColor: '#0EA5E9'
              }}
            />
          </div>
        </div>
        
        {/* Onboarding Card */}
        <div className="glass rounded-[var(--radius-card)] p-10 md:p-12 shadow-2xl">
          {step === 1 && (
            <div className="space-y-7">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-5 shadow-xl animate-float" style={{ backgroundColor: '#0EA5E9' }}>
                  <span className="text-4xl">👋</span>
                </div>
                <h2 className="text-slate-900 mb-3">Personal Information</h2>
                <p className="text-slate-600">Let's get to know you better</p>
              </div>
              
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
              
              <Input
                label="Age"
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
              
              <Button
                variant="primary"
                className="w-full mt-8"
                onClick={handleNext}
              >
                Next <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-7">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-5 shadow-xl animate-float" style={{ backgroundColor: '#D946EF' }}>
                  <span className="text-4xl">📏</span>
                </div>
                <h2 className="text-slate-900 mb-3">Body Metrics</h2>
                <p className="text-slate-600">Help us personalize your experience</p>
              </div>
              
              <Input
                label="Height (cm)"
                type="number"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
              
              <Input
                label="Weight (kg)"
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
              
              <div className="flex gap-4 mt-8">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 w-5 h-5" /> Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleNext}
                >
                  Next <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-7">
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] mb-5 shadow-xl animate-float" style={{ backgroundColor: '#06B6D4' }}>
                  <span className="text-4xl">🎯</span>
                </div>
                <h2 className="text-slate-900 mb-3">Goals & Preferences</h2>
                <p className="text-slate-600">Let's customize your fitness plan</p>
              </div>
              
              <Select
                label="Fitness Goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                options={[
                  { value: 'lose', label: '🔥 Lose Weight' },
                  { value: 'gain', label: '💪 Gain Muscle' },
                  { value: 'maintain', label: '⚖️ Maintain Fitness' }
                ]}
              />
              
              <Select
                label="Activity Level"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                options={[
                  { value: 'sedentary', label: '😴 Sedentary (Little or no exercise)' },
                  { value: 'light', label: '🚶 Lightly Active (1-3 days/week)' },
                  { value: 'moderate', label: '🏃 Moderately Active (3-5 days/week)' },
                  { value: 'very', label: '🔥 Very Active (6-7 days/week)' }
                ]}
              />
              
              <Select
                label="Diet Preference"
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                options={[
                  { value: 'none', label: '🍽️ No Preference' },
                  { value: 'vegetarian', label: '🥗 Vegetarian' },
                  { value: 'vegan', label: '🌱 Vegan' },
                  { value: 'keto', label: '🥑 Keto' },
                  { value: 'paleo', label: '🍖 Paleo' }
                ]}
              />
              
              <div className="flex gap-4 mt-8">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 w-5 h-5" /> Back
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : '✨ Complete'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}