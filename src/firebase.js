import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

/**
 * Firebase Configuration - USER AUTH ONLY
 * This is ONLY for user login/signup/session management
 * NOT for Gmail API access!
 * 
 * For Gmail OAuth (email sending), use src/lib/googleAuth.js
 */

const firebaseConfig = {
  apiKey: "AIzaSyBN2rKiMfUg4qW98r1FxsCe9CeqO6E0Vgk",
  authDomain: "high-impact-events-6d1a9.firebaseapp.com",
  projectId: "high-impact-events-6d1a9",
  storageBucket: "high-impact-events-6d1a9.firebasestorage.app",
  messagingSenderId: "878823250089",
  appId: "1:878823250089:web:f985c5dbc42286620bb1b8",
  measurementId: "G-CP6MJ8EFK9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Set persistence to keep user logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error);
});

// Google Provider for USER LOGIN (no Gmail scope)
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google - USER LOGIN ONLY
 * Use this for signup/signin pages
 * Does NOT include Gmail API scope
 */
export async function signInWithGoogle() {
  try {
    console.log("🔐 Firebase: Signing in user with Google...");
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log("✅ Firebase: User signed in");
    console.log("📧 Email:", user.email);
    console.log("🆔 UID:", user.uid);
    
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error("❌ Firebase: Sign-in error:", error);
    throw error;
  }
}

/**
 * Sign out user
 */
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("✅ Firebase: User signed out");
  } catch (error) {
    console.error("❌ Firebase: Sign out error:", error);
    throw error;
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

export default app;

