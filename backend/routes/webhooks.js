import express from 'express';
import Stripe from 'stripe';
import ContactEventMembership from '../models/ContactEventMembership.js';
import { applyPaid } from '../services/pipelineService.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract membership ID from metadata
      const membershipId = session.metadata?.membershipId;
      if (!membershipId) {
        console.warn('No membershipId in webhook metadata');
        return res.json({ received: true });
      }
      
      // Update membership
      let membership = await ContactEventMembership.findById(membershipId);
      if (membership) {
        const amount = session.amount_total / 100; // Convert from cents
        membership = applyPaid(membership, amount);
        await membership.save();
        
        console.log(`Membership ${membershipId} marked as paid: $${amount}`);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

