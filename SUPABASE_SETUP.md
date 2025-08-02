# Supabase Setup Guide for Rupee Finance Tracker

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- **PostgreSQL Database** - Full SQL database with real-time subscriptions
- **Authentication** - Built-in user management with multiple providers
- **Auto-generated APIs** - REST and GraphQL APIs automatically generated
- **Real-time subscriptions** - Live updates when data changes
- **Row Level Security** - Fine-grained access control
- **Dashboard** - Web interface for database management

## Setup Instructions

### 1. Database Schema Setup

You need to run the SQL schema in your Supabase dashboard:

1. **Go to your Supabase Dashboard:**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `pszkwdndazrncjcxhfgs`

2. **Open the SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema:**
   - Copy the contents of `supabase-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the schema

### 2. Environment Configuration

Your `.env.local` file is already configured with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://pszkwdndazrncjcxhfgs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Test the Connection

After setting up the schema, test the connection:

```bash
node test-supabase-connection.js
```

## Database Schema

The schema includes all necessary tables for the Rupee Finance Tracker:

### Tables Created:

1. **users** - User accounts and preferences
2. **expenses** - Individual expense records
3. **incomes** - Income records
4. **categories** - Expense categories
5. **savings_goals** - Savings goals and progress
6. **budget_limits** - Budget limits by category
7. **insights** - AI-generated spending insights
8. **alerts** - Budget and spending alerts
9. **recurring_expenses** - Recurring expense templates
10. **profiles** - User profiles and permissions
11. **achievements** - Gamification achievements
12. **backup_history** - Data backup records

### Key Features:

- **Row Level Security (RLS)** - Users can only access their own data
- **Automatic timestamps** - All records include `created_at` and `updated_at`
- **Foreign key relationships** - Proper data integrity
- **Indexes** - Optimized for performance
- **JSONB fields** - Flexible data storage for preferences and settings

## Using Supabase in Your Application

### Basic Operations

```typescript
import { supabase } from '@/lib/supabase'

// Create a user
const { data: user, error } = await supabase
  .from('users')
  .insert([{
    email: 'user@example.com',
    name: 'John Doe',
    preferences: { currency: '₹', theme: 'light' }
  }])
  .select()

// Add an expense
const { data: expense, error } = await supabase
  .from('expenses')
  .insert([{
    user_id: userId,
    amount: 1500,
    description: 'Lunch',
    category_id: 'food',
    date: new Date().toISOString()
  }])
  .select()

// Get user's expenses
const { data: expenses, error } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false })

// Update an expense
const { data, error } = await supabase
  .from('expenses')
  .update({ amount: 1800 })
  .eq('id', expenseId)

// Delete an expense
const { error } = await supabase
  .from('expenses')
  .delete()
  .eq('id', expenseId)
```

### Real-time Subscriptions

```typescript
// Subscribe to real-time updates
const subscription = supabase
  .channel('expenses')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'expenses' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

## Authentication

Supabase provides built-in authentication. To enable it:

1. **Go to Authentication > Settings** in your Supabase dashboard
2. **Configure your site URL** (e.g., `http://localhost:3000`)
3. **Enable email/password authentication** or other providers

### User Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Sign out
const { error } = await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## Row Level Security (RLS)

The schema includes RLS policies that ensure users can only access their own data:

- **Users can only see their own expenses, incomes, etc.**
- **Data is automatically filtered by user ID**
- **No additional filtering needed in queries**

## Production Considerations

### Security

1. **RLS is enabled** on all tables
2. **Use environment variables** for sensitive keys
3. **Never expose service role key** in client-side code
4. **Use anon key** for client-side operations

### Performance

1. **Indexes are created** for frequently queried fields
2. **Use pagination** for large datasets
3. **Optimize queries** with proper WHERE clauses
4. **Monitor query performance** in Supabase dashboard

### Backup and Recovery

1. **Automatic backups** are enabled by default
2. **Point-in-time recovery** available
3. **Database snapshots** can be created manually

## Troubleshooting

### Common Issues

1. **"relation does not exist"** - Run the schema SQL first
2. **"RLS policy violation"** - Check user authentication
3. **"invalid JWT"** - Check authentication setup
4. **"permission denied"** - Verify RLS policies

### Getting Help

- **Supabase Documentation:** [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase Community:** [https://discord.gg/supabase](https://discord.gg/supabase)
- **GitHub Issues:** [https://github.com/supabase/supabase](https://github.com/supabase/supabase)

## Next Steps

1. **Run the schema** in your Supabase dashboard
2. **Test the connection** using the test script
3. **Update your components** to use Supabase instead of localStorage
4. **Implement authentication** if needed
5. **Deploy to production** with your Supabase project

Your Rupee Finance Tracker is now ready for production with a robust, scalable database! 🚀 