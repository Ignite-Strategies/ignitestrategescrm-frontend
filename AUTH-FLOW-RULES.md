# Firebase Auth Flow - User Journey Rules

## CRITICAL AUTH FLOW RULES

### 1. **Firebase ID but no orgId/containerId** 
→ Send to "why you here" UX flow (OrgChoose page)

### 2. **Firebase ID + profile creation** 
→ Send to forker page (OrgChoose)

### 3. **Complete profile** 
→ Send to Dashboard

## The Correct Auth Flow

```
Firebase Auth → Check if user has orgId/containerId
├── If missing → OrgChoose page (NOT Welcome page)
└── If present → Dashboard
```

## Key Points

- **Welcome page** should only be for users who already have complete profiles
- **New users** or **incomplete profiles** should go to **OrgChoose** first
- **OrgChoose** is the "forker page" for profile creation
- **Dashboard** is the final destination for complete profiles

## Current Issues

- Welcome page is trying to handle incomplete profiles
- Should redirect incomplete profiles to OrgChoose
- Auth flow is currently jacked because of this confusion

## Fix Needed

1. Update Welcome page to redirect incomplete profiles to OrgChoose
2. Ensure OrgChoose handles the "why you here" UX flow
3. Only complete profiles should see Welcome → Dashboard flow
