import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function SettingsIntegrations() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const adminId = localStorage.getItem('adminId');
  
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState({
    gmail: { connected: false, email: null, loading: true },
    youtube: { connected: false, channel: null, loading: true },
    googleAds: { connected: false, account: null, loading: true },
    meta: { connected: false, page: null, loading: true }
  });

  useEffect(() => {
    loadIntegrationStatuses();
  }, [orgId, adminId]);

  const loadIntegrationStatuses = async () => {
    setLoading(true);
    
    // Load Gmail status
    try {
      const gmailResponse = await api.get(`/gmail-oauth/status?orgId=${orgId}&adminId=${adminId}`);
      setIntegrations(prev => ({
        ...prev,
        gmail: {
          connected: gmailResponse.data.connected,
          email: gmailResponse.data.email,
          connectedAt: gmailResponse.data.connectedAt,
          loading: false
        }
      }));
    } catch (error) {
      console.error('Error loading Gmail status:', error);
      setIntegrations(prev => ({
        ...prev,
        gmail: { connected: false, email: null, loading: false }
      }));
    }
    
    // TODO: Load YouTube, Google Ads, Meta statuses
    // For now, just mark as not loading
    setIntegrations(prev => ({
      ...prev,
      youtube: { ...prev.youtube, loading: false },
      googleAds: { ...prev.googleAds, loading: false },
      meta: { ...prev.meta, loading: false }
    }));
    
    setLoading(false);
  };

  const handleConnectGmail = () => {
    if (!orgId || !adminId) {
      alert('⚠️ Missing organization or admin information. Please refresh and try again.');
      return;
    }
    
    const API_URL = import.meta.env.PROD 
      ? 'https://eventscrm-backend.onrender.com'
      : 'http://localhost:5001';
    
    console.log('🧭 Redirecting to Unified Gmail OAuth...', { orgId, adminId });
    window.location.href = `${API_URL}/api/google-oauth/auth?service=gmail&orgId=${orgId}&adminId=${adminId}`;
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Disconnect Gmail? You will need to reconnect to send emails.')) {
      return;
    }
    
    try {
      await api.delete('/google-oauth/disconnect', {
        data: { service: 'gmail', orgId, adminId }
      });
      
      // Refresh status
      await loadIntegrationStatuses();
      alert('✅ Gmail disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      alert('❌ Failed to disconnect Gmail');
    }
  };

  const handleTestGmail = () => {
    alert('🚧 Test email feature coming soon!\n\nFor now, test by sending a campaign.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
              <p className="text-gray-600">Manage your connected services and OAuth tokens</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading integrations...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Gmail Integration */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Gmail</h3>
                        {integrations.gmail.connected ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Connected
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                            Not Connected
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        Send campaign emails directly from your Gmail account
                      </p>
                      
                      {integrations.gmail.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-gray-700 font-medium">{integrations.gmail.email}</span>
                          </div>
                          {integrations.gmail.connectedAt && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Connected {new Date(integrations.gmail.connectedAt).toLocaleDateString()}
                            </div>
                          )}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-green-700">
                              🔒 <strong>Persistent tokens:</strong> Your connection will never expire. You can send emails anytime!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            Connect your Gmail to send campaign emails. You'll only need to do this once!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {integrations.gmail.connected ? (
                      <>
                        <button
                          onClick={handleTestGmail}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                        >
                          Test Send
                        </button>
                        <button
                          onClick={handleDisconnectGmail}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleConnectGmail}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
                      >
                        Connect Gmail
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* YouTube Integration (Placeholder) */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">YouTube</h3>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold">
                          Not Connected
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Upload and manage videos on your YouTube channel
                      </p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          Connect via YouTube Hub → YouTube Publisher
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/youtube/welcome")}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
                  >
                    Go to YouTube
                  </button>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📘</span>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎫</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">More Integrations Coming Soon</h3>
                <p className="text-gray-600">
                  Google Ads, Facebook/Meta, Eventbrite, and more...
                </p>
              </div>

            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-900 font-semibold mb-1">About OAuth Connections</p>
                  <p className="text-xs text-blue-700">
                    Your OAuth tokens are stored securely and use refresh tokens to stay connected indefinitely. 
                    You'll only need to connect each service once. Disconnecting will require re-authorization to use that service again.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

