import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function SettingsIntegrations() {
  const navigate = useNavigate();
  
  // Just use master keys - simple and reliable
  const orgId = 'cmgfvz9v10000nt284k875eoc';
  const adminId = 'admin_432599718';
  
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState({
    gmail: { connected: false, email: null, loading: true },
    youtube: { connected: false, channel: null, loading: true },
    googleAds: { connected: false, account: null, loading: true },
    meta: { connected: false, page: null, loading: true }
  });

  useEffect(() => {
    loadIntegrationStatuses();
  }, []);

  const loadIntegrationStatuses = async () => {
    setLoading(true);
    
    // Get adminId from localStorage (the personhood key!)
    const adminId = localStorage.getItem('adminId');
    
    if (!adminId) {
      console.error('❌ No adminId in localStorage - cannot load integrations');
      setLoading(false);
      return;
    }
    
    console.log('🔍 Loading Google integrations for adminId:', adminId);
    
    try {
      // ONE API CALL to get ALL Google OAuth connections for this admin
      const response = await api.get(`/google-auth-hydrator/${adminId}`);
      const { connections } = response.data;
      
      console.log('✅ Google Auth Hydrator response:', connections);
      
      // Update state with all connections at once
      setIntegrations(prev => ({
        ...prev,
        gmail: {
          connected: connections.gmail.connected,
          email: connections.gmail.email || null,
          connectionId: connections.gmail.connectionId || null,
          connectedAt: connections.gmail.connectedAt || null,
          loading: false
        },
        youtube: {
          connected: connections.youtube.connected,
          channel: connections.youtube.channelName || null,
          channelId: connections.youtube.channelId || null,
          connectionId: connections.youtube.connectionId || null,
          connectedAt: connections.youtube.connectedAt || null,
          loading: false
        },
        googleAds: {
          connected: connections.ads.connected,
          account: connections.ads.accountName || null,
          customerId: connections.ads.customerId || null,
          connectionId: connections.ads.connectionId || null,
          connectedAt: connections.ads.connectedAt || null,
          loading: false
        },
        meta: { ...prev.meta, loading: false }
      }));
      
    } catch (error) {
      console.error('❌ Error loading Google integrations:', error);
      // Set all to disconnected on error
      setIntegrations(prev => ({
        ...prev,
        gmail: { connected: false, email: null, loading: false },
        youtube: { connected: false, channel: null, loading: false },
        googleAds: { connected: false, account: null, loading: false },
        meta: { ...prev.meta, loading: false }
      }));
    }
    
    setLoading(false);
  };

  const handleConnectGmail = async () => {
    const containerId = localStorage.getItem('containerId');
    
    if (!orgId || !adminId || !containerId) {
      alert('⚠️ Missing organization, admin, or container information. Please refresh and try again.');
      return;
    }
    
    try {
      console.log('🧭 Getting Gmail OAuth URL...', { orgId, adminId, containerId });
      
      // Get the auth URL from the backend with all required IDs
      const response = await api.get(`/google-oauth/auth?service=gmail&orgId=${orgId}&adminId=${adminId}&containerId=${containerId}`);
      
      if (response.data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('No auth URL received from server');
      }
    } catch (error) {
      console.error('Error getting Gmail OAuth URL:', error);
      alert('❌ Failed to initiate Gmail connection. Please try again.');
    }
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

  const handleConnectYouTube = async () => {
    const containerId = localStorage.getItem('containerId');
    
    if (!orgId || !adminId || !containerId) {
      alert('⚠️ Missing organization, admin, or container information. Please refresh and try again.');
      return;
    }
    
    try {
      console.log('🧭 Getting YouTube OAuth URL...', { orgId, adminId, containerId });
      
      const response = await api.get(`/google-oauth/auth?service=youtube&orgId=${orgId}&adminId=${adminId}&containerId=${containerId}`);
      
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('No auth URL received from server');
      }
    } catch (error) {
      console.error('Error getting YouTube OAuth URL:', error);
      alert('❌ Failed to initiate YouTube connection. Please try again.');
    }
  };

  const handleConnectGoogleAds = async () => {
    const containerId = localStorage.getItem('containerId');
    
    if (!orgId || !adminId || !containerId) {
      alert('⚠️ Missing organization, admin, or container information. Please refresh and try again.');
      return;
    }
    
    try {
      console.log('🧭 Getting Google Ads OAuth URL...', { orgId, adminId, containerId });
      
      const response = await api.get(`/google-oauth/auth?service=ads&orgId=${orgId}&adminId=${adminId}&containerId=${containerId}`);
      
      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      } else {
        throw new Error('No auth URL received from server');
      }
    } catch (error) {
      console.error('Error getting Google Ads OAuth URL:', error);
      alert('❌ Failed to initiate Google Ads connection. Please try again.');
    }
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
                          onClick={() => navigate("/send-email")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Email
                        </button>
                        <button
                          onClick={handleConnectGmail}
                          className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
                        >
                          Add Another Email
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

              {/* YouTube Integration */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-red-300 transition">
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
                        {integrations.youtube.connected ? (
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
                        Upload and manage videos on your YouTube channel
                      </p>
                      
                      {integrations.youtube.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                            </svg>
                            <span className="text-gray-700 font-medium">{integrations.youtube.channel}</span>
                          </div>
                          {integrations.youtube.connectedAt && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Connected {new Date(integrations.youtube.connectedAt).toLocaleDateString()}
                            </div>
                          )}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-green-700">
                              🔒 <strong>Persistent tokens:</strong> Your connection will never expire. You can upload videos anytime!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700">
                            Connect your YouTube channel to upload videos. You'll only need to do this once!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {integrations.youtube.connected ? (
                      <button
                        onClick={() => navigate("/youtube/welcome")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
                      >
                        Go to YouTube Hub
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectYouTube}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-semibold shadow-lg"
                      >
                        Connect YouTube
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Google Ads Integration */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">Google Ads</h3>
                        {integrations.googleAds.connected ? (
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
                        Create and manage Google Ads campaigns
                      </p>
                      
                      {integrations.googleAds.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-gray-700 font-medium">{integrations.googleAds.account}</span>
                          </div>
                          {integrations.googleAds.connectedAt && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Connected {new Date(integrations.googleAds.connectedAt).toLocaleDateString()}
                            </div>
                          )}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                            <p className="text-xs text-green-700">
                              🔒 <strong>Persistent tokens:</strong> Your connection will never expire. You can manage campaigns anytime!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-700">
                            ⚠️ <strong>Note:</strong> Google Ads requires developer token verification for production use. Connect for development/testing only.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {integrations.googleAds.connected ? (
                      <button
                        onClick={() => navigate("/ads")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                      >
                        Go to Ads Hub
                      </button>
                    ) : (
                      <button
                        onClick={handleConnectGoogleAds}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-semibold shadow-lg"
                      >
                        Connect Google Ads
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Coming Soon Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📘</span>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎫</span>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📧</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">More Integrations Coming Soon</h3>
                <p className="text-gray-600">
                  Facebook/Meta, Eventbrite, LinkedIn, and more...
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

