// Clean Google OAuth implementation
const GOOGLE_CLIENT_ID = import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

console.log("Google Client ID from env:", GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set!");
}

// Completely fresh Google API load
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    // Nuke any existing Google API state
    if (window.gapi) {
      delete window.gapi;
    }
    
    // Remove any existing Google API scripts
    const existingScripts = document.querySelectorAll('script[src*="apis.google.com"]');
    existingScripts.forEach(script => script.remove());
    
    console.log("Loading fresh Google API...");
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      console.log("Google API script loaded");
      window.gapi.load('auth2', () => {
        console.log("Google Auth2 loaded, initializing...");
        window.gapi.auth2.init({
          client_id: GOOGLE_CLIENT_ID
        }).then(() => {
          console.log("Google Auth2 initialized successfully");
          resolve();
        }).catch((error) => {
          console.error("Google Auth2 init error:", error);
          reject(error);
        });
      });
    };
    script.onerror = (error) => {
      console.error("Failed to load Google API script:", error);
      reject(error);
    };
    document.head.appendChild(script);
  });
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Starting fresh Google sign-in...');
    await loadGoogleAPI();
    
    const authInstance = window.gapi.auth2.getAuthInstance();
    console.log('Auth instance:', authInstance);
    
    if (!authInstance) {
      throw new Error('Auth instance not available');
    }
    
    const authResult = await authInstance.signIn({
      scope: 'https://www.googleapis.com/auth/gmail.send',
      prompt: 'select_account'
    });
    
    const user = authResult.getBasicProfile();
    const authResponse = authResult.getAuthResponse();
    
    console.log('Auth successful for:', user.getEmail());
    
    // Store tokens
    localStorage.setItem('gmailAccessToken', authResponse.access_token);
    localStorage.setItem('userEmail', user.getEmail());
    localStorage.setItem('userName', user.getName());
    localStorage.setItem('userPhoto', user.getImageUrl());
    
    return {
      email: user.getEmail(),
      name: user.getName(),
      photoURL: user.getImageUrl(),
      accessToken: authResponse.access_token
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
    }
  } catch (error) {
    console.error('Sign out error:', error);
  }
  
  // Clear all stored data
  localStorage.removeItem('gmailAccessToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhoto');
};

// Clear all Google auth state
export const clearAllGoogleAuth = async () => {
  await signOutUser();
  console.log('All Google auth state cleared');
};

// Get current Gmail access token
export const getGmailAccessToken = () => {
  return localStorage.getItem('gmailAccessToken');
};

// Check if user is signed in
export const isSignedIn = () => {
  return !!localStorage.getItem('gmailAccessToken');
};