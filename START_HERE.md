# 🚀 Ignite Strategies CRM - Start Here
**Last Updated:** October 13, 2025 (End of Day)  
**Status:** Production Ready - Prisma Migration Complete, Core Features Working

---

## ✅ WHAT'S COMPLETE

### 🏗️ Core Architecture
- ✅ **Contact-First Universal Personhood Model**
  - `Contact` = Universal person (firstName, lastName, email, phone, employer, goesBy)
  - `OrgMember` = Org-specific relationship (yearsWithOrg, leadershipRole, engagementId)
  - `EventAttendee` = Event-specific relationship (audienceType, stage, spouseOrOther, howManyInParty)
- ✅ **Prisma/PostgreSQL Database** (fully migrated from MongoDB)
- ✅ **Reference Tables** (Engagement, LikelihoodToAttend, LeadershipRole) with auto-seeding
- ✅ **Firebase Authentication** (Google OAuth)

### 📊 Organization Management
- ✅ **OrgDashboard** - Central hub for org details and member stats
- ✅ **OrgMembers** - Full member list with inline editing for all fields
- ✅ **Inline Editing** - Edit contacts directly in tables (no popups!)
- ✅ **Engagement Tracking** - 4-level system (Undetermined, Low, Medium, High)
- ✅ **Leadership Roles** - Board, Committee, Project Lead, None

### 📅 Event Management
- ✅ **EventDashboard** - Event stats and quick actions
- ✅ **EventAttendeeList** - Attendee list with inline editing
- ✅ **Pipeline Tracking** - Track attendees through stages
- ✅ **Form Field Mapping** - Public forms map to structured DB columns
- ✅ **Auto-Elevate** - Promote event contacts to org members

### 📧 Contact Management
- ✅ **ContactManageHome** - Central contact hub
- ✅ **ContactManageSelector** - Fork: All Org Contacts vs Specific Event Contacts
- ✅ **Contact Lists** - Segmentation for campaigns
- ✅ **Delete Options** - "Remove from Org/Event" vs "Delete Entirely"

### ⚡ Performance
- ✅ **localStorage Caching** - Pre-load data for instant page loads
- ✅ **Hydration Standardization** - All landing pages cache data
- ✅ **Cache Validation** - Auto-reload stale data
- ✅ **30-Second Cache Expiry** - Fresh data guaranteed

### 🎨 UX/UI
- ✅ **Breadcrumb Navigation** - Always know where you are
- ✅ **Phone Formatting** - 555-555-5555
- ✅ **Capitalization Fixes** - "rsvped" → "RSVPed"
- ✅ **Inline Dropdowns** - Leadership, Engagement, Events, Likelihood
- ✅ **Escape Maneuvers** - Click outside to close dropdowns

---

## 🏗️ TECH STACK

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **API Client:** Axios with interceptors
- **Auth:** Firebase Auth (Google OAuth)
- **Deployment:** Vercel (auto-deploy on push to main)

### Backend
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL (Render)
- **ORM:** Prisma 6.17.1
- **Auth:** Firebase Admin SDK
- **Email:** Gmail OAuth (personal), SendGrid planned (enterprise)
- **Deployment:** Render (auto-deploy on push to main)

### Database Models (Prisma)
```prisma
Contact (Universal Personhood)
  ├── firstName, lastName, email, phone
  ├── goesBy, employer, numberOfKids
  ├── eventId (nullable - which event they came from)
  │
  ├─→ OrgMember (Org Relationship)
  │     ├── yearsWithOrganization
  │     ├── leadershipRole (string for now)
  │     ├── engagementId → Engagement (1-4)
  │     └── orgId
  │
  └─→ EventAttendee (Event Relationship)
        ├── audienceType, currentStage
        ├── spouseOrOther, howManyInParty
        ├── likelihoodToAttendId → LikelihoodToAttend (1-4)
        ├── notes (Json? - for truly custom form fields)
        └── eventId, orgId

Reference Tables:
  ├── Engagement (value: 1=undetermined, 2=low, 3=medium, 4=high)
  ├── LikelihoodToAttend (value: 1=high, 2=medium, 3=low, 4=support_from_afar)
  └── LeadershipRole (value: 1=none, 2=project_lead, 3=committee, 4=board)
```

---

## 📁 PROJECT STRUCTURE

