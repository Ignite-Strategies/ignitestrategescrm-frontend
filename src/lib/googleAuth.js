/**
 * 🧭 Unified Google OAuth (Frontend)
 * Handles Gmail, YouTube, Google Ads API access via unified backend
 * NOT for user login/signup - that's firebase.js!
 */

/**
 * 🚀 Initiate OAuth for any Google service
 * @param {string} service - 'gmail', 'youtube', 'ads'
 * @param {string} orgId - Organization ID
 * @param {string} adminId - Admin ID
 */
export function initiateGoogleOAuth(service, orgId, adminId) {
  if (!service || !orgId || !adminId) {
    throw new Error('service, orgId, and adminId are required');
  }
  
  const validServices = ['gmail', 'youtube', 'ads'];
  if (!validServices.includes(service)) {
    throw new Error(`Invalid service: ${service}. Valid services: ${validServices.join(', ')}`);
  }
  
  const API_URL = import.meta.env.PROD 
    ? 'https://eventscrm-backend.onrender.com'
    : 'http://localhost:5001';
  
  console.log(`🧭 Initiating ${service.toUpperCase()} OAuth...`, { orgId, adminId });
  
  // Redirect to unified OAuth endpoint
  window.location.href = `${API_URL}/api/google-oauth/auth?service=${service}&orgId=${orgId}&adminId=${adminId}`;
}

/**
 * 📧 Gmail OAuth (convenience function)
 */
export function connectGmail(orgId, adminId) {
  return initiateGoogleOAuth('gmail', orgId, adminId);
}

/**
 * 📺 YouTube OAuth (convenience function)
 */
export function connectYouTube(orgId, adminId) {
  return initiateGoogleOAuth('youtube', orgId, adminId);
}

/**
 * 📊 Google Ads OAuth (convenience function)
 */
export function connectGoogleAds(orgId, adminId) {
  return initiateGoogleOAuth('ads', orgId, adminId);
}

/**
 * 🔍 Check if service is connected
 * @param {string} service - 'gmail', 'youtube', 'ads'
 * @param {string} orgId - Organization ID
 * @param {string} adminId - Admin ID
 */
export async function isServiceConnected(service, orgId, adminId) {
  try {
    const API_URL = import.meta.env.PROD 
      ? 'https://eventscrm-backend.onrender.com'
      : 'http://localhost:5001';
    
    const response = await fetch(`${API_URL}/api/google-oauth/status?service=${service}&orgId=${orgId}&adminId=${adminId}`);
    const data = await response.json();
    
    return data.connected || false;
  } catch (error) {
    console.error(`❌ Error checking ${service} connection:`, error);
    return false;
  }
}

/**
 * 📧 Check if Gmail is connected (convenience function)
 */
export async function isGmailConnected(orgId, adminId) {
  return isServiceConnected('gmail', orgId, adminId);
}

/**
 * 📺 Check if YouTube is connected (convenience function)
 */
export async function isYouTubeConnected(orgId, adminId) {
  return isServiceConnected('youtube', orgId, adminId);
}

/**
 * 📊 Check if Google Ads is connected (convenience function)
 */
export async function isGoogleAdsConnected(orgId, adminId) {
  return isServiceConnected('ads', orgId, adminId);
}

/**
 * 🔌 Disconnect a service
 * @param {string} service - 'gmail', 'youtube', 'ads'
 * @param {string} orgId - Organization ID
 * @param {string} adminId - Admin ID
 */
export async function disconnectService(service, orgId, adminId) {
  try {
    const API_URL = import.meta.env.PROD 
      ? 'https://eventscrm-backend.onrender.com'
      : 'http://localhost:5001';
    
    const response = await fetch(`${API_URL}/api/google-oauth/disconnect`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ service, orgId, adminId })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${service.toUpperCase()} disconnected successfully`);
      return true;
    } else {
      throw new Error(data.error || `Failed to disconnect ${service}`);
    }
  } catch (error) {
    console.error(`❌ Error disconnecting ${service}:`, error);
    throw error;
  }
}

/**
 * 📧 Disconnect Gmail (convenience function)
 */
export async function disconnectGmail(orgId, adminId) {
  return disconnectService('gmail', orgId, adminId);
}

/**
 * 📺 Disconnect YouTube (convenience function)
 */
export async function disconnectYouTube(orgId, adminId) {
  return disconnectService('youtube', orgId, adminId);
}

/**
 * 📊 Disconnect Google Ads (convenience function)
 */
export async function disconnectGoogleAds(orgId, adminId) {
  return disconnectService('ads', orgId, adminId);
}
