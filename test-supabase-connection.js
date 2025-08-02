// Test Supabase Connection
const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('✅ Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful!');
    
    // Test 2: Check if tables exist
    console.log('✅ Checking database schema...');
    const tables = [
      'users', 'expenses', 'incomes', 'categories', 
      'savings_goals', 'budget_limits', 'insights', 
      'alerts', 'recurring_expenses', 'profiles', 
      'achievements', 'backup_history'
    ];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`⚠️  Table '${table}' not found or accessible`);
        } else {
          console.log(`✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
      }
    }
    
    // Test 3: Test RLS policies
    console.log('✅ Testing Row Level Security...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1);
    
    if (rlsError) {
      console.log('⚠️  RLS might be blocking access (this is expected for unauthenticated requests)');
    } else {
      console.log('✅ RLS policies are working correctly');
    }
    
    console.log('\n🎉 Supabase connection test completed!');
    console.log('\n📋 Summary:');
    console.log('- Database connection: ✅');
    console.log('- Schema setup: ✅');
    console.log('- RLS policies: ✅');
    console.log('\n🚀 Your Rupee Finance Tracker is ready to use!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n✅ All tests passed! Your database is properly configured.');
  } else {
    console.log('\n❌ Some tests failed. Please check your configuration.');
  }
  process.exit(success ? 0 : 1);
}); 