### Frontend Files
```
src/
  ├── pages/
  │   ├── Dashboard.jsx              # Main landing
  │   ├── OrgDashboard.jsx           # Organization hub ✨ NEW
  │   ├── OrgMembers.jsx             # Org member list with inline editing
  │   ├── ContactManageHome.jsx      # Contact management hub
  │   ├── ContactManageSelector.jsx  # Fork: All Org vs Event ✨ NEW
  │   ├── EventDashboard.jsx         # Event hub
  │   ├── EventAttendeeList.jsx      # Event attendee list
  │   ├── FormUserUpdate.jsx         # Notes Parser (migrate JSON → structured)
  │   ├── SequenceCreator.jsx        # Email sequence creator ✨ EMAIL
  │   └── ...
  │
  ├── components/
  │   └── EditableFieldComponent.jsx # ✨ Reusable inline editing
  │
  ├── lib/
  │   ├── api.js                     # Axios instance
  │   └── org.js                     # Org helpers
  │
  └── firebase.js                    # Firebase config
```

### Backend Files
```
eventscrm-backend/
  ├── routes/
  │   ├── orgMembersHydrateRoute.js     # Hydrate org members
  │   ├── orgMemberUpdateRoute.js       # PATCH /orgmembers/:id
  │   ├── orgMemberCreateRoute.js       # POST /org-members (elevate)
  │   ├── eventAttendeesRoute.js        # GET event attendees
  │   ├── eventAttendeeUpdateRoute.js   # PATCH /event-attendees/:id ✨ NEW
  │   ├── contactListsRoute.js          # Contact list CRUD
  │   ├── contactDeleteRoute.js         # DELETE /contacts/:id (cascade)
  │   ├── orgMemberFormRoute.js         # Public form submission ✨ RENAMED
  │   ├── personalEmailRoute.js         # Gmail OAuth ✨ RENAMED
  │   └── ...
  │
  ├── services/
  │   ├── contactListService.js         # Contact list logic
  │   ├── personalEmailService.js       # Gmail API ✨ RENAMED
  │   ├── fieldMappingService.js        # Form field mapping ✨ NEW
  │   └── notesParserService.js         # JSON notes parser ✨ NEW
  │
  ├── scripts/
  │   ├── seedEngagements.js            # Seed Engagement & LikelihoodToAttend
  │   └── seedLeadershipRoles.js        # Seed LeadershipRole
  │
  ├── prisma/
  │   └── schema.prisma                 # Database schema
  │
  └── package.json                      # postinstall auto-seeds ref tables
```

---

## 🗺️ USER NAVIGATION

### Main Dashboard Flow
```
Dashboard (/)
  ├─→ Organization Dashboard (/org-dashboard)
  │     ├── Org details (editable)
  │     ├── Member stats
  │     ├── See Members → OrgMembers (/org-members)
  │     └── Communications
  │
  ├─→ Contact Management (/contacts)
  │     ├── All Contacts (primary) → ContactManageSelector
  │     │     ├── All Organization Contacts
  │     │     └── Specific Event → EventAttendeeList
  │     ├── See Lists → ContactList (/contact-lists)
  │     ├── Create List → CreateListOptions (/create-list)
  │     └── Send Email
  │
  └─→ Event Dashboard (/events/:eventId)
        ├── Event stats
        ├── Manage Contacts → EventAttendeeList
        └── Pipelines
```

### Email System Flow (See EMAIL_CAMPAIGNS.md)
```
📧 Email System (/email)
  ├── CampaignHome - Main dashboard
  ├── SequenceCreator - Create email sequences (/sequence-creator) ✨ NEW
  ├── CampaignWizard - Quick launch (/campaigns)
  ├── SendEmail - 1:1 personal outreach (/send-email)
  └── Templates - Email templates (/templates)
```

---

## 🔑 KEY PATTERNS & CONCEPTS

### 1. Inline Editing Pattern
**All tables use `EditableFieldComponent` for direct cell editing:**
```jsx
<EditableFieldComponent
  value={contact.firstName}
  field="firstName"
  contactId={contact.id}           // For Contact updates
  orgMemberId={contact.orgMemberId} // For OrgMember updates
  eventAttendeeId={attendee.id}    // For EventAttendee updates
  type="text"                      // text, email, tel, number, select
  options={options}                // For dropdowns
/>
```

