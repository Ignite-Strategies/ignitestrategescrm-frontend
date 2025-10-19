# EngageSmart Auth Flow Documentation

## 🎯 The Complete User Journey

```
SIGNUP → PROFILE SETUP → ORG CHOOSE/CREATE → FIRST EVENT (optional) → DASHBOARD
```

---

## 1️⃣ SIGNUP (`/signup`)

**What happens:**
- User enters email + password
- Firebase creates auth account
- Backend creates **Admin** record with `firebaseId`
- Admin record initially has:
  - `firebaseId` ✅
  - `email`, `firstName`, `lastName` ❌ (null)
  - `orgId` ❌ (null)
  - `role` = "super_admin"
  - `status` = "active"

**Routing:**
- Success → `/welcome` (universal hydrator)

---

## 2️⃣ WELCOME HYDRATION (`/welcome`)

**What happens:**
- Calls `GET /api/welcome/:firebaseId`
- Backend returns:
  - `admin` object (with personhood fields)
  - `org` object (if they have one)
  - `event` object (if they have one)
- Frontend caches to localStorage:
  - `localStorage.setItem('adminId', adminId)`
  - `localStorage.setItem('admin', JSON.stringify(admin))`
  - `localStorage.setItem('org', JSON.stringify(org))`

**Routing logic:**
1. If no `adminId` → redirect to `/signup` (shouldn't happen)
2. If no `firstName` → redirect to `/profile-setup` ⬅️ **PROFILE SETUP TRIGGER**
3. If no `orgId` → redirect to `/org/choose`
4. If all complete → show welcome screen → click button → `/dashboard`

---

## 3️⃣ PROFILE SETUP (`/profile-setup`)

**Why we're here:**
- Admin record exists but `firstName`, `lastName`, `phone` are null
- Need to collect user's personal info

**What happens:**
- Form collects: `firstName`, `lastName`, `email`, `phone`
- Calls `PATCH /api/admin/:adminId` with these fields
- Updates Admin record with personhood data

**Routing:**
- Success → `/org/choose`

---

## 4️⃣ ORG CHOOSE (`/org/choose`)

**Options:**
1. **Create New Org** → `/org/create`
2. **Join Existing Org** → `/org/join` (enter org code)

---

## 5️⃣ ORG CREATE (`/org/create`)

**What happens:**
- User fills in org name, mission, etc.
- Backend creates Organization
- Updates Admin record with `orgId`
- Caches org to localStorage

**Routing:**
- Success → `/org/success` → `/org/post-create`

---

## 6️⃣ POST ORG CREATE (`/org/post-create`)

**Options:**
1. **Create First Event** → `/event/create`
2. **Skip for Now** → `/dashboard`

---

## 7️⃣ DASHBOARD (`/dashboard`)

**Fully hydrated user:**
- ✅ Admin record with personhood (firstName, lastName, email)
- ✅ Org membership
- ✅ Can now use the platform

---

## 🗺️ Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│ SIGNUP (/signup)                                            │
│ • Creates Firebase auth                                     │
│ • Creates Admin with firebaseId only                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ WELCOME HYDRATION (/welcome)                                │
│ • Calls GET /api/welcome/:firebaseId                        │
│ • Checks what's missing                                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
        ▼                    ▼
   No firstName         Has firstName
        │                    │
        ▼                    ▼
┌─────────────────┐   ┌─────────────┐
│ PROFILE SETUP   │   │ Check orgId │
│ (/profile-setup)│   └──────┬──────┘
│                 │          │
│ Fill in:        │    ┌─────┴─────┐
│ • firstName     │    │           │
│ • lastName      │    ▼           ▼
│ • email         │ No orgId   Has orgId
│ • phone         │    │           │
│                 │    ▼           ▼
│ PATCH /api/     │ ORG CHOOSE  DASHBOARD
│ admin/:adminId  │ (/org/choose)  ✅
└────────┬────────┘    │
         │             │
         └─────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ ORG CREATE or  │
         │ ORG JOIN       │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ ORG SUCCESS    │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │ POST ORG CREATE│
         │ (optional)      │
         │ • Create Event │
         │ • Skip         │
         └────────┬───────┘
                  │
                  ▼
         ┌────────────────┐
         │   DASHBOARD    │
         │       ✅       │
         └────────────────┘
```

---

## 🔑 Key localStorage Values

After complete hydration:
- `firebaseId` - Firebase auth ID
- `adminId` - Admin record ID
- `orgId` - Organization ID
- `admin` - Full admin object (JSON)
- `org` - Full org object (JSON)
- `email` - User's email

---

## 🎨 Branding Notes

### Current State (MVP):
- Logo: **F3 logo** (hardcoded for F3 container)
- Name: **EngageSmart** (platform name)
- Tagline: "The smart engaging"

### Future State:
- **Logo Upload per Org/Container**
  - Each container can upload custom logo
  - Stored in Container model
  - Displayed in Navigation based on active container
  - Falls back to EngageSmart logo if none

---

## 🐛 Common Issues

### "Admin not found"
- Check if Admin record was created during signup
- Verify `firebaseId` matches between Firebase and database

### "Profile setup not showing"
- Check if Admin has `firstName` field populated
- Welcome.jsx checks for `admin.firstName` to determine routing

### "Stuck in loop"
- Clear localStorage and start fresh signup
- Check that each step is setting the required fields

---

## 📝 Notes

- **ProfileSetup** was originally for deprecated `OrgMember` model
- Now refactored to update `Admin` table directly
- Universal personhood fields on Admin: `email`, `firstName`, `lastName`, `phone`, `photoURL`
- Container ID will be added for multi-container support

