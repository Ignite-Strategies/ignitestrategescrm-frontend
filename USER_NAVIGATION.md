# User Navigation Flow

## Complete Auth & Onboarding Flow

### New User Journey
```
1. / (Splash)
   - 2s party animation (🎉✨🎊)
   - Checks Firebase auth in background
   - If no Firebase user → /signup

2. /signup
   - Google OAuth sign-in
   - POST /auth/findOrCreate (creates OrgMember with firebaseId)
   - Saves: firebaseId, orgMemberId, email to localStorage
   - → /profile-setup

3. /profile-setup
   - Shows: Name (editable), Email (display), Phone (required)
   - PATCH /org-members/:id (updates phone)
   - → /org/choose

4. /org/choose
   - Two options: Create Organization | Join Organization
   - → /org/create or /org/join

5. /org/create
   - Full org form (name, mission, address, socials)
   - POST /orgs (creates Organization)
   - PATCH /org-members/:id (links orgId + sets role="owner")
   - → /dashboard
```

### Returning User Journey
```
1. / (Splash)
   - 2s party animation
   - Checks Firebase auth
   - If Firebase user exists:
     - POST /auth/findOrCreate (finds existing OrgMember)
     - Saves: firebaseId, orgMemberId, email to localStorage
     - 2.2s additional delay for smooth transition
     - → /welcome

2. /welcome (Universal Hydrator)
   - GET /org-members/:orgMemberId
   - Routes based on completion:
     - No phone? → /profile-setup
     - No orgId? → /org/choose
     - Has everything? → Load org data → /dashboard

3. /dashboard
   - Main app interface
```

## Key Pages

### `/` - Splash (Home Page)
- **Purpose:** Auth check + beautiful entry animation
- **Duration:** 2s animation + 2.2s after auth check = ~4.2s total for returning users
- **Logic:**
  - Check Firebase auth state
  - If authenticated: findOrCreate OrgMember → /welcome
  - If not: → /signup

### `/welcome` - Universal Hydrator & Router
- **Purpose:** Load user data and route to correct page
- **Logic:**
  1. Get orgMemberId from localStorage
  2. Fetch full OrgMember from backend
  3. Check completion status:
     - Missing phone? → /profile-setup
     - Missing orgId? → /org/choose
     - Complete? Load org → /dashboard

### `/signup` - New User Sign Up
- Google OAuth only
- Creates OrgMember in database
- Goes directly to profile setup (no bouncing)

### `/signin` - Returning User Sign In
- Google OAuth
- Finds existing OrgMember
- Goes to /welcome for routing

### `/profile-setup` - Complete Profile
- Editable: First Name, Last Name, Phone
- Read-only: Email (from Google)
- Required for org creation

### `/org/choose` - Create or Join Org
- Two big buttons
- User must have completed profile first

### `/org/create` - Create Organization
- Full organization form
- Links OrgMember to Org
- Sets role="owner"

### `/dashboard` - Main App
- Protected route
- Requires: firebaseId + orgMemberId + orgId

## LocalStorage Keys

```javascript
firebaseId    // Firebase UID (from Google auth)
orgMemberId   // Database OrgMember.id
email         // User email
orgId         // Linked Organization.id (null until org created)
orgName       // Organization name (for display)
```

## Backend API Endpoints Used

### Auth Flow
- `POST /api/auth/findOrCreate` - Find existing or create new OrgMember by firebaseId
- `GET /api/org-members/:id` - Get OrgMember details
- `PATCH /api/org-members/:id` - Update OrgMember (phone, orgId, role)

### Org Management
- `POST /api/orgs` - Create new Organization
- `GET /api/orgs/:id` - Get Organization details

## Critical Rules

1. **New users ALWAYS go:** Signup → Profile → Org Choose → Org Create → Dashboard
2. **Returning users ALWAYS go:** Splash → Welcome (router) → Appropriate page
3. **No bouncing!** Each page transition should be intentional and smooth
4. **Welcome is the ONLY hydrator** - don't hydrate data on other pages
5. **Splash handles auth check** - don't check Firebase auth on every page
6. **Profile must be complete before org creation**
7. **OrgMember exists before Organization** - users create their profile first

## Timing

- Splash animation: 2000ms (2s)
- Post-auth delay: 2200ms (2.2s)
- Total returning user: ~4.2s from splash to Welcome
- No additional delays after Welcome - instant routing based on data

