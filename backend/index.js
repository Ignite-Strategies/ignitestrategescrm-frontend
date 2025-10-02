import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import orgsRouter from './routes/orgs.js';
import contactsRouter from './routes/contacts.js';
import eventsRouter from './routes/events.js';
import membershipsRouter from './routes/memberships.js';
import webhooksRouter from './routes/webhooks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Webhook routes MUST come before express.json() middleware
app.use('/api/webhooks', webhooksRouter);

// Regular JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ignite-crm')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/orgs', orgsRouter);
app.use('/api/orgs', contactsRouter); // Nested under orgs
app.use('/api/orgs', eventsRouter);   // Event creation nested under orgs
app.use('/api/events', eventsRouter); // Event operations
app.use('/api/events', membershipsRouter);
app.use('/api/memberships', membershipsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

