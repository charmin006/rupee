import { Surreal } from 'surrealdb'

// SurrealDB configuration
const SURREAL_CONFIG = {
  url: process.env.NEXT_PUBLIC_SURREAL_URL || 'ws://localhost:8000/rpc',
  namespace: process.env.NEXT_PUBLIC_SURREAL_NAMESPACE || 'rupee',
  database: process.env.NEXT_PUBLIC_SURREAL_DATABASE || 'finance',
  // For local development
  username: process.env.NEXT_PUBLIC_SURREAL_USERNAME || 'root',
  password: process.env.NEXT_PUBLIC_SURREAL_PASSWORD || 'root',
  // For Surreal Cloud (token-based auth)
  token: process.env.NEXT_PUBLIC_SURREAL_TOKEN || null,
}

class SurrealDBService {
  private static instance: SurrealDBService
  private db: Surreal
  private isConnected: boolean = false

  private constructor() {
    this.db = new Surreal()
  }

  static getInstance(): SurrealDBService {
    if (!SurrealDBService.instance) {
      SurrealDBService.instance = new SurrealDBService()
    }
    return SurrealDBService.instance
  }

  async connect(): Promise<void> {
    if (this.isConnected) return

    try {
      await this.db.connect(SURREAL_CONFIG.url)
      
      // Authenticate based on environment (Cloud vs Local)
      if (SURREAL_CONFIG.token) {
        // Surreal Cloud: Use token authentication
        await this.db.authenticate(SURREAL_CONFIG.token)
      } else {
        // Local development: Use username/password
        await this.db.signin({
          username: SURREAL_CONFIG.username,
          password: SURREAL_CONFIG.password,
        })
      }
      
      // Use the namespace and database (create if they don't exist)
      await this.db.use({
        ns: SURREAL_CONFIG.namespace,
        db: SURREAL_CONFIG.database,
      })
      
      this.isConnected = true
      console.log('✅ Connected to SurrealDB')
      
      // Initialize database schema
      await this.initializeSchema()
      
      // Fix any existing users with NONE values
      try {
        await this.fixAllUsers()
        console.log('✅ Fixed existing users with NONE values')
      } catch (error) {
        console.warn('⚠️ Could not fix existing users:', error)
      }
      
      // Fix any existing records with string dates
      try {
        await this.fixDateFieldsSimple()
        console.log('✅ Fixed existing records with string dates')
      } catch (error) {
        console.warn('⚠️ Could not fix existing date fields:', error)
      }
      
      // Fix any existing records with record references instead of string IDs
      try {
        await this.fixRecordReferences()
        console.log('✅ Fixed existing records with record references')
      } catch (error) {
        console.warn('⚠️ Could not fix existing record references:', error)
      }
      
        // Fix the specific error mentioned in the user query
  try {
    await this.fixSpecificRecordError()
    console.log('✅ Fixed specific record error')
  } catch (error) {
    console.warn('⚠️ Could not fix specific record error:', error)
  }
  
  // Additional comprehensive fix for any remaining record references
  try {
    await this.fixAllRecordReferences()
    console.log('✅ Fixed all remaining record references')
  } catch (error) {
    console.warn('⚠️ Could not fix all record references:', error)
  }
    } catch (error) {
      console.error('❌ Failed to connect to SurrealDB:', error)
      throw error
    }
  }

