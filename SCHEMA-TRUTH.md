# 🎯 Schema Truth - What Columns ACTUALLY Exist

**Date:** October 16, 2025  
**Purpose:** Stop the confusion about what's real vs what's debug logs

---

## 🚨 THE PROBLEM

You're seeing logs like:
```
EventAttendee 0: event=Bros & Brews, status=upcoming, isUpcoming=true
```

And you're thinking **"What kind of columns are those?!"**

**Answer:** They're NOT columns! They're debug logs someone left in the code!

---

## 📊 ACTUAL EventAttendee Schema

**File:** `eventscrm-backend/prisma/schema.prisma` (lines 363-405)

### Real Columns:
```prisma
model EventAttendee {
  id      String @id @default(cuid())
  orgId   String
  eventId String
  event   Event  @relation(...)      // 🔗 Relation (not a column!)
  
  contactId String
  contact   Contact @relation(...)   // 🔗 Relation (not a column!)
  
  // REAL COLUMNS:
  currentStage String @default("aware")
  audienceType String
  
  submittedFormId String?
  submittedForm   PublicForm? @relation(...)
  
  attended    Boolean   @default(false)
  checkedInAt DateTime?
  ticketType  String?
  amountPaid  Float     @default(0)
  
  // Event-specific data from forms
  spouseOrOther        String?
  howManyInParty       Int?
  
  // Likelihood to attend (FK)
  likelihoodToAttendId String?
  likelihoodToAttend   LikelihoodToAttend? @relation(...)
  
  notes Json?
  customField Json?  // Old form data
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### What's NOT a Column:
❌ `isUpcoming` - This is computed in JavaScript, NOT stored!
❌ `event.name` - This comes from the Event relation (join)
❌ `event.status` - Also from Event relation
❌ `eventStatus` - Debug variable, not a column!

---

## 🐛 Where's The Debug Garbage Coming From?

**File:** `eventscrm-backend/routes/orgMembersHydrateRoute.js` (lines 95-110)

```javascript
// Debug: Check first member's upcoming events
if (members.length > 0) {
  const firstMember = members[0];
  console.log(`🔍 DEBUG: First member ${firstMember.firstName} ${firstMember.lastName}:`);
  console.log(`🔍 - upcomingEventsCount: ${firstMember.upcomingEventsCount}`);
  console.log(`🔍 - upcomingEventNames:`, firstMember.upcomingEventNames);
  console.log(`🔍 - Total eventAttendees:`, orgMembers[0]?.contact?.eventAttendees?.length || 0);
  
  if (orgMembers[0]?.contact?.eventAttendees?.length > 0) {
    orgMembers[0].contact.eventAttendees.forEach((ea, idx) => {
      const eventStatus = ea.event?.status;        // 🗑️ Debug variable
      const isUpcoming = eventStatus === "upcoming"; // 🗑️ Debug variable
      console.log(`🔍 - EventAttendee ${idx}: event=${ea.event?.name}, status=${eventStatus}, isUpcoming=${isUpcoming}`);
    });
  }
}
```

**Why it exists:**
- Someone was debugging why upcoming events weren't showing
- They added these logs to trace the issue
- FORGOT TO REMOVE THEM!

---

## ✅ What Actually Gets Stored

### EventAttendee Table (Database):
```sql
CREATE TABLE "EventAttendee" (
  "id" TEXT PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "currentStage" TEXT DEFAULT 'aware',
  "audienceType" TEXT NOT NULL,
  "submittedFormId" TEXT,
  "attended" BOOLEAN DEFAULT false,
  "checkedInAt" TIMESTAMP,
  "ticketType" TEXT,
  "amountPaid" REAL DEFAULT 0,
  "spouseOrOther" TEXT,
  "howManyInParty" INTEGER,
  "likelihoodToAttendId" TEXT,
  "notes" JSON,
  "customField" JSON,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP
);
```

### Event Table (Joined via eventId):
```sql
CREATE TABLE "Event" (
  "id" TEXT PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "date" TEXT,
  "time" TEXT,
  "status" TEXT DEFAULT 'upcoming',  -- ✅ THIS is where status lives!
  ...
);
```

---

## 🤔 How The Data Gets Combined

### When You Query:
```javascript
// Backend query:
const orgMembers = await prisma.orgMember.findMany({
  include: {
    contact: {
      include: {
        eventAttendees: {
          include: {
            event: true  // 🔗 JOIN with Event table
          }
        }
      }
    }
  }
});
```

### What You Get:
```javascript
{
  id: "om_123",
  firstName: "John",
  contact: {
    id: "contact_456",
    eventAttendees: [
      {
        id: "ea_789",
        eventId: "event_abc",
        currentStage: "rsvped",        // ✅ Real column
        audienceType: "org_members",   // ✅ Real column
        attended: false,                // ✅ Real column
        event: {                        // 🔗 Joined from Event table
          id: "event_abc",
          name: "Bros & Brews",         // ❌ NOT in EventAttendee!
          status: "upcoming"            // ❌ NOT in EventAttendee!
        }
      }
    ]
  }
}
```

### Then The Debug Code Does:
```javascript
// THIS IS COMPUTED, NOT STORED!
const eventStatus = ea.event?.status;        // "upcoming"
const isUpcoming = eventStatus === "upcoming"; // true
console.log(`isUpcoming=${isUpcoming}`);     // Logs "isUpcoming=true"
```

**So `isUpcoming` is NOT a column!** It's just:
```javascript
ea.event?.status === "upcoming"
```

---

## 🎯 What Should We Do?

### Option 1: Delete The Debug Logs
Just remove lines 95-110 from `orgMembersHydrateRoute.js`. They're noise.

### Option 2: Convert to Proper Logging
Replace with structured logging:
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('📊 OrgMembers Debug:', {
    totalMembers: members.length,
    firstMember: members[0] ? {
      name: `${members[0].firstName} ${members[0].lastName}`,
      upcomingEvents: members[0].upcomingEventsCount,
      totalEventAttendances: orgMembers[0]?.contact?.eventAttendees?.length || 0
    } : null
  });
}
```

