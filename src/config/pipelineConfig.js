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
export const AUDIENCE_STAGES = {
  'org_members': [
    'in_funnel',
    'general_awareness',
    'personal_invite',
    'expressed_interest',
    'rsvped',
    'paid',
    'attended'
  ],
  'friends_family': [
    'in_funnel',
    'general_awareness',
    'personal_invite',
    'expressed_interest',
    'rsvped',
    'paid',
    'attended'
  ],
  'community_partners': [
    'interested',
    'partner'
  ],
  'business_sponsor': [
    'interested',
    'sponsor'
  ],
  'champions': [
    'aware',
    'committed',
    'executing'
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
  'paid': 'Paid',
  'attended': 'Attended'
};

