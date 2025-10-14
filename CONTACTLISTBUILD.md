# Contact List Building - Architecture & Flow

## 🎯 The Goal

**Smart Lists First:** Pre-hydrated lists ready to use (All Org Members, Event Attendees, etc.)

**Custom Lists When Needed:** Upload CSV or select specific contacts

**Simple Deselection:** Preview list, uncheck people you don't want, save

---

## 🏗️ Database Architecture

### The Schema

```javascript
model Contact {
  id            String   @id @default(cuid())
  email         String
  firstName     String?
  lastName      String?
  phone         String?
  orgId         String
  contactListId String?  // ONE-TO-MANY relationship
  
  org           Org      @relation(fields: [orgId], references: [id])
  contactList   ContactList? @relation(fields: [contactListId], references: [id])
}

model ContactList {
  id          String    @id @default(cuid())
  orgId       String
  name        String
  description String?
  type        String    // 'selection', 'smart', 'upload', 'test'
  contactCount Int      @default(0)
  lastUsed    DateTime?
  usageCount  Int       @default(0)
  
  org         Org       @relation(fields: [orgId], references: [id])
  contacts    Contact[] // Reverse relation
}
```

### Key Points

**One-to-Many (Current):**
- Each contact can be in ONE list at a time
- List membership stored as `contactListId` on Contact
- Simple, works for MVP1

**Many-to-Many (Future):**
- Each contact can be in MULTIPLE lists
- Requires junction table: `ContactListMembership`
- Better for complex segmentation

---

## 📄 The Three Pages

### 1. ContactListBuilder.jsx
**Route:** `/contact-list-builder`

**Purpose:** Choose or create a contact list

**UI:**
```
┌─────────────────────────────────────────┐
│ Build Your Contact List                 │
├─────────────────────────────────────────┤
│                                          │
│ 📋 All Org Members                      │
│ Everyone in your organization           │
│ [Preview] [Use]                         │
│                                          │
│ 🧪 Test List                            │
│ Quick test with adam.cole.0524@gmail.com│
│ [Use]                                   │
│                                          │
│ (Future: Event Attendees, etc.)         │
│                                          │
└─────────────────────────────────────────┘
```

**Features:**
- **Smart Lists:** Pre-configured lists ready to use
- **Preview Button:** Navigate to ContactListView to see/customize
- **Use Button:** Select list and return to SequenceCreator

**Smart Lists (MVP1):**
- All Org Members
- Test List (hardcoded test contact)

**Smart Lists (Future):**
- Event Attendees (specific event)
- Paid Members
- Board Members
- Recent Donors
- Newsletter Subscribers

---

### 2. ContactListView.jsx
**Route:** `/contact-list-view`

**Purpose:** Preview and customize a contact list

**UI:**
```
┌─────────────────────────────────────────┐
│ Preview: All Org Members                 │
├─────────────────────────────────────────┤
│ Select contacts for your list:          │
│                                          │
│ ☑ John Doe - john@example.com          │
│ ☑ Jane Smith - jane@example.com        │
│ ☐ Bob Johnson - bob@example.com        │ ← Unchecked
│ ☑ Alice Williams - alice@example.com   │
│                                          │
│ [Create List with 3 contacts]           │
│                                          │
└─────────────────────────────────────────┘
```

**Features:**
- **All Pre-Checked:** All contacts start selected
- **Deselection:** Uncheck people you don't want
- **Name & Save:** Enter list name and create

**Flow:**
```javascript
1. Load all org members via GET /orgmembers?orgId={id}
2. Display with checkboxes (all checked by default)
3. User unchecks some contacts
4. User clicks "Create List"
5. POST /contact-lists/from-selection with selectedContactIds
6. Navigate back to SequenceCreator with new list
```

---

### 3. ContactListManager.jsx
**Route:** `/contact-list-manager`

**Purpose:** Pick an existing contact list

**UI:**
```
┌─────────────────────────────────────────┐
│ Your Contact Lists                       │
├─────────────────────────────────────────┤
│                                          │
│ 📋 Org-Test-Adam Only                   │
│ 1 contact • Created Oct 13              │
│ [Use in Campaign] [Delete]              │
│                                          │
│ 📋 Bros & Brews Attendees               │
│ 42 contacts • Last used Oct 12          │
│ [Use in Campaign] [Delete]              │
│                                          │
│ [+ Create New List]                     │
│                                          │
└─────────────────────────────────────────┘
```

**Features:**
- **List All:** Shows all contact lists for current org
- **Use in Campaign:** Select list and return to SequenceCreator
- **Delete:** Remove a list
- **Create New:** Go to ContactListBuilder

---

## 🔧 Backend Routes

