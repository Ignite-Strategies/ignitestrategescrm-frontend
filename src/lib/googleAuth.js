// Pure Google OAuth for Gmail API access
const GOOGLE_CLIENT_ID = import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

console.log("Google Client ID from env:", GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set!");
}

// Load Google API
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi && window.gapi.auth2) {
      console.log("Google API already loaded");
      resolve(window.gapi);
      return;
    }

    console.log("Loading Google API...");
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
          resolve(window.gapi);
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

// Sign in with Google (for Gmail access)
export const signInWithGoogle = async () => {
  try {
    await loadGoogleAPI();
    
    const authInstance = window.gapi.auth2.getAuthInstance();
    
    if (!authInstance) {
      throw new Error('Google Auth2 instance not available. Please refresh the page and try again.');
    }
    
    // Force account selection and prompt for consent
    const authResult = await authInstance.signIn({
      scope: 'https://www.googleapis.com/auth/gmail.send',
      prompt: 'select_account', // Force account selection
      include_granted_scopes: true
    });
    
    const user = authResult.getBasicProfile();
    const authResponse = authResult.getAuthResponse();
    
    console.log('Auth successful for:', user.getEmail());
    console.log('Access token received:', !!authResponse.access_token);
    
    // Store the access token for Gmail API
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
    console.error('Error signing in with Google:', error);
    console.error('Error details:', error.error, error.details);
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
    
    // Clear stored tokens
    localStorage.removeItem('gmailAccessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Clear all Google auth state (for account switching)
export const clearAllGoogleAuth = async () => {
  try {
    // Sign out from Google
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
    }
    
    // Clear all stored data
    localStorage.removeItem('gmailAccessToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
    
    console.log('All Google auth state cleared');
  } catch (error) {
    console.error('Error clearing Google auth:', error);
  }
};

// Get current Gmail access token
export const getGmailAccessToken = () => {
  return localStorage.getItem('gmailAccessToken');
};

// Check if user is signed in
export const isSignedIn = () => {
  return !!localStorage.getItem('gmailAccessToken');
};
