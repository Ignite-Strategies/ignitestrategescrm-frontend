# Email Campaigns System Guide

## 🎯 Overview

This document maps out the entire email campaign system, including all pages, routes, and their purposes. Use this as your single source of truth for email/campaign functionality.

---

## 📄 Campaign Pages & Their Purposes

### 1. **CampaignHome.jsx** - Main Email Dashboard
- **Route:** `/email` or `/email/campaigns`
- **Purpose:** Hub for all campaign activities
- **Features:**
  - Campaign stats overview (total, active, recipients)
  - Recent campaigns grid
  - "Launch New Campaign" CTA → goes to `/campaigns`
  - Quick actions: Templates, Contact Lists, Analytics, Personal Email
- **When to use:** Main entry point from Dashboard. This is your "Campaign Control Center"

### 2. **CampaignWizard.jsx** - Quick Launch Wizard
- **Route:** `/campaigns`
- **Purpose:** Fast 4-step campaign creation and launch
- **Steps:**
  1. Campaign Name & Audience (select contact list)
  2. Choose Template (or start from scratch)
  3. Subject & Message
  4. Launch (sends immediately)
- **Features:**
  - Shows your existing campaigns at bottom
  - Click campaign → goes to sequences view
- **When to use:** When you want to launch a campaign RIGHT NOW

### 3. **CampaignList.jsx** - Campaign Manager
- **Route:** Currently NOT ROUTED (orphaned page!)
- **Purpose:** Grid view of all campaigns with management actions
- **Features:**
  - Campaign cards with stats
  - Edit and Delete buttons
  - "Back to Email Dashboard" button → `/email`
- **When to use:** Managing existing campaigns (currently inaccessible)

### 4. **CreateCampaign.jsx** - Campaign Setup
- **Route:** `/create-campaign`
- **Purpose:** Create campaign WITHOUT launching (setup only)
- **Features:**
  - Campaign name, description, contact list selection
  - After creation → goes to `/campaigns/:id/sequences` to add emails
- **When to use:** When you want to set up campaign structure first, add sequences later

### 5. **CampaignSequences.jsx** - Campaign Detail View
- **Route:** `/campaigns/:campaignId/sequences`
- **Purpose:** Apollo.io-style campaign management interface
- **Tabs:**
  - **Emails:** List of sequences with activate toggles, stats (delivered, opened, clicked, replied)
  - **Contacts:** Campaign contacts with status filters (cold, replied, interested, etc.)
  - **Analytics:** Placeholder for detailed analytics
  - **Settings:** Placeholder for campaign settings
- **Features:**
  - Add new sequences
  - Send sequences
  - Toggle sequence activation
  - Search & filter contacts
  - Bulk select & manage
- **When to use:** Managing an existing campaign's sequences and contacts

### 6. **SendEmail.jsx** - 1:1 Personal Outreach
- **Route:** `/send-email?listId=xxx`
- **Purpose:** Send personalized emails one-by-one (manual review)
- **Features:**
  - Card-based UI showing current contact
  - Progress bar
  - Gmail authentication
  - Template variable replacement ({{firstName}}, etc.)
  - Skip or Send for each contact
- **When to use:** Personal outreach where you want to review/customize each email

### 7. **EngageEmail.jsx** - Event-Based Email (LEGACY)
- **Route:** `/email` (CONFLICT! Same as CampaignHome)
- **Purpose:** Send emails filtered by event/pipeline stage
- **Features:**
  - Filter by event and stage
  - Compose and send to filtered audience
  - **Note:** This is placeholder/legacy code
- **Status:** ⚠️ DEPRECATED - Should be removed or re-routed

---

## 🗺️ Current Route Mapping

```javascript
// MAIN EMAIL DASHBOARD
/email                          → CampaignHome (PRIMARY)
/email/campaigns                → CampaignHome (ALIAS)

// CAMPAIGN CREATION & MANAGEMENT
/campaigns                      → CampaignWizard (Quick Launch)
/create-campaign                → CreateCampaign (Setup Only)
/campaigns/:id/sequences        → CampaignSequences (Detail View)

// PERSONAL OUTREACH
/email/outreach                 → Outreach (Need to check what this is)
/send-email                     → SendEmail (1:1 Manual)

// SUPPORTING PAGES
/templates                      → Templates (Email templates)
/contact-lists                  → ContactList (Audience management)
/create-list                    → CreateListOptions (List creation)

// ORPHANED/UNUSED
(none)                          → CampaignList ❌ NOT ROUTED
```

---

## ⚠️ Current Problems

### 1. **Route Conflicts**
- `/email` routes to BOTH CampaignHome AND EngageEmail (lines 162-164, 183-185 in App.jsx)
- This creates confusion and unpredictable behavior

### 2. **Orphaned Pages**
- `CampaignList.jsx` exists but has NO ROUTE
- References `/email` as "Email Dashboard" but that's actually CampaignHome

### 3. **Multiple "Launch" Paths**
- **CampaignWizard** (`/campaigns`) = Quick launch wizard
- **CreateCampaign** (`/create-campaign`) = Setup then add sequences
- Both do similar things but with different workflows

