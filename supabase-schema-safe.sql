-- Supabase Database Schema for Rupee Finance Tracker (Safe Version)
-- This version handles existing objects gracefully

-- Drop existing triggers first (if they exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_incomes_updated_at ON incomes;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON savings_goals;
DROP TRIGGER IF EXISTS update_budget_limits_updated_at ON budget_limits;
DROP TRIGGER IF EXISTS update_recurring_expenses_updated_at ON recurring_expenses;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable Row Level Security (RLS) - Safe version
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
        CREATE TABLE users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            preferences JSONB DEFAULT '{
                "currency": "₹",
                "theme": "light",
                "notifications": true,
                "defaultPaymentMethod": "cash",
                "budgetLimits": [],
                "alertSettings": {
                    "overspendingAlerts": true,
                    "budgetLimitAlerts": true,
                    "savingsGoalAlerts": true,
                    "weeklyInsights": true,
                    "emailNotifications": false,
                    "pushNotifications": true
                },
                "gamificationEnabled": true,
                "autoBackupEnabled": false,
                "cloudSyncEnabled": false,
                "receiptScanningEnabled": false
            }',
            profiles JSONB DEFAULT '[]',
            active_profile_id TEXT DEFAULT '',
            security_settings JSONB DEFAULT '{
                "pinEnabled": false,
                "biometricEnabled": false,
                "autoLockTimeout": 5,
                "requireAuthForExport": true,
                "requireAuthForSettings": false
            }',
            achievements JSONB DEFAULT '[]',
            streaks JSONB DEFAULT '{
                "currentStreak": 0,
                "longestStreak": 0,
                "noSpendDays": 0,
                "totalNoSpendDays": 0,
                "currentNoSpendStreak": 0,
                "longestNoSpendStreak": 0
            }',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'expenses') THEN
        CREATE TABLE expenses (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            description TEXT NOT NULL,
            category_id TEXT,
            date TIMESTAMP WITH TIME ZONE NOT NULL,
            payment_method TEXT DEFAULT 'cash',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'incomes') THEN
        CREATE TABLE incomes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            source TEXT NOT NULL,
            date TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'categories') THEN
        CREATE TABLE categories (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            color TEXT NOT NULL,
            icon TEXT NOT NULL,
            is_custom BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'savings_goals') THEN
        CREATE TABLE savings_goals (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            target_amount DECIMAL(10,2) NOT NULL,
            current_amount DECIMAL(10,2) DEFAULT 0,
            target_date TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'budget_limits') THEN
        CREATE TABLE budget_limits (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            category_id TEXT,
            amount DECIMAL(10,2) NOT NULL,
            period TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'insights') THEN
        CREATE TABLE insights (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            data JSONB,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'alerts') THEN
        CREATE TABLE alerts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT DEFAULT 'info',
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'recurring_expenses') THEN
        CREATE TABLE recurring_expenses (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL,
            description TEXT NOT NULL,
            category_id TEXT,
            frequency TEXT NOT NULL,
            next_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            permissions JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'achievements') THEN
        CREATE TABLE achievements (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            icon TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            max_progress INTEGER NOT NULL,
            is_unlocked BOOLEAN DEFAULT false,
            unlocked_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'backup_history') THEN
        CREATE TABLE backup_history (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            file_size INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_incomes_user_id ON incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_incomes_date ON incomes(date);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_limits_user_id ON budget_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user_id ON recurring_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_history_user_id ON backup_history(user_id);

-- Create triggers for updated_at (only if they don't exist)
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_limits_updated_at BEFORE UPDATE ON budget_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies (drop existing ones first, then create new ones)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can delete own data" ON users;

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can view own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can insert own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can update own incomes" ON incomes;
DROP POLICY IF EXISTS "Users can delete own incomes" ON incomes;

DROP POLICY IF EXISTS "Users can view own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
DROP POLICY IF EXISTS "Users can update own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON categories;

DROP POLICY IF EXISTS "Users can view own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete own savings goals" ON savings_goals;

DROP POLICY IF EXISTS "Users can view own budget limits" ON budget_limits;
DROP POLICY IF EXISTS "Users can insert own budget limits" ON budget_limits;
DROP POLICY IF EXISTS "Users can update own budget limits" ON budget_limits;
DROP POLICY IF EXISTS "Users can delete own budget limits" ON budget_limits;

DROP POLICY IF EXISTS "Users can view own insights" ON insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON insights;
DROP POLICY IF EXISTS "Users can update own insights" ON insights;
DROP POLICY IF EXISTS "Users can delete own insights" ON insights;

DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON alerts;

DROP POLICY IF EXISTS "Users can view own recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Users can insert own recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Users can update own recurring expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Users can delete own recurring expenses" ON recurring_expenses;

DROP POLICY IF EXISTS "Users can view own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can delete own achievements" ON achievements;

DROP POLICY IF EXISTS "Users can view own backup history" ON backup_history;
DROP POLICY IF EXISTS "Users can insert own backup history" ON backup_history;
DROP POLICY IF EXISTS "Users can update own backup history" ON backup_history;
DROP POLICY IF EXISTS "Users can delete own backup history" ON backup_history;

-- Create new RLS policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can delete own data" ON users FOR DELETE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own incomes" ON incomes FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own incomes" ON incomes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own incomes" ON incomes FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own incomes" ON incomes FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own savings goals" ON savings_goals FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own savings goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own savings goals" ON savings_goals FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own savings goals" ON savings_goals FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own budget limits" ON budget_limits FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own budget limits" ON budget_limits FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own budget limits" ON budget_limits FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own budget limits" ON budget_limits FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own insights" ON insights FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own insights" ON insights FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own insights" ON insights FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own insights" ON insights FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own alerts" ON alerts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own alerts" ON alerts FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own recurring expenses" ON recurring_expenses FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own recurring expenses" ON recurring_expenses FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own recurring expenses" ON recurring_expenses FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own recurring expenses" ON recurring_expenses FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own profiles" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own profiles" ON profiles FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own achievements" ON achievements FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own achievements" ON achievements FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own backup history" ON backup_history FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own backup history" ON backup_history FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own backup history" ON backup_history FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own backup history" ON backup_history FOR DELETE USING (auth.uid()::text = user_id::text); 