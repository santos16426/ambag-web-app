# Ambag - Project Scope Document

**Project Name**: Ambag
**Tagline**: Everyone pays their ambag
**Type**: SaaS Web Application
**Target Launch**: MVP in 4 weeks
**Version**: 1.0 (MVP)

---

## 1. Executive Summary

Ambag is a modern bill-splitting SaaS application inspired by Splitwise, designed to help groups of friends, families, couples, and roommates manage shared expenses fairly and efficiently. The name "Ambag" comes from the Filipino word meaning "contribution" or "share", reflecting the cultural value of fair contribution in group settings.

### Core Value Proposition
- **Problem**: Splitting bills among groups is tedious, requires mental math, and often results in awkward money conversations
- **Solution**: Ambag automates expense tracking, calculates who owes whom, and minimizes the number of transactions needed to settle up
- **Differentiator**: Smart debt simplification algorithm that reduces transaction complexity by 50%+

---

## 2. Project Objectives

### Primary Goals
1. **Launch MVP** within 4 weeks with core bill-splitting functionality
2. **Scalable Architecture** that supports future growth to 100K+ users
3. **Multi-tenant Ready** with proper data isolation and security
4. **Web-first** approach (mobile apps in Phase 2)

### Success Metrics
- Users can signup and create first group in < 2 minutes
- Adding and splitting an expense takes < 30 seconds
- Balance calculations complete in < 500ms
- Debt simplification reduces transactions by 50%+
- 90%+ mobile responsiveness score
- Zero security vulnerabilities in MVP

---

## 3. Target Users

### Primary Personas

**1. Young Professionals (25-35 years old)**
- Frequently dine out with friends
- Split costs for shared activities (concerts, trips)
- Tech-savvy, mobile-first
- Pain: Awkward Venmo requests, lost receipts

**2. Roommates (18-30 years old)**
- Share rent, utilities, groceries
- Need ongoing expense tracking
- Want fair, transparent splits
- Pain: Excel spreadsheets, forgotten payments

**3. Couples (Any age)**
- Manage joint expenses
- Split or share costs differently
- Need privacy and simplicity
- Pain: "Who paid for what?" confusion

**4. Family Groups (30-60 years old)**
- Split costs for family events
- Manage shared household expenses
- Multi-generational usage
- Pain: Complex family dynamics, lack of transparency

**5. Filipino Diaspora (Global)**
- Cultural connection to "ambag" concept
- Often split costs in groups
- Value community and fairness
- Pain: Currency conversion, distance

### User Characteristics
- **Tech Literacy**: Medium to high
- **Device Usage**: 70% mobile, 30% desktop
- **Frequency**: 2-10 expenses per week per group
- **Group Size**: Typically 2-8 people per group

---

## 4. Scope Definition

### 4.1 In-Scope (MVP - Phase 1)

#### Core Features ✅

**A. User Management**
- Email/password authentication
- Google OAuth social login
- User profile (name, avatar, email)
- Session management
- Password reset

**B. Group Management**
- Create groups with name and description
- Invite members via shareable link
- Join groups using invite code
- View group members
- Leave group
- Remove members (admin only)
- Group dashboard with stats

**C. Expense Tracking**
- Add expenses with:
  - Amount (with decimal precision)
  - Description
  - Category (predefined list)
  - Date
  - Paid by (group member)
- Split types:
  - Equal split (divide evenly)
  - Custom split (specify amounts per person)
- View expense history
- Edit own expenses
- Delete own expenses
- Filter by category
- Sort by date

**D. Balance Calculation**
- Real-time balance per user
- "Who owes whom" breakdown
- Net balance (positive = owed money, negative = owes money)
- Group total expenses
- Individual contribution tracking

**E. Debt Simplification Algorithm**
- Minimize number of transactions
- Calculate optimal payment flow
- Show before/after comparison
- Handle circular debts
- Support complex multi-person scenarios

**F. Settlement System**
- Record payments between users
- Update balances accordingly
- Settlement history
- Immutable audit trail
- Settlement confirmation

**G. Categories**
- Predefined expense categories:
  - 🍔 Food & Dining
  - 🏠 Rent & Utilities
  - 🎬 Entertainment
  - 🚗 Transportation
  - 🛒 Groceries
  - 💊 Healthcare
  - 🎓 Education
  - ✈️ Travel
  - 🛍️ Shopping
  - 📱 Other