### 4. **Naming Confusion**
- "Email Dashboard" mentioned in multiple places
- "Campaign Dashboard" used interchangeably
- "CampaignHome" is the dashboard but route is `/email`

### 5. **Dashboard Navigation Confusion**
- Dashboard button says "Campaign Dashboard"
- Points to `/campaigns` which is CampaignWizard (not CampaignHome)
- Users expect a dashboard but get a wizard

---

## ✅ Recommended Solution

### Primary Routes (Keep These)
```javascript
/email                          → CampaignHome (Main Hub)
/email/launch                   → CampaignWizard (Quick Launch)
/email/campaigns                → CampaignList (All Campaigns)
/email/campaigns/create         → CreateCampaign (New Campaign Setup)
/email/campaigns/:id            → CampaignSequences (Campaign Detail)
/email/outreach                 → SendEmail (1:1 Personal)
/email/templates                → Templates
/email/analytics                → (Future: Campaign Analytics)
```

### Changes Needed

#### 1. **Fix Dashboard Navigation**
```javascript
// Dashboard.jsx line 324
onClick={() => navigate("/email")}  // Changed from /campaigns
```

#### 2. **Update App.jsx Routes**
```javascript
// REMOVE duplicate /email route (EngageEmail)
// REMOVE line 162-164

// UPDATE routes
<Route path="/email" element={<CampaignHome />} />
<Route path="/email/launch" element={<CampaignWizard />} />
<Route path="/email/campaigns" element={<CampaignList />} />
<Route path="/email/campaigns/create" element={<CreateCampaign />} />
<Route path="/email/campaigns/:campaignId" element={<CampaignSequences />} />
<Route path="/email/outreach" element={<SendEmail />} />
<Route path="/email/templates" element={<Templates />} />
```

#### 3. **Update CampaignHome.jsx**
```javascript
// Line 103 - Launch New Campaign button
onClick={() => navigate("/email/launch")}  // Changed from /campaigns

// Line 131, 432 - Campaign click handlers
onClick={() => navigate(`/email/campaigns/${campaign.id}`)}  // Changed from /campaigns/:id/sequences

// Line 67 - Back to Email Dashboard becomes irrelevant (already on /email)
// Remove or change to "Back to Dashboard" → /dashboard

// Line 173 - Templates
onClick={() => navigate("/email/templates")}  // Changed from /templates

// Line 211 - Analytics
onClick={() => navigate("/email/analytics")}  // Keep consistent
```

#### 4. **Update CampaignWizard.jsx**
```javascript
// Line 202 - Breadcrumb back
onClick={() => navigate("/email")}  // Changed from /campaigns

// Line 432 - Campaign click
onClick={() => navigate(`/email/campaigns/${campaign.id}`)}  // Changed
```

#### 5. **Update CampaignList.jsx**
```javascript
// Line 67 - Email Dashboard button
onClick={() => navigate("/email")}  // Keep

// Line 73 - New Campaign
onClick={() => navigate("/email/campaigns/create")}  // Changed

// Line 144 - Edit campaign
onClick={() => navigate(`/email/campaigns/${campaign.id}`)}  // Changed
```

#### 6. **Delete or Archive**
- `EngageEmail.jsx` - Remove from routes, mark as deprecated
- Or keep as `/email/event-based` if still needed for event-specific campaigns

---

## 🎯 User Flow After Fix

### From Dashboard
```
Dashboard
  ↓ Click "Campaign Dashboard"
CampaignHome (/email)
  ├─ Click "Launch New Campaign" → CampaignWizard (/email/launch)
  ├─ Click recent campaign → CampaignSequences (/email/campaigns/:id)
  ├─ Click "Templates" → Templates (/email/templates)
  ├─ Click "Contact Lists" → ContactList (/contact-lists)
  ├─ Click "Analytics" → Analytics (/email/analytics)
  └─ Click "Personal Email" → SendEmail (/email/outreach)
```

### Campaign Creation Flows

#### Quick Launch (All-in-One)
```
CampaignHome → CampaignWizard
  Step 1: Name & Audience
  Step 2: Template
  Step 3: Subject & Message
  Step 4: Launch! (sends immediately)
  → Returns to CampaignHome
```

#### Detailed Setup (Multi-Step)
```
CampaignHome → CampaignList → "New Campaign"
  → CreateCampaign (name, description, list)
  → CampaignSequences (add multiple sequences)
  → Activate when ready
```

---

## 🏗️ File Structure

```
src/pages/
├── CampaignHome.jsx          # Main hub (/email)
├── CampaignWizard.jsx        # Quick launch (/email/launch)
├── CampaignList.jsx          # All campaigns (/email/campaigns)
├── CampaignSequences.jsx     # Campaign detail (/email/campaigns/:id)
├── CreateCampaign.jsx        # New campaign (/email/campaigns/create)
├── SendEmail.jsx             # 1:1 outreach (/email/outreach)
├── Templates.jsx             # Email templates (/email/templates)
├── ContactList.jsx           # Audiences (/contact-lists)
└── EngageEmail.jsx           # DEPRECATED ❌
```

---

## 📊 Feature Comparison

