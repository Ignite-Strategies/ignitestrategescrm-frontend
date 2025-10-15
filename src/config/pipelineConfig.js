/**
 * HARDCODED PIPELINE CONFIGURATION
 * Single source of truth for EventAttendee audiences and stages
 * MUST match eventscrm-backend/config/pipelineConfig.js
 */

// OFFICIAL AUDIENCES from EventAttendee.audienceType
export const OFFICIAL_AUDIENCES = [
  'org_members',
  'friends_family',
  'community_partners',
  'business_sponsor',
  'champions'
];

// AUDIENCE-SPECIFIC STAGES
// Each audience type has its own pipeline stages
// FOLLOW-UP STAGES: Every action stage has a follow-up (rsvped → thanked, paid → thanked_paid, attended → followed_up)
export const AUDIENCE_STAGES = {
  'org_members': [
    'in_funnel',
    'general_awareness',
    'personal_invite',
    'expressed_interest',
    'rsvped',
    'thanked',          // Follow-up after RSVP
    'paid',
    'thanked_paid',     // Follow-up after payment
    'attended',
    'followed_up'       // Follow-up after attendance
  ],
  'friends_family': [
    'in_funnel',
    'general_awareness',
    'personal_invite',
    'expressed_interest',
    'rsvped',
    'thanked',          // Follow-up after RSVP
    'paid',
    'thanked_paid',     // Follow-up after payment
    'attended',
    'followed_up'       // Follow-up after attendance
  ],
  'community_partners': [
    'interested',
    'contacted',        // Follow-up after interest
    'partner',
    'thanked',          // Follow-up after partnership
    'recognized'        // Public recognition/social media
  ],
  'business_sponsor': [
    'interested',
    'contacted',        // Follow-up after interest
    'sponsor',
    'thanked',          // Follow-up after sponsorship
    'recognized'        // Public recognition/social media
  ],
  'champions': [
    'aware',
    'contacted',        // Follow-up after awareness
    'committed',
    'thanked',          // Follow-up after commitment
    'executing',
    'recognized'        // Follow-up after execution
  ]
};

// Get stages for specific audience
export const getStagesForAudience = (audienceType) => {
  return AUDIENCE_STAGES[audienceType] || [];
};

// Display names for audiences
export const AUDIENCE_DISPLAY_NAMES = {
  'org_members': 'Org Members',
  'friends_family': 'Friends & Family',
  'community_partners': 'Community Partners',
  'business_sponsor': 'Business Sponsors',
  'champions': 'Champions'
};

// Display names for stages
export const STAGE_DISPLAY_NAMES = {
  'in_funnel': 'In Funnel',
  'general_awareness': 'General Awareness',
  'personal_invite': 'Personal Invite',
  'expressed_interest': 'Expressed Interest',
  'rsvped': 'RSVPed',
  'thanked': 'Thanked',
  'paid': 'Paid',
  'thanked_paid': 'Thanked (Paid)',
  'attended': 'Attended',
  'followed_up': 'Followed Up',
  'interested': 'Interested',
  'contacted': 'Contacted',
  'partner': 'Partner',
  'sponsor': 'Sponsor',
  'aware': 'Aware',
  'committed': 'Committed',
  'executing': 'Executing',
  'recognized': 'Recognized'
};

