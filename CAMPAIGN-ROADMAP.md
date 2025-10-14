# 🚀 Campaign System Roadmap

**Last Updated:** October 14, 2025  
**Status:** MVP Testing Phase

---

## ✅ **COMPLETED - 3-Step Campaign Flow**

### Architecture
1. **CampaignCreator.jsx** → Create campaign & generate ID
2. **ContactListManager.jsx** / **ContactListBuilder.jsx** → Pick/create list
3. **Sequence.jsx** → Build message & send via Gmail

### Routes
- `/campaign-creator` - Step 1: Name campaign
- `/contact-list-manager?campaignId=X` - Step 2: Pick existing list
- `/contact-list-builder?campaignId=X` - Step 2: Create new list
- `/create-list-options?campaignId=X` - PRIMARY hub for list creation
- `/sequence?campaignId=X&listId=Y` - Step 3: Message & send

### What Works
- ✅ Campaign ID auto-generation (Prisma `cuid()`)
- ✅ localStorage flow tracking (`currentCampaignId`, `currentCampaignName`)
- ✅ Smart lists (All Org Members, Test List)
- ✅ Gmail OAuth integration
- ✅ Variable replacement (`{{firstName}}`, `{{lastName}}`)
- ✅ Bulk email send via Gmail API

---

## 🎯 **ROADMAP - Next Steps**

### **Phase 1: Simple Flow Testing** 🧪
**Goal:** Validate the 3-step flow end-to-end

**Tasks:**
- [ ] Test CampaignCreator → stores campaignId correctly
- [ ] Test ContactListBuilder → creates list & navigates to Sequence
- [ ] Test Sequence → loads campaign/list data & sends emails
- [ ] Verify Gmail OAuth doesn't expire mid-flow
- [ ] Test with real org members (not just test contact)
- [ ] Verify campaign appears in CampaignHome after creation
- [ ] Test "back" buttons work correctly in flow

**Success Criteria:**
- Can create campaign → pick list → send email in < 2 minutes
- No errors in console
- Email arrives in Gmail with variables replaced

---

### **Phase 2: Advanced List Creation** 📋
**Goal:** Support event-based and pipeline-based list creation

**Features to Build:**

#### 2.1 Event Attendee Lists
```
User Flow:
1. Go to CreateListOptions
2. Click "Event Attendees" (currently disabled)
3. Select event from dropdown
4. Select pipeline stages (e.g., "RSVP'd", "Paid", "Attended")
5. Preview contacts
6. Create list
```

**Implementation:**
- [ ] Add event dropdown to ContactListBuilder
- [ ] Add multi-select for pipeline stages
- [ ] Backend: `POST /contact-lists/from-event`
- [ ] Frontend: EventBasedListCreator component
- [ ] Wire up in CreateListOptions

#### 2.2 All Event Members (any stage)
```
Quick smart list:
- "All [Event Name] Attendees"
- Includes everyone in that event's pipeline
- One-click creation
```

**Implementation:**
- [ ] Add to ContactListBuilder as smart list option
- [ ] Backend: `GET /events/:eventId/all-contacts`
- [ ] UI: Show total count before creating

#### 2.3 Pipeline Stage Filtering
```
Advanced filtering:
- Event: Bros & Brews 2025
- Audience: Friends & Family
- Stages: [RSVP'd, Soft Commit, Paid] ✓
- Stages: [Can't Attend] ✗ (exclude)
```

**Implementation:**
- [ ] Multi-select stages with include/exclude
- [ ] Live preview of contact count
- [ ] Backend: Complex query builder
- [ ] UI: ContactUploadChooser enhancement

---

### **Phase 3: Variable Replacement** 🔤
**Goal:** Rich personalization in emails

**Current Variables:**
- `{{firstName}}` - Works ✅
- `{{lastName}}` - Works ✅

**New Variables to Add:**

#### 3.1 Contact Variables
- [ ] `{{email}}` - Contact's email
- [ ] `{{phone}}` - Contact's phone
- [ ] `{{goesBy}}` - Preferred name (fallback to firstName)
- [ ] `{{fullName}}` - firstName + lastName

#### 3.2 Organization Variables
- [ ] `{{orgName}}` - Organization name
- [ ] `{{orgWebsite}}` - Organization website
- [ ] `{{senderName}}` - Email sender's name
- [ ] `{{senderEmail}}` - Email sender's email

#### 3.3 Event Variables (if in event context)
- [ ] `{{eventName}}` - Event name
- [ ] `{{eventDate}}` - Event date
- [ ] `{{eventLocation}}` - Event venue
- [ ] `{{ticketCost}}` - Ticket price

#### 3.4 Dynamic Variables (advanced)
- [ ] `{{unsubscribeLink}}` - Auto-generated unsubscribe
- [ ] `{{trackingPixel}}` - Email open tracking
- [ ] Conditional blocks: `{{#if paid}}Thank you!{{/if}}`

