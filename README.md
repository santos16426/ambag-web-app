# Ambag 🇵🇭

**Everyone pays their ambag**

A modern, hassle-free bill-splitting app that makes group expenses simple. Built with Filipino values of fairness and community in mind.

---

## 🌟 What is Ambag?

**Ambag** (Tagalog/Filipino: "contribution" or "share") is a SaaS application that helps groups of friends, families, and roommates split expenses fairly and track who owes what.

No more awkward conversations about money. No more spreadsheets. No more mental math. Just add the expense, and Ambag handles the rest.

---

## ✨ Features

### ✅ Currently Available
- 🔐 **User Authentication** - Secure signup with email/password and Google OAuth
- 👥 **Group Management** - Create groups, manage members, and organize expenses
- 🔗 **Group Invitations** - Invite friends via email (even if they don't have an account yet)
- 🎫 **Join by Invite Code** - Share 8-character invite codes for quick group joining
- ✅ **Smart Join Logic** - Auto-approve invited users, require approval for others
- 💰 **Expense Tracking** - Add expenses with custom splits (equal or custom amounts)
- 📊 **Smart Balance Calculation** - Real-time balance updates with automatic debt netting
- 🧮 **Debt Simplification Algorithm** - Minimize transactions needed to settle up
- 💳 **Settle Up** - Record payments and track settlement history
- 🏷️ **Expense Categories** - Organize expenses (Food, Rent, Entertainment, etc.)
- 🔔 **Notifications System** - Real-time notifications for group activities, expenses, and payments
- 👤 **User Profiles** - Customizable profiles with avatar uploads
- 📱 **Responsive Design** - Works beautifully on mobile and desktop
- 🌓 **Dark Mode** - Full dark mode support with smooth theme transitions

### 🚧 Coming Soon
- 💱 Multi-currency support with live exchange rates
- 💸 Payment gateway integration (Stripe, PayPal)
- 🧾 Receipt uploads with OCR
- 📧 Email notifications (currently logged to console)
- 📲 Push notifications
- 📱 Native mobile apps (iOS & Android)
- 🔄 Recurring expenses
- 💬 Expense comments
- 📥 Export to CSV/PDF

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **UI** | Tailwind CSS + shadcn/ui |
| **Backend** | Next.js API Routes + Supabase |
| **Database** | PostgreSQL (via Supabase) |
| **Auth** | Supabase Auth |
| **Deployment** | Vercel |
| **State Management** | React Context + Zustand |

---

## 🏗️ Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ↓
┌─────────────┐
│  Next.js    │ ← Server-side rendering
│  (Vercel)   │ ← API Routes
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Supabase   │
├─────────────┤
│ PostgreSQL  │ ← Row Level Security
│ Auth        │ ← JWT tokens
│ Storage     │ ← (Future: receipts)
└─────────────┘
```

**Multi-tenancy**: Group-based isolation with Row Level Security (RLS)
**Security**: All database access enforced through RLS policies

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works!)
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ambag.git
   cd ambag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run migrations from `supabase/migrations/` folder
   - Enable Row Level Security on all tables

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

6. **Setup shadcn/ui** (if not already done)
   ```bash
   npx shadcn-ui@latest init
   ```

---

## 📁 Project Structure

```
ambag/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Auth components
│   ├── groups/              # Group management
│   ├── expenses/            # Expense tracking
│   └── balances/            # Balance display
├── lib/                     # Utilities and helpers
│   ├── supabase/           # Supabase clients
│   ├── algorithms/         # Core algorithms
│   ├── utils/              # Helper functions
│   └── types/              # TypeScript types
├── hooks/                   # Custom React hooks
├── supabase/               # Database migrations
│   └── migrations/
├── public/                  # Static assets
└── docs/                    # Documentation
```

---

## 🧮 How It Works

### The Debt Simplification Algorithm

**Problem**: When splitting expenses, you often end up with many small transactions between people.

**Example**:
```
Before simplification:
- Alice owes Bob $10
- Bob owes Charlie $10
- Charlie owes Alice $10

After simplification:
- 0 transactions! (everything cancels out)
```

**Our Solution**: Greedy algorithm that calculates net balances and minimizes transactions.

```typescript
// Simplified version
1. Calculate each person's net balance (what they owe or are owed)
2. Match creditors (people owed money) with debtors (people who owe)
3. Settle largest amounts first
4. Result: Minimum number of transactions
```

**Performance**: O(n log n) where n = number of people in group

---

## 🔒 Security

- **Row Level Security (RLS)** - Users can only access their own groups and expenses
- **JWT Authentication** - Secure token-based auth via Supabase
- **Input Validation** - All inputs validated with Zod schemas
- **HTTPS Only** - Enforced on Vercel
- **SQL Injection Protection** - Parameterized queries via Supabase client

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

Key test areas:
- ✅ Debt simplification algorithm
- ✅ Balance calculation logic
- ✅ Authentication flows
- ✅ API route handlers
- ✅ React components

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables

3. **Deploy!**
   - Vercel automatically builds and deploys
   - Your app is live at `your-app.vercel.app`

### Environment Variables (Production)

Set these in Vercel dashboard:
```
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 📚 Documentation

- [Development Roadmap](DEVELOPMENT_ROADMAP.md) - Week-by-week development plan
- [Taskboard](TASKBOARD.md) - Visual kanban board for tracking progress
- [Branding Guide](BRANDING.md) - Brand identity and messaging
- [Architecture Plan](c:\Users\Lucas\.cursor\plans\splitwise_clone_architecture_98b956bb.plan.md) - Detailed technical architecture

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/device info

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by [Splitwise](https://www.splitwise.com)
- Built with [Next.js](https://nextjs.org)
- Powered by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Filipino community for the concept of "ambag"

---

## 💬 Support

- 📧 Email: support@ambag.app
- 💬 Discord: [Join our community](#)
- 🐦 Twitter: [@ambagapp](#)

---

## 📊 Project Status

**Current Phase**: 🟢 MVP Active Development
**Status**: Core features implemented and in use
**Last Updated**: January 2026

---

## 🎯 Roadmap

### ✅ Completed
- [x] Architecture planning and database schema
- [x] User authentication (email/password + OAuth)
- [x] Group management (create, invite, join)
- [x] Group invitations system (email-based)
- [x] Join requests with invite codes
- [x] Expense tracking with custom splits
- [x] Smart balance calculation with debt netting
- [x] Settlement tracking
- [x] Notifications system
- [x] User profiles and avatar uploads
- [x] Responsive UI with dark mode
- [x] Row Level Security (RLS) policies

### 🏗️ In Progress
- [ ] Production deployment
- [ ] Email service integration
- [ ] Performance optimization

### 📅 Upcoming
- [ ] Receipt scanning (OCR)
- [ ] Multi-currency support
- [ ] Payment gateway integration
- [ ] Mobile apps
- [ ] Recurring expenses

---

**Made with ❤️ for the Filipino community and beyond**

*Ambag - Because everyone should pay their share* 🇵🇭
