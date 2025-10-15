# 🔥 Hydration Standardization - October 13, 2025

## The RULE: Always Hydrate on Landing Pages

**ALL landing/dashboard pages MUST hydrate their data to localStorage** to ensure child pages have consistent, fresh data regardless of entry point.

## Landing Pages & Their Hydration

### 1. EventDashboard (`/events/:eventId`)
**Entry Point:** Main Dashboard → Events card
**Hydrates:**
- All event attendees → `localStorage: event_{eventId}_attendees`
- Pipeline configs → `localStorage: pipelineConfigs`

**Child Pages:**
- EventPipelines
- EventAttendeeList
- EventEngagementAdvisory

**Status:** ✅ Already implemented

---

### 2. OrgDashboard (`/org-dashboard`)
**Entry Point:** Main Dashboard → Org Members card
**Hydrates:**
- All org members → `localStorage: org_{orgId}_members`

**Features:**
- Edit org name, mission, description
- View member stats (total, active, inactive, engagement)
- Member management (view, upload, add)
- Communications (send newsletter, announcements)

**Child Pages:**
- OrgMembers
- OrgMembersCSVUpload
- OrgMemberManual

**Status:** ✅ Just created (Oct 13, 2025)

---

### 3. ContactManageHome (`/contactmanage`)
**Entry Point:** Main Dashboard → Contact Management card
**Hydrates:**
- Org members for stats → Currently loads but doesn't cache
- Contact lists → Currently loads but doesn't cache

**Features:**
- View total contacts, org members stats
- Navigate to contact selector
- Upload contacts
- View/create contact lists

**Child Pages:**
- ContactManageSelector
- EventAttendeeList (via selector)
- OrgMembers (via selector)
- ContactLists

**Status:** ⚠️ Needs hydration implementation

---

### 4. EventAttendeeList (`/events/:eventId/attendees`)
**Entry Point:** 
- EventDashboard (via View Attendees)
- ContactManageSelector (via Specific Event)

**Hydration Strategy:**
- Checks localStorage for `event_{eventId}_attendees`
- **Validates** cached data has `orgMemberId` field
- Falls back to API if cache is stale/incomplete
- **Clears cache** after delete or elevate operations

**Features:**
- View all event attendees
- Phone formatting (555-555-5555)
- "RSVPed" capitalization
- Delete contact entirely
- Remove from event
- Elevate to Org Member (only if not already)
- View form responses

**Status:** ✅ Fixed localStorage validation & cache invalidation (Oct 13, 2025)

---

## Cache Validation Pattern

All pages loading from localStorage should validate data quality:

```javascript
// Check if cached data has required fields
const cachedData = localStorage.getItem('key');
if (cachedData) {
  const parsed = JSON.parse(cachedData);
  
  // Validate data structure
  const isValid = parsed.length > 0 && parsed[0].hasOwnProperty('requiredField');
  
  if (isValid) {
    // Use cached data
    setData(parsed);
  } else {
    // Reload from API
    console.log('⚠️ Cached data incomplete, reloading...');
    loadFromAPI();
  }
}
```

---

## Cache Invalidation Pattern

After mutations (create, update, delete), clear relevant caches:

```javascript
// After delete
localStorage.removeItem(`event_${eventId}_attendees`);
await loadData(); // Reload fresh data

// After elevate
localStorage.removeItem(`event_${eventId}_attendees`);
localStorage.removeItem(`org_${orgId}_members`);
await loadData();
```

---

## Navigation Flows

### To OrgMembers Page:
1. **Main Dashboard** → **OrgDashboard** → **OrgMembers** (hydrates on OrgDashboard)
2. **ContactManageHome** → **ContactManageSelector** → **OrgMembers** (needs hydration)

### To EventAttendeeList Page:
1. **EventDashboard** → **EventAttendeeList** (hydrates on EventDashboard)
2. **ContactManageHome** → **ContactManageSelector** → **EventAttendeeList** (validates cache)

---

## Benefits

✅ **Faster load times** - Data loads from localStorage first
✅ **Consistent data** - All entry points use same hydration
✅ **Better UX** - No flicker/loading on navigation
✅ **Offline-ready** - Works with cached data
✅ **Self-healing** - Validates and reloads if stale

---

## Next Steps

1. ⚠️ **Implement hydration in ContactManageHome**
2. ✅ Add validation to all pages loading from cache
3. ✅ Clear caches after mutations
4. 📝 Document all localStorage keys in use

---

## localStorage Keys Reference

| Key | Data | Hydrated By | Used By |
|-----|------|-------------|---------|
| `adminId` | String | Welcome | All pages |
| `orgId` | String | Welcome | All pages |
| `eventId` | String | Welcome | Event pages |
| `admin` | Admin Object | Welcome | All pages |
| `org` | Organization Object | Welcome | All pages |
| `event` | Event Object | Welcome | Event pages, OrgMembersUploadPreview |
| `event_{eventId}_attendees` | EventAttendee[] | EventDashboard, EventAttendeeList | EventAttendeeList, EventPipelines |
| `org_{orgId}_members` | OrgMember[] | OrgDashboard, Dashboard | OrgMembers |
| `pipelineConfigs` | PipelineConfig[] | EventDashboard | EventPipelines |

---

## 🔥 NEW PATTERN (Oct 15, 2025)

### Welcome = Universal Hydrator

Welcome.jsx now caches FULL objects, not just IDs:
- `localStorage.admin` - Full admin object (id, name, email, firebaseId)
- `localStorage.org` - Full org object (id, name, slug, mission, website)
- `localStorage.event` - Full event object (id, name, slug, date, time, description)

**Plus** backward-compatible IDs:
- `localStorage.adminId`
- `localStorage.orgId`
- `localStorage.eventId`

**Child pages should:**
1. Check cache first (`localStorage.event`)
2. Fall back to API if cache miss
3. Parse JSON carefully with try/catch

---

**Last Updated:** October 15, 2025
**Status:** ✅ Welcome hydration upgraded to full objects!


