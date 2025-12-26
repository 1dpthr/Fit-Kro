// Force data injection system for immediate dashboard fixes
export class ForceDataHelper {
  static injectTestUser() {
    if (typeof window === 'undefined') return;
    
    console.log('🔧 FORCE: Injecting test user data');
    
    // Clear all existing data
    localStorage.clear();
    sessionStorage.clear();
    
    // Inject test user data
    const testUser = {
      name: "Test User Dashboard",
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
    
    localStorage.setItem('demo_profile', JSON.stringify(testUser));
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('signup_prefill', JSON.stringify({ email: 'test@example.com', name: 'Test User Dashboard' }));
    
    console.log('✅ FORCE: Test user data injected successfully');
    console.log('📋 localStorage keys:', Object.keys(localStorage));
    console.log('💾 demo_profile:', localStorage.getItem('demo_profile'));
    
    // Force page reload to apply changes
    setTimeout(() => {
      console.log('🔄 FORCE: Reloading page to apply changes');
      window.location.reload();
    }, 100);
  }
  
  static injectRealUser(name: string, email?: string) {
    if (typeof window === 'undefined') return;
    
    console.log('🔧 FORCE: Injecting real user data for:', name);
    
    // Clear all existing data
    localStorage.clear();
    sessionStorage.clear();
    
    // Inject real user data
    const realUser = {
      name: name,
      gender: "user",
      age: 25,
      height: 170,
      weight: 65,
      goal: "maintain",
      activityLevel: "moderate",
      dietPreference: "none",
      completed: true,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('demo_profile', JSON.stringify(realUser));
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('signup_prefill', JSON.stringify({ 
      email: email || 'user@example.com', 
      name: name 
    }));
    
    console.log('✅ FORCE: Real user data injected successfully');
    console.log('📋 localStorage keys:', Object.keys(localStorage));
    console.log('💾 demo_profile:', localStorage.getItem('demo_profile'));
    
    // Force page reload to apply changes
    setTimeout(() => {
      console.log('🔄 FORCE: Reloading page to apply changes');
      window.location.reload();
    }, 100);
  }
  
  static addGlobalHelpers() {
    if (typeof window === 'undefined') return;
    
    // Add global functions for easy testing
    (window as any).forceTestUser = () => this.injectTestUser();
    (window as any).forceRealUser = (name: string) => this.injectRealUser(name);
    
    console.log('🛠️ FORCE: Global force helpers added');
    console.log('💡 Use forceTestUser() or forceRealUser("Your Name") in console');
  }
}
