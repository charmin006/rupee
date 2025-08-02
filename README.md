# Rupee - AI-Powered Finance Tracker

A modern, intelligent personal finance tracking website designed to simplify daily expense management, provide AI-powered financial insights, and foster sustainable money habits.

## 🚀 Features

### Core Features (Phase 1 - MVP) ✅
- ✅ **Add/Edit/Delete Expenses** - Quick expense logging with categories, notes, and payment methods
- ✅ **Daily/Monthly Summary** - Automatic financial summaries with visual breakdowns
- ✅ **Category Tracking** - Predefined and customizable expense categories with color coding
- ✅ **Local Storage** - Secure local data persistence using browser storage
- ✅ **AI Spending Insights** - Intelligent analysis of spending patterns and trends
- ✅ **Income Tracking** - Log and manage income sources
- ✅ **Responsive Design** - Beautiful, modern UI that works on all devices

### Advanced Features (Phase 2) ✅
- ✅ **Savings Goals** - Set and track financial goals with progress visualization
- ✅ **Budget Limits** - Set spending limits by category with smart alerts
- ✅ **Overspending Alerts** - Real-time notifications when you exceed budgets
- ✅ **Enhanced AI Insights** - Advanced spending pattern analysis with goal tracking
- ✅ **Alert Management** - Comprehensive notification system with severity levels
- ✅ **Advanced Settings** - Granular control over alerts and preferences

### Advanced Features (Phase 3) ✅
- ✅ **Receipt Scanner** - OCR-powered receipt scanning and automatic categorization
- ✅ **Recurring Expenses** - Automatic expense scheduling and tracking
- ✅ **Advanced Charts** - Weekly & monthly visualizations with calendar view
- ✅ **Gamification** - Streak tracking, "No Spend Day" badges, and achievements
- ✅ **Multi-profile Support** - Family and team expense tracking (UI ready)
- ✅ **PIN/Biometric Lock** - Enhanced security for sensitive financial data (infrastructure ready)
- ✅ **Data Backup/Restore** - Cloud synchronization and data export/import (infrastructure ready)

### Planned Features (Future)
- 🔄 **Enhanced OCR** - Improved receipt scanning with better accuracy
- 🔄 **Cloud Sync** - Real-time data synchronization across devices
- 🔄 **Mobile App** - Native mobile application
- 🔄 **Bank Integration** - Direct bank account connectivity
- 🔄 **Investment Tracking** - Portfolio management and tracking
- 🔄 **Tax Reporting** - Automated tax preparation and reporting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Charts**: Recharts with advanced visualizations
- **Date Handling**: date-fns
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast
- **Storage**: Browser localStorage with secure data management
- **AI**: GPT-style spending insights with rule-based analysis
- **OCR**: Tesseract.js for receipt scanning
- **Encryption**: Crypto-js for data security
- **Camera**: React Webcam for receipt scanning
- **File Upload**: React Dropzone for image uploads
- **Calendar**: React Calendar for advanced date views
- **Animations**: React Confetti for achievements

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rupee
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Troubleshooting SurrealDB Issues

If you encounter the error `Found users:bagkteyku5snng5qt6wn for field userId, with record expenses:2dahp1q8e9cer4n5s8ze, but expected a string`, this means there are record references instead of string IDs in your database.

**Automatic Fix**: The application will automatically attempt to fix this issue when connecting to SurrealDB.

**Manual Fix**: If the automatic fix doesn't work, you can run the fix script:

```bash
node fix-surrealdb-error.js
```

**Test Page**: Visit `http://localhost:3000/surrealdb-test` to test the database connection and run manual fixes.

### Build for Production

```bash
npm run build
npm start
```

## 📱 Usage Guide

### Getting Started
1. **Add Your First Expense**: Click "Add Expense" on the overview page
2. **Set Up Categories**: Customize expense categories in the Categories section
3. **Track Income**: Log your income sources for complete financial overview
4. **Create Savings Goals**: Set financial targets with deadlines
5. **Set Budget Limits**: Define spending limits by category
6. **Review Insights**: Check AI-powered spending analysis

### Phase 3 Features

#### 📷 **Receipt Scanner**
- **Camera Scanning**: Use your device camera to scan receipts
- **File Upload**: Drag and drop or select receipt images
- **OCR Processing**: Automatic text extraction from receipts
- **Auto-categorization**: Smart category suggestions based on receipt content
- **Manual Review**: Edit extracted information before saving