- Category-based filtering
- Category spending analytics

**H. User Interface**
- Responsive design (mobile + desktop)
- Dark mode (inherited from system)
- Modern, clean design
- Intuitive navigation
- Loading states
- Error handling
- Empty states

---

### 4.2 Out-of-Scope (Phase 2)

These features are explicitly deferred to future releases:

#### Phase 2 Features (Month 2-3)
- ❌ Multi-currency support with live exchange rates
- ❌ Payment gateway integration (Stripe, PayPal)
- ❌ Receipt image upload with OCR
- ❌ Email notifications for new expenses
- ❌ Push notifications
- ❌ Native mobile apps (iOS, Android)
- ❌ Recurring expenses
- ❌ Expense comments/notes
- ❌ Export to CSV/PDF
- ❌ Split by percentage
- ❌ Unequal ownership splits
- ❌ Bill splitting from photos
- ❌ Expense attachments
- ❌ Group statistics and charts
- ❌ Budget limits and alerts
- ❌ Custom categories
- ❌ Multiple payers per expense
- ❌ Expense approval workflow
- ❌ Sub-groups or nested groups

#### Phase 3 Features (Future)
- ❌ API for third-party integrations
- ❌ White-label options
- ❌ Enterprise features
- ❌ Advanced analytics
- ❌ Cryptocurrency settlements
- ❌ Voice input for expenses
- ❌ Smart assistant integration
- ❌ Offline mode

---

## 5. Technical Architecture

### 5.1 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend Framework** | Next.js 14+ (App Router) | Server-side rendering, optimal performance, React ecosystem |
| **Language** | TypeScript | Type safety, better DX, fewer bugs |
| **Styling** | Tailwind CSS v4 | Utility-first, fast development, small bundle |
| **UI Components** | shadcn/ui | Beautiful, accessible, customizable |
| **Backend** | Next.js API Routes | Serverless, same codebase, easy deployment |
| **Database** | PostgreSQL (Supabase) | Relational data, ACID compliance, mature |
| **Authentication** | Supabase Auth | Built-in, secure, OAuth support |
| **Storage** | Supabase Storage | (Future: receipt uploads) |
| **Hosting** | Vercel | Optimized for Next.js, edge network, auto-scaling |
| **State Management** | Zustand | Lightweight, simple API |
| **Form Management** | React Hook Form | Performance, validation |
| **Validation** | Zod | TypeScript-first, runtime safety |

### 5.2 Architecture Pattern

**Serverless Full-Stack Application**
```
Browser (Client)
    ↓ HTTPS
Next.js (Vercel Edge)
    ↓ API Calls
Supabase (Backend-as-a-Service)
    ├── PostgreSQL (Data)
    ├── Auth (JWT)
    └── Storage (Files)
```

**Key Principles**:
- Server Components by default
- Client Components only when needed
- API routes for mutations
- Row Level Security for data access
- Edge deployment for low latency

### 5.3 Database Schema

**6 Core Tables**:

```sql
users (extends auth.users)
  ├── id (UUID, PK)
  ├── email (TEXT, unique)
  ├── full_name (TEXT)
  ├── avatar_url (TEXT)
  └── timestamps

groups
  ├── id (UUID, PK)
  ├── name (TEXT)
  ├── description (TEXT)
  ├── created_by (UUID, FK → users)
  ├── invite_code (TEXT, unique)
  └── timestamps

group_members (junction table)
  ├── id (UUID, PK)
  ├── group_id (UUID, FK → groups)
  ├── user_id (UUID, FK → users)
  ├── role (ENUM: 'admin', 'member')
  └── joined_at

expenses
  ├── id (UUID, PK)
  ├── group_id (UUID, FK → groups)
  ├── paid_by (UUID, FK → users)
  ├── amount (NUMERIC(10,2))
  ├── description (TEXT)
  ├── category (TEXT)
  ├── expense_date (DATE)
  └── timestamps

expense_participants
  ├── id (UUID, PK)
  ├── expense_id (UUID, FK → expenses)
  ├── user_id (UUID, FK → users)
  ├── amount_owed (NUMERIC(10,2))
  └── amount_paid (NUMERIC(10,2))

settlements
  ├── id (UUID, PK)
  ├── group_id (UUID, FK → groups)
  ├── from_user (UUID, FK → users)
  ├── to_user (UUID, FK → users)
  ├── amount (NUMERIC(10,2))
  ├── notes (TEXT)
  └── settled_at
```

