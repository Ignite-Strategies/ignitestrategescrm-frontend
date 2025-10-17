# API Endpoint Naming Convention - The Complete Guide 🎯

## The Problem (We've Seen This 10+ Times!)
**WRONG:** `/api/orgs/{orgId}/events` ❌  
**CORRECT:** `/api/events/{orgId}/events` ✅

## Root Cause Analysis

### 1. **Logical vs Technical Naming**
- **Logical:** "Get events FOR an org" → `/orgs/{orgId}/events`
- **Technical:** "Events resource with orgId param" → `/events/{orgId}/events`

### 2. **REST Convention Confusion**
- **What we expect:** `/orgs/{orgId}/events` (nested resource)
- **What we have:** `/events/{orgId}/events` (flat resource with param)

## Current API Endpoint Map

### ✅ **WORKING ENDPOINTS**
```
GET /api/events/{orgId}/events          - Get events for org
GET /api/events                        - Get all events
POST /api/events                       - Create event
GET /api/events/{eventId}              - Get specific event
```

### ❌ **BROKEN PATTERNS (Don't Use)**
```
GET /api/orgs/{orgId}/events           - DOESN'T EXIST
GET /api/orgs/{orgId}/members          - DOESN'T EXIST  
GET /api/orgs/{orgId}/campaigns        - DOESN'T EXIST
```

### ✅ **ACTUAL ORG ENDPOINTS**
```
GET /api/orgs                          - Get all orgs
GET /api/orgs/{orgId}                  - Get specific org
POST /api/orgs                         - Create org
PATCH /api/orgs/{orgId}                - Update org
```

## The Pattern We Keep Hitting

### **Events**
- ❌ **Wrong:** `/orgs/{orgId}/events`
- ✅ **Right:** `/events/{orgId}/events`

### **Org Members** 
- ❌ **Wrong:** `/orgs/{orgId}/members`
- ✅ **Right:** `/orgmembers?orgId={orgId}`

### **Campaigns**
- ❌ **Wrong:** `/orgs/{orgId}/campaigns`
- ✅ **Right:** `/campaigns?orgId={orgId}`

### **Contact Lists**
- ❌ **Wrong:** `/orgs/{orgId}/lists`
- ✅ **Right:** `/contact-lists?orgId={orgId}`

## Why This Keeps Happening

### 1. **Intuitive vs Actual**
- **Intuitive:** "I want events for this org" → `/orgs/{orgId}/events`
- **Actual:** Events are a top-level resource with orgId filter

### 2. **REST Resource Design**
- **Events:** Top-level resource (`/events`)
- **Org Members:** Top-level resource (`/orgmembers`) 
- **Campaigns:** Top-level resource (`/campaigns`)
- **Contact Lists:** Top-level resource (`/contact-lists`)

### 3. **Query Parameter Pattern**
Most resources use query parameters instead of nested routes:
```
GET /api/events?orgId={orgId}
GET /api/campaigns?orgId={orgId}
GET /api/contact-lists?orgId={orgId}
GET /api/orgmembers?orgId={orgId}
```

## The Fix Pattern

### **When you see this error:**
```
Cannot GET /api/orgs/{orgId}/events
```

### **Check these alternatives:**
1. **Events:** `/api/events/{orgId}/events`
2. **Campaigns:** `/api/campaigns?orgId={orgId}`
3. **Contact Lists:** `/api/contact-lists?orgId={orgId}`
4. **Org Members:** `/api/orgmembers?orgId={orgId}`

## Files That Have Been Fixed

### **Frontend Files Fixed:**
- ✅ `OrgMemberManual.jsx` - Fixed `/orgs/{orgId}/events` → `/events/{orgId}/events`
- ✅ `Dashboard.jsx` - Fixed `/orgs/{orgId}/events` → `/events?orgId={orgId}`
- ✅ Multiple other files with similar patterns

### **Backend Routes That Exist:**
```javascript
// eventsRoute.js
router.get('/:orgId/events', ...)     // /api/events/{orgId}/events

// campaignRoute.js  
router.get('/', ...)                  // /api/campaigns?orgId={orgId}

// contactListsRoute.js
router.get('/', ...)                  // /api/contact-lists?orgId={orgId}

// orgMembersRoute.js
router.get('/', ...)                  // /api/orgmembers?orgId={orgId}
```

## Prevention Strategy

### 1. **Always Check Existing Routes First**
```bash
grep -r "router\.get.*events" routes/
grep -r "router\.get.*campaigns" routes/
grep -r "router\.get.*orgmembers" routes/
```

### 2. **Use the Pattern**
- **Events:** `/events/{orgId}/events` or `/events?orgId={orgId}`
- **Campaigns:** `/campaigns?orgId={orgId}`
- **Contact Lists:** `/contact-lists?orgId={orgId}`
- **Org Members:** `/orgmembers?orgId={orgId}`

### 3. **Test the Endpoint**
```javascript
// Test in browser console
fetch('/api/events/cmgfvz9v10000nt284k875eoc/events')
  .then(r => r.json())
  .then(console.log)
```

## The Real Solution

### **Option 1: Fix the Backend (Recommended)**
Add the intuitive nested routes:
```javascript
// In orgsRoute.js
router.get('/:orgId/events', async (req, res) => {
  const { orgId } = req.params;
  // Forward to events route
  return eventsRouter.handle(req, res);
});
```

### **Option 2: Fix the Frontend (Current)**
Update all frontend calls to use correct endpoints.

### **Option 3: Documentation**
Create this guide and reference it every time.

## Quick Reference Card

| Resource | Wrong Pattern | Correct Pattern |
|----------|---------------|-----------------|
| Events | `/orgs/{orgId}/events` | `/events/{orgId}/events` |
| Campaigns | `/orgs/{orgId}/campaigns` | `/campaigns?orgId={orgId}` |
| Contact Lists | `/orgs/{orgId}/lists` | `/contact-lists?orgId={orgId}` |
| Org Members | `/orgs/{orgId}/members` | `/orgmembers?orgId={orgId}` |

## Lessons Learned

1. **RESTful design is hard**
2. **Intuitive ≠ Technical**
3. **We need better API documentation**
4. **This pattern keeps repeating**
5. **Frontend developers assume nested resources**

---
**Created:** After the 10th occurrence of this error
**Status:** Still happening
**Next Action:** Consider adding nested route aliases in backend

