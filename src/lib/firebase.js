// Simple Google OAuth for Gmail API access
const GOOGLE_CLIENT_ID = import.meta.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "156240197681-29v1fodqm59f3igas7j9np989q3shbc6.apps.googleusercontent.com";

console.log("Google Client ID:", GOOGLE_CLIENT_ID);

// Load Google API
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
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
    const authResult = await authInstance.signIn({
      scope: 'https://www.googleapis.com/auth/gmail.send'
    });
    
    const user = authResult.getBasicProfile();
    const authResponse = authResult.getAuthResponse();
    
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
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    if (window.gapi && window.gapi.auth2) {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
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

// Get current Gmail access token
export const getGmailAccessToken = () => {
  return localStorage.getItem('gmailAccessToken');
};

// Check if user is signed in
export const isSignedIn = () => {
  return !!localStorage.getItem('gmailAccessToken');
};