**Implementation:**
- [ ] Backend: Variable replacement engine
- [ ] Frontend: Token picker dropdown in Sequence.jsx
- [ ] Live preview with sample data
- [ ] Error handling for missing variables

---

### **Phase 4: Org Member Upload & Send** 👥
**Goal:** Upload real org members and send campaigns to them

**Sub-Tasks:**

#### 4.1 CSV Upload Enhancement
```
Current: /org-members/upload exists but needs validation
Needed:
- Better CSV template download
- Field mapping UI
- Duplicate detection
- Preview before upload
```

**Tasks:**
- [ ] Download CSV template button
- [ ] Field mapper (CSV column → Contact field)
- [ ] Duplicate detection (by email)
- [ ] Preview screen showing what will be imported
- [ ] Success confirmation with contact count

#### 4.2 Create List from Uploaded Contacts
```
Flow:
1. Upload CSV → X contacts imported
2. Auto-create contact list "Uploaded [Date]"
3. Option to proceed to campaign or done
```

**Tasks:**
- [ ] Backend: Auto-create list after upload
- [ ] Frontend: "Create Campaign" button on upload success
- [ ] Link upload → campaign flow seamlessly

#### 4.3 Test with Real Data
```
Testing checklist:
- [ ] Upload 5-10 real org members
- [ ] Create campaign targeting them
- [ ] Send test email with variables
- [ ] Verify emails arrive correctly
- [ ] Check Gmail sent folder
- [ ] Verify no bounce/spam issues
```

---

## 🔮 **Future Enhancements (Post-MVP)**

### Email Analytics
- Email open tracking
- Link click tracking
- Reply detection
- Bounce handling
- Unsubscribe management

### Scheduling
- Schedule send for specific date/time
- Drip campaigns (email 1, wait 3 days, email 2)
- Follow-up sequences based on opens/clicks

### Templates
- Save/reuse email templates
- Template variables
- Template library (fundraising, events, newsletters)

### A/B Testing
- Test subject lines
- Test message content
- Automatic winner selection

### Integration
- Stripe payment links in emails
- Calendar invite attachments
- Event registration forms

---

## 🚨 **Known Issues & Tech Debt**

### Critical
- [ ] Gmail OAuth tokens expire after 1 hour (need refresh token logic)
- [ ] Campaign ID must be provided to Sequence (no auto-create fallback)
- [ ] localStorage can be cleared (need backend session storage)

### Medium
- [ ] SequenceCreator.jsx still exists (deprecated, should delete)
- [ ] CampaignSequences.jsx not integrated with new flow
- [ ] Multiple contact list pages (needs consolidation)
- [ ] No error handling for missing orgId

### Low
- [ ] Line ending warnings (LF/CRLF)
- [ ] Some deprecated routes still mounted
- [ ] Documentation spread across multiple .md files

---

## 📊 **Success Metrics**

### MVP Goals
- [ ] Send first real campaign to 10+ org members
- [ ] <2 minute end-to-end flow (campaign creation → send)
- [ ] 95%+ email delivery rate
- [ ] Variables replaced correctly in 100% of emails
- [ ] Zero Gmail API errors during send

### v2 Goals
- [ ] Support 5+ different list creation methods
- [ ] 20+ variables available for personalization
- [ ] Email analytics dashboard live
- [ ] Schedule/automation working
- [ ] Template library with 10+ templates

---

## 🛠️ **Technical Notes**

### Campaign ID Generation
```javascript
// Backend (Prisma auto-generates)
model Campaign {
  id String @id @default(cuid())
}

// Frontend stores in localStorage
localStorage.setItem('currentCampaignId', campaign.id);
localStorage.setItem('currentCampaignName', campaign.name);
```

### Contact List Types
- `smart` - Pre-configured (All Org Members, Test List)
- `selection` - User-selected from preview
- `upload` - CSV upload
- `event_attendee` - Event pipeline based
- `test` - Hardcoded test contact

### Gmail Send Flow
```
1. User clicks "Launch Campaign" in Sequence.jsx
2. Check gmailAccessToken in localStorage
3. POST /enterprise-gmail/send-sequence with:
   - sequenceId
   - contacts array [{id, firstName, email}]
   - delaySeconds
4. Backend replaces variables and sends via Gmail API
5. Frontend shows success and redirects to CampaignHome
```

---

## 📚 **Related Documentation**

- `EMAIL_CAMPAIGNS.md` - Campaign system architecture
- `AUTH.md` - Gmail OAuth setup
- `CONTACTLISTBUILD.md` - List creation architecture
- `WHERE_WE_ARE_NOW.md` - Current project status

---

**Next Session:** Start with Phase 1 testing! 🚀

