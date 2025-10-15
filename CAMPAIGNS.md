# Campaign System - Surgical Documentation

**Last Updated:** October 15, 2025  
**Purpose:** Clean, surgical documentation of EXACTLY what routes to what and what mutates state

---

## 🎯 **CURRENT STATE - What's Actually Wired**

### **Frontend Route**
```
/campaign-creator → CampaignCreator.jsx (NOT CampaignCreatorSimple.jsx)
```

**Import in App.jsx (line 67):**
```javascript
import CampaignCreator from "./pages/CampaignCreatorSimple.jsx";  // ❌ MISLEADING NAME!
```

**Actual File Being Used:** `CampaignCreator.jsx` (the full one with hydration)

---

## 📋 **The Flow - Step by Step**

### **Step 1: Create Campaign**
**Page:** `/campaign-creator`  
**Component:** `CampaignCreator.jsx`

**UI State:**
- User enters campaign name
- Clicks "Create Campaign"

**What Happens:**
```javascript
POST /api/campaigns
{
  orgId: "xxx",
  name: "Campaign Name",
  description: "Campaign created 10/15/2025",
  status: "draft"
}

RESPONSE:
{
  id: "cm123...",
  orgId: "xxx",
  name: "Campaign Name",
  status: "draft",
  contactListId: null,  // Not assigned yet
  subject: null,
  body: null,
  createdAt: "2025-10-15T..."
}
```

**State Mutation:**
```javascript
// URL updates to include campaignId
setSearchParams({ campaignId: campaign.id });
// Component re-renders, now shows Step 2
```

---

### **Step 2: Pick Contact List**
**Page:** `/campaign-creator?campaignId=cm123`  
**Component:** `CampaignCreator.jsx` (same page, different view)

**Two Options:**

#### **Option A: Select Existing List (inline)**
User clicks one of the available lists shown on page

**What Happens:**
```javascript
PATCH /api/campaigns/:campaignId
{
  contactListId: "cl456..."
}

RESPONSE:
{
  id: "cm123...",
  contactListId: "cl456...",  // NOW LINKED!
  contactList: { id: "cl456", name: "...", ... }
  ...
}
```

**State Mutation:**
```javascript
// URL updates to include listId
setSearchParams({ campaignId, listId: list.id });
// Component re-renders, loads contacts, shows Step 3
```

#### **Option B: Create New List**
User clicks "Build Custom List" button

**What Happens:**
```javascript
// Navigate away (keeps campaignId in URL)
navigate(`/contact-list-builder?campaignId=${campaignId}`);
```

**In ContactListBuilder.jsx:**
- User picks smart list (All Org Members, etc.)
- Backend creates list
- List is linked to campaign
- Returns to `/campaign-creator?campaignId=cm123&listId=cl456`

---

### **Step 3: Write Message**
**Page:** `/campaign-creator?campaignId=cm123&listId=cl456`  
**Component:** `CampaignCreator.jsx` (same page, now shows message editor)

**What Shows:**
- Subject input
- Message textarea with variable buttons
- Live preview with actual contact data
- Gmail auth status
- Preview button

**User Actions:**
- Enters subject
- Enters message with variables: `{{firstName}}`, `{{lastName}}`, `{{goesBy}}`, `{{email}}`
- Clicks "Preview & Send Campaign"

**What Happens:**
```javascript
// 1. Save content to campaign
PATCH /api/campaigns/:campaignId
{
  subject: "Your Subject",
  body: "Hi {{firstName}}, ..."
}

// 2. Navigate to preview
navigate(`/campaign-preview?campaignId=${campaignId}`);
```

**NOTE:** `listId` is NOT passed to preview - preview uses `campaignId` to hydrate everything!

---

### **Step 4: Preview & Send**
**Page:** `/campaign-preview?campaignId=cm123`  
**Component:** `CampaignPreview.jsx`

