# Authentication Architecture

## 🔐 Current Setup (October 14, 2025)

### Two Auth Systems Working Together

**1. Firebase Auth** = User Login & Profile
- Sign in/sign up with Google
- User profile management
- Session handling
- `googleId` stored in localStorage

**2. Google OAuth (Gmail API)** = Email Sending
- Direct Google OAuth for Gmail API access
- Access token stored in `localStorage` as `gmailAccessToken`
- Used for bulk email sending via Gmail API
- Separate from Firebase auth!

---

## 📁 Files

### `src/firebase.js`
Firebase initialization and basic auth.
- Handles user sign-in/sign-up
- Manages user sessions
- Provides `auth` object for protected routes

### `src/lib/googleAuth.js` (CONSOLIDATED)
**NEW as of Oct 14, 2025** - Centralized Google OAuth for Gmail API.

**Functions:**
- `signInWithGoogle()` - Triggers Google OAuth with Gmail scope
- `signOutUser()` - Signs out and clears tokens
- `isSignedIn()` - Checks if user has valid Gmail token
- `getGmailAccessToken()` - Returns current Gmail access token

**Key Implementation:**
```javascript
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential.accessToken;
  
  localStorage.setItem('gmailAccessToken', accessToken);
  return accessToken;
};
```

**Note:** This is DIFFERENT from Firebase's built-in Google auth. We use Firebase for user authentication, but direct Google OAuth for Gmail API access tokens.

---

## 🎯 Why Two Auth Systems?

### The Confusion (What We Had)
- Firebase Google Sign-In returns a **Firebase ID token**
- Gmail API needs a **Google OAuth access token**
- These are NOT the same thing!

### The Solution (What We Built)
1. **Firebase Auth** for user login → stores `googleId` in localStorage
2. **Google OAuth (via Firebase)** for Gmail API → stores `gmailAccessToken` in localStorage
3. Same Google account, two different tokens, two different purposes

---

## 🔄 Auth Flows

### User Login Flow
```
Splash (/) 
  → Checks Firebase auth (googleId in localStorage)
  → If authenticated: /auth/check
  → If not: /signup

Signup (/signup)
  → Firebase Google sign-in
  → Store googleId in localStorage
  → Create OrgMember in backend
  → /profile-setup

ProfileSetup (/profile-setup)
  → Enter name/phone
  → Update OrgMember
  → /org/choose

OrgChoose (/org/choose)
  → Create or Join Org
  → /org/create or /org/join

OrgCreate (/org/create)
  → Create Organization
  → Link OrgMember (role=owner)
  → /dashboard

Dashboard (/dashboard)
  → Authenticated app
```

### Gmail OAuth Flow (NEW)
```
SequenceCreator or CampaignHome
  ↓ Check for gmailAccessToken in localStorage
  ↓ If missing, show "Connect Gmail" button
  ↓ User clicks
signInWithGoogle() from lib/googleAuth.js
  ↓ Google OAuth popup with gmail.send scope
  ↓ User approves
  ↓ Store gmailAccessToken in localStorage
Ready to send emails via Gmail API!
```

---

## 🔒 Protected Routes

### App-Level Protection
Check for `googleId` in localStorage (from Firebase auth).
If missing, redirect to `/signup`.

**Used by:** All authenticated pages (Dashboard, Campaigns, Contacts, etc.)

### Gmail-Level Protection
Check for `gmailAccessToken` in localStorage (from Google OAuth).
If missing, show "Connect Gmail" button.

**Used by:** SequenceCreator, SendEmail, any page that sends via Gmail API

---

## 🔧 Backend Middleware

### `authMiddleware.js`
Validates Firebase ID token from frontend.
Used on most API routes.

**NOT used for Gmail API routes** (those use Gmail token directly).

### `verifyGmailToken.js`
Validates Gmail access token from frontend.
Used on Gmail API routes: `/api/email/personal/send-bulk`

**Note:** Despite the name, this is NOT verifying Firebase tokens. It's checking the Google OAuth access token.

---

## 🎨 UI Components

### Gmail Connect Button (ContactManageHome, CampaignHome)
```javascript
import { signInWithGoogle, isSignedIn } from '../lib/googleAuth';

const [gmailConnected, setGmailConnected] = useState(false);

useEffect(() => {
  setGmailConnected(isSignedIn());
}, []);

const handleGmailConnect = async () => {
  try {
    await signInWithGoogle();
    setGmailConnected(true);
    alert('✅ Gmail connected!');
  } catch (error) {
    alert('❌ Gmail connection failed');
  }
};

return (
  <div>
    {gmailConnected ? (
      <div>✅ Gmail Connected</div>
    ) : (
      <button onClick={handleGmailConnect}>
        Connect Gmail
      </button>
    )}
  </div>
);
```

---

## 🐛 Common Issues & Fixes

### Issue: "Gmail API returns 401 Unauthorized"
**Cause:** Access token expired (tokens expire after 1 hour)

**Fix:** Re-authenticate by calling `signInWithGoogle()` again

**Future Fix:** Implement refresh token logic

---

### Issue: "Firebase auth works but Gmail sending fails"
**Cause:** User has Firebase auth but no Gmail access token

**Fix:** Show "Connect Gmail" button and call `signInWithGoogle()`

---

### Issue: "Multiple auth.js files causing confusion"
**Cause:** Previous code had `src/lib/auth.js` AND `src/lib/googleAuth.js`

**Fix:** ✅ CONSOLIDATED into single `src/lib/googleAuth.js` (Oct 14, 2025)

---

## 🔜 Future Enhancements

### 1. Token Refresh
- Google OAuth tokens expire after 1 hour
- Need to implement refresh token logic
- Store refresh token securely
- Auto-refresh before expiry

### 2. Better Error Handling
- Detect token expiry
- Auto-trigger re-auth flow
- Show clear "Reconnect Gmail" message

### 3. Scope Management
- Currently requesting `gmail.send` only
- Future: Add `gmail.readonly` for reply tracking
- Future: Add `gmail.modify` for labeling sent emails

### 4. Multi-Account Support
- Allow sending from different Gmail accounts
- Store multiple access tokens
- UI to switch between accounts

---

## 📚 Related Documentation

- `SEQUENCE.md` - How Gmail auth is used in sequences
- `WHERE_WE_ARE_NOW.md` - Current project status
- `EMAIL_CAMPAIGNS.md` - Campaign system overview

---

**Last Updated:** October 14, 2025  
**Status:** ✅ Auth consolidated, Gmail OAuth working (pending backend deployment)  
**Next:** Token refresh logic

---

*"Two tokens, two purposes, one confused developer at 2am"* - The Auth Journey

