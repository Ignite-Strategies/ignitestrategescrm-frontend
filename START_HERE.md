# 🚀 High Impact Events - Start Here

## ✅ What's Complete

### Authentication & User Management
- ✅ Firebase authentication (Google OAuth)
- ✅ User signup/signin flow
- ✅ OrgMember creation and profile setup
- ✅ Organization creation and linking
- ✅ Proper role assignment (owner)
- ✅ Data persisting in PostgreSQL via Prisma

### Current User Flow
```
/ (Splash - 1.2s)
  → Firebase auth check
  → POST /auth/findOrCreate
  ↓
/welcome (Universal Hydrator - 1.8s)
  → Checks profile/org status
  → Routes appropriately
  ↓
New Users: /profile-setup → /org/choose → /org/create → /dashboard
Returning Users: /dashboard (if complete)
```

### Database Models (Prisma)
- **Organization** - Orgs with mission, address, socials
- **OrgMember** - People (contacts + users with firebaseId/role)
- **Event** - Events with embedded location fields
- **EventAttendee** - Event participation records
- **Task** - Event tasks
- **Supporter** - Legacy contact model (being phased out)

### Tech Stack
- **Frontend:** React + Vite + Tailwind (Vercel)
- **Backend:** Express + Prisma + PostgreSQL (Render)
- **Auth:** Firebase Authentication
- **Email:** SendGrid (planned)

---

## 🎯 Next Phase: Core Features

### 1. Contact Management
**Goal:** Load and manage contacts (OrgMembers)

**Tasks:**
- [ ] CSV upload for bulk contact import
- [ ] Contact list display with filtering
- [ ] Individual contact detail pages
- [ ] Tag system (Board, Committee, VIP, Donor, Volunteer)
- [ ] Link contacts to events as EventAttendees

**Key Routes:**
- `GET /api/orgs/:orgId/org-members` - List all contacts
- `POST /api/orgs/:orgId/org-members/upload` - CSV bulk import
- `GET /api/org-members/:id` - Individual contact
- `PATCH /api/org-members/:id` - Update contact

---

### 2. Soft Commit Form (Priority!)
**Goal:** Wire up the HTML landing page soft commit form

**Current State:**
- HTML form exists on landing page
- Needs backend integration
- Should create EventAttendee with stage="soft_commit"

**Tasks:**
- [ ] Review HTML form on landing page
- [ ] Create backend endpoint: `POST /api/events/:eventId/soft-commit`
- [ ] Add EventAttendee model fields if needed
- [ ] Wire form to backend
- [ ] Test submission flow
- [ ] Add confirmation page/email

**Data Flow:**
```
Landing Page Form
  → POST /api/events/:eventId/soft-commit
  → Create/Update EventAttendee { stage: "soft_commit" }
  → Send confirmation email (SendGrid)
  → Redirect to thank you page
```

---

## 📁 File Structure

### Frontend (`ignitestrategescrm-frontend/`)
```
src/
  pages/
    Splash.jsx          - Home page with auth check
    Signup.jsx          - New user signup
    Signin.jsx          - Returning user signin  
    Welcome.jsx         - Universal hydrator & router
    ProfileSetup.jsx    - Complete user profile
    OrgChoose.jsx       - Create or join org
    OrgCreate.jsx       - Create organization
    OrgJoin.jsx         - Join via email invite
    Dashboard.jsx       - Main app
    Events.jsx          - Event list
    EventCreate.jsx     - Create event
    Supporters.jsx      - Contact management
    
  lib/
    api.js              - Axios instance with logging
    googleAuth.js       - Firebase auth helpers
    
  firebase.js           - Firebase config
```

### Backend (`eventscrm-backend/`)
```
routes/
  authRoute.js          - Firebase auth (findOrCreate)
  orgMembersRoute.js    - OrgMember CRUD
  orgsRoute.js          - Organization CRUD
  eventsRoute.js        - Event CRUD
  supportersRoute.js    - Legacy contact routes
  
config/
  database.js           - Prisma client
  firebase.js           - Firebase Admin SDK
  
middleware/
  authMiddleware.js     - Token verification
  
prisma/
  schema.prisma         - Database schema
```

---

## 🔑 Key Concepts

### OrgMember = Universal Contact + User
```javascript
OrgMember {
  id: "cmgfv1cnq..."
  firebaseId: "FZPsy..."  // If they can login
  role: "owner"|"manager"|null
  orgId: "cmgfvz9v1..."
  email, firstName, lastName, phone
  // Plus all contact fields (address, employer, etc.)
}
```

### Roles
- `owner` - Created the org, full admin access
- `manager` - Invited team member, can manage
- `null` - Just a contact (no login access)

### EventAttendee vs OrgMember
- **OrgMember** = Master contact list (people in your org)
- **EventAttendee** = Event-specific participation record
  - Links OrgMember to Event
  - Tracks pipeline stage (soft_commit, paid, etc.)
  - Event-specific data (ticket type, dietary needs)

---

## 🐉 Dragon to Slay

### Priority 1: Soft Commit Form
**Why:** Active HTML form needs to work NOW
**Where:** Landing page (need to locate the HTML file)
**What:** Wire to backend, create EventAttendee records

### Priority 2: Contact Upload
**Why:** Need to get contact lists into the system
**What:** CSV upload → Parse → Validate → Create OrgMembers

---

## 🔧 Quick Reference

### Environment Variables
**Frontend (.env):**
- Firebase config is in `src/firebase.js` (hardcoded - it's public)

**Backend (Render):**
- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase Admin SDK key (JSON string)

### Common Commands
```bash
# Frontend
npm run dev          # Local development
npm run build        # Build for production
git push origin main # Deploy to Vercel

# Backend
npm run dev          # Local development with nodemon
npm run start        # Production start
npx prisma studio    # Visual database browser
npx prisma db push   # Push schema changes
git push origin main # Deploy to Render
```

### Database Access
- **Tool:** pgAdmin or Render PostgreSQL console
- **Remember:** Table/column names are case-sensitive!
  - Use quotes: `"OrgMember"`, `"firebaseId"`

---

## 🎯 Ready to Build!

You now have:
1. ✅ Stable auth system
2. ✅ User profiles in database
3. ✅ Organization setup
4. ✅ Clean codebase with proper architecture

**Next session focus:**
1. Wire up soft commit form
2. Build contact upload system
3. Complete event management features

**NO MORE DEBUGGING AUTH!** Time to build the actual product! 🚀💪

