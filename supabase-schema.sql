-- Supabase Database Schema for Rupee Finance Tracker

-- Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budget_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS backup_history ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
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

-- Incomes table
CREATE TABLE IF NOT EXISTS incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    source TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Savings goals table
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget limits table
CREATE TABLE IF NOT EXISTS budget_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    period TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring expenses table
CREATE TABLE IF NOT EXISTS recurring_expenses (
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

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
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

-- Backup history table
CREATE TABLE IF NOT EXISTS backup_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_limits_updated_at BEFORE UPDATE ON budget_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON recurring_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Users table policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can delete own data" ON users FOR DELETE USING (auth.uid()::text = id::text);

-- Expenses table policies
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid()::text = user_id::text);

-- Incomes table policies
CREATE POLICY "Users can view own incomes" ON incomes FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own incomes" ON incomes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own incomes" ON incomes FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own incomes" ON incomes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Categories table policies
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid()::text = user_id::text);

-- Savings goals table policies
CREATE POLICY "Users can view own savings goals" ON savings_goals FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own savings goals" ON savings_goals FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own savings goals" ON savings_goals FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own savings goals" ON savings_goals FOR DELETE USING (auth.uid()::text = user_id::text);

-- Budget limits table policies
CREATE POLICY "Users can view own budget limits" ON budget_limits FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own budget limits" ON budget_limits FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own budget limits" ON budget_limits FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own budget limits" ON budget_limits FOR DELETE USING (auth.uid()::text = user_id::text);

-- Insights table policies
CREATE POLICY "Users can view own insights" ON insights FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own insights" ON insights FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own insights" ON insights FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own insights" ON insights FOR DELETE USING (auth.uid()::text = user_id::text);

-- Alerts table policies
CREATE POLICY "Users can view own alerts" ON alerts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own alerts" ON alerts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own alerts" ON alerts FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own alerts" ON alerts FOR DELETE USING (auth.uid()::text = user_id::text);

-- Recurring expenses table policies
CREATE POLICY "Users can view own recurring expenses" ON recurring_expenses FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own recurring expenses" ON recurring_expenses FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own recurring expenses" ON recurring_expenses FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own recurring expenses" ON recurring_expenses FOR DELETE USING (auth.uid()::text = user_id::text);

-- Profiles table policies
CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own profiles" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own profiles" ON profiles FOR DELETE USING (auth.uid()::text = user_id::text);

-- Achievements table policies
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own achievements" ON achievements FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own achievements" ON achievements FOR DELETE USING (auth.uid()::text = user_id::text);

-- Backup history table policies
CREATE POLICY "Users can view own backup history" ON backup_history FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own backup history" ON backup_history FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own backup history" ON backup_history FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own backup history" ON backup_history FOR DELETE USING (auth.uid()::text = user_id::text); 