### 1. Get All Lists
```
GET /contact-lists?orgId={orgId}

Response: [
  {
    id: "abc123",
    name: "All Org Members",
    description: "Everyone in org",
    type: "smart",
    contactCount: 42,
    lastUsed: "2025-10-13T...",
    usageCount: 5
  },
  ...
]
```

### 2. Get Org Members
```
GET /orgmembers?orgId={orgId}

Response: {
  success: true,
  count: 42,
  members: [
    {
      id: "contact123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com"
    },
    ...
  ]
}

OR (array format):

Response: [
  {
    id: "contact123",
    firstName: "John",
    ...
  },
  ...
]
```

**Note:** The route can return EITHER format, so frontend handles both:
```javascript
const members = Array.isArray(response.data) 
  ? response.data 
  : response.data.members || [];
```

### 3. Create List from Selection
```
POST /contact-lists/from-selection

Body: {
  orgId: string,
  name: string,
  description: string,
  selectedContactIds: string[]  // Array of contact IDs
}

Response: {
  id: "list123",
  name: "Custom List",
  type: "selection",
  contactCount: 5,
  ...
}
```

**Backend Logic:**
```javascript
// 1. Clear ALL org members from lists (ensure deselection works)
await prisma.contact.updateMany({
  where: { 
    orgId: body.orgId,
    isOrgMember: true  // Only clear org members
  },
  data: { contactListId: null }
});

// 2. Create new list
const newList = await prisma.contactList.create({
  data: {
    orgId: body.orgId,
    name: body.name,
    description: body.description,
    type: "selection",
    contactCount: body.selectedContactIds.length
  }
});

// 3. Add selected contacts to new list
await prisma.contact.updateMany({
  where: { 
    id: { in: body.selectedContactIds }
  },
  data: { contactListId: newList.id }
});

return newList;
```

### 4. Create Test List
```
POST /contact-lists/test

Body: {
  orgId: string
}

Response: {
  id: "testlist123",
  name: "Test List",
  type: "test",
  contactCount: 1,
  contacts: [
    {
      id: "testcontact123",
      firstName: "Adam",
      email: "adam.cole.0524@gmail.com"
    }
  ]
}
```

**Backend Logic:**
```javascript
// 1. Find or create test contact
let testContact = await prisma.contact.findUnique({
  where: { email: "adam.cole.0524@gmail.com" }
});

if (!testContact) {
  testContact = await prisma.contact.create({
    data: {
      email: "adam.cole.0524@gmail.com",
      firstName: "Adam",
      orgId: body.orgId,
      isOrgMember: false
    }
  });
}

// 2. Create test list
const testList = await prisma.contactList.create({
  data: {
    orgId: body.orgId,
    name: "Test List",
    description: "Quick test contact",
    type: "test",
    contactCount: 1
  }
});

// 3. Link contact to list
await prisma.contact.update({
  where: { id: testContact.id },
  data: { contactListId: testList.id }
});

return { ...testList, contacts: [testContact] };
```

---

## 🎯 Smart List Architecture

### What Are Smart Lists?

**Smart Lists** = Pre-configured, dynamically loaded lists that "just work"

**Examples:**
- **All Org Members:** Everyone with `isOrgMember = true`
- **Event Attendees:** Everyone with `eventId = X` and `stage = 'attended'`
- **Paid Members:** Everyone with `paymentStatus = 'paid'`

### How They Work

**Option 1: Query on Load (Current)**
```javascript
// Frontend calls GET /orgmembers
// Backend returns all org members
// Frontend creates temporary list for selection
// On "Use", POST /contact-lists/from-selection
```

**Option 2: Pre-Saved Lists (Future)**
```javascript
// Backend creates "All Org Members" list on org creation
// Automatically updates when new org members added
// Frontend just loads the list
```

### Smart List Types (Future Expansion)

```javascript
const SMART_LISTS = [
  {
    id: "all-org-members",
    name: "All Org Members",
    description: "Everyone in your organization",
    query: { isOrgMember: true },
    icon: "👥"
  },
  {
    id: "event-attendees",
    name: "Event Attendees",
    description: "People who attended [Event Name]",
    query: (eventId) => ({ eventId, stage: "attended" }),
    icon: "🎉",
    requiresInput: true  // Need to select which event
  },
  {
    id: "paid-members",
    name: "Paid Members",
    description: "Members with active payments",
    query: { paymentStatus: "paid" },
    icon: "💳"
  },
  {
    id: "board-members",
    name: "Board Members",
    description: "Board and leadership",
    query: { leadershipRole: { in: ["board", "committee"] } },
    icon: "🎖️"
  }
];
```

---

## 🗑️ The Wiper Service Concept

### The Problem