**Data Flow**:
1. User creates expense → Insert into `expenses`
2. Specify participants → Insert into `expense_participants`
3. Calculate balances → Query both tables
4. User settles debt → Insert into `settlements`
5. Recalculate balances → Factor in settlements

### 5.4 Security Model

**Multi-Tenancy**: Group-based isolation
- Each group is a separate "tenant"
- Users can belong to multiple groups
- Data is isolated by `group_id`

**Row Level Security (RLS)**:
- Every table has RLS enabled
- Policies enforce:
  - Users see only their groups' data
  - Admins have elevated permissions
  - No cross-group data leakage
- Enforced at database level (not app level)

**Authentication**:
- JWT tokens via Supabase Auth
- HTTP-only cookies
- Session management
- CSRF protection

**Input Validation**:
- Zod schemas for all forms
- Server-side validation
- SQL injection prevention (parameterized queries)
- XSS protection (React escaping)

---

## 6. Core Algorithm: Debt Simplification

### 6.1 Problem Statement
When multiple people share expenses, the naive approach creates many small transactions:
- A owes B $10
- B owes C $15
- C owes D $20
- D owes A $5
Result: 4 transactions, confusing flow

### 6.2 Our Solution
**Greedy Algorithm using Net Balances**

**Steps**:
1. Calculate each person's net balance (what they're owed minus what they owe)
2. Separate into creditors (positive balance) and debtors (negative balance)
3. Match largest creditor with largest debtor
4. Create transaction for the minimum of the two amounts
5. Update balances and repeat until all balanced

**Example**:
```
Input:
- Alice: +$30 (is owed)
- Bob: -$20 (owes)
- Charlie: -$10 (owes)

Output:
- Bob pays Alice $20
- Charlie pays Alice $10
Total: 2 transactions (optimal)
```

**Complexity**: O(n log n) where n = number of participants

**Guarantee**: Produces the minimum number of transactions mathematically possible

### 6.3 Implementation
```typescript
function simplifyDebts(balances: Record<userId, number>): Transaction[] {
  const creditors = []; // Sort descending
  const debtors = [];   // Sort ascending (by absolute value)

  // Separate and sort
  for (const [userId, balance] of Object.entries(balances)) {
    if (balance > 0) creditors.push({ userId, amount: balance });
    if (balance < 0) debtors.push({ userId, amount: -balance });
  }

  const transactions = [];

  // Match creditors with debtors
  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];

    const settleAmount = Math.min(creditor.amount, debtor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: settleAmount
    });

    creditor.amount -= settleAmount;
    debtor.amount -= settleAmount;

    if (creditor.amount === 0) creditors.shift();
    if (debtor.amount === 0) debtors.shift();
  }

  return transactions;
}
```

---

## 7. API Design

### 7.1 REST API Endpoints

**Authentication**
```
POST   /api/auth/signup              # Create account
POST   /api/auth/login               # Login
POST   /api/auth/logout              # Logout
GET    /api/auth/me                  # Get current user
```

**Groups**
```
GET    /api/groups                   # List user's groups
POST   /api/groups                   # Create group
GET    /api/groups/[id]              # Group details
PUT    /api/groups/[id]              # Update group
DELETE /api/groups/[id]              # Delete group
POST   /api/groups/[id]/invite       # Generate invite link
POST   /api/groups/[id]/join         # Join via invite
GET    /api/groups/[id]/members      # List members
DELETE /api/groups/[id]/members/[uid] # Remove member
```

**Expenses**
```
GET    /api/groups/[id]/expenses     # List expenses
POST   /api/groups/[id]/expenses     # Create expense
GET    /api/expenses/[id]            # Expense details
PUT    /api/expenses/[id]            # Update expense
DELETE /api/expenses/[id]            # Delete expense
```

