import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function GoogleOAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get service from URL params or localStorage
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    const emailParam = params.get('email');
    
    setService(serviceParam || localStorage.getItem('lastConnectedService') || 'Google');
    setEmail(emailParam || '');
  }, [location]);

  const getServiceActions = () => {
    switch(service.toLowerCase()) {
      case 'gmail':
        return [
          { label: 'Send an Email', path: '/send-email', icon: '📧' },
          { label: 'View Campaigns', path: '/campaigns', icon: '📊' },
          { label: 'Back to Settings', path: '/settings/integrations', icon: '⚙️' }
        ];
      case 'youtube':
        return [
          { label: 'Upload a Video', path: '/youtube/upload', icon: '🎬' },
          { label: 'Manage Playlists', path: '/youtube/playlists', icon: '📋' },
          { label: 'View Analytics', path: '/youtube/hub', icon: '📊' },
          { label: 'Back to Settings', path: '/settings/integrations', icon: '⚙️' }
        ];
      case 'ads':
        return [
          { label: 'Go to Google Ads Hub', path: '/googleads/home', icon: '🚀' },
          { label: 'Back to Settings', path: '/settings/integrations', icon: '⚙️' }
        ];
      default:
        return [
          { label: 'Go to Dashboard', path: '/dashboard', icon: '🏠' },
          { label: 'Back to Settings', path: '/settings/integrations', icon: '⚙️' }
        ];
    }
  };

  const actions = getServiceActions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-black text-center text-gray-900 mb-3">
          {service.toUpperCase()} Connected! 🎉
        </h1>
        
        <p className="text-center text-gray-600 mb-2">
          Your {service} account is now connected and ready to use.
        </p>
        
        {email && (
          <p className="text-center text-sm text-gray-500 mb-8">
            Connected as: <span className="font-semibold">{email}</span>
          </p>
        )}

        {/* What's Next */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What would you like to do?</h2>
          
          <div className="space-y-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition transform hover:scale-105 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <span className="font-semibold text-gray-900">{action.label}</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tip</h3>
          <p className="text-sm text-blue-800">
            {service.toLowerCase() === 'gmail' && "You can now send emails directly from the platform and track all engagement."}
            {service.toLowerCase() === 'youtube' && "Upload videos, manage playlists, and track performance all in one place."}
            {service.toLowerCase() === 'ads' && "Create and manage Google Ads campaigns right from your dashboard."}
            {!['gmail', 'youtube', 'ads'].includes(service.toLowerCase()) && "Your Google service is now integrated and ready to use."}
          </p>
        </div>
      </div>
    </div>
  );
}