**Scenario:**
1. Create list "Event Attendees" (42 contacts)
2. Send email to them
3. Now want to create "All Org Members" (100 contacts)
4. But 42 contacts already in "Event Attendees" list
5. One-to-many limitation: Can't add them to second list

### The Solution: Wiper Service

**Purpose:** Reset all contact list memberships to allow re-segmentation

**When to Use:**
- "I need to re-segment contacts into different lists"
- "Emergency override: I know what I'm doing"

**UI:**
```
┌─────────────────────────────────────────┐
│ ⚠️ Reset List Memberships               │
├─────────────────────────────────────────┤
│ This will remove ALL contacts from      │
│ their current lists.                    │
│                                          │
│ Use this when you need to create new    │
│ lists with contacts already assigned.   │
│                                          │
│ ⚠️ This cannot be undone!               │
│                                          │
│ [Cancel] [Reset All Memberships]        │
│                                          │
└─────────────────────────────────────────┘
```

**Backend Route:**
```
POST /contact-lists/wiper

Body: {
  orgId: string
}

Response: {
  success: true,
  message: "Reset 100 contact list memberships"
}
```

**Backend Logic:**
```javascript
const result = await prisma.contact.updateMany({
  where: { orgId: body.orgId },
  data: { contactListId: null }
});

return {
  success: true,
  message: `Reset ${result.count} contact list memberships`
};
```

**Status:** 💡 Concept only, not built yet

---

## 📊 List Types Reference

| Type | How Created | Use Case | Example |
|------|-------------|----------|---------|
| `smart` | Pre-configured query | Quick, common segments | All Org Members |
| `selection` | User deselects from smart list | Customized subset | "Org Members except Bob" |
| `upload` | CSV upload | External contacts | Email list from MailChimp |
| `test` | Hardcoded test contact | Testing emails | Test List (1 contact) |
| `event` | Event registration | Event-specific | Bros & Brews Attendees |

---

## 🔜 Future Enhancements

### 1. Many-to-Many Lists
**Current:** Contact can be in ONE list  
**Future:** Contact can be in MULTIPLE lists

**Requires:**
- New junction table: `ContactListMembership`
- Schema change
- Route updates

**Schema:**
```javascript
model ContactListMembership {
  id            String   @id @default(cuid())
  contactId     String
  contactListId String
  addedAt       DateTime @default(now())
  
  contact       Contact      @relation(fields: [contactId], references: [id])
  contactList   ContactList  @relation(fields: [contactListId], references: [id])
  
  @@unique([contactId, contactListId])
}
```

### 2. List Duplication
```
POST /contact-lists/{id}/duplicate

Response: {
  id: "newlist123",
  name: "Copy of Original List",
  contactCount: 42
}
```

### 3. List Merging
```
POST /contact-lists/merge

Body: {
  listIds: ["list1", "list2"],
  name: "Merged List",
  strategy: "union" | "intersection"
}
```

### 4. Smart List Builder UI
```
┌─────────────────────────────────────────┐
│ Build Smart List                         │
├─────────────────────────────────────────┤
│ Name: Active Members                     │
│                                          │
│ Conditions:                              │
│ ☑ Is Org Member                         │
│ ☑ Last Active: Within 30 days          │
│ ☑ Payment Status: Paid                  │
│ ☐ Leadership Role: Any                  │
│                                          │
│ Preview: 23 contacts match              │
│                                          │
│ [Cancel] [Create Smart List]            │
└─────────────────────────────────────────┘
```

### 5. List Analytics
- Who opened emails from this list?
- Who clicked links?
- Who replied?
- Who unsubscribed?

---

## 🐛 Known Issues

### Issue: Org Members API Returns Two Formats
**Problem:** Sometimes returns array, sometimes returns object with `members` array

**Fix:** Handle both formats in frontend
```javascript
const members = Array.isArray(response.data) 
  ? response.data 
  : response.data.members || [];
```

**Better Fix:** Standardize backend to always return object format:
```javascript
{
  success: true,
  count: number,
  members: Contact[]
}
```

### Issue: One-to-Many Limitation
**Problem:** Contact can only be in one list at a time

**Workaround:** Use Wiper Service to reset memberships

**Real Fix:** Migrate to many-to-many with junction table

---

## 📚 Related Documentation

- `SEQUENCE.md` - How sequences use contact lists
- `WHERE_WE_ARE_NOW.md` - Current project status
- `EMAIL_CAMPAIGNS.md` - Campaign system overview
- `CONTACTMANAGE.md` - Contact management hub

---

**Last Updated:** October 14, 2025  
**Status:** ✅ MVP1 working (smart lists + selection)  
**Next:** Wiper service, then many-to-many migration

---

*"Preview list, uncheck people you don't want, save. That's it."* - The UX Goal

