# Email Sequences - How We're Building It

## 🎯 The Vision

**Apollo.io-style email sequences** but simpler. No wizard hell. No button confusion. Just pick a list, write an email, send.

---

## 🏗️ Current Architecture (MVP1)

### The Simple Flow
```
1. Name your sequence
2. Pick a contact list (or create one)
3. Write subject & message with {{firstName}} token
4. Create & Launch → sends via Gmail API
```

That's it. No multi-step wizard. No confusion.

---

## 📄 Main Page: SequenceCreator.jsx

**Route:** `/sequence-creator`

**Accessed From:**
- CampaignHome → "Launch New Campaign" button

**Purpose:** Create and send email sequences in one focused page.

---

## 🎨 UI Components

### 1. Sequence Name Input
```javascript
<input 
  value={sequenceData.name}
  onChange={(e) => setSequenceData({...sequenceData, name: e.target.value})}
  placeholder="Name your sequence"
/>
```

### 2. Contact List Selection (The Key UX Win!)

**Before (The Trap):**
```
┌─────────────────────────┐
│ Selected List: Test     │  ← User sees this and thinks
│ ▼ Select a list...      │     they need to click dropdown
└─────────────────────────┘
```

**After (The Fix):**
```
┌─────────────────────────────────────┐
│ Contact List                         │
│ ┌─────────────────────────────────┐ │
│ │ Using: Test List (1 contact)    │ │  ← Clear what's selected
│ └─────────────────────────────────┘ │
│                                      │
│ [Pick New List] [Create New List]   │  ← Clear actions
└─────────────────────────────────────┘
```

**States:**
- **No list selected:** Shows "No list selected" + "Pick List" + "Create List"
- **List selected:** Shows "Using: [List Name]" + "Pick New List" + "Create New List"

**Logic:**
```javascript
{selectedList ? (
  <div>Using: {selectedList.name} ({selectedList.contactCount} contacts)</div>
) : (
  <div>No list selected</div>
)}

<button onClick={() => navigate("/contact-list-manager")}>
  {selectedList ? "Pick New List" : "Pick List"}
</button>

<button onClick={() => navigate("/contact-list-builder")}>
  {selectedList ? "Create New List" : "Create List"}
</button>
```

### 3. Email Composer

**Subject:**
```javascript
<input 
  value={sequenceData.subject}
  onChange={(e) => setSequenceData({...sequenceData, subject: e.target.value})}
  placeholder="Email subject"
/>
```

**Message:**
```javascript
<textarea 
  value={sequenceData.message}
  onChange={(e) => setSequenceData({...sequenceData, message: e.target.value})}
  placeholder="Write your email here..."
  rows={10}
/>
```

### 4. Token Picker (MVP1: firstName only)

```javascript
<button onClick={() => {
  setSequenceData({
    ...sequenceData,
    message: sequenceData.message + "{{firstName}}"
  });
}}>
  Insert {{firstName}}
</button>
```

**Live Preview:**
```javascript
<div>
  Preview: {sequenceData.message.replace(/\{\{firstName\}\}/g, "John")}
</div>
```

### 5. Create & Launch Button

```javascript
<button onClick={handleCreateSequence}>
  Create & Launch Sequence
</button>
```

---

## 🔧 The Create & Launch Flow

### Frontend Logic (SequenceCreator.jsx)

```javascript
const handleCreateSequence = async () => {
  try {
    // 1. Create campaign first (backend requirement)
    const campaignResponse = await api.post("/campaigns", {
      orgId: currentOrgId,
      name: sequenceData.name,
      contactListId: selectedList.id,
      status: "draft"
    });
    
    const campaignId = campaignResponse.data.id;
    
    // 2. Create sequence
    const sequenceResponse = await api.post("/sequences", {
      campaignId: campaignId,
      name: sequenceData.name,
      subject: sequenceData.subject,
      html: sequenceData.message,  // NOTE: 'html' not 'body'!
      delayDays: 0,
      status: "draft"
    });
    
    // 3. Send via Gmail API
    if (confirm("🚀 Launch sequence now?")) {
      // For MVP1, using hardcoded test contact
      const contactPayload = [{
        id: "test-contact-id",
        firstName: "Adam",
        email: "adam.cole.0524@gmail.com"
      }];
      
      const gmailResponse = await api.post("/api/email/personal/send-bulk", {
        recipients: contactPayload.map(contact => ({
          email: contact.email,
          variables: {
            firstName: contact.firstName
          }
        })),
        subject: sequenceData.subject,
        body: sequenceData.message  // Body for Gmail API
      });
      
      alert(`🚀 Sequence "${sequenceData.name}" LAUNCHED via Gmail!`);
    }
    
  } catch (error) {
    console.error("❌ Failed:", error);
    alert(`❌ Failed: ${error.response?.data?.error || error.message}`);
  }
};
```