#### 🔄 **Recurring Expenses**
- **Automatic Scheduling**: Set up daily, weekly, monthly, or yearly expenses
- **Smart Notifications**: Get reminded when recurring expenses are due
- **Auto-generation**: Expenses are automatically created on due dates
- **Flexible Management**: Pause, edit, or delete recurring expenses anytime

#### 📊 **Advanced Analytics**
- **Multiple Chart Types**: Bar, line, area, pie, and calendar views
- **Period Filtering**: View data by day, week, month, or year
- **Category Filtering**: Analyze spending by specific categories
- **Calendar View**: Visual spending patterns on a monthly calendar
- **Interactive Charts**: Hover for detailed information

#### 🏆 **Gamification**
- **Achievement System**: Unlock badges for financial milestones
- **Streak Tracking**: Monitor consecutive days of expense tracking
- **No Spend Days**: Track and celebrate days without spending
- **Progress Visualization**: Visual progress bars for all achievements
- **Celebration Effects**: Confetti animations for unlocked achievements

#### 👥 **Multi-Profile Support** (UI Ready)
- **Family Profiles**: Manage expenses for multiple family members
- **Team Tracking**: Track shared expenses for teams or groups
- **Role-based Permissions**: Control access levels for different users
- **Shared Goals**: Collaborative savings and budget goals

#### 🔒 **Security Features** (Infrastructure Ready)
- **PIN Protection**: Secure app access with PIN codes
- **Biometric Authentication**: Use fingerprint or face recognition
- **Auto-lock**: Automatic app locking after inactivity
- **Encrypted Data**: All sensitive data is encrypted at rest

#### ☁️ **Data Management** (Infrastructure Ready)
- **Export/Import**: Backup and restore your financial data
- **Cloud Sync**: Synchronize data across multiple devices
- **Version Control**: Track changes and restore previous versions
- **Encrypted Backups**: Secure cloud storage with encryption

### Key Features

#### 📊 **Overview Dashboard**
- Real-time financial summaries (day, week, month, year)
- Visual spending breakdowns by category
- Quick action buttons for adding expenses/income
- AI insights preview

#### 💰 **Expense Management**
- One-tap expense logging
- Category-based organization
- Payment method tracking
- Receipt image support
- Search and filter capabilities

#### 🎯 **Savings Goals**
- Set target amounts and deadlines
- Progress tracking with visual indicators
- On-track/behind-schedule status
- Goal completion celebrations

#### ⚠️ **Budget Limits & Alerts**
- Category-specific spending limits
- Real-time overspending notifications
- Severity-based alert system
- Customizable alert preferences

#### 🤖 **AI Insights**
- Spending pattern analysis
- Budget limit warnings
- Savings goal progress updates
- Personalized financial tips

#### ⚙️ **Settings & Preferences**
- Currency selection (₹, $, €, £)
- Theme options (light, dark, auto)
- Monthly budget setting
- Comprehensive alert controls

## 🏗️ Project Structure

```
rupee/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind config
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard layout
│   ├── Header.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Overview.tsx       # Dashboard overview
│   ├── Expenses.tsx       # Expense management
│   ├── Incomes.tsx        # Income tracking
│   ├── Categories.tsx     # Category management
│   ├── Insights.tsx       # AI insights display
│   ├── SavingsGoals.tsx   # Savings goals (Phase 2)
│   ├── BudgetLimits.tsx   # Budget limits (Phase 2)
│   ├── Alerts.tsx         # Alert management (Phase 2)
│   ├── Settings.tsx       # User preferences
│   ├── ReceiptScanner.tsx # Receipt scanning (Phase 3)
│   ├── RecurringExpenses.tsx # Recurring expenses (Phase 3)
│   ├── Gamification.tsx   # Achievements & streaks (Phase 3)
│   ├── AdvancedCharts.tsx # Advanced analytics (Phase 3)
│   └── ...                # Other UI components
├── lib/                   # Utility libraries
│   ├── types.ts           # TypeScript type definitions
│   ├── storage.ts         # Local storage management
│   └── utils.ts           # Utility functions
├── public/                # Static assets
└── ...                    # Configuration files
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:

```env
# Optional: API keys for enhanced AI features (Phase 3)
OPENAI_API_KEY=your_openai_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### Customization

