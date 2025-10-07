# Router & Navigation Logic

## 🎯 Core Principle

**Routing is event-based, not session-based.** We don't track "first time" or login counts.

The only question: **Does the user have an active event?**

---

## 🔀 Complete Routing Flow

### New User Journey
```
/ (Splash - 1s)
  ↓
No Firebase user → /signup
  ↓
Google OAuth → POST /auth/findOrCreate
  ↓
/welcome (Universal Router)
  ↓
No phone? → /profile-setup
  ↓
No orgId? → /org/choose → /org/create
  ↓
No events? → /org/post-create (fork)
  ├─ Create Event
  ├─ Load Contacts
  └─ Explore Dashboard
  ↓
Has events → /dashboard
```

### Returning User Journey
```
/ (Splash - 1s)
  ↓
Has Firebase user → POST /auth/findOrCreate
  ↓
/welcome (Universal Router)
  ↓
Check events:
  • No events? → /org/post-create (EVERY TIME!)
  • Has events? → /dashboard
```

---

## 🧭 The Universal Router (Welcome.jsx)

**Purpose:** Smart routing based on user/org state

**Logic:**
```javascript
1. Load OrgMember
   ↓
2. Check profile complete (has phone?)
   NO → /profile-setup
   ↓
3. Check has org
   NO → /org/choose
   ↓
4. Load org data (events, contacts)
   ↓
5. Check has events
   NO → /org/post-create
   YES → /dashboard
```

**Key Insight:** Welcome ALWAYS checks for events. If none exist, user can't proceed to Dashboard.

---

## 📄 Page Descriptions

### / (Splash.jsx)
- **Duration:** 1000ms
- **Purpose:** Auth check + beautiful entry
- **Routes to:**
  - No Firebase user → `/signup`
  - Has Firebase user → `/welcome`

### /welcome (Welcome.jsx)
- **Purpose:** Universal router & data hydrator
- **Duration:** 1500ms display, then auto-routes
- **Checks:**
  1. Profile complete?
  2. Has org?
  3. Has events?
- **Routes to:** Various pages based on state

### /signup (Signup.jsx)
- **Purpose:** New user Google OAuth
- **Routes to:** `/welcome` (after creating OrgMember)

### /profile-setup (ProfileSetup.jsx)
- **Purpose:** Complete profile (phone required)
- **Routes to:** `/org/choose`

### /org/choose (OrgChoose.jsx)
- **Purpose:** Create or join org
- **Routes to:** `/org/create` or `/org/join`

### /org/create (OrgCreate.jsx)
- **Purpose:** Create organization
- **Routes to:** `/org/success`

### /org/success (OrgSuccess.jsx)
- **Purpose:** Confirmation + celebration
- **Routes to:** `/org/post-create`

### /org/post-create (PostOrgCreate.jsx) 🆕
- **Purpose:** 3-way fork (what to do first?)
- **Options:**
  - Create Event → `/event/create`
  - Load Contacts → `/supporters/upload`
  - Explore → `/dashboard`

### /dashboard (Dashboard.jsx)
- **Purpose:** Main app interface
- **Smart Banners:**
  - No contacts → Upload CSV banner
  - No events → Create Event banner (shouldn't see this if routing works)

---

## 🔒 Protected Routes

All routes except public pages require `firebaseId` in localStorage.

**Public:**
- `/`
- `/signup`
- `/signin`

**Protected:** Everything else (wrapped in `<ProtectedRoute>`)

---

## 🎯 Event-Based Routing (MVP1)

**The Rule:** User needs an active event to use the CRM effectively.

**Enforcement:**
```
Welcome.jsx checks:
  if (events.length === 0) {
    → /org/post-create (fork)
  } else {
    → /dashboard
  }
```

**Impact:**
- User can't skip event creation
- Can't get "stuck" in empty Dashboard
- Clear guidance: "Create an event first"
- Can dismiss and explore, but Welcome will route back

---

## 🧹 Contact Count Logic

**Dashboard Contact Counter:**
```javascript
// Filter out app users (firebaseId exists)
const actualContacts = supporters.filter(s => !s.firebaseId);
setSupporterCount(actualContacts.length);
```

**Why:**
- Owner/managers are app users, not "contacts"
- Contact count = people you manage, not people who manage
- Accurate metric for CRM usage

---

## 📝 Routing Rules

1. **Splash always runs first** - No bypassing auth check
2. **Welcome is the universal router** - Only place that decides routing
3. **No page-level auth checks** - ProtectedRoute wrapper handles it
4. **Event-based not session-based** - Check state, not login count
5. **Profile → Org → Event** - Sequential dependencies
6. **Auto-route when possible** - Minimize manual clicks

---

## 🐛 Common Routing Issues

### "Stuck in redirect loop"
- Check localStorage for stale data
- Clear and restart: `localStorage.clear()`

### "Welcome keeps showing"
- Check if events exist in database
- Verify `/org/post-create` route is registered

### "Dashboard shows despite no events"
- Check Welcome.jsx routing logic
- Verify events API returns correct data

### "Contact count shows owner"
- Check firebaseId filter in Dashboard
- Verify OrgMember has firebaseId set correctly

---

## 🔮 Future Enhancements

### Multi-Event Routing
When single-event constraint is removed:
- Event selector in Dashboard
- "Switch Event" dropdown in nav
- Active event stored in localStorage

### Breadcrumb Navigation
- Show current path
- Quick navigation back
- Progress indicators for multi-step flows

### Deep Linking
- Link directly to event: `/event/:eventId`
- Link to specific form: `/forms/:formId`
- Preserve navigation state

---

## 📍 Quick Reference

**Check if user needs setup:**
```javascript
const needsProfile = !localStorage.getItem('phone');
const needsOrg = !localStorage.getItem('orgId');
const needsEvent = events.length === 0;
```

**Force routing:**
```javascript
// From anywhere, send to fork
navigate('/org/post-create');

// From anywhere, send to dashboard
navigate('/dashboard');
```

**Clear state and restart:**
```javascript
localStorage.clear();
navigate('/');
```

