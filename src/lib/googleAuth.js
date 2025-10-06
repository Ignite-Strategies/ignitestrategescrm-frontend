import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

// Add Gmail scopes for email sending
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

/**
 * Sign in with Google using Firebase
 */
export async function signInWithGoogle() {
  try {
    console.log("🔐 Initiating Google sign-in via Firebase...");
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    console.log("✅ Firebase auth successful");
    console.log("📧 Email:", user.email);
    console.log("🆔 UID:", user.uid);
    
    return {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      accessToken: credential?.accessToken || null
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
    localStorage.clear();
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
