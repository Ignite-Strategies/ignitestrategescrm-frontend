# 📍 WHERE WE ARE NOW - Frontend
**Last Updated:** October 13, 2025 (End of Day)  
**Status:** Major Architecture Overhaul - Prisma Migration Complete, Inline Editing Implemented

---

## 🎯 WHAT THIS FRONTEND DOES

The **Ignite Strategies CRM Frontend** provides a React-based interface for:

1. **Organization Management** - Central hub for org details, member stats, and management
2. **Contact Management** - Universal contact-first architecture with event and org relationships
3. **Event Management** - Event dashboards, attendee tracking, and pipeline management
4. **Inline Editing** - Edit contacts, org members, and event attendees directly in tables
5. **Contact List Creation** - Segment contacts for campaigns and targeted outreach
6. **Form Association** - Link public forms to events for data collection

---

## 🏗️ CORE ARCHITECTURE

### **Contact-First Universal Personhood Model**

```
Contact (Universal Personhood)
  ├── firstName, lastName, email, phone
  ├── goesBy (F3 name), employer, numberOfKids
  ├── eventId (which event they're associated with)
  │
  ├─→ OrgMember (Org-Specific Relationship)
  │     ├── yearsWithOrganization
  │     ├── leadershipRole (string for now, ref table exists for future)
  │     ├── engagementId → Engagement (1=undetermined, 2=low, 3=medium, 4=high)
  │     └── orgId
  │
  └─→ EventAttendee (Event-Specific Relationship)
        ├── audienceType, currentStage
        ├── spouseOrOther, howManyInParty
        ├── likelihoodToAttendId → LikelihoodToAttend (1=high, 2=medium, 3=low, 4=support_from_afar)
        ├── notes (Json? - for truly custom form fields)
        └── eventId, orgId
```

### **Key Navigation Structure**

```
Main Dashboard
  ├─→ Organization Dashboard (NEW!)
  │     ├── Org details (editable)
  │     ├── Member stats (active, inactive, engagement levels)
  │     ├── See Members → OrgMembers.jsx
  │     └── Communications (Newsletter, etc.)
  │
  ├─→ Contact Management Home
  │     ├── All Contacts (primary button) → ContactManageSelector
  │     │     ├── All Organization Contacts
  │     │     └── Specific Event Contacts → EventAttendeeList
  │     ├── See Lists (campaign lists) → ContactList.jsx
  │     ├── Create List → CreateListOptions.jsx
  │     │     ├── Import Contacts (CSV upload)
  │     │     ├── Select from Pipeline
  │     │     └── Manual Selection
  │     └── Send Email → Email campaigns
  │
  └─→ Event Dashboard
        ├── Event stats and quick actions
        ├── Manage Contacts → EventAttendeeList.jsx
        └── Pipelines → EventPipelines.jsx
```

---

## 📁 KEY FILES & PAGES

### **Main Pages**

```
src/pages/
  ├── Dashboard.jsx                 # Main landing, redirects to org/event dashboards
  ├── OrgDashboard.jsx              # ✨ NEW! Org management hub
  ├── OrgMembers.jsx                # Org member list with inline editing
  ├── ContactManageHome.jsx         # Contact management hub
  ├── ContactManageSelector.jsx     # ✨ NEW! Fork: All Org vs Specific Event
  ├── EventDashboard.jsx            # Event management hub
  ├── EventAttendeeList.jsx         # Event attendee list with inline editing
  └── FormUserUpdate.jsx            # Notes Parser (migrates JSON to structured fields)
```

### **Reusable Components**

```
src/components/
  └── EditableFieldComponent.jsx    # ✨ RENAMED! Inline editing for all tables
        - Handles text, number, tel, email, select (dropdown)
        - Routes to correct backend (orgMembers, contacts, event-attendees)
        - Auto-saves on blur (text/number) or immediate (dropdown)
```

---

## 🚀 KEY FEATURES IMPLEMENTED TODAY

### ✅ 1. Database Migration to Prisma/PostgreSQL

**FROM:** MongoDB with deprecated Supporter model  
**TO:** PostgreSQL with Contact → OrgMember/EventAttendee relationships

**Migration Impact:**
- All `supporterId` references → `orgMemberId`/`contactId`
- All MongoDB routes deprecated
- New Prisma-based routes for CRUD operations

---

### ✅ 2. Reference Tables for Data Integrity

