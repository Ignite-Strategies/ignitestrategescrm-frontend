# Contact Upload Architecture

## Overview

The system supports multiple contact upload flows with proper tracking and event assignment.

---

## Upload Types

### 1. Org Members Upload (`uploadType: 'orgMember'`)

**Purpose:** Import your core team (staff, board, volunteers, core members)

**Route:** `/org-members/upload`

**Data Created:**
- ✅ Contact (universal personhood)
- ✅ OrgMember (relationship to this org)
- ✅ EventAttendee (optional, if event selected)

**Fields Supported:**
- Contact: firstName, lastName, goesBy, email, phone, street, city, state, zip, employer
- OrgMember: yearsWithOrganization, leadershipRole, originStory, notes, tags
- EventAttendee: audienceType, currentStage (if event assignment enabled)

**Flow:**
```
Upload CSV → Preview & Map Fields → Optional Event Assignment → Import → Success
```

---

### 2. Event Contact Upload (`uploadType: 'eventAttendee'`)

**Purpose:** Import contacts for a specific event (prospects, invites, RSVPs)

**Route:** `/contacts/event/upload`

**Data Created:**
- ✅ Contact (universal personhood)
- ✅ EventAttendee (relationship to event)
- ❌ OrgMember (NOT created - these are external contacts)

**Fields Supported:**
- Contact: firstName, lastName, email, phone
- EventAttendee: audienceType, currentStage, attended, ticketType, amountPaid

---

## Universal Upload Endpoint

**Route:** `POST /api/contacts/upload/save`

**Backend File:** `eventscrm-backend/routes/universalContactUploadRoute.js`

**Request:**
```javascript
FormData {
  file: CSV blob,
  uploadType: 'orgMember' | 'eventAttendee',
  orgId: 'org_123',
  eventId: 'event_456' (optional),
  assignments: JSON.stringify({
    audienceType: 'org_members',
    defaultStage: 'in_funnel'
  })
}
```

**Response:**
```javascript
{
  success: true,
  uploadType: 'orgMember',
  contacts: 2,              // Total contacts processed
  contactsCreated: 1,       // NEW contacts
  contactsUpdated: 1,       // UPDATED contacts
  orgMembers: 2,            // Total org members
  orgMembersCreated: 2,     // NEW org members
  orgMembersUpdated: 0,     // UPDATED org members
  eventAttendees: 2,        // Total event attendees (if assigned)
  totalProcessed: 2,        // Total CSV rows
  validCount: 2,            // Valid rows
  errorCount: 0,            // Error rows
  errors: []                // Error details
}
```

---

## New vs Updated Tracking

### The Problem

Prisma's `upsert` doesn't tell you what it did:
```javascript
const result = await prisma.contact.upsert({...});
// Did it create or update? 🤷‍♂️
```

### The Solution

Check BEFORE upsert:
```javascript
// 1. Check if exists
const existingContact = await prisma.contact.findUnique({
  where: { email: contactData.email }
});

// 2. Do the upsert
const contact = await prisma.contact.upsert({...});

// 3. Track what happened
if (existingContact) {
  contactsUpdated++;  // It was an update!
} else {
  contactsCreated++;  // It was a create!
}
```

**Result:** Success page can show "1 new · 1 updated contacts" ✅

---

## Event Assignment During Upload

### How It Works

**Optional Feature:** While uploading org members, assign them to an event

**UI Elements:**
- ✅ Checkbox: "Add these contacts to an event"
- ✅ Dropdown: Select event (shows event name from cache)
- ✅ Dropdown: Select audience type (org_members, friends_family, etc.)
- ✅ Dropdown: Select pipeline stage (filtered to audience-specific stages)

**Backend Handling:**
```javascript
// If assignments provided
if (parsedAssignments.audienceType && eventId) {
  await prisma.eventAttendee.upsert({
    where: {
      eventId_contactId_audienceType: {
        eventId: eventId,
        contactId: contact.id,
        audienceType: parsedAssignments.audienceType
      }
    },
    create: {
      eventId: eventId,
      contactId: contact.id,
      orgId: orgId,
      audienceType: parsedAssignments.audienceType,
      currentStage: parsedAssignments.defaultStage
    }
  });
}
```

**Success Page Shows:**
```
🎯 2 contacts were added to Bros & Brews as Org Members in In Funnel stage
```

---

## Navigation Pattern (The Nuclear Option)

### Why We Changed It

**BEFORE (Broken):**
```
Preview Page:
  ↓
  Upload to backend (async)
  ↓
  Wait for response
  ↓
  Navigate to success ← Race condition! Redirect hell!
```

**AFTER (Nuclear Option):**
```
Preview Page:
  ↓
  Navigate IMMEDIATELY to success (instant!)
  ↓
Success Page:
  ↓
  Upload to backend
  ↓
  Show results
```

### Implementation

**Preview Page:**
```javascript
const handleUpload = () => {
  // No async! Just navigate!
  const uploadData = {
    file: file,
    orgId: orgId,
    uploadType: 'orgMember',
    eventAssignment: {...}
  };
  
  navigate('/org-members/upload/success', { 
    state: { uploadData } 
  });
};
```

**Success Page:**
```javascript
useEffect(() => {
  const uploadData = location.state?.uploadData;
  if (uploadData) {
    performUpload(uploadData);  // Upload happens HERE
  }
}, [location]);
```

