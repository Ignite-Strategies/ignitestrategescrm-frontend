# Ignite CRM - Frontend

React frontend for event management CRM with kanban pipeline management and audience targeting.

## Features

- Organization & contact management
- Event creation with revenue calculator
- Drag-and-drop kanban pipeline
- Pipeline automation configuration
- Audience segmentation
- Email campaign builder
- CSV contact import
- Champion tracking with visual badges

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Axios

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs on **http://localhost:5173**

## Backend

This frontend connects to:
- **eventscrm-backend** (port 5001) - Event CRM operations
- **ignite-pay-backend** (port 5000) - Payment processing

Configure backend URLs in `vite.config.js` proxy settings.

## Environment

The proxy is configured to forward `/api` requests to `http://localhost:5001` (eventscrm-backend).

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5001',  // eventscrm-backend
    changeOrigin: true
  }
}
```

## Build

```bash
npm run build
```

Output: `dist/` folder ready for deployment.

## Deployment

Deploy to:
- **Vercel** (recommended)
- **Netlify**
- **Cloudflare Pages**
- Any static host

Set environment variable:
```
VITE_API_URL=https://your-crm-backend.com
```

## Pages

- `/org/create` - Create organization
- `/org/:orgId/users` - Manage contacts + CSV upload
- `/dashboard/:orgId` - Main dashboard
- `/event/create/:orgId` - Create event
- `/event/:eventId/pipelines` - Kanban board
- `/event/:eventId/pipeline-config` - Configure automation
- `/event/:eventId/audiences` - Select audiences
- `/engage/email/:orgId` - Email campaigns

## Key Features

### Revenue Calculator
Live calculation of tickets needed based on:
- Revenue target
- Ticket price
- Costs

### Pipeline Automation Config
Visual interface to set up:
- SOP entry triggers
- RSVP triggers
- Champion criteria

### Kanban Board
- Drag-and-drop contacts between stages
- Champion badges (⭐)
- Payment amount display
- RSVP indicators
- Filter by champions only

### CSV Upload
Upload contacts with format:
```csv
name,email,phone,tags
John Doe,john@example.com,555-1234,"f3:ao,role:sponsor"
```

## Project Structure

```
ignitestrategescrm-frontend/
├── src/
│   ├── pages/           # React pages
│   ├── lib/             # API client
│   ├── App.jsx          # Router
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Related Repos

- **eventscrm-backend** - Event CRM API
- **ignite-pay-backend** - Payment processing

## License

Proprietary