**Created:**
- `Engagement` table (value: 1-4)
- `LikelihoodToAttend` table (value: 1-4)
- `LeadershipRole` table (value: 1-4, with names)

**Auto-Seeded on Deployment:**
```javascript
// package.json → postinstall script
"postinstall": "prisma generate && prisma db push && npm run db:seed-engagement && npm run db:seed-leadership"
```

**Seeds are idempotent** - Can run multiple times without duplicates (upsert pattern).

---

### ✅ 3. Inline Editing (EditableFieldComponent)

**Replaces:** Old popup modals, separate edit pages  
**New UX:** Click field → Edit → Auto-save on blur/change

**Implemented On:**
- `OrgMembers.jsx` - All fields (name, email, phone, years, leadership, engagement, events)
- `EventAttendeeList.jsx` - Email, phone, audience, stage, spouseOrOther, howManyInParty, likelihoodToAttend

**Backend Routes:**
- PATCH `/orgmembers/:orgMemberId` - Updates OrgMember + Contact fields
- PATCH `/contacts/:contactId` - Updates Contact fields
- PATCH `/event-attendees/:attendeeId` - Updates EventAttendee fields

**Field Type Support:**
- `text` - First/last name, goesBy
- `email` - Email addresses
- `tel` - Phone numbers (formatted: 555-555-5555)
- `number` - Years, party size (fixed width: w-16 min-w-16)
- `select` - Dropdowns (engagement, leadership, events, likelihood)

**Key Fixes:**
- `onBlur={() => handleSave()}` - Prevents circular JSON error
- `handleSave(newValue)` - Immediate save for dropdowns
- Phone formatting helper
- Number input width fix (was too compressed)

---

### ✅ 4. Form Field Mapping to Structured Columns

**Problem:** Custom form fields were all dumped into `EventAttendee.notes` as JSON.

**Solution:**
- Added structured columns: `spouseOrOther`, `howManyInParty`, `likelihoodToAttendId`
- Created `fieldMappingService.js` to centralize mapping logic
- `orgMemberFormRoute.js` maps specific fields to columns, only truly custom fields go to `notes`

**Mapped Fields:**
```javascript
// Contact fields
f3_name → Contact.goesBy

// EventAttendee fields
will_you_bring_your_m → spouseOrOther
if_going_how_many_in_your_party → howManyInParty
how_likely_are_you_to_attend → likelihoodToAttendId
attendance_likelihood → likelihoodToAttendId (alternate form field)
```

**EventAttendee.notes:**
- Changed from `String?` to `Json?`
- Now only stores truly custom fields (not mapped to specific columns)

---

### ✅ 5. localStorage Caching & Hydration Standardization

**"The Rule":** All landing pages hydrate data to localStorage for instant child page loads.

**Implemented:**
```javascript
// EventDashboard
localStorage.setItem(`event_${eventId}_attendees`, JSON.stringify(attendees));

// OrgDashboard
localStorage.setItem(`org_${orgId}_members`, JSON.stringify(members));

// ContactManageHome
localStorage.setItem(`org_${orgId}_members`, JSON.stringify(members));
localStorage.setItem(`org_${orgId}_contact_lists`, JSON.stringify(lists));
```

**Cache Validation:**
- `EventAttendeeList` checks for `orgMemberId` in cached data
- If missing → Reload from API
- 30-second cache expiry to prevent stale data

**Cache Invalidation:**
- `localStorage.removeItem()` after delete/elevate operations

---

### ✅ 6. OrgDashboard - Dedicated Organization Hub

**NEW PAGE:** Central place for organization management

**Features:**
- Editable org name, mission, description
- Member stats: Total, Active, Inactive, Engagement breakdown
- Quick actions: See Members, Upload Members, Add Member
- Communications: Newsletter, Announcements (coming soon)

**Hydration:**
- Loads org members to localStorage
- Breadcrumb: Main Dashboard → Organization Dashboard

---

### ✅ 7. Breadcrumb Navigation

**Added To:**
- OrgDashboard: Main Dashboard → Organization Dashboard
- OrgMembers: Main Dashboard → Org Dashboard → Org Members
- ContactManageHome: Main Dashboard → Contact Management Home
- EventAttendeeList: Main Dashboard → Contact Management Home → Event - Attendees

**UX Benefit:** Always know where you are, easy to navigate back.

---

### ✅ 8. OrgMembers Page Enhancements