| Feature | CampaignWizard | CreateCampaign | CampaignSequences |
|---------|----------------|----------------|-------------------|
| Create campaign | ✅ | ✅ | ❌ |
| Add sequences | ✅ (1 only) | ❌ | ✅ (multiple) |
| Send immediately | ✅ | ❌ | ✅ |
| Multi-step wizard | ✅ | ❌ | ❌ |
| Manage existing | ❌ | ❌ | ✅ |
| View contacts | ❌ | ❌ | ✅ |
| Analytics | ❌ | ❌ | ✅ |

---

## 🎨 Page Hierarchy

```
📧 Email System
│
├── 🏠 CampaignHome (Main Dashboard)
│   │
│   ├── 🚀 Quick Actions
│   │   ├── Launch Campaign → CampaignWizard
│   │   ├── Templates → Templates
│   │   ├── Contact Lists → ContactList
│   │   ├── Analytics → Analytics
│   │   └── Personal Email → SendEmail
│   │
│   └── 📊 Recent Campaigns
│       └── Click → CampaignSequences
│
├── 🎯 CampaignWizard (Quick Launch)
│   └── Complete & Send → back to CampaignHome
│
├── 📋 CampaignList (All Campaigns)
│   ├── New Campaign → CreateCampaign
│   └── Edit Campaign → CampaignSequences
│
├── ⚙️ CreateCampaign (Setup)
│   └── Create → CampaignSequences (add emails)
│
├── 📈 CampaignSequences (Detail View)
│   ├── Emails Tab
│   ├── Contacts Tab
│   ├── Analytics Tab
│   └── Settings Tab
│
└── 💌 SendEmail (1:1 Outreach)
    └── Personal outreach with review
```

---

## 🔑 Key Takeaways

1. **CampaignHome** is your main email dashboard (route: `/email`)
2. **CampaignWizard** is for quick campaign launches (should be `/email/launch`)
3. **CampaignSequences** is your detailed campaign manager (should be `/email/campaigns/:id`)
4. **SendEmail** is for 1:1 personal outreach
5. **EngageEmail** is deprecated and should be removed
6. **Dashboard** should point to `/email` not `/campaigns`

---

## 📝 Next Steps

1. ✅ Read this document
2. Update routes in `App.jsx`
3. Update navigation in all campaign pages
4. Remove or archive `EngageEmail.jsx`
5. Test all navigation flows
6. Update `Dashboard.jsx` button
7. Celebrate with a clean, coherent system! 🎉

---

## 🐛 Debugging

**If you're lost:**
1. Start at `/email` (CampaignHome) - this is home base
2. Check the Quick Actions to see where each button goes
3. All campaign routes should start with `/email/...`

**If routes aren't working:**
1. Check `App.jsx` for route definitions
2. Look for duplicate routes (like the `/email` conflict)
3. Verify navigation calls use correct paths

**If pages look wrong:**
1. Check you're on the right route
2. CampaignHome = dashboard view
3. CampaignWizard = wizard/stepper view
4. CampaignSequences = detail table view

---

---

## 🆕 NEW: SequenceCreator.jsx (October 13, 2025)

### **SequenceCreator.jsx** - Simple Email Sequence Creator
- **Route:** `/sequence-creator` (NEEDS TO BE ADDED TO APP.JSX!)
- **Purpose:** Apollo.io-style simple sequence creator
- **Features:**
  - Sequence name input
  - Contact list selection (simple box UI)
  - Email subject & message composer
  - Token insertion ({{firstName}})
  - Live preview
  - Create campaign + sequence
  - Launch immediately via Gmail OAuth
- **Flow:**
  1. Enter sequence name
  2. Pick contact list (or create new)
  3. Write subject & message
  4. Create & Launch → sends via `/api/email/personal/send-bulk`
- **Current Issues:**
  - ⚠️ Routes to `/contact-list-manager` and `/contact-list-builder` DON'T EXIST
  - ⚠️ Back button goes to `/campaignhome` (should be `/email`)
  - ⚠️ No route in App.jsx yet
- **Status:** ⚠️ EXISTS BUT NOT ROUTED

### Recommended Changes for SequenceCreator
```javascript
// Line 164 - Back button
onClick={() => navigate("/email")}  // Changed from /campaignhome

// Line 222, 229, 248, 255 - Contact list routes
onClick={() => navigate("/contact-lists")}  // Changed from /contact-list-manager
onClick={() => navigate("/create-list")}    // Changed from /contact-list-builder
```

### Add to App.jsx
```javascript
<Route path="/sequence-creator" element={<SequenceCreator />} />
// Or better: /email/sequence-creator for consistency
```

---

*Last Updated: October 13, 2025*
*Status: ⚠️ Partial - SequenceCreator exists but needs routing fixes*

---

## 🔗 Related Documentation

See also:
- `START_HERE.md` - Project overview and quick reference
- `WHERE_WE_ARE_NOW.md` - Detailed Oct 13 session documentation
- `CONTACTMANAGE.md` - Contact system architecture and hub
- `ROUTER.md` - Navigation and routing logic
- `USER_NAVIGATION.md` - User journey flows

