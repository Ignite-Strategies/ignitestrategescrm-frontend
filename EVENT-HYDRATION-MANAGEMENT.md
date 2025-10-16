# Event Hydration Management - SURGICAL SPECIFICATION

## 🎯 THE PROBLEM
**Event Attendees hydration is failing because we're using the wrong API endpoint.**

## 🔍 CURRENT STATE
- **Event ID**: Stored in `localStorage.getItem('event')` (set by universal hydrator)
- **Event ID Format**: `cmggljv7z0002nt28gckp1jpe` (example)
- **Current Wrong Endpoint**: `/orgs/${orgId}/attendees` ❌
- **Correct Endpoint**: `/events/${eventId}/attendees` ✅

## 📡 API ENDPOINT SPECIFICATION

### **GET /events/{eventId}/attendees**
- **Method**: GET
- **URL**: `https://eventscrm-backend.onrender.com/api/events/{eventId}/attendees`
- **Example**: `https://eventscrm-backend.onrender.com/api/events/cmggljv7z0002nt28gckp1jpe/attendees`
- **Response**: Array of EventAttendee objects
- **Status**: ✅ EXISTS (confirmed in backend)

### **GET /events/{eventId}/attendees?stage=paid**
- **Method**: GET  
- **URL**: `https://eventscrm-backend.onrender.com/api/events/{eventId}/attendees?stage=paid`
- **Example**: `https://eventscrm-backend.onrender.com/api/events/cmggljv7z0002nt28gckp1jpe/attendees?stage=paid`
- **Response**: Array of EventAttendee objects with stage=paid
- **Status**: ✅ EXISTS (confirmed in backend)

## 🏗️ IMPLEMENTATION SPECIFICATION

### **Step 1: Get Event ID from localStorage**
```javascript
const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
const eventId = cachedEvent?.id;
```

### **Step 2: Make API Call**
```javascript
const response = await api.get(`/events/${eventId}/attendees`);
const attendees = response.data || [];
```

### **Step 3: Handle Response**
```javascript
if (!attendees || attendees.length === 0) {
  console.log('⚠️ No attendees found for event:', eventId);
  return [];
}
console.log('✅ Loaded event attendees:', attendees.length);
```

## 🚨 ERROR HANDLING

### **Missing Event ID**
```javascript
if (!cachedEvent) {
  throw new Error('No event found. Please go to Events page first.');
}
```

### **API Error**
```javascript
catch (err) {
  console.error('❌ Error loading event attendees:', err);
  setError('Failed to load event attendees');
  return [];
}
```

## 📋 COMPLETE IMPLEMENTATION

### **ContactListBuilder.jsx - loadEventAttendees()**
```javascript
const loadEventAttendees = async () => {
  try {
    setLoading(true);
    setError("");
    
    console.log('📅 Loading event attendees...');
    
    // Get event ID from localStorage
    const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
    if (!cachedEvent) {
      throw new Error('No event found. Please go to Events page first.');
    }
    
    // Make API call
    const response = await api.get(`/events/${cachedEvent.id}/attendees`);
    const attendees = response.data || [];
    
    setAllAttendees(attendees);
    console.log('✅ Loaded event attendees:', attendees.length);
    
    return attendees;
    
  } catch (err) {
    console.error('❌ Error loading event attendees:', err);
    setError('Failed to load event attendees');
    return [];
  } finally {
    setLoading(false);
  }
};
```

### **ContactListView.jsx - loadContacts() for all_attendees**
```javascript
} else if (type === 'all_attendees') {
  console.log('📅 Loading event attendees...');
  const cachedEvent = JSON.parse(localStorage.getItem('event') || 'null');
  if (!cachedEvent) {
    throw new Error('No event found. Please go to Events page first.');
  }
  response = await api.get(`/events/${cachedEvent.id}/attendees`);
  setContacts(response.data || []);
  console.log('✅ Loaded event attendees:', response.data?.length || 0);
}
```

## 🎯 ROUTE VERIFICATION

### **Backend Routes (Confirmed)**
- ✅ `GET /events/:eventId/attendees` - `routes/eventAttendeeListRoute.js`
- ✅ `GET /events/:eventId/attendees?stage=paid` - Same route with query param

### **Frontend Calls**
- ✅ `api.get('/events/${eventId}/attendees')` - Event Attendees
- ✅ `api.get('/events/${eventId}/attendees?stage=paid')` - Paid Attendees

## 🔥 SURGICAL FIXES APPLIED

### **1. ContactListBuilder.jsx - loadEventAttendees()**
- ❌ **OLD**: `api.get('/orgs/${orgId}/attendees')`
- ✅ **NEW**: `api.get('/events/${cachedEvent.id}/attendees')`

### **2. ContactListBuilder.jsx - loadPaidAttendees()**
- ❌ **OLD**: `api.get('/orgs/${orgId}/attendees?stage=paid')`
- ✅ **NEW**: `api.get('/events/${cachedEvent.id}/attendees?stage=paid')`

### **3. ContactListView.jsx - all_attendees type**
- ✅ **CORRECT**: `api.get('/events/${cachedEvent.id}/attendees')`

## 🎯 FINAL SPECIFICATION

**For Event Attendees hydration:**
1. **Get Event ID**: `localStorage.getItem('event')`
2. **API Call**: `GET /events/{eventId}/attendees`
3. **Handle Response**: Array of EventAttendee objects
4. **Error Handling**: Missing event ID, API failures

**This is the definitive specification. No more guessing. No more wrong endpoints.**

---

**STATUS**: ✅ IMPLEMENTED AND DEPLOYED
**LAST UPDATED**: $(date)
**VERIFIED**: All endpoints confirmed working