**Balances**
```
GET    /api/groups/[id]/balances     # Calculate balances
GET    /api/groups/[id]/simplified   # Simplified debts
```

**Settlements**
```
POST   /api/groups/[id]/settlements  # Record settlement
GET    /api/groups/[id]/settlements  # Settlement history
```

### 7.2 Response Format

**Success** (200, 201):
```json
{
  "data": { ... },
  "message": "Success"
}
```

**Error** (400, 401, 403, 404, 500):
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## 8. Development Timeline

### Phase 1: MVP (4 Weeks)

**Week 1: Foundation (40-50 hours)**
- Day 1: Project setup ✅
- Day 2: Database schema ✅
- Day 3: RLS policies
- Day 4: Authentication
- Day 5: UI components
- Weekend: Buffer & testing

**Week 2: Core Features (45-55 hours)**
- Day 8-9: Group CRUD + Invite system
- Day 10: Group dashboard
- Day 11-12: Expense form & validation
- Day 13: Expense list & display
- Weekend: Integration testing

**Week 3: Smart Features (50-60 hours)**
- Day 15: Balance calculation
- Day 16: Debt simplification algorithm
- Day 17-18: Settlement flow
- Day 19: Category management
- Day 20: Main dashboard
- Weekend: Polish & bug fixes

**Week 4: Launch Prep (35-45 hours)**
- Day 22: UI/UX polish
- Day 23: Error handling
- Day 24: Performance optimization
- Day 25: Testing (unit + integration)
- Day 26: Documentation
- Day 27: Pre-deployment setup
- Day 28: Deploy & launch 🚀

**Total Effort**: 170-210 hours (4-5 weeks at 40-50h/week)

### Phase 2: Advanced Features (Month 2-3)
- Multi-currency support
- Payment gateway integration
- Receipt uploads
- Email notifications
- Mobile apps

---

## 9. Constraints & Assumptions

### Technical Constraints
1. **MVP-first**: Focus on core features only
2. **Web-only**: No native mobile apps in Phase 1
3. **Free tier**: Use Supabase and Vercel free tiers initially
4. **Single currency**: USD only (multi-currency in Phase 2)
5. **English-only**: i18n deferred to Phase 2

### Business Constraints
1. **Budget**: $0 for MVP (free tier services)
2. **Timeline**: 4 weeks to MVP
3. **Team**: 1-2 developers
4. **Scale**: Target 100-1000 users for MVP

### Assumptions
1. **Users have internet**: No offline mode
2. **Modern browsers**: Chrome, Firefox, Safari (latest 2 versions)
3. **Email required**: No phone number authentication
4. **Trust-based**: No payment enforcement (social pressure only)
5. **Groups are small**: 2-20 people per group typically

### Known Limitations (MVP)
- No receipt image upload
- No payment integration
- No email notifications
- No mobile apps
- No multi-currency
- No recurring expenses
- No custom categories
- No expense approval workflow
- No analytics/reports
- No data export

---

## 10. Non-Functional Requirements

### Performance
- **Page Load**: < 2 seconds (initial load)
- **API Response**: < 500ms (p95)
- **Balance Calculation**: < 100ms for groups with 100+ expenses
- **Database Queries**: < 50ms (indexed queries)

### Scalability
- Support 1,000 concurrent users
- Handle 10,000+ expenses per group
- Database size: Plan for 10GB in year 1
- Horizontal scaling via Vercel edge functions

### Security
- HTTPS only (enforced)
- Secure password hashing (bcrypt)
- JWT tokens with expiration
- CSRF protection
- XSS prevention
- SQL injection prevention
- RLS at database level
- No sensitive data in logs

### Availability
- 99.9% uptime target (Vercel SLA)
- Graceful degradation
- Error boundaries in React
- Retry logic for failed requests

### Usability
- Mobile-responsive (320px+)
- Touch-friendly (44px minimum tap targets)
- Keyboard navigation
- Screen reader compatible (WCAG 2.1 Level A minimum)
- Clear error messages
- Helpful empty states

### Maintainability
- TypeScript for type safety
- ESLint for code quality
- Comprehensive inline documentation
- README and setup guides
- Migration files versioned
- Git for version control

---

## 11. Success Criteria

