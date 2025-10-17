# 🚨 CONTACT HYDRATION RULES - READ THIS FIRST!

## GOLDEN RULE:
**IF YOU'RE NOT USING `contactId` IN THE API CALL, YOU'RE WRONG!**

## THE ONLY WAYS TO HYDRATE CONTACTS:

### 1. Get ALL contacts by orgId:
```javascript
GET /api/contacts?orgId=cmgfvz9v10000nt284k875eoc
```

### 2. Get ONE contact by contactId:
```javascript
GET /api/contacts/:contactId
```

### 3. Get contacts with filters:
```javascript
GET /api/contacts?orgId=xxx&eventId=yyy&audienceType=zzz
```

## WRONG ENDPOINTS (DON'T USE):
- ❌ `/lists/preview` - This is for previewing lists, not hydrating contacts
- ❌ `/orgmembers` - This is legacy, use contacts
- ❌ `/eventattendees` - This is legacy, use contacts

## RIGHT ENDPOINT:
- ✅ `/contacts` - This is THE contact endpoint

## CONTACT MODEL HAS:
- `id` (contactId) - PRIMARY KEY
- `orgId` - Organization ID
- `eventId` - Event ID (optional)
- `firstName`, `lastName`, `email`
- `currentStage`, `audienceType`
- All the contact data you need

## IF YOU'RE BUILDING A CONTACT LIST:
1. Call `GET /contacts?orgId=xxx`
2. Get `response.data.contacts` array
3. Show contacts with checkboxes
4. Let user select contacts
5. Create list with selected contact IDs

**THAT'S IT. NO COMPLICATED SHIT.**
