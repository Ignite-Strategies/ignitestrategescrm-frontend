# 🚨 SCHEMA DEPRECATION AUDIT - FULL CLEANUP NEEDED

## ❌ DEPRECATED SCHEMA CRAP

### 1. **Backend Schema Config Route - COMPLETELY WRONG**
**File:** `eventscrm-backend/routes/schemaConfigRoute.js`

```javascript
// 🚫 THIS IS WRONG - Hardcoded stages that don't match reality
const EVENT_ATTENDEE_STAGES = [
  "in_funnel",           // ❌ DEPRECATED
  "general_awareness",   // ❌ DEPRECATED  
  "personal_invite",     // ❌ DEPRECATED
  "expressed_interest",  // ❌ DEPRECATED
  "rsvp",                // ✅ Still used
  "paid",                // ✅ Still used
  "attended",            // ✅ Still used
  "cant_attend"          // ❌ DEPRECATED
];
```

**REALITY:** Events use `['sop_entry', 'rsvp', 'paid', 'attended', 'champion']`

### 2. **Prisma Schema - Has Deprecated Fields**
**File:** `eventscrm-backend/prisma/schema.prisma`

```prisma
// ❌ DEPRECATED FIELDS IN EVENT MODEL
autoSopOnIntake       Boolean  @default(true)     // ❌ SOP terminology
sopTriggers           String[] @default(["landing_form", "csv", "qr", "admin_add"]) // ❌ SOP
```

### 3. **Frontend Components Using Wrong Schema**
- `EventPipelines.jsx` - May be deprecated component
- Hardcoded audience types instead of using event config
- Falling back to schema config instead of event pipelines

## ✅ WHAT'S ACTUALLY BEING USED

### 1. **Real Event Pipeline Stages**
```javascript
// ✅ REAL STAGES FROM YOUR EVENT
['sop_entry', 'rsvp', 'paid', 'attended', 'champion']
```

### 2. **Real Audience Types**
```javascript
// ✅ REAL AUDIENCE TYPES
['org_members', 'friends_family', 'landing_page_public', 'community_partners', 'cold_outreach']
```

## 🔥 IMMEDIATE ACTIONS NEEDED

### 1. **Update Schema Config Route**
Replace hardcoded `EVENT_ATTENDEE_STAGES` with dynamic loading from actual event data.

### 2. **Clean Prisma Schema**
Remove deprecated `sop` terminology and fields.

### 3. **Fix Frontend Components**
- Identify which pipeline component is actually being used
- Remove hardcoded stage arrays
- Always use `event.pipelines` when available

### 4. **Remove Deprecated Components**
- Find and delete any deprecated pipeline components
- Update routing to use correct components

## 🎯 THE REAL ISSUE

The schema config route is returning hardcoded stages that don't match your actual event configuration. The frontend is falling back to this wrong schema instead of using the event's actual `pipelines` array.

## 🚨 CRITICAL FIXES NEEDED

1. **Schema Config Route** - Make it dynamic or remove it entirely
2. **Event Pipeline Loading** - Always use `event.pipelines` first
3. **Component Audit** - Find the real pipeline component being used
4. **Database Schema** - Clean up deprecated `sop` fields

---

**BOTTOM LINE:** The schema is completely out of sync with reality and causing all the "sop" stage hallucinations!