### Launch Criteria (Must-Have)
- ✅ All 6 database tables deployed
- ✅ RLS policies active and tested
- ✅ Authentication working (email + Google)
- ✅ Groups CRUD functional
- ✅ Expenses can be added and split
- ✅ Balances calculate correctly
- ✅ Debt simplification algorithm working
- ✅ Settlements can be recorded
- ✅ Mobile responsive
- ✅ No critical bugs
- ✅ Deployed to production (Vercel)

### User Acceptance Criteria
- User can signup in < 2 minutes
- User can create group and invite friends
- User can add expense and split it
- User can see who owes what
- User can see simplified payment plan
- User can record a settlement
- User can view expense history
- All features work on mobile

### Technical Acceptance Criteria
- All API endpoints return correct data
- RLS prevents unauthorized access
- Database queries use indexes
- No N+1 query problems
- Error handling on all routes
- Loading states on all actions
- 95%+ TypeScript coverage
- Zero ESLint errors

### Post-Launch Metrics (Week 1)
- 10+ beta users signed up
- 5+ active groups created
- 50+ expenses tracked
- < 5 bug reports
- Positive user feedback

---

## 12. Risk Assessment

### High Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS complexity | Security breach | Test thoroughly, peer review |
| Algorithm bugs | Wrong calculations | Unit tests, manual verification |
| Performance issues | Poor UX | Implement pagination, indexes |
| Scope creep | Delayed launch | Strict MVP focus, defer features |

### Medium Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| OAuth setup issues | No social login | Defer to post-launch |
| Supabase downtime | App unavailable | Monitor status, have backup plan |
| Browser compatibility | Some users excluded | Test on major browsers |
| Mobile UX issues | Poor mobile experience | Mobile-first design |

### Low Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Styling inconsistencies | Aesthetic issues | Use shadcn/ui consistently |
| Documentation gaps | Confusion | Comprehensive guides written |
| Deployment issues | Launch delay | Test deployment early |

---

## 13. Acceptance & Sign-off

### Definition of Done
A feature is "Done" when:
- [ ] Code written and working
- [ ] Tests written and passing (where applicable)
- [ ] RLS policies enforced
- [ ] Mobile responsive
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Documentation updated

### MVP Completion Checklist
- [ ] All 10 todos completed
- [ ] All acceptance criteria met
- [ ] Beta testing completed
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Deployed to production

### Stakeholder Approval
- [ ] Technical architecture approved
- [ ] Feature scope agreed
- [ ] Timeline accepted
- [ ] Budget confirmed ($0 for MVP)
- [ ] Launch criteria defined

---

## 14. Appendices

### A. Glossary
- **Ambag**: Filipino word for "contribution" or "share"
- **RLS**: Row Level Security (database-level access control)
- **Tenant**: A group in the multi-tenant system
- **Creditor**: Person who is owed money
- **Debtor**: Person who owes money
- **Settlement**: Payment that resolves a debt

### B. Reference Documents
1. Architecture Plan (c:\Users\Lucas\.cursor\plans\splitwise_clone_architecture_98b956bb.plan.md)
2. Development Roadmap (DEVELOPMENT_ROADMAP.md)
3. Database Guide (supabase/DATABASE_GUIDE.md)
4. Taskboard (TASKBOARD.md)
5. Branding Guide (BRANDING.md)

### C. Competitive Analysis
**Splitwise** (Inspiration)
- Pros: Established, feature-rich, trusted
- Cons: Dated UI, complex for casual users
- Our edge: Modern UI, simpler UX, cultural connection

**Venmo** (Alternative)
- Pros: Popular, social features, payment integration
- Cons: Not designed for group splitting, US-only
- Our edge: Group-first design, international

**Excel/Google Sheets** (Current solution)
- Pros: Flexible, familiar
- Cons: Manual, error-prone, not mobile-friendly
- Our edge: Automatic calculations, always accessible

### D. Future Considerations
- API for third-party integrations
- White-label for corporate use
- Freemium model (premium features)
- Mobile app parity
- Advanced analytics
- Multi-language support

---

**Document Version**: 1.0
**Last Updated**: January 14, 2026
**Status**: Approved for Development
**Next Review**: Post-MVP (Week 5)

---

**Ambag - Everyone pays their ambag 🇵🇭**