---

## 🔌 Backend Routes Used

### 1. Create Campaign
```
POST /campaigns
Body: {
  orgId: string,
  name: string,
  contactListId: string,
  status: "draft"
}
Response: { id: string, ... }
```

### 2. Create Sequence
```
POST /sequences
Body: {
  campaignId: string,
  name: string,
  subject: string,
  html: string,        // NOT 'body'! Backend expects 'html'
  delayDays: number,
  status: "draft"
}
Response: { id: string, ... }
```

### 3. Send Bulk Email via Gmail
```
POST /api/email/personal/send-bulk
Body: {
  recipients: [
    {
      email: string,
      variables: {
        firstName: string,
        lastName: string,  // Future
        email: string      // Future
      }
    }
  ],
  subject: string,
  body: string  // Can include {{firstName}} tokens
}
Response: { success: true, count: number }
```

**Backend handles:**
- Token replacement ({{firstName}} → actual name)
- 4-second delay between sends (prevent spam flags)
- Gmail API authentication
- Error handling

---

## 🎯 Contact List Integration

### When User Clicks "Pick List"
```
SequenceCreator
  ↓ navigate("/contact-list-manager")
ContactListManager
  ↓ Shows all available lists
  ↓ User clicks "Use in Campaign"
  ↓ navigate("/sequence-creator", { state: { selectedList } })
SequenceCreator
  ↓ Receives selectedList from location.state
  ↓ Updates UI to show selected list
```

### When User Clicks "Create List"
```
SequenceCreator
  ↓ navigate("/contact-list-builder")
ContactListBuilder
  ↓ Shows smart lists (All Org Members, Test List, etc.)
  ↓ User clicks "Preview" on "All Org Members"
ContactListView
  ↓ Shows all org members with checkboxes
  ↓ User unchecks people they don't want
  ↓ User clicks "Create List"
  ↓ Calls POST /contact-lists/from-selection
  ↓ navigate("/sequence-creator", { state: { selectedList } })
SequenceCreator
  ↓ Receives new list
  ↓ Ready to send!
```

---

## 🔐 Gmail Authentication

### Current Setup
- Uses `src/lib/googleAuth.js` for Google OAuth
- Access token stored in `localStorage` as `gmailAccessToken`
- Backend validates token via `verifyGmailToken` middleware

### Auth Flow
```
1. User loads SequenceCreator
2. Check if gmailAccessToken exists in localStorage
3. If not, show "Connect Gmail" button
4. User clicks → triggers Google OAuth flow
5. On success, store access token in localStorage
6. Backend uses token to send via Gmail API
```

### Future: Token Refresh
- Access tokens expire after 1 hour
- Need refresh token logic
- For MVP1, just re-authenticate if token expired

---

## 🎨 Personalization Tokens (Current & Future)

### MVP1 (Current)
- `{{firstName}}` only

### MVP2 (Future)
```javascript
const TOKENS = [
  { label: "First Name", value: "{{firstName}}" },
  { label: "Last Name", value: "{{lastName}}" },
  { label: "Email", value: "{{email}}" },
  { label: "Company", value: "{{company}}" },
  { label: "Phone", value: "{{phone}}" }
];

// Token picker UI
{TOKENS.map(token => (
  <button onClick={() => insertToken(token.value)}>
    {token.label}
  </button>
))}
```

### Backend Token Replacement Logic
```javascript
// In personalEmailRoute.js or enterpriseGmailRoute.js
recipients.forEach(recipient => {
  let personalizedBody = body;
  
  // Replace all tokens
  Object.keys(recipient.variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    personalizedBody = personalizedBody.replace(regex, recipient.variables[key]);
  });
  
  // Send email with personalized body
  await sendGmail(recipient.email, subject, personalizedBody);
});
```