**Hydration Magic:**
```javascript
// Single source of truth: campaignId
// Campaign includes contactList
// Campaign has contactListId → can load contacts

const [campaignRes, contactsRes] = await Promise.all([
  api.get(`/campaigns/${campaignId}`),      // Gets campaign + contactList
  api.get(`/campaigns/${campaignId}/contacts`)  // Gets contacts via campaignId
]);
```

**What Shows:**
- Campaign details (name, status)
- Contact list name & count
- Subject and message preview
- List of all recipients (clickable)
- Personalized preview for selected recipient
- Gmail status indicator
- "Send to X contacts" button

**User Clicks Send:**
```javascript
// 1. Send via Gmail API
POST /api/enterprise-gmail/send-campaign
{
  campaignId: "cm123",
  subject: "Your Subject",
  message: "Hi {{firstName}}, ...",
  contactListId: "cl456"
}

// Backend:
// - Loads all contacts for the list
// - Replaces variables for each contact
// - Sends via Gmail API (one email per contact)
// - Returns success/failure

// 2. Update campaign status
PATCH /api/campaigns/:campaignId
{
  status: "sent"
}

// 3. Navigate home
navigate('/campaignhome');
```

---

## 🔗 **Backend Routes - Complete API**

### **Campaign CRUD**
```javascript
GET    /api/campaigns?orgId=xxx           // Get all campaigns for org
GET    /api/campaigns/:campaignId         // Get single campaign (includes contactList)
POST   /api/campaigns                     // Create new campaign
PATCH  /api/campaigns/:campaignId         // Update campaign (name, status, subject, body, contactListId)
DELETE /api/campaigns/:campaignId         // Delete campaign (preserves ContactList!)
```

### **Campaign Contacts**
```javascript
GET    /api/campaigns/:campaignId/contacts  // Get all contacts for campaign's list
```

### **Contact List Routes**
```javascript
GET    /api/contact-lists?orgId=xxx         // Get all lists for org
GET    /api/contact-lists/:listId           // Get single list details
GET    /api/contact-lists/:listId/contacts  // Get all contacts in list
POST   /api/contact-lists                   // Create new list
DELETE /api/contact-lists/:listId           // Delete list
```

### **Email Sending**
```javascript
POST   /api/enterprise-gmail/send-campaign  // Send campaign via Gmail API
```

---

## 💾 **State Management - What Lives Where**

### **URL Params (Source of Truth)**
```javascript
/campaign-creator?campaignId=cm123&listId=cl456

// These drive what the component loads
// Component uses useSearchParams() to read them
// Component uses setSearchParams() to update them
```

### **React State (Hydrated from URL Params)**
```javascript
// In CampaignCreator.jsx
const [campaignName, setCampaignName] = useState("");       // Loaded from GET /campaigns/:id
const [contactList, setContactList] = useState(null);        // Loaded from GET /contact-lists/:id
const [contacts, setContacts] = useState([]);                // Loaded from GET /contact-lists/:id/contacts
const [availableLists, setAvailableLists] = useState([]);    // Loaded from GET /contact-lists?orgId=xxx
const [subject, setSubject] = useState("");                  // Loaded from campaign.subject
const [message, setMessage] = useState("");                  // Loaded from campaign.body
```

### **Database State (Single Source of Truth)**
```javascript
// Campaign Model
{
  id: "cm123...",
  orgId: "org456",
  name: "Campaign Name",
  description: "...",
  status: "draft" | "sent" | "active" | "paused",
  contactListId: "cl789",  // Foreign key to ContactList
  subject: "Email Subject",
  body: "Email message with {{variables}}",
  createdAt: "2025-10-15T...",
  updatedAt: "2025-10-15T..."
}

// ContactList Model
{
  id: "cl789",
  orgId: "org456",
  name: "All Org Members",
  description: "...",
  totalContacts: 45,
  contactCount: 45,  // Alias for totalContacts
  ...
}
```

---

## 🔄 **Hydration Pattern**

### **The Rule: URL Params → Load Everything**

**When component loads:**
```javascript
useEffect(() => {
  if (campaignId) await loadCampaignData();  // Loads name, subject, body
  if (listId) {
    await loadContactList();                  // Loads list details
    await loadContacts();                      // Loads contacts array
  }
  await loadAvailableLists();                 // Always load for selection
}, [campaignId, listId]);
```