**Inline Editing for All Fields:**
- First/Last Name, Email, Phone
- Years with Organization (fixed width number input)
- Leadership Role (dropdown: None, Project Lead, Committee, Board)
- Engagement (dropdown: Undetermined, Low, Medium, High)
- Events (dropdown: select event or "None")

**Upcoming Events Column:**
- Shows event names as badges (hydrated from `orgMembersHydrateRoute`)
- Filter by `event.status === "upcoming"` (not `event.date`)

**Actions Column:**
- Email button (one-to-one email)
- Delete dropdown:
  - "Remove from Organization" (DELETE `/orgmembers/:orgMemberId`)
  - "Delete Contact Entirely" (DELETE `/contacts/:contactId` - cascades)
  - Click outside to close (escape maneuver)

**Fixes:**
- Phone formatting: 555-555-5555
- Capitalization: "rsvped" → "RSVPed"
- Engagement stats: Correctly count by `engagementValue` (1-4)
- Inactive count: Only count `!m.engagementValue`

---

### ✅ 9. EventAttendeeList Page Enhancements

**Replaced TYPE Column with Structured Fields:**
- "Who's Coming" (spouseOrOther - editable)
- "Party Size" (howManyInParty - editable)
- "Likelihood" (likelihoodToAttendId - editable)

**Replaced ACTIONS with Member Status:**
- "Member of Org: Yes/No" badge
- "Elevate" button (only if "No")
- Delete dropdown:
  - "Remove from Event" (soft delete)
  - "Delete Contact Entirely" (hard delete, cascades)

**Inline Editing:**
- Email, Phone, Audience, Stage, spouseOrOther, howManyInParty, likelihoodToAttendId

**Bottom Navigation:**
- "👥 Go to Contacts Manager Hub" button

**Route Fix:**
- Changed API call from `/events/${eventId}/attendees` to `/event-attendees/${eventId}/attendees` to resolve route conflict with `pipelineHydrationRouter`

---

### ✅ 10. ContactManageHome Navigation Fix

**Problem:** Both "See Lists" and "Create List" went to the same page.

**Solution:**
- "See Lists" → `/contact-lists` (view existing lists)
- "Create List" → `/create-list` (CreateListOptions.jsx)

**CreateListOptions.jsx has 3 choices:**
1. Import Contacts (CSV upload)
2. Select from Pipeline
3. Manual Selection

**API Route Fix:**
- Changed from non-existent `/orgs/{orgId}/org-members` to `/orgmembers?orgId={orgId}`

---

### ✅ 11. Backend Route Refactoring

**Renamed for Clarity:**
- `emailRoute.js` → `personalEmailRoute.js`
- `gmailService.js` → `personalEmailService.js`
- `publicFormSubmissionRoute.js` → `orgMemberFormRoute.js`
- `EditableField.jsx` → `EditableFieldComponent.jsx`

**New Routes:**
- `eventAttendeeUpdateRoute.js` - PATCH `/event-attendees/:attendeeId`
- `orgMemberUpdateRoute.js` - PATCH `/orgmembers/:orgMemberId`

**Route Mount Changes:**
- `eventAttendeesRouter` moved from `/api/events` to `/api/event-attendees` (resolve conflict)
- `orgMemberFormRouter` stays at `/api/contacts` (matches hardcoded form submission URL in `ignite-ticketing/PublicForm.jsx`)

**CORS Configuration:**
- Added `x-org-id` to allowed headers (later removed, now using request body for `orgId`)

---

## 🔧 KEY BACKEND CHANGES

### **Schema Updates (eventscrm-backend/prisma/schema.prisma)**

**New Models:**
```prisma
model Engagement {
  id    String @id @default(cuid())
  value Int    @unique  // 1=undetermined, 2=low, 3=medium, 4=high
  OrgMembers OrgMember[]
}

model LikelihoodToAttend {
  id    String @id @default(cuid())
  value Int    @unique  // 1=high, 2=medium, 3=low, 4=support_from_afar
  EventAttendees EventAttendee[]
}

model LeadershipRole {
  id    String @id @default(cuid())
  value Int    @unique  // 1=none, 2=project_lead, 3=committee, 4=board
  name  String
}
```

