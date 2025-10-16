# Modular Hydration Architecture - DEFINITIVE SPECIFICATION

## 🎯 THE PRINCIPLE
**We are modular - each entity has its own hydration route based on its primary identifier.**

## 📡 HYDRATION ROUTES BY ENTITY

### **1. OrgMember Hydration**
- **Primary Key**: `orgId` (Organization ID)
- **Route**: `GET /api/orgmembers?orgId={orgId}`
- **Service**: `orgMembersHydrateRoute.js`
- **Query**: `prisma.orgMember.findMany({ where: { orgId } })`
- **Returns**: Array of OrgMember objects with Contact data
- **Usage**: "All organization members and supporters"

### **2. EventAttendee Hydration**
- **Primary Key**: `eventId` (Event ID)
- **Route**: `GET /api/events/{eventId}/attendees`
- **Service**: `eventAttendeesRoute.js`
- **Query**: `prisma.eventAttendee.findMany({ where: { eventId } })`
- **Returns**: Array of EventAttendee objects with Contact data
- **Usage**: "All contacts from all event pipelines"

### **3. EventAttendee by Stage**
- **Primary Key**: `eventId` + `stage` filter
- **Route**: `GET /api/events/{eventId}/attendees?stage=paid`
- **Service**: `eventAttendeesRoute.js` (same service, filtered)
- **Query**: `prisma.eventAttendee.findMany({ where: { eventId, currentStage: 'paid' } })`
- **Returns**: Array of EventAttendee objects (paid only)
- **Usage**: "All contacts who have paid across all events"

### **4. Org Members Attending Event**
- **Primary Key**: `eventId` (filter by `orgMemberId`)
- **Route**: `GET /api/events/{eventId}/attendees`
- **Service**: `eventAttendeesRoute.js` (same service, filtered on frontend)
- **Query**: `prisma.eventAttendee.findMany({ where: { eventId } })` + filter by `orgMemberId`
- **Returns**: Array of EventAttendee objects where `orgMemberId` exists
- **Usage**: "Org members attending a specific event"

## 🏗️ MODULAR ARCHITECTURE PATTERN

### **Pattern: Entity-Based Hydration**
```
Entity → Primary Key → Route → Service → Query
```

### **Examples:**
```
OrgMember → orgId → /orgmembers?orgId=X → orgMembersHydrateRoute → findMany({orgId})
EventAttendee → eventId → /events/X/attendees → eventAttendeesRoute → findMany({eventId})
Contact → contactId → /contacts/X → contactRoute → findUnique({id})
```

## 📋 IMPLEMENTATION SPECIFICATION

### **Frontend Hydration Pattern**
```javascript
// 1. Get Primary Key from localStorage (set by universal hydrator)
const cachedOrg = JSON.parse(localStorage.getItem('org') || 'null');
const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');

// 2. Make Entity-Specific API Call
const response = await api.get(`/orgmembers?orgId=${cachedOrg.id}`);
const response = await api.get(`/events/${cachedEvent.id}/attendees`);

// 3. Handle Response
const entities = response.data || [];
```

### **Backend Route Registration**
```javascript
// index.js
app.use('/api/orgmembers', orgMembersHydrateRouter);  // OrgMember hydration
app.use('/api/events', eventAttendeesRouter);         // EventAttendee hydration
app.use('/api/contacts', contactRouter);              // Contact hydration
```

## 🎯 MODULAR BENEFITS

### **1. Clear Separation of Concerns**
- **OrgMember stuff** → Uses `orgId` → `orgmembers` route
- **EventAttendee stuff** → Uses `eventId` → `events` route
- **Contact stuff** → Uses `contactId` → `contacts` route

### **2. Predictable API Structure**
```
GET /api/orgmembers?orgId={orgId}           // All org members
GET /api/events/{eventId}/attendees         // All event attendees
GET /api/events/{eventId}/attendees?stage=paid  // Paid attendees only
```

### **3. Entity-Specific Services**
- **orgMembersHydrateRoute.js** → Handles OrgMember queries
- **eventAttendeesRoute.js** → Handles EventAttendee queries
- **contactRoute.js** → Handles Contact queries

## 🚨 ANTI-PATTERNS (WHAT NOT TO DO)

### **❌ Wrong: Mixed Entity Routes**
```javascript
// DON'T DO THIS
GET /api/orgs/{orgId}/attendees  // Org route for EventAttendee data
GET /api/events/{eventId}/members  // Event route for OrgMember data
```

### **❌ Wrong: Generic Hydration**
```javascript
// DON'T DO THIS
GET /api/hydrate?type=orgmembers&orgId=X
GET /api/hydrate?type=attendees&eventId=X
```

### **✅ Correct: Entity-Specific Routes**
```javascript
// DO THIS
GET /api/orgmembers?orgId={orgId}
GET /api/events/{eventId}/attendees
```

## 📊 MODULAR HYDRATION MATRIX

| Entity | Primary Key | Route | Service | Query Pattern |
|--------|-------------|-------|---------|---------------|
| OrgMember | orgId | `/orgmembers?orgId=X` | orgMembersHydrateRoute | `findMany({orgId})` |
| EventAttendee | eventId | `/events/X/attendees` | eventAttendeesRoute | `findMany({eventId})` |
| EventAttendee (paid) | eventId + stage | `/events/X/attendees?stage=paid` | eventAttendeesRoute | `findMany({eventId, currentStage})` |
| Contact | contactId | `/contacts/X` | contactRoute | `findUnique({id})` |

## 🔥 IMPLEMENTATION STATUS

### **✅ IMPLEMENTED**
- **OrgMember Hydration**: `GET /api/orgmembers?orgId={orgId}` ✅
- **EventAttendee Hydration**: `GET /api/events/{eventId}/attendees` ✅ (NOW FIXED)
- **EventAttendee (paid)**: `GET /api/events/{eventId}/attendees?stage=paid` ✅

### **🎯 FRONTEND USAGE**
```javascript
// ContactListBuilder.jsx
const loadOrgMembers = async () => {
  const response = await api.get(`/orgmembers?orgId=${orgId}`);
  // ...
};

const loadEventAttendees = async () => {
  const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
  const response = await api.get(`/events/${cachedEvent.id}/attendees`);
  // ...
};

const loadPaidAttendees = async () => {
  const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
  const response = await api.get(`/events/${cachedEvent.id}/attendees?stage=paid`);
  // ...
};

const loadOrgMembersAttendingEvent = async () => {
  const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
  const response = await api.get(`/events/${cachedEvent.id}/attendees`);
  // Filter for org members only
  const orgMembers = response.data.filter(attendee => attendee.orgMemberId);
  // ...
};
```

## 🎯 THE MODULAR PRINCIPLE

**Each entity type has its own hydration route based on its primary identifier:**

- **OrgMember** → `orgId` → `/orgmembers`
- **EventAttendee** → `eventId` → `/events/{eventId}/attendees`
- **Contact** → `contactId` → `/contacts/{contactId}`

**This is the definitive modular hydration architecture. No more mixed routes. No more confusion.**

---

**STATUS**: ✅ IMPLEMENTED AND DEPLOYED
**LAST UPDATED**: $(date)
**PRINCIPLE**: Entity-based modular hydration
