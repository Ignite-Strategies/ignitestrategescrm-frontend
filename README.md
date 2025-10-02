# Ignite CRM - Event Management System

A comprehensive CRM system designed specifically for event management with pipeline automation, audience targeting, and champion tracking.

## 🚀 Features

- **Master CRM**: Centralized contact management at the organization level
- **Event Pipelines**: Kanban-style pipeline management with customizable stages
- **Rules Engine**: Automatic stage transitions based on user actions
- **Champion Tracking**: Identify and track high-engagement advocates
- **Audience Segmentation**: Target specific groups for each event
- **CSV Import**: Bulk upload contacts via CSV
- **Email Campaigns**: Send targeted emails to pipeline segments
- **Revenue Calculator**: Track ticket sales goals and progress
- **Stripe Integration**: Automatic payment tracking via webhooks

## 📋 Pipeline Stages

Default pipeline stages (customizable per event):
- **SOP Entry**: First touch / ingestion success
- **RSVP**: Expressed intent to attend
- **Paid**: Treasury truth (payment confirmed)
- **Attended**: Post-event reconciliation
- **Champion**: Advocacy lane (high engagement)

## 🛠️ Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Stripe (payments)
- CSV parsing
- SendGrid/Nodemailer (email)

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Setup

1. **Install dependencies**
```bash
npm run install-all
```

2. **Configure Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ignite-crm
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
FRONTEND_URL=http://localhost:5173
```

3. **Start Development**
```bash
# From root directory
npm run dev
```

This runs both:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## 🔄 UX Flow

### Organization Setup
1. Create Organization → Upload Contacts → Dashboard

### Event Setup
1. **Create Event** - Set name, date, location, revenue goals
2. **Define Audiences** - Select target groups (org members, partners, etc.)
3. **Configure Pipeline** - Set automation rules
4. **Kanban Management** - Drag contacts through pipeline stages
5. **Email Campaign** - Send targeted messages

## 🤖 Automation Rules

### SOP Entry
Auto-mark contacts as "SOP Entry" when they:
- Fill out landing form
- Are imported via CSV
- Scan QR code
- Added by admin

### RSVP
Auto-advance to RSVP when:
- Form checkbox selected
- "I'm coming" button clicked

### Paid
Auto-advance on Stripe webhook confirmation

### Champion
Auto-flag when:
- Engagement score ≥ threshold (default: 3)
- Has qualifying tags (role:ao_q, shared_media, etc.)
- Manual override allowed

## 📡 API Endpoints

### Organizations
- `POST /api/orgs` - Create organization
- `GET /api/orgs/:orgId` - Get organization
- `PATCH /api/orgs/:orgId` - Update organization

### Contacts
- `POST /api/orgs/:orgId/contacts` - Upsert contact
- `POST /api/orgs/:orgId/contacts/csv` - Bulk CSV upload
- `GET /api/orgs/:orgId/contacts` - List contacts (search, filter)

### Events
- `POST /api/orgs/:orgId/events` - Create event
- `GET /api/orgs/:orgId/events` - List events
- `GET /api/events/:eventId` - Get event
- `PATCH /api/events/:eventId` - Update event
- `GET /api/events/:eventId/pipeline-config` - Get pipeline config

### Memberships
- `POST /api/events/:eventId/memberships` - Add contacts to event
- `POST /api/events/:eventId/memberships/from-form` - Landing form intake
- `PATCH /api/memberships/:membershipId` - Update stage/tags
- `POST /api/memberships/:membershipId/champion` - Mark as champion
- `GET /api/events/:eventId/memberships` - List memberships (filter by stage)

### Webhooks
- `POST /api/webhooks/stripe` - Stripe payment webhook

## 🎨 Frontend Pages

- `/org/create` - Organization setup
- `/org/success/:orgId` - Setup confirmation
- `/org/:orgId/users` - Contact management
- `/dashboard/:orgId` - Main dashboard
- `/event/create/:orgId` - Create event
- `/event/success/:eventId` - Event creation success
- `/event/:eventId/audiences` - Define audiences
- `/event/:eventId/pipeline-config` - Configure automation
- `/event/:eventId/pipelines` - Kanban board
- `/engage/email/:orgId` - Email campaigns
- `/marketing/analytics/:orgId` - Analytics (placeholder)

## 📊 Data Models

### Organization
```js
{
  name, mission, website, socials, address,
  pipelineDefaults: ["sop_entry", "rsvp", "paid", "attended", "champion"],
  audienceDefaults: ["org_members", "friends_family", ...]
}
```

### Contact
```js
{
  orgId, name, email, phone, tags: []
}
```

### Event
```js
{
  orgId, name, slug, date, location,
  pipelines: [], // override org defaults
  pipelineRules: { /* automation config */ },
  goals: { revenueTarget, ticketPrice, costs }
}
```

### ContactEventMembership
```js
{
  orgId, eventId, contactId,
  stage, tags, source,
  rsvp, paid, amount,
  champion, engagementScore
}
```

## 🔌 Stripe Integration

1. Create Stripe Checkout Session with `metadata.membershipId`
2. Webhook triggers on `checkout.session.completed`
3. System auto-advances membership to "paid" stage
4. Records amount and updates engagement score

## 📧 Email Integration

Currently uses console logging. To integrate with SendGrid:

```js
// backend/services/emailService.js
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendCampaign(recipients, subject, message) {
  await sgMail.send({
    to: recipients.map(r => r.contactId.email),
    from: 'events@yourorg.com',
    subject,
    text: message
  });
}
```

## 🚧 Future Enhancements

- [ ] Google Analytics integration
- [ ] UTM tracking
- [ ] Advanced email templates
- [ ] SMS campaigns
- [ ] QR code check-in
- [ ] Event analytics dashboard
- [ ] Multi-user permissions
- [ ] Audit logs

## 📝 CSV Format

Upload contacts with these columns:

```csv
name,email,phone,tags
John Doe,john@example.com,555-1234,"f3:ao,role:sponsor"
Jane Smith,jane@example.com,555-5678,"community:leader"
```

## 🤝 Contributing

This is a custom CRM built for event management. For questions or support, contact the development team.

## 📄 License

Proprietary - All rights reserved

