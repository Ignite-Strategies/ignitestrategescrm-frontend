# 🚨 CRITICAL: SCHEMA CONFIG RULE - NO HARDCODED VALUES

## ⚠️ THE #1 RULE - NEVER HARDCODE SCHEMA VALUES

**EVERYTHING MUST USE CONFIG ROUTES - NO EXCEPTIONS**

This is the most critical architectural principle for this application. Violating this rule leads to:
- GPT hallucinations
- Inconsistent data
- Broken pipeline management
- Maintenance nightmares
- Data model mismatches

## 📋 CONFIG ROUTES TO USE

### 1. **Universal Schema Config**
```javascript
// ✅ ALWAYS USE THIS FOR UNIVERSAL SCHEMA
const response = await api.get('/schema/event-attendee');
const { audienceTypes, stages } = response.data;
```

**Returns:**
```json
{
  "audienceTypes": [
    "org_members",
    "friends_family", 
    "landing_page_public",
    "community_partners",
    "cold_outreach"
  ],
  "stages": [
    "in_funnel",
    "general_awareness",
    "personal_invite", 
    "expressed_interest",
    "rsvp",
    "paid",
    "attended",
    "cant_attend"
  ]
}
```

### 2. **Audience-Specific Stages**
```javascript
// ✅ USE THIS FOR AUDIENCE-SPECIFIC STAGES
const response = await api.get(`/schema/audience-stages/${audienceType}`);
const { stages } = response.data;
```

### 3. **Event-Specific Pipeline Override**
```javascript
// ✅ CHECK EVENT'S CUSTOM PIPELINE FIRST
const eventResponse = await api.get(`/events/${eventId}`);
const eventPipelines = eventResponse.data.pipelines; // Array of custom stages

// Use event.pipelines if exists, otherwise fall back to schema config
const stagesToUse = eventPipelines?.length > 0 ? eventPipelines : schemaStages;
```

## ❌ WHAT NOT TO DO - NEVER HARDCODE

### ❌ WRONG - Hardcoded Arrays
```javascript
// 🚫 NEVER DO THIS
const audienceTypes = ['org_members', 'friends_family', 'landing_page_public'];
const stages = ['rsvp', 'paid', 'attended', 'cant_attend'];

// 🚫 NEVER DO THIS  
const stageProgression = {
  'rsvp': ['paid', 'attended', 'cant_attend'],
  'paid': ['attended']
};
```

### ❌ WRONG - Hardcoded Dropdown Options
```javascript
// 🚫 NEVER DO THIS
<select>
  <option value="org_members">Org Members</option>
  <option value="friends_family">Friends Family</option>
</select>
```

### ❌ WRONG - Hardcoded Pipeline Logic
```javascript
// 🚫 NEVER DO THIS
const getNextStages = (currentStage) => {
  if (currentStage === 'rsvp') return ['paid', 'attended'];
  if (currentStage === 'paid') return ['attended'];
  return [];
};
```

## ✅ CORRECT IMPLEMENTATION PATTERNS

### ✅ CORRECT - Dynamic Audience Types
```javascript
// ✅ DO THIS
const [schemaRes] = await Promise.all([
  api.get('/schema/event-attendee')
]);

const audienceTypes = schemaRes.data.audienceTypes;

return (
  <div>
    {audienceTypes.map(audienceType => (
      <button key={audienceType}>
        {audienceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </button>
    ))}
  </div>
);
```

### ✅ CORRECT - Dynamic Stage Progression
```javascript
// ✅ DO THIS
const getLogicalNextStages = (currentStage) => {
  if (!availableStages || availableStages.length === 0) return [];
  
  const currentIndex = availableStages.indexOf(currentStage);
  if (currentIndex === -1) return [];
  
  // Return all stages that come after current stage
  return availableStages.slice(currentIndex + 1);
};
```

### ✅ CORRECT - Event Pipeline Override
```javascript
// ✅ DO THIS
const loadData = async () => {
  const [eventRes, schemaRes] = await Promise.all([
    api.get(`/events/${eventId}`),
    api.get('/schema/event-attendee')
  ]);
  
  // Use event's custom pipelines if available, otherwise use schema config
  const stagesToUse = eventRes.data.pipelines?.length > 0 
    ? eventRes.data.pipelines 
    : schemaRes.data.stages;
    
  setAvailableStages(stagesToUse);
};
```

## 🔍 CODE REVIEW CHECKLIST

Before any commit, verify:

- [ ] **No hardcoded arrays** for audience types or stages
- [ ] **All dropdowns/selects** use schema config data
- [ ] **All pipeline logic** uses dynamic stage arrays
- [ ] **Event-specific overrides** check event.pipelines first
- [ ] **Fallback logic** uses schema config when no custom config
- [ ] **No magic strings** like 'rsvp', 'paid', 'attended' in logic

## 🚨 COMMON VIOLATIONS TO WATCH FOR

1. **Hardcoded stage progression maps**
2. **Hardcoded audience type arrays**  
3. **Hardcoded dropdown options**
4. **Magic strings in conditional logic**
5. **Static button generation**
6. **Fixed stage movement logic**

## 📚 BACKEND SCHEMA CONFIG LOCATIONS

- **Primary Config:** `/api/schema/event-attendee`
- **Audience Stages:** `/api/schema/audience-stages/:audienceType`
- **Legacy Routes:** `/api/schema/audience-types`, `/api/schema/audience-config`

## 🎯 IMPLEMENTATION PRIORITY

1. **First:** Always fetch schema config
2. **Second:** Check for event-specific overrides
3. **Third:** Use schema config as fallback
4. **Fourth:** Never hardcode values

## 💡 WHY THIS MATTERS

- **Consistency:** All components use same data source
- **Flexibility:** Easy to add new stages/audiences
- **Maintainability:** Changes in one place affect everything
- **Accuracy:** No GPT hallucinations about stage names
- **Scalability:** New events can have custom pipelines

---

## 🚨 REMEMBER: IF YOU SEE HARDCODED VALUES, YOU'RE DOING IT WRONG!

**Every single schema value must come from a config route. Period.**
