# 🏗️ System Architecture

## Overview

A full-stack event management CRM with pipeline automation, designed to help organizations target and convert event attendees through intelligent stage management.

## 🎯 Core Concept

**Master CRM + Event Overlays**
- One organization = One master contact database
- Events create overlays (memberships) without duplicating contacts
- Pipeline stages track contact progress per event
- Automation rules handle transitions automatically

## 📊 Data Model

```
┌─────────────────┐
│  Organization   │
│  (Master CRM)   │
└────────┬────────┘
         │
         │ 1:N
         ▼
    ┌─────────┐
    │ Contact │◄──────┐
    └─────────┘       │
         │            │
         │ N:M        │
         ▼            │
    ┌─────────┐       │
    │  Event  │       │
    └────┬────┘       │
         │            │
         │ 1:N        │
         ▼            │
┌────────────────────┐│
│ContactEventMember  ││
│     ship           │┘
│ (Pipeline Bridge)  │
└────────────────────┘
```

### Organization
- Holds pipeline defaults
- Holds audience defaults
- Container for all contacts

### Contact
- Lives in master CRM
- One per email per org
- Global tags (persona, role, etc.)

### Event
- Overlay on master CRM
- Can override pipeline stages
- Has automation rules
- Has revenue goals

### ContactEventMembership
- Join table (Contact ↔ Event)
- Tracks pipeline stage
- Tracks event-specific tags
- Tracks engagement & champion status

## 🔄 Pipeline Flow

```
Landing Form / CSV / QR → SOP Entry (auto)
                              ↓
                        User RSVPs → RSVP (auto)
                              ↓
                    Stripe Payment → Paid (auto)
                              ↓
                       Check-in → Attended (manual)
                              ↓
              High Engagement → Champion (auto/manual)
```

### Automation Triggers

**SOP Entry** (First Touch)
- `landing_form` - Web form submission
- `csv` - Bulk import
- `qr` - QR code scan
- `admin_add` - Manual addition

**RSVP** (Intent)
- `form_rsvp` - Checkbox on form
- `button_click` - "I'm coming" CTA

**Paid** (Treasury)
- `stripe_webhook` - Payment confirmed

**Champion** (Advocacy)
- Engagement score ≥ threshold (default: 3)
- Has qualifying tags (role:ao_q, shared_media, etc.)
- Manual override allowed

## 🎨 UX Flow

### Organization Setup
```
Create Org → Success → Upload Contacts → Dashboard
```

### Event Setup
```
Create Event → Success → Define Audiences → Configure Pipeline → Kanban
```

### Daily Operations
```
Dashboard → Event Kanban → Drag contacts → Send emails → Track progress
```

## 🛣️ Routes & Endpoints

### Organizations
```
POST   /api/orgs                        Create org
GET    /api/orgs/:orgId                 Get org
PATCH  /api/orgs/:orgId                 Update org
```

### Contacts (Master CRM)
```
POST   /api/orgs/:orgId/contacts        Upsert contact
POST   /api/orgs/:orgId/contacts/csv    Bulk CSV upload
GET    /api/orgs/:orgId/contacts        List/search contacts
```

### Events
```
POST   /api/orgs/:orgId/events          Create event
GET    /api/orgs/:orgId/events          List events
GET    /api/events/:eventId             Get event details
PATCH  /api/events/:eventId             Update event
GET    /api/events/:eventId/pipeline-config  Get pipeline config
```

### Memberships (Pipeline)
```
POST   /api/events/:eventId/memberships              Add contacts to event
POST   /api/events/:eventId/memberships/from-form    Landing form intake
PATCH  /api/memberships/:membershipId                Update stage/tags
POST   /api/memberships/:membershipId/champion       Mark champion
GET    /api/events/:eventId/memberships              List (filter by stage)
```

### Webhooks
```
POST   /api/webhooks/stripe             Stripe payment webhook
```

## 🧠 Rules Engine

### Pipeline Service (`services/pipelineService.js`)

**applyIntakeRules()**
- Called when contact enters event
- Checks automation rules
- Sets initial stage
- Adds source tags
- Checks champion criteria

**applyPaid()**
- Called from Stripe webhook
- Sets paid=true, amount
- Advances to "paid" stage
- Bumps engagement score +2

**shouldMarkChampion()**
- Evaluates engagement score
- Checks qualifying tags
- Returns true/false

**markAsChampion()**
- Manual override
- Sets champion flag
- Adds audit tag

### Event Rules Schema
```js
pipelineRules: {
  autoSopOnIntake: true,
  sopTriggers: ["landing_form", "csv", "qr", "admin_add"],
  rsvpTriggers: ["form_rsvp", "button_click"],
  paidTriggers: ["stripe_webhook"],
  championCriteria: {
    minEngagement: 3,
    tagsAny: ["role:ao_q", "role:influencer", "shared_media"],
    manualOverrideAllowed: true
  }
}
```

## 📱 Frontend Pages