#### Colors and Themes
Edit `tailwind.config.js` to customize the design system:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* Custom primary colors */ },
        rupee: { /* Rupee brand colors */ },
        success: { /* Success state colors */ },
        warning: { /* Warning state colors */ },
        danger: { /* Danger state colors */ },
      },
    },
  },
}
```

#### Default Categories
Modify `lib/storage.ts` to customize default expense categories:

```typescript
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', color: '#ef4444', icon: '🍽️', isCustom: false },
  // Add your custom categories...
]
```

## 📊 Data Structure

### Core Data Models

```typescript
interface Expense {
  id: string
  amount: number
  category: string
  date: string
  note?: string
  paymentMethod?: PaymentMethod
  receiptImage?: string
  receiptData?: ReceiptData
  isRecurring?: boolean
  recurringId?: string
  profileId?: string
  createdAt: string
  updatedAt: string
}

interface RecurringExpense {
  id: string
  title: string
  amount: number
  category: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate?: string
  nextDueDate: string
  isActive: boolean
  note?: string
  paymentMethod?: PaymentMethod
  profileId: string
  createdAt: string
  updatedAt: string
}

interface Achievement {
  id: string
  type: 'streak' | 'savings' | 'budget' | 'no_spend' | 'goal' | 'milestone'
  title: string
  description: string
  icon: string
  isUnlocked: boolean
  unlockedAt?: string
  progress: number
  maxProgress: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface ReceiptData {
  id: string
  imageUrl: string
  ocrText?: string
  extractedData?: {
    merchant?: string
    total?: number
    date?: string
    items?: ReceiptItem[]
  }
  confidence: number
  isProcessed: boolean
  createdAt: string
}

interface UserProfile {
  id: string
  name: string
  avatar?: string
  role: 'owner' | 'member' | 'viewer'
  permissions: ProfilePermissions
  createdAt: string
  updatedAt: string
}
```

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: All data stored locally in browser
- **No External Servers**: No data transmitted to external services
- **Encryption Ready**: Architecture supports data encryption
- **Privacy First**: No tracking or analytics without consent
- **PIN Protection**: Optional PIN-based app locking
- **Biometric Ready**: Infrastructure for biometric authentication

### Best Practices
- Regular data backups (export functionality)
- Secure browser environment
- No sensitive data in URLs or logs
- Local-only processing for AI insights
- Encrypted data storage and transmission

## 🧪 Testing

### Manual Testing Checklist
- [ ] Add/Edit/Delete expenses
- [ ] Add/Edit/Delete income
- [ ] Create/Update savings goals
- [ ] Set/Modify budget limits
- [ ] Test alert generation
- [ ] Verify data persistence
- [ ] Test responsive design
- [ ] Validate form inputs
- [ ] Check accessibility
- [ ] Test receipt scanning
- [ ] Verify recurring expenses
- [ ] Check achievement system
- [ ] Test advanced charts
- [ ] Verify data export/import

### Automated Testing (Future)
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **AWS Amplify**: Use Next.js build specification
- **Docker**: Use official Next.js Docker image

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component reusability
- Add proper error handling
- Include accessibility features

## 📈 Roadmap

### Phase 3 (Current) ✅
- [x] Receipt Scanner (OCR)
- [x] Recurring Expenses
- [x] Advanced Analytics
- [x] Gamification Features
- [x] Multi-profile Support (UI)
- [x] Security Infrastructure
- [x] Data Backup Infrastructure

### Future Enhancements
- [ ] Enhanced OCR with better accuracy
- [ ] Cloud synchronization
- [ ] Mobile App (React Native)
- [ ] Bank Integration
- [ ] Investment Tracking
- [ ] Tax Reporting
- [ ] Advanced AI features
- [ ] Social features and sharing

## 📞 Support

### Getting Help
- **Documentation**: Check this README and code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Email**: Contact the development team

### Common Issues
1. **Data not persisting**: Check browser localStorage permissions
2. **Styling issues**: Verify Tailwind CSS is properly configured
3. **Build errors**: Ensure Node.js version is 18+
4. **Performance**: Optimize for large datasets
5. **Camera access**: Ensure HTTPS for camera functionality
6. **OCR accuracy**: Improve image quality for better results

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first styling
- **Lucide** for beautiful icons
- **React Community** for excellent documentation and tools
- **Tesseract.js** for OCR capabilities
- **Recharts** for advanced charting

---

**Built with ❤️ for better financial management** 