const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

async function testSupabaseConnection() {
  const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey)
  
  try {
    console.log('🔌 Testing Supabase connection...')
    console.log('URL:', SUPABASE_CONFIG.url)
    console.log('Anon Key:', SUPABASE_CONFIG.anonKey ? '***' : 'NOT SET')
    
    // Test basic connection by getting the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('ℹ️ No authenticated user (expected for initial test)')
    } else {
      console.log('✅ User authenticated:', user?.email)
    }
    
    // Test database connection by checking if tables exist
    console.log('🔧 Testing database tables...')
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('⚠️ Users table not found or error:', usersError.message)
    } else {
      console.log('✅ Users table accessible')
    }
    
    // Test expenses table
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .limit(1)
    
    if (expensesError) {
      console.log('⚠️ Expenses table not found or error:', expensesError.message)
    } else {
      console.log('✅ Expenses table accessible')
    }
    
    // Test categories table
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)
    
    if (categoriesError) {
      console.log('⚠️ Categories table not found or error:', categoriesError.message)
    } else {
      console.log('✅ Categories table accessible')
    }
    
    // Test creating a sample user
    console.log('🔧 Creating test user...')
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        currency: '₹',
        theme: 'light',
        notifications: true,
        defaultPaymentMethod: 'cash',
        budgetLimits: [],
        alertSettings: {
          overspendingAlerts: true,
          budgetLimitAlerts: true,
          savingsGoalAlerts: true,
          weeklyInsights: true,
          emailNotifications: false,
          pushNotifications: true
        },
        gamificationEnabled: true,
        autoBackupEnabled: false,
        cloudSyncEnabled: false,
        receiptScanningEnabled: false
      },
      profiles: [],
      active_profile_id: '',
      security_settings: {
        pinEnabled: false,
        biometricEnabled: false,
        autoLockTimeout: 5,
        requireAuthForExport: true,
        requireAuthForSettings: false
      },
      achievements: [],
      streaks: {
        currentStreak: 0,
        longestStreak: 0,
        noSpendDays: 0,
        totalNoSpendDays: 0,
        currentNoSpendStreak: 0,
        longestNoSpendStreak: 0
      }
    }
    
    const { data: newUser, error: createUserError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
    
    if (createUserError) {
      console.log('⚠️ Could not create test user:', createUserError.message)
    } else {
      console.log('✅ Created test user:', newUser[0])
      
      // Test creating a sample expense
      console.log('🔧 Creating test expense...')
      const testExpense = {
        user_id: newUser[0].id,
        amount: 1500,
        description: 'Test lunch expense',
        category_id: 'food',
        date: new Date().toISOString(),
        payment_method: 'cash'
      }
      
      const { data: newExpense, error: createExpenseError } = await supabase
        .from('expenses')
        .insert([testExpense])
        .select()
      
      if (createExpenseError) {
        console.log('⚠️ Could not create test expense:', createExpenseError.message)
      } else {
        console.log('✅ Created test expense:', newExpense[0])
        
        // Clean up test data
        console.log('🧹 Cleaning up test data...')
        await supabase
          .from('expenses')
          .delete()
          .eq('description', 'Test lunch expense')
        
        await supabase
          .from('users')
          .delete()
          .eq('email', 'test@example.com')
        
        console.log('✅ Cleaned up test data')
      }
    }
    
    console.log('🎉 Supabase connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Error testing Supabase connection:', error)
    console.error('Error details:', error.message)
  }
}

testSupabaseConnection() 