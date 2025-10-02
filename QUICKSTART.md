# 🚀 Quick Start Guide

Get your CRM up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm run install-all
```

This installs packages for root, backend, and frontend.

## Step 2: Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Make sure MongoDB is running locally
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free cluster at https://mongodb.com/atlas
2. Get connection string
3. Use it in backend/.env

## Step 3: Configure Backend

```bash
cd backend
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ignite-crm
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SENDGRID_API_KEY=your_sendgrid_key
FRONTEND_URL=http://localhost:5173
```

**For now, you can start without Stripe/SendGrid:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ignite-crm
FRONTEND_URL=http://localhost:5173
```

## Step 4: Start the App

From the **root directory**:
```bash
npm run dev
```

This starts:
- ✅ Backend on http://localhost:5000
- ✅ Frontend on http://localhost:5173

## Step 5: Use the App!

1. **Open** http://localhost:5173
2. **Create Organization** - Fill in your org details
3. **Upload Contacts** - Use CSV or add manually
4. **Create Event** - Set goals and revenue targets
5. **Configure Pipeline** - Set automation rules
6. **Kanban View** - Drag contacts through stages!

## 📝 Sample CSV for Testing

Create `test-contacts.csv`:
```csv
name,email,phone,tags
John Doe,john@example.com,555-1234,"f3:ao,role:sponsor"
Jane Smith,jane@example.com,555-5678,"community:leader"
Bob Wilson,bob@example.com,555-9999,"role:influencer"
```

Upload via: Dashboard → Manage Contacts → Upload CSV

## 🔧 Common Issues

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ignite-crm
```

### Port Already in Use
```bash
# Change ports in backend/.env and frontend/vite.config.js
PORT=5001  # backend
# vite.config.js: server.port: 5174  # frontend
```

### CORS Issues
Make sure `FRONTEND_URL` in backend/.env matches your frontend URL

## 🎯 Next Steps

1. **Add Stripe** for payment tracking
   - Get keys from https://dashboard.stripe.com
   - Set up webhook endpoint
   - Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`

2. **Add Email** for campaigns
   - Sign up at https://sendgrid.com
   - Get API key
   - Add `SENDGRID_API_KEY`

3. **Customize Pipelines**
   - Edit default stages in Organization model
   - Configure per-event rules
   - Set up champion criteria

## 📚 Key Concepts

### Master CRM
- One organization = one master contact database
- Contacts belong to org, not individual events

### Event Pipelines
- Events overlay on master CRM
- ContactEventMembership = many-to-many join table
- Drag contacts through stages without duplicating data

### Rules Engine
- Auto-advance stages based on actions
- Track engagement scores
- Flag champions automatically

### Champion Tracking
- Can be a stage OR a flag (or both!)
- Based on engagement score + tags
- Manual override allowed

## 🎨 UX Flow Example

```
1. Create Org "F3 Capital"
   ↓
2. Upload 100 contacts via CSV
   ↓
3. Create Event "Bros & Brews 2025"
   - Revenue target: $10,000
   - Ticket price: $50
   - Costs: $2,000
   - System shows: "You need 160 tickets"
   ↓
4. Define Audiences
   - Select "Org Members" (adds all 100 contacts)
   ↓
5. Configure Pipeline
   - Auto SOP Entry on: landing_form, csv
   - Auto RSVP on: form_rsvp
   - Champion score: 3+
   ↓
6. Kanban View
   - See all 100 contacts in "SOP Entry"
   - Drag to RSVP as they respond
   - Auto-advance to Paid when Stripe webhook fires
   - See ⭐ on champions
   ↓
7. Email Campaign
   - Filter: RSVP'd but not Paid
   - Compose: "Don't forget to complete registration!"
   - Send to 25 recipients
```

## 🔥 Pro Tips

- **Tags are powerful**: Use them for segmentation (f3:ao, role:sponsor, etc.)
- **Engagement scores**: Auto-bump on actions (paid +2, attended +1)
- **Audit tags**: System adds tags like `rule:auto_paid@2025-10-02`
- **Champion flag**: Independent of stage - can be paid AND champion
- **Source tracking**: Every membership tracks where they came from

## 🆘 Need Help?

Check the main README.md for:
- Complete API documentation
- Data model schemas
- Integration guides
- Feature roadmap

---

**Now go crush those event signups! 🎉**

