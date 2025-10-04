// Google Identity Services (GIS) implementation for Next.js
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

console.log("Google Client ID from env:", GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is not set!");
}

// Global token client instance
let tokenClient = null;

// Load Google Identity Services
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      console.log("Google Identity Services already loaded");
      resolve();
      return;
    }

    console.log("Loading Google Identity Services...");
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      console.log("Google Identity Services loaded");
      resolve();
    };
    script.onerror = (error) => {
      console.error("Failed to load Google Identity Services:", error);
      reject(error);
    };
    document.head.appendChild(script);
  });
};

// Initialize the token client once (on page load)
const initializeTokenClient = () => {
  if (tokenClient) {
    return tokenClient;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "openid email profile https://www.googleapis.com/auth/gmail.send",
    prompt: "", // try silent first, then use select_account in requestAccessToken
    callback: (response) => {
      console.log('Token response:', response);
      
      if (response.error) {
        console.error('Token error:', response.error);
        window.dispatchEvent(new CustomEvent('googleAuthError', {
          detail: response.error
        }));
        return;
      }

      // Store the access token
      localStorage.setItem('gmailAccessToken', response.access_token);
      
      // Get user info using the access token
      fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
        .then(res => res.json())
        .then(userInfo => {
          console.log('User info:', userInfo);
          
          // Store user info
          localStorage.setItem('userEmail', userInfo.email);
          localStorage.setItem('userName', userInfo.name);
          localStorage.setItem('userPhoto', userInfo.picture);
          
          // Trigger success event
          window.dispatchEvent(new CustomEvent('googleAuthSuccess', {
            detail: {
              email: userInfo.email,
              name: userInfo.name,
              photoURL: userInfo.picture,
              accessToken: response.access_token
            }
          }));
        })
        .catch(error => {
          console.error('Error fetching user info:', error);
          window.dispatchEvent(new CustomEvent('googleAuthError', {
            detail: 'Failed to fetch user info'
          }));
        });
    }
  });

  return tokenClient;
};

// Sign in with Google using GIS
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in with GIS...');
    await loadGoogleAPI();
    
    if (!window.google || !window.google.accounts) {
      throw new Error('Google Identity Services not available');
    }

    return new Promise((resolve, reject) => {
      // Initialize the token client (only once)
      const client = initializeTokenClient();
      
      // Set up success listener
      const handleSuccess = (event) => {
        window.removeEventListener('googleAuthSuccess', handleSuccess);
        window.removeEventListener('googleAuthError', handleError);
        resolve(event.detail);
      };
      
      const handleError = (event) => {
        window.removeEventListener('googleAuthSuccess', handleSuccess);
        window.removeEventListener('googleAuthError', handleError);
        reject(new Error(event.detail));
      };
      
      window.addEventListener('googleAuthSuccess', handleSuccess);
      window.addEventListener('googleAuthError', handleError);

      // Request access token with account chooser (this is the "switch account" pattern)
      console.log('Requesting access token with account chooser...');
      client.requestAccessToken({ prompt: "select_account" });
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
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

// Clear all Google auth state (only localStorage, keep GIS client)
export const clearAllGoogleAuth = async () => {
  // Only clear localStorage, don't touch the GIS client
  localStorage.removeItem('gmailAccessToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPhoto');
  console.log('Google auth localStorage cleared');
};

// Get current Gmail access token
export const getGmailAccessToken = () => {
  return localStorage.getItem('gmailAccessToken');
};

// Check if user is signed in
export const isSignedIn = () => {
  return !!localStorage.getItem('gmailAccessToken');
};