### Option 3: Use Actual Monitoring
Set up proper logging/monitoring instead of console.logs everywhere.

---

## 🧹 Cleanup Checklist

**Debug Logs to Remove:**
- [ ] `orgMembersHydrateRoute.js` lines 95-110 (upcoming events debug)
- [ ] Any other `🔍 DEBUG:` logs in the codebase
- [ ] Console.logs that aren't errors/warnings

**Documentation to Create:**
- [x] This file (SCHEMA-TRUTH.md)
- [ ] EventAttendee field reference
- [ ] Event field reference
- [ ] Contact field reference

---

## 📖 Field Reference

### EventAttendee - What's Real vs Computed

| Field | Type | Source | Real Column? |
|-------|------|--------|--------------|
| `id` | String | EventAttendee | ✅ Yes |
| `eventId` | String | EventAttendee | ✅ Yes |
| `contactId` | String | EventAttendee | ✅ Yes |
| `currentStage` | String | EventAttendee | ✅ Yes |
| `audienceType` | String | EventAttendee | ✅ Yes |
| `attended` | Boolean | EventAttendee | ✅ Yes |
| `amountPaid` | Float | EventAttendee | ✅ Yes |
| `event.name` | String | Event (join) | ❌ No (from join) |
| `event.status` | String | Event (join) | ❌ No (from join) |
| `isUpcoming` | Boolean | Computed | ❌ No (calculated) |
| `eventStatus` | String | Computed | ❌ No (alias) |

---

## 💡 Pro Tips

### 1. Check Schema First
Before asking "what's this column?", check `prisma/schema.prisma` first!

### 2. Relations Are Not Columns
```prisma
event Event @relation(...)  // This is NOT a column!
```
It's a foreign key relationship. The actual column is `eventId`.

### 3. Computed Fields Are Not Stored
```javascript
isUpcoming: ea.event?.status === "upcoming"  // NOT stored!
```
This is calculated on the fly in JavaScript.

### 4. Prisma Include = SQL JOIN
```javascript
include: { event: true }  // = LEFT JOIN Event ON ...
```
The `event` object comes from a JOIN, not from EventAttendee table.

---

## 🎬 Summary

**The Confusion:**
```
EventAttendee 0: event=Bros & Brews, status=upcoming, isUpcoming=true
```

**The Truth:**
- `event` = Joined from Event table (not an EventAttendee column)
- `status` = `event.status` from Event table
- `isUpcoming` = Computed (`status === "upcoming"`) not stored!

**The Fix:**
Clean up debug logs and document what's actually real.

---

**Last Updated:** October 16, 2025  
**Status:** Documenting the truth  
**Next:** Clean up all the debug garbage

