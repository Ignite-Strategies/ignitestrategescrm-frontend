import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";

/**
 * Google OAuth for Gmail API - EMAIL SENDING ONLY
 * This is ONLY for getting Gmail access tokens to send emails
 * NOT for user login/signup!
 * 
 * For user authentication, import from '../firebase.js' instead
 */

// Google OAuth provider with Gmail scope
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');

/**
 * Sign in with Google (includes Gmail scope)
 */
export async function signInWithGoogle() {
  try {
    console.log("🔐 Signing in with Google (Gmail scope)...");
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    console.log("✅ Google sign-in successful");
    console.log("📧 Email:", user.email);
    console.log("🆔 UID:", user.uid);
    
    const accessToken = credential?.accessToken;
    
    // Store Gmail access token for API calls
    if (accessToken) {
      localStorage.setItem('gmailAccessToken', accessToken);
      localStorage.setItem('gmailEmail', user.email);
      console.log("🔑 Gmail access token stored");
    }
    
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      accessToken: accessToken
    };
  } catch (error) {
    console.error("❌ Google sign-in error:", error);
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    localStorage.removeItem('gmailAccessToken');
    localStorage.removeItem('gmailEmail');
    console.log("✅ User signed out");
  } catch (error) {
    console.error("❌ Sign out error:", error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Check if user is signed in
 */
export function isSignedIn() {
  return auth.currentUser !== null;
}

/**
 * Get Gmail access token from localStorage
 */
export function getGmailAccessToken() {
  return localStorage.getItem('gmailAccessToken');
}
