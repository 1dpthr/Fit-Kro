// Debug utilities for tracking data flow issues
export class DebugHelper {
  static logLocalStorage() {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 DEBUG: Current localStorage state');
    console.log('📋 All localStorage keys:', Object.keys(localStorage));
    
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`🔑 ${key}:`, value);
      
      try {
        if (value) {
          const parsed = JSON.parse(value);
          console.log(`✅ Parsed ${key}:`, parsed);
        }
      } catch (e) {
        console.log(`⚠️ Failed to parse ${key}:`, e);
      }
    });
  }
  
  static simulateOnboardingComplete() {
    if (typeof window === 'undefined') return;
    
    console.log('🧪 DEBUG: Simulating onboarding completion');
    
    const testProfile = {
      name: "Test User Debug",
      gender: "male",
      age: 25,
      height: 175,
      weight: 70,
      goal: "maintain",
      activityLevel: "moderate",
      dietPreference: "none",
      completed: true,
      timestamp: new Date().toISOString()
    };
    
    // Clear and save
    localStorage.removeItem('demo_profile');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('signup_prefill');
    
    localStorage.setItem('demo_profile', JSON.stringify(testProfile));
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('signup_prefill', JSON.stringify({ email: 'test@example.com', name: 'Test User Debug' }));
    
    console.log('✅ DEBUG: Simulated data saved');
    this.logLocalStorage();
  }
  
  static testDashboardData() {
    if (typeof window === 'undefined') return;
    
    console.log('🧪 DEBUG: Testing dashboard data loading');
    
    // Test each data source
    const sources = [
      'demo_profile',
      'signup_prefill',
      'onboarding_completed'
    ];
    
    sources.forEach(source => {
      const data = localStorage.getItem(source);
      console.log(`🔍 ${source}:`, data);
      
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ Parsed ${source}:`, parsed);
          
          if (source === 'demo_profile' && parsed.name) {
            console.log(`🏷️ Found name in ${source}:`, parsed.name);
          }
          if (source === 'signup_prefill' && parsed.name) {
            console.log(`🏷️ Found name in ${source}:`, parsed.name);
          }
        } catch (e) {
          console.log(`❌ Failed to parse ${source}:`, e);
        }
      } else {
        console.log(`⚠️ No data in ${source}`);
      }
    });
  }
  
  static addGlobalDebugHelpers() {
    if (typeof window === 'undefined') return;
    
    // Add global functions for easy testing in browser console
    (window as any).debugLS = this.logLocalStorage;
    (window as any).debugSimulate = this.simulateOnboardingComplete;
    (window as any).debugTest = this.testDashboardData;
    
    console.log('🛠️ DEBUG: Global debug helpers added');
    console.log('💡 Use debugLS(), debugSimulate(), debugTest() in console');
  }
}