**Field Migrations:**
```prisma
model Contact {
  // ...existing fields
  employer String?     // MOVED from OrgMember
  eventId  String?     // NEW! Links contact to event
  // ...
}

model OrgMember {
  // ...existing fields
  leadershipRole String?  // NEW! (string for now, FK to LeadershipRole in future)
  engagementId   String?  // NEW! FK to Engagement
  engagement     Engagement? @relation(fields: [engagementId], references: [id])
  // ...
}

model EventAttendee {
  // ...existing fields
  spouseOrOther       String?  // NEW! "wife", "M", "solo", etc.
  howManyInParty      Int?     // NEW! Party size
  likelihoodToAttendId String? // NEW! FK to LikelihoodToAttend
  likelihoodToAttend  LikelihoodToAttend? @relation(fields: [likelihoodToAttendId], references: [id])
  notes               Json?    // CHANGED from String? to Json?
  // REMOVED: attendingWithSpouse (redundant with spouseOrOther)
  // ...
}
```

---

### **Hydration Routes**

**orgMembersHydrateRoute.js:**
- Includes `engagement: true` for engagement data
- Transforms `categoryOfEngagement` → `engagementValue` (1-4)
- Includes `leadershipRole` and `employer` (from Contact)
- Filters upcoming events by `event.status === "upcoming"` (not `event.date`)
- Returns `upcomingEventNames` array (just names, not objects)
- Includes `eventId: member.contact?.eventId || null` for inline editing

**eventAttendeesRoute.js:**
- Switched from raw SQL to Prisma `findMany`
- Includes `likelihoodToAttend: true` for reference table data
- Transforms result to include `orgMemberId` at top level
- Added filter routes:
  - `GET /events/attendees?formId=xxx` (filter by `submittedFormId`)
  - `GET /events/attendees?hasNotes=true&orgId=xxx` (for Notes Parser)

---

### **Update Routes**

**orgMemberUpdateRoute.js:**
- Separates Contact fields from OrgMember fields
- Converts `engagementValue` (1-4) to `engagementId` (FK)
- Validates engagement value (1-4)
- Handles empty strings for `yearsWithOrganization` (Int?) → converts to `null`
- Includes `contact: true` and `engagement: true` in response

**eventAttendeeUpdateRoute.js:**
- NEW FILE! Handles PATCH `/event-attendees/:attendeeId`
- Updates `spouseOrOther`, `howManyInParty`, `likelihoodToAttendId`, etc.