**Benefits:**
- ✅ No race conditions
- ✅ No redirect loops
- ✅ User sees loading state on success page
- ✅ Results display when ready

---

## Pipeline Stage Configuration

### Audience-Specific Stages

**Org Members & Friends/Family:**
```javascript
[
  'in_funnel',
  'general_awareness',
  'personal_invite',
  'expressed_interest',
  'rsvped',
  'thanked',          // Follow-up after RSVP
  'paid',
  'thanked_paid',     // Follow-up after payment
  'attended',
  'followed_up'       // Follow-up after attendance
]
```

**Community Partners:**
```javascript
[
  'interested',
  'contacted',        // Follow-up after interest
  'partner',
  'thanked',          // Follow-up after partnership
  'recognized'        // Public recognition/social media
]
```

**Business Sponsors:**
```javascript
[
  'interested',
  'contacted',        // Follow-up after interest
  'sponsor',
  'thanked',          // Follow-up after sponsorship
  'recognized'        // Public recognition/social media
]
```

**Champions:**
```javascript
[
  'aware',
  'contacted',        // Follow-up after awareness
  'committed',
  'thanked',          // Follow-up after commitment
  'executing',
  'recognized'        // Follow-up after execution
]
```

### Configuration Files

**Backend:** `eventscrm-backend/config/pipelineConfig.js`
- Exports: `OFFICIAL_AUDIENCES`, `AUDIENCE_STAGES`, `ALL_STAGES`
- Helper functions: `getStagesForAudience()`, `isValidStageForAudience()`

**Frontend:** `ignitestrategescrm-frontend/src/config/pipelineConfig.js`
- Exports: `OFFICIAL_AUDIENCES`, `AUDIENCE_STAGES`
- Display names: `AUDIENCE_DISPLAY_NAMES`, `STAGE_DISPLAY_NAMES`
- Helper: `getStagesForAudience()`

**Rule:** Backend and frontend configs MUST stay in sync!

---

## Hydration Strategy

### Welcome Hydration (Universal)

**Endpoint:** `GET /api/welcome/:firebaseId`

**Returns:**
```javascript
{
  // IDs (backward compatibility)
  adminId: 'admin_123',
  orgId: 'org_456',
  eventId: 'event_789',
  
  // Full objects (NEW)
  admin: {...},
  org: {...},
  event: {...},
  
  // Legacy display fields
  orgName: 'F3 Capital',
  memberName: 'Adam'
}
```

**Frontend Caches:**
```javascript
localStorage.setItem('adminId', adminId);
localStorage.setItem('orgId', orgId);
localStorage.setItem('eventId', eventId);
localStorage.setItem('admin', JSON.stringify(admin));
localStorage.setItem('org', JSON.stringify(org));
localStorage.setItem('event', JSON.stringify(event));
```

**Usage:**
```javascript
// Preview page loads events
const cachedEvent = localStorage.getItem('event');
if (cachedEvent) {
  const event = JSON.parse(cachedEvent);
  setAvailableEvents([event]);  // Event name available!
}
```

---

## Success Page Display

### Stats Breakdown

**Total Processed:** Shows total CSV rows attempted

**Successfully Imported:** 
- Big number: Total valid records
- Breakdown: "1 new · 1 updated contacts · 2 new org members"

**Errors/Skipped:**
- Count of failed rows
- Expandable error details

**Event Assignment (if applicable):**
```
🎯 2 contacts were added to Bros & Brews as Org Members in In Funnel stage
```

### Next Steps Buttons

- 🏢 View Org Members
- 📅 Manage Events
- 📤 Upload More
- 🏠 Back to Dashboard

---

## Common Issues & Solutions

### Issue: Event names not showing in dropdown
**Cause:** Welcome not caching full event object  
**Fix:** Updated `welcomeHydrationRoute.js` to return full objects

### Issue: Wrong pipeline stages for audience
**Cause:** Hardcoded config in component out of sync  
**Fix:** Use centralized `AUDIENCE_STAGES` from config

### Issue: Success page redirects to /org-members
**Cause:** Async navigation race condition  
**Fix:** Navigate first, upload after (Nuclear Option)

### Issue: Can't tell new vs updated
**Cause:** Upsert doesn't track what it did  
**Fix:** Check existence before upsert, track counts

### Issue: Vercel serving old code
**Cause:** Build cache or slow deployment  
**Fix:** Hard refresh (Ctrl+Shift+R), wait for Vercel, or update `deploy-trigger.txt`

---

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/welcome/:firebaseId` | GET | Universal hydration (admin, org, event objects) |
| `/events/:orgId/events` | GET | List all events for org |
| `/contacts/upload/preview` | POST | Preview CSV with field mapping |
| `/contacts/upload/save` | POST | Save contacts/org members/event attendees |
| `/orgmembers?orgId=:orgId` | GET | List org members (for /org-members page) |
| `/pipeline-config` | GET | Get pipeline configurations |

---

## Performance Notes

### Caching Strategy
- ✅ Welcome caches: admin, org, event objects
- ✅ EventDashboard caches: pipeline configs, event attendees
- ✅ Dashboard caches: org members
- ❌ Events list is NEVER cached (always fetched fresh)

### Why Events Aren't Cached
- Events change frequently (status, dates, etc.)
- Multiple pages need different event data
- Fresh data prevents stale event info
- API call is fast enough

---

**Last Updated:** October 15, 2025  
**Status:** ✅ Production Ready  
**Next Steps:** Test with real data, monitor for edge cases