### Organization Flow
- `/org/create` - Setup wizard
- `/org/success/:orgId` - Confirmation
- `/org/:orgId/users` - Contact management

### Dashboard
- `/dashboard/:orgId` - Main hub

### Event Flow
- `/event/create/:orgId` - Event wizard
- `/event/success/:eventId` - Confirmation
- `/event/:eventId/audiences` - Audience selection
- `/event/:eventId/pipeline-config` - Automation config
- `/event/:eventId/pipelines` - Kanban board

### Engagement
- `/engage/email/:orgId` - Email campaigns
- `/marketing/analytics/:orgId` - Analytics

## 🔌 Integration Points

### Stripe (Payments)
```js
// When creating Stripe Checkout Session:
metadata: {
  membershipId: membership._id  // Critical!
}

// Webhook receives this metadata
// Auto-advances membership to "paid"
```

### SendGrid (Email)
```js
// Filter recipients by stage/tags
// Compose message
// POST /api/orgs/:orgId/email/campaigns
```

### Landing Forms
```js
// POST /api/events/:eventId/memberships/from-form
{
  name: "John Doe",
  email: "john@example.com",
  phone: "555-1234",
  rsvp: true,  // triggers RSVP stage
  source: "landing_form"
}
```

## 🎯 Key Features

### 1. No Contact Duplication
- Contacts stored once in master CRM
- Memberships track event relationships
- Same contact can be in multiple events

### 2. Flexible Pipelines
- Org-level defaults
- Event-level overrides
- Configurable per event

### 3. Smart Automation
- Rule-based stage transitions
- Engagement scoring
- Champion identification

### 4. Powerful Filtering
- By stage, tags, champion status
- Cross-event analysis
- Targeted email campaigns

### 5. Revenue Tracking
- Goal calculator (tickets needed)
- Payment tracking via Stripe
- Per-event metrics

## 🔐 Security Considerations

### Current State (MVP)
- No authentication (add clerk/auth0/passport)
- No authorization (add role-based access)
- No rate limiting (add express-rate-limit)
- No input sanitization (add validator.js)

### Production Checklist
- [ ] Add user authentication
- [ ] Add org-level permissions
- [ ] Sanitize all inputs
- [ ] Add rate limiting
- [ ] Use HTTPS only
- [ ] Secure webhook endpoints
- [ ] Add CORS whitelist
- [ ] Encrypt sensitive data
- [ ] Add audit logging

## 📈 Scaling Considerations

### Database
- Add indexes on frequently queried fields
- Use MongoDB aggregation for analytics
- Consider read replicas for reporting

### API
- Add caching (Redis)
- Implement pagination
- Add request queuing for webhooks

### Frontend
- Code splitting by route
- Lazy load heavy components
- Optimize bundle size

## 🧪 Testing Strategy

### Backend
```bash
# Unit tests
- Model validation
- Service logic
- Rule engine

# Integration tests
- API endpoints
- Webhook handling
- Database operations
```

### Frontend
```bash
# Component tests
- Page rendering
- Form validation
- Drag-and-drop

# E2E tests
- Complete user flows
- Multi-event scenarios
```

## 📊 Analytics & Reporting

### Current Metrics
- Contact count
- Event count
- Revenue by event
- Champion count

### Future Metrics
- Conversion rates (stage → stage)
- Email engagement (open/click rates)
- Source attribution (ROI by channel)
- Time-to-convert (SOP → Paid)
- Lifetime value (multi-event analysis)

## 🚀 Deployment

### Backend (Options)
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

### Frontend (Options)
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

### Database
- MongoDB Atlas (recommended)
- Self-hosted MongoDB
- DocumentDB (AWS)

### Environment Variables
```env
# Production
MONGODB_URI=mongodb+srv://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
FRONTEND_URL=https://crm.yourorg.com
NODE_ENV=production
```

## 🎓 Learning Path

To understand this system:

1. **Start with Data Models** (`backend/models/`)
   - How contacts relate to events
   - Membership as join table

2. **Review Pipeline Service** (`backend/services/pipelineService.js`)
   - Automation rules
   - Champion logic

3. **Explore API Routes** (`backend/routes/`)
   - CRUD operations
   - Webhook handling

4. **Study Frontend Flow** (`frontend/src/pages/`)
   - User journey
   - State management

5. **Test Integrations**
   - Stripe webhooks
   - CSV uploads
   - Email campaigns

## 💡 Extending the System

### Add Custom Stages
```js
// Organization.js
pipelineDefaults: [
  "sop_entry",
  "qualified",      // NEW
  "rsvp",
  "paid",
  "attended",
  "champion"
]
```

### Add Custom Automation
```js
// pipelineService.js
export function applyCustomRule(membership, event) {
  if (membership.tags.includes("vip")) {
    membership.stage = "priority";
  }
  return membership;
}
```

### Add New Integrations
- Twilio (SMS campaigns)
- Mailchimp (email sync)
- Zapier (workflow automation)
- Google Sheets (reporting)

---

**This architecture is designed for growth. Start simple, scale as needed.** 🚀

