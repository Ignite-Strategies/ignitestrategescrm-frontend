import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Landing() {
  const navigate = useNavigate();
  const [hasRouted, setHasRouted] = useState(false);

  useEffect(() => {
    console.log("🔍 Landing - Checking Firebase auth state...");

    const timeoutId = setTimeout(() => {
      const unsub = auth.onAuthStateChanged(async (firebaseUser) => {
        console.log("🔥 Firebase auth state:", firebaseUser ? "User found" : "No user");
        
        if (!hasRouted) {
          setHasRouted(true);
          
          if (firebaseUser) {
            console.log("✅ User authenticated, routing to profile check...");
            navigate("/auth/check");
          } else {
            console.log("❌ No user, staying on landing page");
          }
        }
      });

      return () => unsub();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [navigate, hasRouted]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
              High Impact Events
            </h1>
            <p className="text-xl text-white/90 font-medium drop-shadow-md">
              Your source for creating unique events that matter
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => navigate("/signup")}
            className="w-full bg-white text-indigo-600 py-4 px-8 rounded-xl font-bold text-lg hover:bg-white/90 transition shadow-2xl"
          >
            Get Started
          </button>
          
          <button
            onClick={() => navigate("/signin")}
            className="w-full bg-white/20 backdrop-blur text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-white/30 transition border-2 border-white/40"
          >
            Sign In
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-white font-bold text-lg mb-2">Event Pipeline</h3>
            <p className="text-white/80 text-sm">Track supporters through your funnel</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-white font-bold text-lg mb-2">Smart Campaigns</h3>
            <p className="text-white/80 text-sm">Multi-channel engagement tools</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-white font-bold text-lg mb-2">Task Management</h3>
            <p className="text-white/80 text-sm">AI-powered event checklist</p>
          </div>
        </div>
      </div>
    </div>
  );
}

