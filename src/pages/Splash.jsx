import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check Firebase auth state
    const unsub = auth.onAuthStateChanged((firebaseUser) => {
      setTimeout(() => {
        if (firebaseUser) {
          console.log("✅ User authenticated, go to auth check");
          navigate("/auth/check");
        } else {
          console.log("❌ No user, go to signup");
          navigate("/signup");
        }
      }, 1800); // 1.8 seconds
    });

    return () => unsub();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-6 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative text-center space-y-8 animate-fade-in">
        {/* Party Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Confetti particles */}
            <div className="absolute -top-8 -left-8 text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</div>
            <div className="absolute -top-6 -right-8 text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</div>
            <div className="absolute -bottom-4 -left-6 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎊</div>
            
            {/* Main icon */}
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl animate-scale-in">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-6xl font-black text-white drop-shadow-2xl">
            High Impact Events
          </h1>
          <p className="text-2xl text-white/90 font-medium drop-shadow-lg">
            Create events that bring communities together
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center pt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

