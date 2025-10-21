# 🧭 OAuth Architecture (EngageSmart)

## 🔥 **SACRED GROUND - DO NOT TOUCH**

### **`firebase.js`** ✅ **USER AUTHENTICATION ONLY**
- **Purpose:** User login/signup/session management
- **Scope:** Basic Google auth (NO Gmail API scope)
- **Functions:**
  - `signInWithGoogle()` - User login
  - `signOutUser()` - User logout
  - `getCurrentUser()` - Get current user
- **Used for:** Splash screen, user authentication, staying logged in
- **STATUS:** ✅ WORKING - DO NOT MODIFY

---

## 🆕 **NEW UNIFIED SYSTEM**

### **`unifiedGoogleOAuthRoute.js`** (Backend)
- **Purpose:** Gmail, YouTube, Google Ads API access
- **Scope:** Service-specific scopes (Gmail send, YouTube upload, etc.)
- **Functions:**
  - `GET /api/google-oauth/auth?service=gmail` - Initiate OAuth
  - `POST /api/google-oauth/callback` - Handle callback
  - `GET /api/google-oauth/status?service=gmail` - Check status
- **STATUS:** ✅ NEW - Replaces old Gmail OAuth

### **`UnifiedGoogleOAuthCallback.jsx`** (Frontend)
- **Purpose:** Handle OAuth callbacks for all Google services
- **Route:** `/oauth/callback`
- **STATUS:** ✅ NEW - Single callback for all services

---

## 🗑️ **DELETED**

### **`googleAuth.js`** ❌ **REMOVED**
- **Was:** Problematic Firebase Gmail OAuth
- **Problem:** No refresh tokens (1-hour expiry)
- **Replacement:** Unified OAuth system
- **STATUS:** ✅ DELETED

---

## 🔧 **WHAT I UPDATED**

### **Import Changes (Safe)**
- Changed imports from `../lib/googleAuth` to `../firebase`
- This just fixes broken imports after deleting `googleAuth.js`
- **Firebase functions remain unchanged!**

### **Files Updated:**
- ✅ `CampaignHome.jsx` - Fixed imports
- ✅ `CampaignPreview.jsx` - Fixed imports  
- ✅ `CampaignCreator.jsx` - Fixed imports
- ✅ `ContactManageHome.jsx` - Fixed imports
- ✅ `TestAuth.jsx` - Fixed imports

---

## 🎯 **CURRENT STATE**

1. **Firebase** = User login/signup (SACRED - UNTOUCHED)
2. **Unified OAuth** = Gmail/YouTube/Ads API access (NEW)
3. **Old Gmail OAuth** = Deleted (was broken)

**Firebase is still doing exactly what it was doing before!** 🔥