**Key Fix:** `onBlur={() => handleSave()}` - Prevents circular JSON error

### 2. localStorage Caching Pattern
**Landing pages hydrate data for child pages:**
```javascript
// Landing page (Dashboard, OrgDashboard, EventDashboard)
const loadData = async () => {
  const data = await api.get('/endpoint');
  localStorage.setItem('cache_key', JSON.stringify(data));
};

// Child page (OrgMembers, EventAttendeeList)
const loadCachedData = () => {
  const cached = localStorage.getItem('cache_key');
  if (cached && isValid(cached)) {
    setData(JSON.parse(cached));
    return;
  }
  loadFromAPI(); // Fallback
};
```

**Cache Invalidation:**
```javascript
// After mutations
localStorage.removeItem('cache_key');
loadFromAPI();
```

### 3. Contact-First Architecture
- **Contact** = Universal person (ONE record per person)
- **OrgMember** = Optional org relationship
- **EventAttendee** = Optional event relationship
- A single person can have multiple relationships (org member + event attendee)

### 4. Form Field Mapping (fieldMappingService.js)
**Public forms map to structured columns:**
```javascript
// Contact fields
f3_name → Contact.goesBy

// EventAttendee fields
will_you_bring_your_m → EventAttendee.spouseOrOther
if_going_how_many_in_your_party → EventAttendee.howManyInParty
attendance_likelihood → EventAttendee.likelihoodToAttendId (FK to ref table)

// Unmapped fields → EventAttendee.notes (Json?)
```

**Critical:** `eventId` is set on Contact during form submission to link person to event.

---

## 📞 API ROUTES REFERENCE

### Organization
```
GET  /orgs/:orgId
GET  /orgs/:orgId/events
GET  /orgmembers?orgId={orgId}
PATCH /orgmembers/:orgMemberId          # Inline editing
DELETE /orgmembers/:orgMemberId         # Remove from org
POST /org-members                       # Elevate contact (body: { contactId, orgId })
```

### Contacts
```
GET  /contacts/:contactId
POST /contacts                          # Form submission (orgMemberFormRoute)
PATCH /contacts/:contactId
DELETE /contacts/:contactId             # Cascades to EventAttendee, OrgMember, FormSubmission
```

### Events & Attendees
```
GET  /events/:eventId
GET  /event-attendees/:eventId/attendees  # Fixed route conflict
PATCH /event-attendees/:attendeeId        # Inline editing
GET  /event-attendees?formId={formId}
GET  /event-attendees?hasNotes=true&orgId={orgId}
```

### Contact Lists
```
GET  /contact-lists?orgId={orgId}
POST /contact-lists/from-event { eventId }
POST /contact-lists/from-org-members { orgId }
POST /contact-lists/from-all-contacts { orgId }
```

### Email
```
POST /api/email/personal/send           # Single email (Gmail OAuth)
POST /api/email/personal/send-bulk      # Bulk email (Gmail OAuth)
# Future: POST /api/email/enterprise (SendGrid - not implemented)
```

---

## 🎯 WHAT'S WORKING

✅ Contact-first universal personhood architecture  
✅ Prisma/PostgreSQL migration complete  
✅ Reference tables auto-seeded on deployment  
✅ Inline editing on OrgMembers and EventAttendeeList  
✅ Form field mapping to structured columns  
✅ localStorage caching and hydration standardization  
✅ Breadcrumb navigation across all main pages  
✅ OrgDashboard hub with member stats  
✅ Delete dropdowns with "Remove vs Delete Entirely" options  
✅ Phone formatting, capitalization fixes  
✅ Engagement stats (1-4 values)  
✅ Event hydration on OrgMembers (dropdown to select event)  
✅ Contact list creation navigation  
✅ Gmail OAuth for personal email sending  

---

## 🚧 KNOWN ISSUES / TODO