**When URL changes:**
- Component automatically re-runs useEffect
- Loads new data based on new params
- UI updates to show current state

**This enables:**
- ✅ Page refreshes work (URL has all info needed)
- ✅ Back/forward buttons work
- ✅ Shareable URLs (send link to teammate)
- ✅ Resume flow (navigate away and come back)

---

## 🛡️ **Backend Guardrails**

### **Campaign → ContactList Assignment**

**Guardrail 1: Can't reassign sent campaigns**
```javascript
PATCH /campaigns/:id { contactListId: "new-list" }

// If campaign.status === 'sent'
→ 400 Error: "Cannot change contact list - campaign already sent"
→ Options: Wiper Service, DELETE, or ?force=true
```

**Guardrail 2: List must exist and belong to org**
```javascript
PATCH /campaigns/:id { contactListId: "cl999" }

// If list doesn't exist
→ 404 Error: "Contact list not found"

// If list.orgId !== campaign.orgId
→ 403 Error: "Contact list belongs to different organization"
```

**Guardrail 3: Warning for reused lists (allows but logs)**
```javascript
PATCH /campaigns/:id { contactListId: "cl456" }

// If list already used by other campaigns
→ ⚠️ Console warning (but allows it)
```

### **Campaign Deletion**

**ContactList is PRESERVED:**
```javascript
DELETE /campaigns/:id

// Deletes:
// - Campaign record
// - Associated sequences

// Preserves:
// ✅ ContactList (it's a reusable asset!)
// ✅ Contacts (they're org members or event attendees)

// Response explains why:
{
  message: "Campaign deleted successfully",
  note: "ContactList preserved - it's a reusable asset!",
  preserved: {
    listId: "cl456",
    listName: "All Org Members",
    reason: "Smart lists are modular - can be reused"
  }
}
```

---

## 🎨 **UI States - What User Sees**

### **State 1: No Campaign Yet**
```
1. Campaign Name
   [Input: "Enter campaign name"]
   [Button: "Create Campaign"]

2. Contact List
   [Locked - gray box: "Create a campaign first"]

3. Message
   [Hidden - not shown yet]
```

### **State 2: Campaign Created, No List**
```
1. Campaign Name
   ✅ "Q4 Newsletter" (ID: cm123)
   [Button: "Start New"]

2. Contact List
   📋 Available Lists:
   - [Card: "All Org Members" - 45 contacts]
   - [Card: "Event Attendees" - 23 contacts]
   
   ➕ Build Custom List
   [Button: navigates to /contact-list-builder]

3. Message
   [Hidden - not shown yet]
```

### **State 3: Campaign + List, Writing Message**
```
1. Campaign Name
   ✅ "Q4 Newsletter" (ID: cm123)
   [Button: "Start New"]

2. Contact List
   ✅ "All Org Members" - 45 contacts
   [Button: "Change List"]

3. Message
   [Input: Subject]
   [Textarea: Message with variable buttons]
   [Live Preview with actual contact data]
   
   [Button: "👁️‍🗨️ Preview & Send Campaign"]
```

---

## 🚨 **Common Issues & Solutions**

### **Issue: "Campaign content not saving"**
**Cause:** User navigates away before clicking Preview  
**Solution:** Auto-save on message change (debounced)

### **Issue: "Contacts disappeared after selecting list"**
**Cause:** useEffect not triggering on listId change  
**Solution:** Add listId to useEffect dependency array ✅ (already done)

### **Issue: "Campaign shows old data after editing"**
**Cause:** React state not syncing with URL params  
**Solution:** Use URL as source of truth, reload on param change ✅ (already done)

### **Issue: "Gmail auth expires mid-flow"**
**Cause:** Token expires after 1 hour  
**Solution:** Check auth before send, prompt user to reconnect ✅ (already done)

---

## 📊 **Data Flow Diagram**

