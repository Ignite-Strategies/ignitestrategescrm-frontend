import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebase";
import api from "../lib/api";

export default function Signup() {
  const navigate = useNavigate();
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignUp = async () => {
    if (isSigningUp) return;
    
    setIsSigningUp(true);
    try {
      console.log("🚀 Starting signup with Google...");
      const result = await signInWithGoogle();
      
      console.log("✅ Google sign-in successful:", result.email);
      
      // Call backend findOrCreate
      const firstName = result.name?.split(' ')[0] || '';
      const lastName = result.name?.split(' ').slice(1).join(' ') || '';
      
      const res = await api.post("/auth/findOrCreate", {
        firebaseId: result.uid,
        email: result.email,
        firstName,
        lastName,
        photoURL: result.photoURL
      });
      
      const orgMember = res.data;
      console.log("✅ OrgMember:", orgMember.id);
      console.log("🔍 DEBUG: Firebase result:", result);
      console.log("🔍 DEBUG: Backend orgMember:", orgMember);
      console.log("🔍 DEBUG: Firebase email:", result.email);
      console.log("🔍 DEBUG: Backend email:", orgMember.email);
      
      // Store auth data - use Firebase email as fallback!
      localStorage.setItem("firebaseId", result.uid);
      localStorage.setItem("orgMemberId", orgMember.id);
      localStorage.setItem("email", orgMember.email || result.email); // Firebase email fallback!
      
      // NEW USER → Profile setup FIRST!
      console.log("✅ New user → Profile setup");
      navigate("/profile-setup");
      
    } catch (error) {
      console.error("❌ Signup failed:", error);
      alert("Signup failed. Please try again.");
    } finally {
      setIsSigningUp(false);
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
            Welcome to EngageSmart!
          </h1>
          <p className="text-gray-600 text-lg">
            How would you like to get started?
          </p>
        </div>

        {/* Fork: Set Up Org vs Join Org */}
        <div className="space-y-4">
          <button
            onClick={handleSignUp}
            disabled={isSigningUp}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🚀</span>
            <div className="text-left flex-1">
              <div className="font-bold">Set Up Your Organization</div>
              <div className="text-xs text-white/80">I'm starting fresh - create new org</div>
            </div>
          </button>

          <button
            onClick={handleSignUp}
            disabled={isSigningUp}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">👥</span>
            <div className="text-left flex-1">
              <div className="font-bold">Join an Existing Organization</div>
              <div className="text-xs text-gray-500">I have an invite code or email</div>
            </div>
          </button>
        </div>

        {/* Already have account */}
        <p className="text-gray-600 text-sm">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

