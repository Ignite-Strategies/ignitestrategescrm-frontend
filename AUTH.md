# Authentication Architecture

## Current Setup

**Firebase Auth** = User authentication
- Sign in/sign up with Google
- User profile management
- Session handling

**SendGrid** = Email sending
- Campaign emails
- Transactional emails
- No Gmail API needed

## Files

### `src/firebase.js`
Main auth file - Firebase initialization and auth export.

### `src/lib/googleAuth.js` (DEPRECATED)
Old Gmail API OAuth implementation.
Kept for backward compatibility with existing pages.
Will be removed once all pages migrate to Firebase auth.

## Auth Flow

```
Splash (/) 
  → Checks Firebase auth
  → If authenticated: /auth/check
  → If not: /signup

Signup (/signup)
  → Firebase Google sign-in
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

## Protected Routes

Check for `googleId` in localStorage (from Firebase auth).
If missing, redirect to `/signup`.