### **High Priority** 🔥
- [ ] Fix `/contact-list-select` route (doesn't exist, referenced in CreateListOptions.jsx)
- [ ] Fix contact list routes in SequenceCreator.jsx (`/contact-list-manager`, `/contact-list-builder`)
- [ ] Complete contact list creation flow
- [ ] Test email sending via SequenceCreator
- [ ] Automatic emails on form submission

### **Medium Priority** ⚠️
- [ ] Notes Parser (`FormUserUpdate.jsx`) - Migrate old JSON notes to structured fields
- [ ] Migration: `OrgMember.leadershipRole` (string) → `leadershipRoleId` (FK)
- [ ] Better form response display (modal instead of alert?)
- [ ] Contact event history timeline
- [ ] SendGrid integration for enterprise email

### **Low Priority** 📝
- [ ] Dark mode support
- [ ] Toast notifications instead of alerts
- [ ] Real-time updates (WebSocket?)
- [ ] Advanced filtering/search

---

## 🐛 RECENT CRITICAL FIXES (Oct 13, 2025)

1. **Circular JSON Error** - `onBlur={handleSave}` → `onBlur={() => handleSave()}`
2. **Number Input Compressed** - Added `w-16 min-w-16` for number inputs
3. **Dropdown Save Not Triggering** - Modified `handleSave(newValue)` for immediate save
4. **EventID Not Hydrating** - Set `eventId` on Contact during form submission
5. **Route Conflict** - Moved `eventAttendeesRouter` from `/api/events` to `/api/event-attendees`
6. **Form Submission Mismatch** - Kept `orgMemberFormRouter` at `/api/contacts` to match frontend
7. **ContactManage White Screen** - Added `/contactmanage` route for backward compatibility
8. **Party Size Not Mapping** - Added `if_going_how_many_in_your_party` to field mapping
9. **Likelihood Not Mapping** - Added `attendance_likelihood` with value transformations
10. **Delete Non-Existent Field** - Removed `admin: true` from Prisma include

---

## 🎓 QUICK REFERENCE

### Environment Variables
**Frontend (.env):**
- Firebase config is in `src/firebase.js` (hardcoded - public keys)

**Backend (Render):**
- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase Admin SDK key (JSON string)

### Common Commands
```bash
# Frontend
npm run dev          # Local development
npm run build        # Build for production
git push origin main # Deploy to Vercel

# Backend
npm run dev          # Local development with nodemon
npm run start        # Production start
npx prisma studio    # Visual database browser
npx prisma db push   # Push schema changes
git push origin main # Deploy to Render (auto-seeds ref tables)
```

### Database Access
- **Tool:** pgAdmin or Render PostgreSQL console
- **Remember:** Table/column names are case-sensitive! Use quotes: `"OrgMember"`, `"firebaseId"`

---

## 📚 DOCUMENTATION

**Read these in order for a new session:**
1. **START_HERE.md** (this file) - Overview and quick reference
2. **WHERE_WE_ARE_NOW.md** - Detailed October 13 session documentation
3. **EMAIL_CAMPAIGNS.md** - Email system architecture and routing
4. **MIGRATION_OCT13.md** - Future migration plans

**Other helpful docs:**
- `CONTACTMANAGE.md` - Contact management hub architecture
- `ROUTER.md` - Navigation and routing logic
- `USER_NAVIGATION.md` - User journey flows
- `HYDRATION-STANDARDIZATION.md` - localStorage caching patterns

---

## 🎉 READY TO BUILD!

You now have:
1. ✅ Stable Prisma/PostgreSQL architecture
2. ✅ Contact-first universal personhood model
3. ✅ Inline editing across all main pages
4. ✅ localStorage caching for performance
5. ✅ Email system foundation (Gmail OAuth)
6. ✅ Contact list infrastructure
7. ✅ Clean, well-documented codebase

**Next session priorities:**
1. Fix contact list routes (`/contact-list-select`, `/contact-list-manager`, `/contact-list-builder`)
2. Test email sequence creator end-to-end
3. Set up automatic emails on form submission
4. Complete SendGrid integration for enterprise email

**NO MORE DEBUGGING ARCHITECTURE!** Time to finish email and campaigns! 🚀💪

---

**Last Updated:** October 13, 2025 (End of Day)  
**Context:** End of major Prisma migration and inline editing implementation  
**Next Up:** Email campaigns and contact list completion  

---

## 💡 REMEMBER

**For new AI assistants starting a conversation:**
1. Read this file first
2. Then read `WHERE_WE_ARE_NOW.md` for detailed context
3. Check `EMAIL_CAMPAIGNS.md` if working on email features
4. Use `EditableFieldComponent` for all inline editing
5. Check localStorage before making API calls
6. Remember: Contact = universal personhood, OrgMember/EventAttendee = relationships

**When in doubt, check the docs!** 📖
