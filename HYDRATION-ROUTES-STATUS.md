# Hydration Routes Status

## ✅ WORKING ROUTES (What we actually use):

### 1. `/api/orgmembers?orgId=xxx`
- **Purpose**: Load org members with engagement data
- **Used by**: OrgMembers page, ContactListBuilder
- **Status**: ✅ WORKING
- **Data**: Members + engagement values

### 2. `/api/contact-lists?orgId=xxx` 
- **Purpose**: Get all contact lists for an org
- **Used by**: ContactListCampaignSelector
- **Status**: ✅ WORKING
- **Data**: List metadata, contact counts

### 3. `/api/campaigns?orgId=xxx`
- **Purpose**: Get all campaigns for an org  
- **Used by**: ContactListCampaignSelector, CampaignCreator
- **Status**: ✅ WORKING
- **Data**: Campaign details, linked lists

## ❌ DEPRECATED ROUTES:

### `/api/universal-hydration`
- **Status**: ❌ DELETED
- **Reason**: Over-complicated, caused crashes
- **Replaced by**: Individual routes above

### `/api/list-hydration` 
- **Status**: ❌ EXPERIMENTAL (not needed)
- **Reason**: We already have working individual routes
- **Keep**: Individual `/contact-lists` + `/campaigns` calls

## 📋 CURRENT ARCHITECTURE:

**ContactListBuilder** (`/contact-list-builder`) = CREATOR
- Uses `/api/orgmembers` to load members
- Creates NEW lists

**ContactListCampaignSelector** (`/contact-list-manager`) = HUB  
- Uses `/api/contact-lists` + `/api/campaigns` 
- Shows existing lists + campaigns
- Attach list to campaign → go to CampaignCreator

**CampaignCreator** (`/campaign-creator`) = CAMPAIGN BUILDER
- Uses `/api/campaigns` + `/api/contact-lists`
- All steps visible, preview button always shows

## 🎯 THE ANSWER:
**We DO have the routes!** `/contact-lists` and `/campaigns` work perfectly. 
No need for universal hydration - individual calls are cleaner and more reliable.
