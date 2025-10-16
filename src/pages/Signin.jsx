import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import api from "../lib/api";

export default function Signin() {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showApprovalCode, setShowApprovalCode] = useState(false);
  const [approvalCode, setApprovalCode] = useState("");

  const handleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      console.log("🚀 Starting sign-in with Google...");
      const result = await signInWithGoogle();
      
      console.log("✅ Google sign-in successful:", result.email);
      
      // Call backend findOrCreate (will find existing user)
      const res = await api.post("/auth/findOrCreate", {
        firebaseId: result.uid,
        email: result.email,
        firstName: result.name?.split(' ')[0] || '',
        lastName: result.name?.split(' ').slice(1).join(' ') || '',
        photoURL: result.photoURL
      });
      
      const orgMember = res.data;
      console.log("✅ User found:", orgMember.id);
      
      // Store auth data
      localStorage.setItem("firebaseId", result.uid);
      localStorage.setItem("orgMemberId", orgMember.id);
      localStorage.setItem("email", orgMember.email);
      
      // Check if user has orgId (existing user) or needs setup (new user)
      if (orgMember.orgId) {
        console.log("✅ Existing user with org → Welcome");
        navigate("/welcome");
      } else {
        console.log("✅ New user without org → Auto-assign to F3 Capital");
        // Auto-assign to F3 Capital org (you can change this)
        try {
          await api.patch(`/orgmembers/${orgMember.id}`, {
            orgId: "cmgfvz9v10000nt284k875eoc" // F3 Capital org ID
          });
          console.log("✅ Auto-assigned to F3 Capital");
          navigate("/welcome");
        } catch (assignError) {
          console.error("❌ Auto-assign failed:", assignError);
          // Fallback to signup
          navigate("/signup");
        }
      }
      
    } catch (error) {
      console.error("❌ Sign-in failed:", error);
      
      // If it's a 404 or user not found, show approval code
      if (error.response?.status === 404 || error.message.includes('not found')) {
        setShowApprovalCode(true);
        alert("New user detected! Enter approval code to continue.");
      } else {
        alert("Sign-in failed. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleApprovalCode = () => {
    // Simple approval code - you can change this
    if (approvalCode === "LETMEIN" || approvalCode === "1234") {
      alert("Approved! You can now sign in.");
      setShowApprovalCode(false);
      setApprovalCode("");
      // Try sign in again
      handleSignIn();
    } else {
      alert("Invalid approval code. Try: LETMEIN or 1234");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-8 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* Logo */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-gray-600 text-lg">
            Sign in to manage your events
          </p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSigningIn ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Approval Code Section */}
        {showApprovalCode && (
          <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Approval Required</h3>
            <p className="text-sm text-yellow-700">
              New user detected. Enter approval code to continue.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={approvalCode}
                onChange={(e) => setApprovalCode(e.target.value)}
                placeholder="Enter approval code"
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
              <button
                onClick={handleApprovalCode}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition"
              >
                Approve & Continue
              </button>
            </div>
            <p className="text-xs text-yellow-600">
              Try: LETMEIN or 1234
            </p>
          </div>
        )}

        {/* New user link */}
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