```
User Action          →  Frontend API Call           →  Backend Mutation           →  URL Update
─────────────────────────────────────────────────────────────────────────────────────────────────

1. Enter name        →  POST /campaigns             →  Campaign created           →  ?campaignId=cm123
   "Q4 Newsletter"

2. Click list        →  PATCH /campaigns/:id        →  Campaign.contactListId     →  ?campaignId=cm123
   "All Org Members"     { contactListId: "cl456" }     = "cl456"                     &listId=cl456

3. Write message     →  (none - local state)        →  (none)                     →  (no change)
   "Hi {{firstName}}"

4. Click Preview     →  PATCH /campaigns/:id        →  Campaign.subject/body      →  /campaign-preview
                         { subject, body }              saved                          ?campaignId=cm123

5. Click Send        →  POST /enterprise-gmail/...  →  Emails sent                →  /campaignhome
                         PATCH /campaigns/:id           Campaign.status = 'sent'
                         { status: 'sent' }
```

---

## 🔧 **File Map - What Does What**

### **Frontend Files**
```
src/pages/
├── CampaignCreator.jsx        ← Main 3-step builder (Steps 1-3)
├── CampaignPreview.jsx         ← Preview & send (Step 4)
├── ContactListBuilder.jsx      ← Smart list creation (sidebar flow)
├── CampaignHome.jsx            ← Dashboard/home (after send)
└── CampaignCreatorSimple.jsx   ← NOT USED (orphaned, can delete)

src/lib/
├── api.js                      ← Axios wrapper for API calls
├── googleAuth.js               ← Gmail OAuth helpers
└── org.js                      ← Get orgId from localStorage
```

### **Backend Files**
```
routes/
├── campaignRoute.js            ← Campaign CRUD + contacts
├── enterpriseGmailRoute.js     ← Send campaign via Gmail
└── contactListRoute.js         ← Contact list CRUD

services/
├── contactListService.js       ← List business logic
└── (gmail service TBD)         ← Gmail API wrapper
```

---

## 🎯 **Next Steps & Improvements**

### **Priority 1: Testing**
- [ ] Test full flow: Create → Pick List → Write → Preview → Send
- [ ] Test with real Gmail account and org members
- [ ] Test resume flow (navigate away and back)
- [ ] Test refresh at each step (URL hydration)

### **Priority 2: UX Polish**
- [ ] Auto-save subject/body on change (debounced)
- [ ] Show "Saving..." indicator when patching campaign
- [ ] Add "Send Test Email" button in preview
- [ ] Add confirmation modal before send

### **Priority 3: Error Handling**
- [ ] Better error messages for API failures
- [ ] Retry logic for Gmail API rate limits
- [ ] Handle expired Gmail tokens gracefully
- [ ] Validate subject/body not empty before allowing send

### **Priority 4: Cleanup**
- [ ] Delete `CampaignCreatorSimple.jsx` (orphaned)
- [ ] Rename import in App.jsx to not be misleading
- [ ] Archive old campaign docs (CAMPAIGN-FIX-OCT14.md, etc.)
- [ ] Consolidate campaign routes under `/email/...`

---

## 📝 **Architecture Notes**

### **Why URL Params as Source of Truth?**
- ✅ Survives page refreshes
- ✅ Shareable (send link to teammate)
- ✅ Browser back/forward works
- ✅ No localStorage juggling
- ✅ React automatically re-renders on URL change

### **Why Campaign → ContactList (not ContactList → Campaign)?**
- Campaign "uses" a list (one-to-many: list can be used by multiple campaigns)
- Deleting campaign doesn't delete list (lists are reusable)
- List creation can happen independently (not tied to campaign)

### **Why Separate Preview Page?**
- Clear separation of concerns (edit vs. review)
- Forces user to review before sending (UX best practice)
- Allows back button to return to editing
- Preview uses clean URL without listId (hydrates from campaign)

---

**End of Surgical Documentation**

*This document is the SINGLE SOURCE OF TRUTH for how campaigns work RIGHT NOW (October 15, 2025)*