**contactDeleteRoute.js:**
- Removed `admin: true` from Prisma include (field doesn't exist)
- Cascading deletes: `EventAttendee`, `OrgMember`, `FormSubmission`

---

### **Form Submission (orgMemberFormRoute.js)**

**Field Mapping:**
```javascript
// Contact fields
f3_name → Contact.goesBy

// EventAttendee fields
will_you_bring_your_m → spouseOrOther
bringing_m → spouseOrOther (alternate)
if_going_how_many_in_your_party → howManyInParty
how_many_in_party → howManyInParty (alternate)
how_likely_are_you_to_attend → likelihoodToAttendId
attendance_likelihood → likelihoodToAttendId (alternate)
```

**Value Transformations (fieldMappingService.js):**
```javascript
// likelihoodToAttend mapping
'i\'m in — planning to be there!' → 1 (high)
'very_likely' → 1
'probably' → 2 (medium)
'likely' → 2
'maybe' → 3 (low)
'support_from_afar' → 4
```

**Critical Fix:**
```javascript
// Contact creation/update
contact = await prisma.contact.create({
  data: {
    firstName,
    lastName,
    email,
    phone,
    eventId,  // ← CRITICAL! Links contact to event
    ...(goesBy && { goesBy })
  }
});

// Always update eventId on contact update
if (Object.keys(contactUpdates).length > 0) {
  contactUpdates.eventId = eventId; // Always link to this event
  contact = await prisma.contact.update({
    where: { id: contact.id },
    data: contactUpdates
  });
}
```

---

## 🎯 WHAT'S WORKING

✅ Contact-first universal personhood architecture  
✅ Prisma/PostgreSQL migration complete  
✅ Reference tables auto-seeded on deployment  
✅ Inline editing on OrgMembers and EventAttendeeList  
✅ Form field mapping to structured columns  
✅ localStorage caching and hydration standardization  
✅ Breadcrumb navigation  
✅ OrgDashboard hub  
✅ Delete dropdowns with "Remove vs Delete Entirely" options  
✅ Phone formatting (555-555-5555)  
✅ Capitalization ("rsvped" → "RSVPed")  
✅ Engagement stats (1-4 values)  
✅ Event hydration on OrgMembers (dropdown to select event)  
✅ Escape maneuver for delete dropdowns (click outside to close)  
✅ Contact list creation navigation fixed  

---

## 🚧 KNOWN ISSUES / TODO

### **High Priority**
- [ ] Fix `/contact-list-select` route (doesn't exist, referenced in CreateListOptions.jsx)
- [ ] Complete contact list creation flow
- [ ] Email functionality (personal email route exists, enterprise SendGrid planned)
- [ ] Automatic emails on form submission

### **Medium Priority**
- [ ] Notes Parser (`FormUserUpdate.jsx`) - Migrate old JSON notes to structured fields
- [ ] Migration: `OrgMember.leadershipRole` (string) → `leadershipRoleId` (FK to LeadershipRole)
- [ ] Better form response display (modal instead of alert?)
- [ ] Contact event history timeline in ContactDetail

### **Low Priority**
- [ ] Dark mode support
- [ ] Toast notifications instead of alerts
- [ ] Real-time updates (WebSocket?)

---

## 🎓 KEY PATTERNS TO REMEMBER

### **1. Inline Editing Pattern**
```javascript
// Use EditableFieldComponent for all table cells
<EditableFieldComponent
  value={contact.firstName}
  field="firstName"
  contactId={contact.id}           // For Contact fields
  orgMemberId={contact.orgMemberId} // For OrgMember fields
  eventAttendeeId={attendee.id}    // For EventAttendee fields
  type="text"                      // text, email, tel, number, select
  options={options}                // For select dropdowns
  placeholder="Enter value"
/>
```

### **2. Backend Update Pattern**
```javascript
// orgMemberUpdateRoute: Separate Contact vs OrgMember fields
const contactFields = ['firstName', 'lastName', 'email', 'phone', 'goesBy', 'employer', 'numberOfKids'];
const orgMemberFields = ['yearsWithOrganization', 'leadershipRole', 'engagementValue'];

// Update Contact if contactUpdates exist
if (Object.keys(contactUpdates).length > 0) {
  await prisma.contact.update({ where: { id: contactId }, data: contactUpdates });
}

// Update OrgMember if orgMemberUpdates exist
if (Object.keys(orgMemberUpdates).length > 0) {
  await prisma.orgMember.update({ where: { id: orgMemberId }, data: orgMemberUpdates });
}
```

### **3. Hydration Pattern**
```javascript
// Landing page (Dashboard, OrgDashboard, EventDashboard)
const loadData = async () => {
  const data = await api.get('/endpoint');
  localStorage.setItem('cache_key', JSON.stringify(data));
  setData(data);
};

// Child page (OrgMembers, EventAttendeeList)
const loadCachedData = () => {
  const cached = localStorage.getItem('cache_key');
  if (cached) {
    const parsed = JSON.parse(cached);
    // Validate cached data has required fields
    if (parsed[0]?.requiredField) {
      setData(parsed);
      return;
    }
  }
  // Fallback to API if cache is stale/invalid
  loadFromAPI();
};
```

### **4. Cache Invalidation Pattern**
```javascript
// After mutations (delete, elevate, update)
const handleDelete = async () => {
  await api.delete(`/contacts/${contactId}`);
  localStorage.removeItem(`org_${orgId}_members`);    // Clear cache
  loadContacts();  // Reload from API
};
```

### **5. Navigation Pattern**
```javascript
// Breadcrumbs
<div className="text-sm text-gray-600 mb-6">
  <button onClick={() => navigate("/dashboard")} className="hover:underline">
    Main Dashboard
  </button>
  <span className="mx-2">→</span>
  <button onClick={() => navigate("/org-dashboard")} className="hover:underline">
    Organization Dashboard
  </button>
  <span className="mx-2">→</span>
  <span className="font-semibold text-gray-900">Org Members</span>
</div>
```

---

## 📞 API ROUTES REFERENCE

### **Organization**
```
GET  /orgs/:orgId
GET  /orgs/:orgId/events
GET  /orgmembers?orgId={orgId}
PATCH /orgmembers/:orgMemberId
DELETE /orgmembers/:orgMemberId
POST /org-members { contactId, orgId }
```

### **Contacts**
```
GET  /contacts/:contactId
POST /contacts (form submission via orgMemberFormRoute)
PATCH /contacts/:contactId
DELETE /contacts/:contactId (cascades to EventAttendee, OrgMember, FormSubmission)
```

### **Events & Attendees**
```
GET  /events/:eventId
GET  /event-attendees/${eventId}/attendees
GET  /event-attendees?formId={formId}
GET  /event-attendees?hasNotes=true&orgId={orgId}
PATCH /event-attendees/:attendeeId
```

### **Contact Lists**
```
GET  /contact-lists?orgId={orgId}
POST /contact-lists/from-event { eventId }
POST /contact-lists/from-org-members { orgId }
POST /contact-lists/from-all-contacts { orgId }
```

### **Forms**
```
GET  /forms?orgId={orgId}
GET  /attendees/:attendeeId/form-response
```

### **Email**
```
POST /email/personal (Gmail OAuth - personalEmailRoute)
// Future: POST /email/enterprise (SendGrid - not implemented)
```

---

## 💡 CRITICAL FIXES TODAY

### **1. Circular JSON Error in EditableFieldComponent**
**Problem:** `onBlur={handleSave}` passed event object → circular structure  
**Fix:** `onBlur={() => handleSave()}`

### **2. Number Input Too Compressed**
**Problem:** `yearsWithOrganization` input was tiny  
**Fix:** Added `w-16 min-w-16` className for `type="number"`

### **3. Dropdown Save Not Triggering**
**Problem:** `onChange` for dropdowns didn't trigger backend save  
**Fix:** Modified `handleSave(newValue)` to accept optional value, call directly from `onChange`

### **4. EventID Not Hydrating on OrgMembers**
**Problem:** Events column always showed "No Event"  
**Fix:**
- Set `eventId` on Contact during form submission
- Include `eventId` in `orgMembersHydrateRoute` response
- Made Events column editable with dropdown

### **5. Route Conflict: EventAttendees**
**Problem:** `pipelineHydrationRouter` intercepting `/events/:eventId/attendees`  
**Fix:** Moved `eventAttendeesRouter` to `/api/event-attendees`

### **6. Form Submission Route Mismatch**
**Problem:** Form hardcoded to `/api/contacts`, backend route moved  
**Fix:** Kept `orgMemberFormRouter` at `/api/contacts` to match frontend

### **7. ContactManage White Screen of Death**
**Problem:** `EventAttendeeList` navigated to `/contactmanage` but route was `/contacts`  
**Fix:** Added `/contactmanage` route for backward compatibility

### **8. Party Size Field Not Mapping**
**Problem:** `if_going_how_many_in_your_party` not in field mapping  
**Fix:** Added to `orgMemberFormRoute` and `fieldMappingService`

### **9. Likelihood Field Not Mapping**
**Problem:** `attendance_likelihood` from "Bros & Brews" form not mapping  
**Fix:** Added to `fieldMappingService` with value transformations

### **10. Delete Functionality Not Working**
**Problem:** `contactDeleteRoute` tried to include non-existent `admin` field  
**Fix:** Removed `admin: true` from Prisma include statement

---

## 🎉 WHAT'S NEXT?

**Immediate:**
1. Fix `/contact-list-select` route issue
2. Complete contact list creation flow
3. Test email sending (personal Gmail OAuth)
4. Set up automatic emails on form submission

**Future:**
- Notes Parser migration utility
- SendGrid integration for enterprise email
- Contact event history timeline
- Advanced filtering/search
- Real-time updates

---

## 📝 MIGRATION BREADCRUMBS

### **Future Migrations (see MIGRATION_OCT13.md)**

1. **OrgMember.leadershipRole (string) → leadershipRoleId (FK)**
   - Ref table already exists and seeded
   - Need to map existing string values to IDs
   - Update frontend to use ID

2. **EventAttendee.notes JSON → Structured Fields**
   - Notes Parser tool created (`FormUserUpdate.jsx`)
   - Manually run to migrate old form data
   - Not automated (too risky)

3. **Contact.eventId Migration**
   - Already nullable, no breaking changes
   - Forms now set this on submission
   - Old contacts have `null` (expected)

---

**When in doubt:**
1. Check `WHERE_WE_ARE_NOW.md` (this file)
2. Check `MIGRATION_OCT13.md` for future work
3. Check localStorage for cached data
4. Use `EditableFieldComponent` for all inline editing
5. Remember: Contact = universal personhood, OrgMember/EventAttendee = relationships

---

**End of October 13, 2025 Session** 🎉
