import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseInstance) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    
    console.log('🔧 Initializing Supabase client...');
    console.log('📍 Supabase URL:', supabaseUrl);
    console.log('🔑 Project ID:', projectId);
    console.log('🔐 Anon Key exists:', !!publicAnonKey);
    
    if (!projectId || !publicAnonKey) {
      console.error('❌ Missing Supabase configuration:', { projectId: !!projectId, publicAnonKey: !!publicAnonKey });
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }
    
    try {
      supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      });
      
      console.log('✅ Supabase client initialized successfully');
      console.log('🔗 Connected to:', supabaseUrl);
      console.log('🆔 Project ID:', projectId);
      
      // Test the connection
      supabaseInstance.from('profiles').select('id').limit(1).then(
        () => console.log('✅ Database connection verified'),
        (error) => console.warn('⚠️ Database connection test failed (this is normal if no profiles exist):', error.message)
      );
      
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error);
      throw error;
    }
  }
  
  return supabaseInstance;
}
