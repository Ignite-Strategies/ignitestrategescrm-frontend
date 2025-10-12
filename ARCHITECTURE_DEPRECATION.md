# 🚨 CRITICAL ARCHITECTURE DEPRECATION - NEVER FORGET!

## ❌ DEPRECATED - DO NOT USE

### **EventPipelines.jsx - COMPLETELY DELETED**
- **DELETED:** `src/pages/EventPipelines.jsx` 
- **REASON:** Moved to EventAttendee model architecture
- **DATE DELETED:** 2024-01-XX
- **NEVER USE AGAIN:** EventPipeline components

### **Event Pipeline Model - DEPRECATED**
- **OLD:** `event.pipelines` array
- **NEW:** `EventAttendee.currentStage` per contact
- **OLD:** Pipeline stage management through events
- **NEW:** Modular audience + currentStage approach

## ✅ NEW ARCHITECTURE - USE THIS

### **EventAttendee Model - SOURCE OF TRUTH**
```javascript
// ✅ THIS IS THE NEW WAY
EventAttendee {
  currentStage: "rsvp" | "paid" | "attended" | "champion"
  audienceType: "org_members" | "friends_family" | etc.
  contactId: string
  eventId: string
}
```

### **Pipeline Management**
- **OLD:** Event-centric pipeline stages
- **NEW:** Contact-centric stage tracking via EventAttendee
- **OLD:** `event.pipelines` array
- **NEW:** `EventAttendee.currentStage` field

### **Audience Management**
- **MODULAR:** Each contact has `audienceType` + `currentStage`
- **FLEXIBLE:** No hardcoded pipeline stages
- **DYNAMIC:** Stages determined by EventAttendee data

## 🚨 CRITICAL RULES

1. **NEVER** use EventPipeline components
2. **ALWAYS** use EventAttendee model
3. **NEVER** use `event.pipelines` arrays
4. **ALWAYS** use `EventAttendee.currentStage`
5. **MODULAR** approach: audience + stage per contact

## 🔥 WHAT CAUSED THE CHAOS

- Frontend was using deprecated EventPipelines.jsx
- Backend had hardcoded schema stages
- Event.pipelines arrays were deprecated but still being used
- EventAttendee model was the new truth but not being used

## ✅ THE SOLUTION

- **DELETED:** EventPipelines.jsx completely
- **USE:** EventAttendee.currentStage for all stage management
- **USE:** Modular audience + stage approach
- **FORGET:** Event pipeline arrays ever existed

---

## 🚨 MEMORY IMPRINT: EventPipelines.jsx = DELETED FOREVER!

**If you see EventPipeline mentioned anywhere, it's WRONG!**
**EventAttendee.currentStage is the ONLY way to manage stages!**