  private async initializeSchema(): Promise<void> {
    try {
      console.log('🔍 Initializing schema...')
      // Wrap in try-catch to handle "table already exists" errors gracefully
      try {
        await this.db.query(`
          USE NS rupee DB finance;
          
          -- Users table
          DEFINE TABLE users SCHEMAFULL;
          DEFINE FIELD email ON users TYPE string ASSERT $value != NONE;
          DEFINE FIELD name ON users TYPE string;
          DEFINE FIELD preferences ON users TYPE object DEFAULT {
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
          };
          DEFINE FIELD profiles ON users TYPE array DEFAULT [];
          DEFINE FIELD activeProfileId ON users TYPE string DEFAULT '';
          DEFINE FIELD securitySettings ON users TYPE object DEFAULT {
            pinEnabled: false,
            biometricEnabled: false,
            autoLockTimeout: 5,
            requireAuthForExport: true,
            requireAuthForSettings: false
          };
          DEFINE FIELD achievements ON users TYPE array DEFAULT [];
          DEFINE FIELD streaks ON users TYPE object DEFAULT {
            currentStreak: 0,
            longestStreak: 0,
            noSpendDays: 0,
            totalNoSpendDays: 0,
            currentNoSpendStreak: 0,
            longestNoSpendStreak: 0
          };
          DEFINE FIELD createdAt ON users TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON users TYPE datetime DEFAULT time::now();
          
          -- Expenses table
          DEFINE TABLE expenses SCHEMAFULL;
          DEFINE FIELD userId ON expenses TYPE string;
          DEFINE FIELD amount ON expenses TYPE number;
          DEFINE FIELD description ON expenses TYPE string;
          DEFINE FIELD categoryId ON expenses TYPE string;
          DEFINE FIELD date ON expenses TYPE datetime;
          DEFINE FIELD paymentMethod ON expenses TYPE string;
          DEFINE FIELD createdAt ON expenses TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON expenses TYPE datetime DEFAULT time::now();
          
          -- Incomes table
          DEFINE TABLE incomes SCHEMAFULL;
          DEFINE FIELD userId ON incomes TYPE string;
          DEFINE FIELD amount ON incomes TYPE number;
          DEFINE FIELD source ON incomes TYPE string;
          DEFINE FIELD date ON incomes TYPE datetime;
          DEFINE FIELD createdAt ON incomes TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON incomes TYPE datetime DEFAULT time::now();
          
          -- Categories table
          DEFINE TABLE categories SCHEMAFULL;
          DEFINE FIELD userId ON categories TYPE string;
          DEFINE FIELD name ON categories TYPE string;
          DEFINE FIELD color ON categories TYPE string;
          DEFINE FIELD icon ON categories TYPE string;
          DEFINE FIELD isCustom ON categories TYPE bool DEFAULT true;
          DEFINE FIELD createdAt ON categories TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON categories TYPE datetime DEFAULT time::now();
          
          -- Savings goals table
          DEFINE TABLE savings_goals SCHEMAFULL;
          DEFINE FIELD userId ON savings_goals TYPE string;
          DEFINE FIELD name ON savings_goals TYPE string;
          DEFINE FIELD targetAmount ON savings_goals TYPE number;
          DEFINE FIELD currentAmount ON savings_goals TYPE number DEFAULT 0;
          DEFINE FIELD targetDate ON savings_goals TYPE datetime;
          DEFINE FIELD createdAt ON savings_goals TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON savings_goals TYPE datetime DEFAULT time::now();
          
          -- Budget limits table
          DEFINE TABLE budget_limits SCHEMAFULL;
          DEFINE FIELD userId ON budget_limits TYPE string;
          DEFINE FIELD categoryId ON budget_limits TYPE string;
          DEFINE FIELD amount ON budget_limits TYPE number;
          DEFINE FIELD period ON budget_limits TYPE string;
          DEFINE FIELD isActive ON budget_limits TYPE bool DEFAULT true;
          DEFINE FIELD createdAt ON budget_limits TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON budget_limits TYPE datetime DEFAULT time::now();
          
          -- Insights table
          DEFINE TABLE insights SCHEMAFULL;
          DEFINE FIELD userId ON insights TYPE string;
          DEFINE FIELD type ON insights TYPE string;
          DEFINE FIELD title ON insights TYPE string;
          DEFINE FIELD description ON insights TYPE string;
          DEFINE FIELD data ON insights TYPE object;
          DEFINE FIELD isRead ON insights TYPE bool DEFAULT false;
          DEFINE FIELD createdAt ON insights TYPE datetime DEFAULT time::now();
          
          -- Alerts table
          DEFINE TABLE alerts SCHEMAFULL;
          DEFINE FIELD userId ON alerts TYPE string;
          DEFINE FIELD type ON alerts TYPE string;
          DEFINE FIELD title ON alerts TYPE string;
          DEFINE FIELD message ON alerts TYPE string;
          DEFINE FIELD severity ON alerts TYPE string;
          DEFINE FIELD isRead ON alerts TYPE bool DEFAULT false;
          DEFINE FIELD createdAt ON alerts TYPE datetime DEFAULT time::now();
          
          -- Recurring expenses table
          DEFINE TABLE recurring_expenses SCHEMAFULL;
          DEFINE FIELD userId ON recurring_expenses TYPE string;
          DEFINE FIELD amount ON recurring_expenses TYPE number;
          DEFINE FIELD description ON recurring_expenses TYPE string;
          DEFINE FIELD categoryId ON recurring_expenses TYPE string;
          DEFINE FIELD frequency ON recurring_expenses TYPE string;
          DEFINE FIELD nextDueDate ON recurring_expenses TYPE datetime;
          DEFINE FIELD isActive ON recurring_expenses TYPE bool DEFAULT true;
          DEFINE FIELD createdAt ON recurring_expenses TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON recurring_expenses TYPE datetime DEFAULT time::now();
          
          -- Profiles table
          DEFINE TABLE profiles SCHEMAFULL;
          DEFINE FIELD userId ON profiles TYPE string;
          DEFINE FIELD name ON profiles TYPE string;
          DEFINE FIELD role ON profiles TYPE string;
          DEFINE FIELD permissions ON profiles TYPE object;
          DEFINE FIELD createdAt ON profiles TYPE datetime DEFAULT time::now();
          DEFINE FIELD updatedAt ON profiles TYPE datetime DEFAULT time::now();
          
          -- Achievements table
          DEFINE TABLE achievements SCHEMAFULL;
          DEFINE FIELD userId ON achievements TYPE string;
          DEFINE FIELD name ON achievements TYPE string;
          DEFINE FIELD description ON achievements TYPE string;
          DEFINE FIELD icon ON achievements TYPE string;
          DEFINE FIELD progress ON achievements TYPE number DEFAULT 0;
          DEFINE FIELD maxProgress ON achievements TYPE number;
          DEFINE FIELD isUnlocked ON achievements TYPE bool DEFAULT false;
          DEFINE FIELD unlockedAt ON achievements TYPE datetime;
          DEFINE FIELD createdAt ON achievements TYPE datetime DEFAULT time::now();
          
          -- Backup history table
          DEFINE TABLE backup_history SCHEMAFULL;
          DEFINE FIELD userId ON backup_history TYPE string;
          DEFINE FIELD type ON backup_history TYPE string;
          DEFINE FIELD status ON backup_history TYPE string;
          DEFINE FIELD fileSize ON backup_history TYPE number;
          DEFINE FIELD createdAt ON backup_history TYPE datetime DEFAULT time::now();
        `)
        console.log('✅ Database schema initialized')
      } catch (error) {
        // Handle "table already exists" error gracefully
        if (error.message && error.message.includes('already exists')) {
          console.log('ℹ️ Schema already exists, skipping initialization')
        } else {
          console.error('❌ Failed to initialize schema:', error)
          throw error
        }
      }
    } catch (error) {
      console.error('❌ Error in initializeSchema:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.db.close()
      this.isConnected = false
      console.log('🔌 Disconnected from SurrealDB')
    }
  }

  // User operations
  async createUser(userData: any): Promise<any> {
    await this.connect()
    
    // Ensure required fields have default values
    const defaultUserData = {
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
      activeProfileId: '',
      securitySettings: {
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
      },
      ...userData
    }
    
    const result = await this.db.query('USE NS rupee DB finance; CREATE users CONTENT $userData', { userData: defaultUserData })
    const user = result[1]?.[0] || result[0]?.result?.[0]
    
    // Return user with ID as string, not record reference
    if (user && user.id) {
      if (typeof user.id === 'object' && user.id.id) {
        // Handle _RecordId object
        user.id = user.id.id
      } else if (typeof user.id === 'string' && user.id.includes(':')) {
        // Handle string record reference
        user.id = user.id.split(':')[1] || user.id
      }
    }
    
    return user
  }

  async getUser(userId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM users WHERE id = $userId', { userId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE users SET * = $userData WHERE id = $userId', { userId, userData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async deleteUser(userId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; DELETE users WHERE id = $userId', { userId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async fixUserFields(userId: string): Promise<any> {
    await this.connect()
    
    // Fix users with NONE values for required fields
    const result = await this.db.query(`
      USE NS rupee DB finance;
      UPDATE users SET 
        achievements = [] WHERE id = $userId AND achievements = NONE;
      UPDATE users SET 
        streaks = {
          currentStreak: 0,
          longestStreak: 0,
          noSpendDays: 0,
          totalNoSpendDays: 0,
          currentNoSpendStreak: 0,
          longestNoSpendStreak: 0
        } WHERE id = $userId AND streaks = NONE;
      UPDATE users SET 
        profiles = [] WHERE id = $userId AND profiles = NONE;
      UPDATE users SET 
        activeProfileId = '' WHERE id = $userId AND activeProfileId = NONE;
      UPDATE users SET 
        securitySettings = {
          pinEnabled: false,
          biometricEnabled: false,
          autoLockTimeout: 5,
          requireAuthForExport: true,
          requireAuthForSettings: false
        } WHERE id = $userId AND securitySettings = NONE;
    `, { userId })
    
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async fixAllUsers(): Promise<any> {
    await this.connect()
    
    // Fix all users with NONE values for required fields
    const result = await this.db.query(`
      USE NS rupee DB finance;
      UPDATE users SET 
        achievements = [] WHERE achievements = NONE;
      UPDATE users SET 
        streaks = {
          currentStreak: 0,
          longestStreak: 0,
          noSpendDays: 0,
          totalNoSpendDays: 0,
          currentNoSpendStreak: 0,
          longestNoSpendStreak: 0
        } WHERE streaks = NONE;
      UPDATE users SET 
        profiles = [] WHERE profiles = NONE;
      UPDATE users SET 
        activeProfileId = '' WHERE activeProfileId = NONE;
      UPDATE users SET 
        securitySettings = {
          pinEnabled: false,
          biometricEnabled: false,
          autoLockTimeout: 5,
          requireAuthForExport: true,
          requireAuthForSettings: false
        } WHERE securitySettings = NONE;
    `)
    
    return result[1] || result[0]?.result || []
  }

  async fixDateFields(): Promise<any> {
    await this.connect()
    
    // Fix expenses with string dates by converting them to datetime
    const result = await this.db.query(`
      USE NS rupee DB finance;
      UPDATE expenses SET 
        date = time::parse(date) WHERE type::of(date) = 'string';
      UPDATE incomes SET 
        date = time::parse(date) WHERE type::of(date) = 'string';
      UPDATE savings_goals SET 
        targetDate = time::parse(targetDate) WHERE type::of(targetDate) = 'string';
      UPDATE recurring_expenses SET 
        nextDueDate = time::parse(nextDueDate) WHERE type::of(nextDueDate) = 'string';
    `)
    
    return result[1] || result[0]?.result || []
  }

  async fixDateFieldsSimple(): Promise<any> {
    await this.connect()
    
    // Get all expenses and check if they have string dates
    const expenses = await this.db.query(`
      USE NS rupee DB finance;
      SELECT * FROM expenses;
    `)
    
    if (expenses[1] && expenses[1].length > 0) {
      for (const expense of expenses[1]) {
        // Check if the date is a string (not a datetime object)
        if (typeof expense.date === 'string' && expense.date.includes('T')) {
          try {
            await this.db.query(`
              USE NS rupee DB finance;
              UPDATE ${expense.id} SET date = time::parse('${expense.date}');
            `)
          } catch (error) {
            console.warn(`Could not fix date for expense ${expense.id}:`, error)
          }
        }
      }
    }
    
    // Get all incomes and check if they have string dates
    const incomes = await this.db.query(`
      USE NS rupee DB finance;
      SELECT * FROM incomes;
    `)
    
    if (incomes[1] && incomes[1].length > 0) {
      for (const income of incomes[1]) {
        // Check if the date is a string (not a datetime object)
        if (typeof income.date === 'string' && income.date.includes('T')) {
          try {
            await this.db.query(`
              USE NS rupee DB finance;
              UPDATE ${income.id} SET date = time::parse('${income.date}');
            `)
          } catch (error) {
            console.warn(`Could not fix date for income ${income.id}:`, error)
          }
        }
      }
    }
    
    return { success: true }
  }

  async fixRecordReferences(): Promise<any> {
    await this.connect()
    
    // Fix expenses with record references instead of string IDs
    const expenses = await this.db.query(`
      USE NS rupee DB finance;
      SELECT * FROM expenses;
    `)
    
    if (expenses[1] && expenses[1].length > 0) {
      for (const expense of expenses[1]) {
        // Check if userId is a record reference or _RecordId object
        if (expense.userId) {
          let userId = expense.userId
          let needsFix = false
          
          if (typeof expense.userId === 'object' && expense.userId.id) {
            // Handle _RecordId object
            userId = expense.userId.id
            needsFix = true
          } else if (typeof expense.userId === 'string' && expense.userId.includes(':')) {
            // Handle string record reference
            userId = expense.userId.split(':')[1]
            needsFix = true
          }
          
          if (needsFix) {
            try {
              await this.db.query(`
                USE NS rupee DB finance;
                UPDATE ${expense.id} SET userId = '${userId}';
              `)
              console.log(`Fixed userId for expense ${expense.id}: ${expense.userId} -> ${userId}`)
            } catch (error) {
              console.warn(`Could not fix userId for expense ${expense.id}:`, error)
            }
          }
        }
        
        // Also check categoryId if it's a record reference
        if (expense.categoryId && typeof expense.categoryId === 'string' && expense.categoryId.includes(':')) {
          try {
            const categoryId = expense.categoryId.split(':')[1]
            await this.db.query(`
              USE NS rupee DB finance;
              UPDATE ${expense.id} SET categoryId = '${categoryId}';
            `)
            console.log(`Fixed categoryId for expense ${expense.id}: ${expense.categoryId} -> ${categoryId}`)
          } catch (error) {
            console.warn(`Could not fix categoryId for expense ${expense.id}:`, error)
          }
        }
      }
    }
    
    // Fix incomes with record references instead of string IDs
    const incomes = await this.db.query(`
      USE NS rupee DB finance;
      SELECT * FROM incomes;
    `)
    
    if (incomes[1] && incomes[1].length > 0) {
      for (const income of incomes[1]) {
        // Check if userId is a record reference or _RecordId object
        if (income.userId) {
          let userId = income.userId
          let needsFix = false
          
          if (typeof income.userId === 'object' && income.userId.id) {
            // Handle _RecordId object
            userId = income.userId.id
            needsFix = true
          } else if (typeof income.userId === 'string' && income.userId.includes(':')) {
            // Handle string record reference
            userId = income.userId.split(':')[1]
            needsFix = true
          }
          
          if (needsFix) {
            try {
              await this.db.query(`
                USE NS rupee DB finance;
                UPDATE ${income.id} SET userId = '${userId}';
              `)
              console.log(`Fixed userId for income ${income.id}: ${income.userId} -> ${userId}`)
            } catch (error) {
              console.warn(`Could not fix userId for income ${income.id}:`, error)
            }
          }
        }
      }
    }
    
    // Fix categories with record references
    const categories = await this.db.query(`
      USE NS rupee DB finance;
      SELECT * FROM categories;
    `)
    
    if (categories[1] && categories[1].length > 0) {
      for (const category of categories[1]) {
        // Check if userId is a record reference (contains ':')
        if (category.userId && typeof category.userId === 'string' && category.userId.includes(':')) {
          try {
            const userId = category.userId.split(':')[1]
            await this.db.query(`
              USE NS rupee DB finance;
              UPDATE ${category.id} SET userId = '${userId}';
            `)
            console.log(`Fixed userId for category ${category.id}: ${category.userId} -> ${userId}`)
          } catch (error) {
            console.warn(`Could not fix userId for category ${category.id}:`, error)
          }
        }
      }
    }
    
    // Fix other tables with userId references
    const tables = ['savings_goals', 'budget_limits', 'insights', 'alerts', 'recurring_expenses', 'profiles', 'achievements', 'backup_history']
    
    for (const table of tables) {
      try {
        const records = await this.db.query(`
          USE NS rupee DB finance;
          SELECT * FROM ${table};
        `)
        
        if (records[1] && records[1].length > 0) {
          for (const record of records[1]) {
            if (record.userId && typeof record.userId === 'string' && record.userId.includes(':')) {
              try {
                const userId = record.userId.split(':')[1]
                await this.db.query(`
                  USE NS rupee DB finance;
                  UPDATE ${record.id} SET userId = '${userId}';
                `)
                console.log(`Fixed userId for ${table} ${record.id}: ${record.userId} -> ${userId}`)
              } catch (error) {
                console.warn(`Could not fix userId for ${table} ${record.id}:`, error)
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Could not process table ${table}:`, error)
      }
    }
    
    return { success: true }
  }

  // Comprehensive method to fix all record references
  async fixAllRecordReferences(): Promise<any> {
    await this.connect()
    
    try {
      // Get all expenses and fix any record references
      const expenses = await this.db.query(`
        USE NS rupee DB finance;
        SELECT * FROM expenses;
      `)
      
      let fixedCount = 0
      if (expenses[1] && expenses[1].length > 0) {
        for (const expense of expenses[1]) {
          if (expense.userId && typeof expense.userId === 'string' && expense.userId.includes(':')) {
            try {
              const userId = expense.userId.split(':')[1]
              await this.db.query(`
                USE NS rupee DB finance;
                UPDATE ${expense.id} SET userId = '${userId}';
              `)
              console.log(`Fixed userId for expense ${expense.id}: ${expense.userId} -> ${userId}`)
              fixedCount++
            } catch (error) {
              console.warn(`Could not fix userId for expense ${expense.id}:`, error)
            }
          }
          
          if (expense.categoryId && typeof expense.categoryId === 'string' && expense.categoryId.includes(':')) {
            try {
              const categoryId = expense.categoryId.split(':')[1]
              await this.db.query(`
                USE NS rupee DB finance;
                UPDATE ${expense.id} SET categoryId = '${categoryId}';
              `)
              console.log(`Fixed categoryId for expense ${expense.id}: ${expense.categoryId} -> ${categoryId}`)
              fixedCount++
            } catch (error) {
              console.warn(`Could not fix categoryId for expense ${expense.id}:`, error)
            }
          }
        }
      }
      
      // Get all incomes and fix any record references
      const incomes = await this.db.query(`
        USE NS rupee DB finance;
        SELECT * FROM incomes;
      `)
      
      if (incomes[1] && incomes[1].length > 0) {
        for (const income of incomes[1]) {
          if (income.userId && typeof income.userId === 'string' && income.userId.includes(':')) {
            try {
              const userId = income.userId.split(':')[1]
              await this.db.query(`
                USE NS rupee DB finance;
                UPDATE ${income.id} SET userId = '${userId}';
              `)
              console.log(`Fixed userId for income ${income.id}: ${income.userId} -> ${userId}`)
              fixedCount++
            } catch (error) {
              console.warn(`Could not fix userId for income ${income.id}:`, error)
            }
          }
        }
      }
      
      console.log(`Fixed ${fixedCount} record references`)
      return { success: true, fixedCount }
    } catch (error) {
      console.error('Error fixing all record references:', error)
      return { success: false, error: error.message }
    }
  }

  // New method to fix the specific error mentioned
  async fixSpecificRecordError(): Promise<any> {
    await this.connect()
    
    try {
      // Find the specific expense mentioned in the error
      const result = await this.db.query(`
        USE NS rupee DB finance;
        SELECT * FROM expenses WHERE id = 'expenses:2dahp1q8e9cer4n5s8ze';
      `)
      
      if (result[1] && result[1].length > 0) {
        const expense = result[1][0]
        if (expense.userId && typeof expense.userId === 'string' && expense.userId.includes(':')) {
          const userId = expense.userId.split(':')[1]
          await this.db.query(`
            USE NS rupee DB finance;
            UPDATE expenses:2dahp1q8e9cer4n5s8ze SET userId = '${userId}';
          `)
          console.log(`Fixed specific expense userId: ${expense.userId} -> ${userId}`)
          return { success: true, fixed: true }
        }
      }
      
      // Also check for the new error mentioned
      const result2 = await this.db.query(`
        USE NS rupee DB finance;
        SELECT * FROM expenses WHERE id = 'expenses:ce9obee44h94a18tq6m9';
      `)
      
      if (result2[1] && result2[1].length > 0) {
        const expense = result2[1][0]
        if (expense.userId && typeof expense.userId === 'string' && expense.userId.includes(':')) {
          const userId = expense.userId.split(':')[1]
          await this.db.query(`
            USE NS rupee DB finance;
            UPDATE expenses:ce9obee44h94a18tq6m9 SET userId = '${userId}';
          `)
          console.log(`Fixed specific expense userId: ${expense.userId} -> ${userId}`)
          return { success: true, fixed: true }
        }
      }
      
      // Check for the latest error mentioned
      const result3 = await this.db.query(`
        USE NS rupee DB finance;
        SELECT * FROM expenses WHERE id = 'expenses:5t7s208me18ur6hzf4jp';
      `)
      
      if (result3[1] && result3[1].length > 0) {
        const expense = result3[1][0]
        if (expense.userId && typeof expense.userId === 'string' && expense.userId.includes(':')) {
          const userId = expense.userId.split(':')[1]
          await this.db.query(`
            USE NS rupee DB finance;
            UPDATE expenses:5t7s208me18ur6hzf4jp SET userId = '${userId}';
          `)
          console.log(`Fixed specific expense userId: ${expense.userId} -> ${userId}`)
          return { success: true, fixed: true }
        }
      }
      
      return { success: true, fixed: false }
    } catch (error) {
      console.error('Error fixing specific record:', error)
      return { success: false, error: error.message }
    }
  }

  // Expense operations
  async createExpense(expenseData: any): Promise<any> {
    await this.connect()
    
    // Ensure userId is a string, not a record reference
    const cleanExpenseData = { ...expenseData }
    if (cleanExpenseData.userId) {
      if (typeof cleanExpenseData.userId === 'object' && cleanExpenseData.userId.id) {
        // Handle _RecordId object
        cleanExpenseData.userId = cleanExpenseData.userId.id
      } else if (typeof cleanExpenseData.userId === 'string' && cleanExpenseData.userId.includes(':')) {
        // Handle string record reference
        cleanExpenseData.userId = cleanExpenseData.userId.split(':')[1]
      }
    }
    
    // Ensure categoryId is a string, not a record reference
    if (cleanExpenseData.categoryId && typeof cleanExpenseData.categoryId === 'string' && cleanExpenseData.categoryId.includes(':')) {
      cleanExpenseData.categoryId = cleanExpenseData.categoryId.split(':')[1]
    }
    
    const result = await this.db.query('USE NS rupee DB finance; CREATE expenses CONTENT $expenseData', { expenseData: cleanExpenseData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async getExpenses(userId: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM expenses WHERE userId = $userId', { userId })
    return result[1] || result[0]?.result || []
  }

  async updateExpense(expenseId: string, expenseData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE expenses SET * = $expenseData WHERE id = $expenseId', { expenseId, expenseData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async deleteExpense(expenseId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; DELETE expenses WHERE id = $expenseId', { expenseId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  // Income operations
  async createIncome(incomeData: any): Promise<any> {
    await this.connect()
    
    // Ensure userId is a string, not a record reference
    const cleanIncomeData = { ...incomeData }
    if (cleanIncomeData.userId) {
      if (typeof cleanIncomeData.userId === 'object' && cleanIncomeData.userId.id) {
        // Handle _RecordId object
        cleanIncomeData.userId = cleanIncomeData.userId.id
      } else if (typeof cleanIncomeData.userId === 'string' && cleanIncomeData.userId.includes(':')) {
        // Handle string record reference
        cleanIncomeData.userId = cleanIncomeData.userId.split(':')[1]
      }
    }
    
    const result = await this.db.query('USE NS rupee DB finance; CREATE incomes CONTENT $incomeData', { incomeData: cleanIncomeData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async getIncomes(userId: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM incomes WHERE userId = $userId', { userId })
    return result[1] || result[0]?.result || []
  }

  async updateIncome(incomeId: string, incomeData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE incomes SET * = $incomeData WHERE id = $incomeId', { incomeId, incomeData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async deleteIncome(incomeId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; DELETE incomes WHERE id = $incomeId', { incomeId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  // Category operations
  async createCategory(categoryData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; CREATE categories CONTENT $categoryData', { categoryData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async getCategories(userId: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM categories WHERE userId = $userId', { userId })
    return result[1] || result[0]?.result || []
  }

  async updateCategory(categoryId: string, categoryData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE categories SET * = $categoryData WHERE id = $categoryId', { categoryId, categoryData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async deleteCategory(categoryId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; DELETE categories WHERE id = $categoryId', { categoryId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  // Savings goals operations
  async createSavingsGoal(goalData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; CREATE savings_goals CONTENT $goalData', { goalData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async getSavingsGoals(userId: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM savings_goals WHERE userId = $userId', { userId })
    return result[1] || result[0]?.result || []
  }

  async updateSavingsGoal(goalId: string, goalData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE savings_goals SET * = $goalData WHERE id = $goalId', { goalId, goalData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async deleteSavingsGoal(goalId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; DELETE savings_goals WHERE id = $goalId', { goalId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  // Budget limits operations
  async createBudgetLimit(limitData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; CREATE budget_limits CONTENT $limitData', { limitData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async getBudgetLimits(userId: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM budget_limits WHERE userId = $userId', { userId })
    return result[1] || result[0]?.result || []
  }

  async updateBudgetLimit(limitId: string, limitData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE budget_limits SET * = $limitData WHERE id = $limitId', { limitId, limitData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async deleteBudgetLimit(limitId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; DELETE budget_limits WHERE id = $limitId', { limitId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  // Insights operations
  async createInsight(insightData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; CREATE insights CONTENT $insightData', { insightData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async getInsights(userId: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM insights WHERE userId = $userId ORDER BY createdAt DESC', { userId })
    return result[1] || result[0]?.result || []
  }

  async markInsightAsRead(insightId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE insights SET isRead = true WHERE id = $insightId', { insightId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  // Alerts operations
  async createAlert(alertData: any): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; CREATE alerts CONTENT $alertData', { alertData })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async getAlerts(userId: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; SELECT * FROM alerts WHERE userId = $userId ORDER BY createdAt DESC', { userId })
    return result[1] || result[0]?.result || []
  }

  async markAlertAsRead(alertId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; UPDATE alerts SET isRead = true WHERE id = $alertId', { alertId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  async deleteAlert(alertId: string): Promise<any> {
    await this.connect()
    const result = await this.db.query('USE NS rupee DB finance; DELETE alerts WHERE id = $alertId', { alertId })
    return result[1]?.[0] || result[0]?.result?.[0]
  }

  // Analytics queries
  async getMonthlyExpenses(userId: string, year: number, month: number): Promise<any[]> {
    await this.connect()
    const result = await this.db.query(`
      USE NS rupee DB finance;
      SELECT * FROM expenses 
      WHERE userId = $userId 
      AND time::year(date) = $year 
      AND time::month(date) = $month
      ORDER BY date DESC
    `, { userId, year, month })
    return result[1] || result[0]?.result || []
  }

  async getExpensesByCategory(userId: string, startDate: string, endDate: string): Promise<any[]> {
    await this.connect()
    const result = await this.db.query(`
      USE NS rupee DB finance;
      SELECT categoryId, sum(amount) as total 
      FROM expenses 
      WHERE userId = $userId 
      AND date >= $startDate 
      AND date <= $endDate
      GROUP BY categoryId
    `, { userId, startDate, endDate })
    return result[1] || result[0]?.result || []
  }

  async getTotalSavings(userId: string): Promise<number> {
    await this.connect()
    const result = await this.db.query(`
      USE NS rupee DB finance;
      SELECT sum(currentAmount) as total 
      FROM savings_goals 
      WHERE userId = $userId
    `, { userId })
    return result[1]?.[0]?.total || result[0]?.result?.[0]?.total || 0
  }
}

export const surrealDB = SurrealDBService.getInstance()
export default surrealDB 