---

## 📊 Sequence Status Flow

```
draft → active → sent → completed
   ↓       ↓       ↓        ↓
Create   Send   Done   Analytics
```

**Status Values:**
- `draft` - Created but not sent
- `active` - Currently sending
- `sent` - Sent to all recipients
- `paused` - User paused mid-send
- `completed` - Fully done with analytics

**For MVP1:**
- We jump straight from `draft` to `sent` (immediate send)
- No pausing, no scheduling

---

## 🚫 What We're NOT Building (Yet)

### Multi-Step Sequences
- No "Day 1: Email 1, Day 3: Email 2" flows
- MVP1 = One email per sequence
- Future: Add sequence steps with delays

### Scheduling
- No "Send tomorrow at 9am"
- MVP1 = Send immediately
- Future: Add scheduling

### A/B Testing
- No "Test subject A vs subject B"
- MVP1 = Single version
- Future: Add A/B testing

### Reply Tracking
- No "Stop sending if they reply"
- MVP1 = Send to all
- Future: Track replies and pause

### Open/Click Tracking
- No pixel tracking (yet)
- MVP1 = Just send
- Future: Add tracking pixels

---

## 🐛 Known Issues & Fixes

### Issue 1: Backend Validation Error
**Error:** "campaignId, name, subject, and html are required"

**Cause:** Frontend wasn't creating campaign first

**Fix:** ✅ Create campaign first, then sequence

---

### Issue 2: contactList.save() Error
**Error:** `contactList.save is not a function`

**Cause:** Prisma doesn't have `.save()` method

**Fix:** ✅ Use `prisma.contactList.update()` instead

---

### Issue 3: Gmail API 404
**Error:** `404 Not Found` on `/api/email/personal/send-bulk`

**Cause:** Backend deployment broken (authRoute.js import error)

**Fix:** ⏳ IN PROGRESS - Remove authRoute.js import from index.js

---

### Issue 4: List Selection Confusion
**Error:** User sees selected list but thinks they need to click dropdown

**Fix:** ✅ Replaced dropdown with single box showing "Using: [List]" and clear action buttons

---

## 🎯 Testing Checklist

### Pre-Send Checks
- [ ] Gmail token exists in localStorage
- [ ] Contact list selected
- [ ] Sequence name filled in
- [ ] Subject filled in
- [ ] Message has content
- [ ] Backend deployment successful

### Send Checks
- [ ] Campaign created successfully
- [ ] Sequence created successfully
- [ ] Gmail API call returns 200
- [ ] Email received in inbox
- [ ] {{firstName}} replaced correctly

### Post-Send Checks
- [ ] Sequence status updated to "sent"
- [ ] Contact list usage tracked
- [ ] No console errors
- [ ] Success message shown

---

## 🔜 Next Features (Priority Order)

### 1. Token Expansion (MVP2)
- Add lastName, email, company, phone tokens
- Improve token picker UI
- Add token validation (warn if token missing data)

### 2. Send Scheduling (MVP3)
- "Send now" vs "Schedule for later"
- Time picker UI
- Backend cron job or scheduled task

### 3. Multi-Step Sequences (MVP4)
- Day 1: Email 1
- Day 3: Email 2 (if no reply)
- Day 7: Email 3 (if no reply)
- UI: List of sequence steps with delays

### 4. Analytics (MVP5)
- Sent count
- Open rate
- Click rate
- Reply rate
- Individual contact status

### 5. Reply Tracking (MVP6)
- Webhook from Gmail API
- Stop sequence if contact replies
- Mark contact as "replied" in database

---

## 📚 Related Documentation

- `WHERE_WE_ARE_NOW.md` - Current project status
- `EMAIL_CAMPAIGNS.md` - Campaign system overview
- `CONTACTMANAGE.md` - Contact list architecture
- `AUTH.md` - Authentication flow

---

**Last Updated:** October 14, 2025  
**Status:** ✅ Frontend built, ⏳ Backend deployment pending  
**MVP1 Goal:** Single email sequence with firstName token via Gmail API

---

*"No wizard hell. No button confusion. Just send the damn email."* - The Design Philosophy

