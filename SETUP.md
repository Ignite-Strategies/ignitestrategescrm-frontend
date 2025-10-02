# 🎯 Setup Instructions

## ✅ What's Been Built

Your complete CRM system is ready with:

### Backend (Express + MongoDB)
- ✅ 4 Data Models (Organization, Contact, Event, ContactEventMembership)
- ✅ 5 Route Modules (orgs, contacts, events, memberships, webhooks)
- ✅ Rules Engine (automatic pipeline transitions)
- ✅ CSV Upload Service
- ✅ Stripe Webhook Integration
- ✅ Champion Tracking Logic

### Frontend (React + Vite + Tailwind)
- ✅ 11 Complete Pages
- ✅ Organization Setup Flow
- ✅ Dashboard with Event Management
- ✅ Contact Management with CSV Upload
- ✅ Event Creation with Revenue Calculator
- ✅ Pipeline Configuration
- ✅ Kanban Board (drag-and-drop)
- ✅ Audience Selection
- ✅ Email Campaign Builder
- ✅ Analytics Placeholder

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd "C:\Users\adamc\OneDrive\Documents\2-Ignite Stragies\14-Events Tech Stack\ignitestrategescrm-frontend"
npm run install-all
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB: https://www.mongodb.com/try/download/community
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Update backend/.env with your connection string

### 3. Configure Environment

The backend/.env file needs your credentials. Update it with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ignite-crm
# OR for Atlas: mongodb+srv://username:password@cluster.mongodb.net/ignite-crm

# Optional (for full functionality):
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
FRONTEND_URL=http://localhost:5173
```

### 4. Start the Application
```bash
npm run dev
```

This starts both servers:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### 5. Open Your Browser
Navigate to: http://localhost:5173

## 📋 First Use Flow

1. **Create Organization**
   - Fill in org name, mission, website
   - Click "Create Organization"

2. **Upload Contacts** (Optional but recommended)
   - Click "Upload Contacts"
   - Use CSV format: `name,email,phone,tags`
   - Or add manually later

3. **Create Your First Event**
   - From dashboard, click "Create Event"
   - Set revenue target and ticket price
   - See automatic "tickets needed" calculation

4. **Define Audiences**
   - Select "Org Members" to add all contacts
   - Or choose specific audience segments

5. **Configure Pipeline**
   - Set automation rules for stage transitions
   - Configure champion criteria
   - Save settings

6. **Use Kanban Board**
   - Drag contacts between pipeline stages
   - Mark champions manually
   - Filter by champions only

7. **Send Email Campaign**
   - Filter by event and stage
   - Compose message
   - Send to targeted audience

## 🎨 Architecture Highlights

### Pipeline Automation
Contacts automatically advance stages based on:
- **SOP Entry**: Landing form, CSV import, QR scan, admin add
- **RSVP**: Form checkbox, button click
- **Paid**: Stripe webhook (auto)
- **Champion**: Engagement score + tags

### Champion Logic
Auto-flagged when:
- Engagement score ≥ 3 (configurable)
- Has qualifying tags (role:ao_q, role:influencer, shared_media)
- Manual override allowed

### Data Separation
- **Organization**: Master CRM container
- **Contacts**: Global contacts (one per org)
- **Events**: Overlay on master CRM
- **Memberships**: Many-to-many join (contact ↔ event)

No contact duplication! Contacts exist once in master CRM, memberships track their relationship to each event.

## 🔌 Integrations

### Stripe (Payment Tracking)
1. Get Stripe keys: https://dashboard.stripe.com/apikeys
2. Set up webhook: https://dashboard.stripe.com/webhooks
3. Point webhook to: `https://your-domain.com/api/webhooks/stripe`
4. Listen for: `checkout.session.completed`
5. Include `metadata.membershipId` in checkout sessions

### SendGrid (Email)
1. Sign up: https://sendgrid.com
2. Create API key
3. Add to backend/.env
4. Implement emailService.js (template provided in README)

## 📁 Project Structure

```
ignitestrategescrm-frontend/
├── backend/
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   └── index.js          # Express server
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── lib/          # API client
│   │   └── App.jsx       # Router
│   └── vite.config.js
├── package.json          # Root scripts
├── README.md             # Full documentation
├── QUICKSTART.md         # Quick reference
└── SETUP.md             # This file
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# Or use MongoDB Atlas cloud connection
```

### Port 5000 Already in Use
```bash
# Change PORT in backend/.env to 5001
```

### CSV Upload Not Working
- Ensure columns: `name,email,phone,tags`
- Email is required
- Tags should be comma-separated in quotes

### Kanban Drag Not Working
- Make sure memberships are loaded
- Check browser console for errors
- Verify event has contacts added

### Stripe Webhook Fails
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`
- Verify webhook secret matches .env

## 📊 Sample CSV Data

Create `sample-contacts.csv`:

```csv
name,email,phone,tags
John Smith,john@f3capital.com,555-0001,"f3:ao,role:sponsor"
Jane Doe,jane@community.org,555-0002,"role:influencer,community:leader"
Bob Wilson,bob@localbiz.com,555-0003,"role:sponsor,business:owner"
Alice Johnson,alice@example.com,555-0004,"f3:member"
Mike Brown,mike@example.com,555-0005,"role:champion,referred:5+"
```

## 🎯 Next Steps

1. **Customize Default Pipelines**
   - Edit `backend/models/Organization.js`
   - Change `pipelineDefaults` array

2. **Add More Automation Rules**
   - Edit `backend/services/pipelineService.js`
   - Add custom logic for your events

3. **Integrate Landing Forms**
   - Point form to: `POST /api/events/:eventId/memberships/from-form`
   - Include: `{ name, email, phone, rsvp: true }`

4. **Set Up QR Codes**
   - Generate QR codes with event URL
   - Track scans with `source: "qr"`

5. **Build Email Templates**
   - Create reusable templates
   - Add merge tags for personalization

## 📚 Key Files to Review

- `README.md` - Complete API documentation
- `QUICKSTART.md` - 5-minute setup guide
- `backend/models/Event.js` - Pipeline configuration schema
- `backend/services/pipelineService.js` - Automation rules
- `frontend/src/pages/event.pipelines.jsx` - Kanban implementation

## 💡 Pro Tips

1. **Use Tags Extensively**: They power filtering and automation
2. **Track Sources**: Know where contacts came from (landing, csv, qr, etc.)
3. **Engagement Scores**: Auto-calculated, drives champion logic
4. **Audit Tags**: System adds tags for every automation action
5. **Champion as Flag**: Keep it separate from stage for flexibility

## 🎉 You're Ready!

Your CRM is built and ready to go. Start by:
1. Creating your organization
2. Uploading contacts
3. Creating your first event
4. Watching the pipeline automation work!

For questions or issues, check the README.md or review the code comments.

**Now go get those event sign-ups! 🚀**

