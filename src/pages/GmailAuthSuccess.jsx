import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function GmailAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('gmailEmail');

  useEffect(() => {
    // Auto-redirect to campaign home after 3 seconds
    const timer = setTimeout(() => {
      navigate("/campaignhome");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center space-y-8 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Gmail Connected! 🎉
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold">{email}</span>
            </div>
            <p className="text-sm text-green-600">
              Your Gmail account is now connected and ready to send emails!
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>✨ You're all set!</strong>
              <br />
              Your Gmail connection is persistent and will never expire. You can now send campaigns and emails without re-authenticating.
            </p>
          </div>

          <div className="text-sm text-gray-500 pt-4">
            Redirecting to Campaign Home in a few seconds...
          </div>

          <button
            onClick={() => navigate("/campaignhome")}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            Go to Campaigns Now →
          </button>
        </div>
      </div>
    </div>
  );
}

