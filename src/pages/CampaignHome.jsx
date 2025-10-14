import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";
import { signInWithGoogle, isSignedIn, getGmailAccessToken } from "../lib/googleAuth";

export default function CampaignHome() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [redirectMessage, setRedirectMessage] = useState("");

  useEffect(() => {
    loadCampaigns();
    checkGmailAuth();
    
    // Check for redirect message
    const message = localStorage.getItem('redirectMessage');
    if (message) {
      setRedirectMessage(message);
      localStorage.removeItem('redirectMessage');
      // Clear message after 5 seconds
      setTimeout(() => setRedirectMessage(""), 5000);
    }
  }, [orgId]);

  const checkGmailAuth = () => {
    // Only check for Gmail access token, not Firebase auth
    const accessToken = getGmailAccessToken();
    const gmailEmail = localStorage.getItem('gmailEmail');
    
    console.log('🔍 Checking Gmail auth:', { 
      hasToken: !!accessToken, 
      email: gmailEmail,
      tokenLength: accessToken?.length 
    });
    
    if (accessToken && gmailEmail) {
      setGmailAuthenticated(true);
      setGmailEmail(gmailEmail);
      console.log('✅ Gmail authenticated:', gmailEmail);
    } else {
      setGmailAuthenticated(false);
      setGmailEmail('');
      console.log('❌ Gmail not authenticated');
    }
  };

  const handleGmailAuth = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.accessToken) {
        setGmailAuthenticated(true);
        setGmailEmail(result.email);
        localStorage.setItem('gmailEmail', result.email);
        console.log('✅ Gmail authentication successful');
        alert(`✅ Gmail authenticated! You can now send emails via ${result.email}`);
      }
    } catch (error) {
      console.error('❌ Gmail authentication failed:', error);
      alert('❌ Gmail authentication failed. Please try again.');
    }
  };

  const loadCampaigns = async () => {
    try {
      if (orgId) {
        const response = await api.get(`/campaigns?orgId=${orgId}`);
        setCampaigns(response.data);
      }
    } catch (err) {
      console.error("Error loading campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (e, campaign) => {
    e.stopPropagation(); // Prevent card click
    
    const confirmMsg = `🗑️ Delete "${campaign.name}"?\n\n` +
      `Status: ${campaign.status}\n` +
      `Contact List: ${campaign.contactList?.name || 'None'}\n\n` +
      `⚠️ Note: The contact list will be preserved for reuse.\n\n` +
      `Are you sure?`;
    
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await api.delete(`/campaigns/${campaign.id}`);
      
      // Remove from local state immediately
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id));
      
      // Clear localStorage if this was the current campaign
      const currentCampaignId = localStorage.getItem('campaignId');
      if (currentCampaignId === campaign.id) {
        localStorage.removeItem('campaignId');
        localStorage.removeItem('currentCampaign');
        localStorage.removeItem('listId');
        console.log('🧹 Cleared localStorage for deleted campaign');
      }
      
      console.log('✅ Campaign deleted:', campaign.name);
      alert(`✅ Campaign "${campaign.name}" deleted successfully!`);
    } catch (err) {
      console.error('❌ Error deleting campaign:', err);
      alert(`❌ Failed to delete campaign: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaign Dashboard</h1>
              <p className="text-gray-600">Send campaigns and personal outreach</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Redirect Message Banner */}
          {redirectMessage && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-blue-900 font-semibold">{redirectMessage}</p>
                  <p className="text-sm text-blue-700">Use the "Connect Gmail" button below to get started</p>
                </div>
                <button
                  onClick={() => setRedirectMessage("")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Campaign Overview */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Campaigns */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                  </div>
                </div>
              </div>

              {/* Active Campaigns */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.filter(c => c.status === 'active' || c.status === 'sent').length}
                    </p>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                  </div>
                </div>
              </div>

              {/* Emails Sent */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.reduce((total, c) => total + (c.contactList?.totalContacts || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Recipients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Sequence - NEW FLOW */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition cursor-pointer"
                 onClick={() => {
                   // Go to fork page (new vs resume)
                   navigate('/campaign-chooser');
                 }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-indigo-500 text-white rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 3v12m0 0l-3-3m3 3l3-3" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">📢 Launch New Campaign</h2>
                    <p className="text-gray-600">Send emails to your contact lists</p>
                  </div>
                </div>
                <span className="inline-flex items-center text-indigo-600 font-semibold text-lg">
                  Start Campaign →
                </span>
              </div>
            </div>
          </div>

          {/* Gmail Authentication */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">📧 Gmail Authentication</h2>
                  <p className="text-gray-600">
                    {gmailAuthenticated 
                      ? `Connected as ${gmailEmail}` 
                      : "Connect Gmail to send emails"
                    }
                  </p>
                </div>
              </div>
              {gmailAuthenticated ? (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Connected</span>
                </div>
              ) : (
                <button
                  onClick={handleGmailAuth}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Connect Gmail
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* 📋 Contact Lists */}
            <button
              onClick={() => navigate("/contact-list-manager")}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📋 Contact Lists</h3>
                  <p className="text-sm text-gray-600">Manage lists</p>
                </div>
              </div>
              <p className="text-sm text-indigo-700">Create and manage contact segments</p>
            </button>
            
            {/* 📝 Templates */}
            <button
              onClick={() => navigate("/templates")}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📝 Templates</h3>
                  <p className="text-sm text-gray-600">Email templates</p>
                </div>
              </div>
              <p className="text-sm text-purple-700">Create reusable email templates</p>
            </button>

            {/* 👥 Upload Contacts */}
            <button
              onClick={() => navigate("/contacteventmanual")}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">👥 Upload Contacts</h3>
                  <p className="text-sm text-gray-600">Quick import</p>
                </div>
              </div>
              <p className="text-sm text-blue-700">Fast upload for campaigns</p>
            </button>

            {/* 📊 Analytics */}
            <button
              onClick={() => navigate("/analytics")}
              className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📊 Analytics</h3>
                  <p className="text-sm text-gray-600">Email performance</p>
                </div>
              </div>
              <p className="text-sm text-orange-700">Track opens, clicks, and engagement</p>
            </button>

            {/* 📧 Personal Email */}
            <button
              onClick={() => navigate("/outreach")}
              className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-lg border-2 border-emerald-200 hover:border-emerald-400 transition text-left"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">📧 Personal Email</h3>
                  <p className="text-sm text-gray-600">Send 1:1 email</p>
                </div>
              </div>
              <p className="text-sm text-emerald-700">Send personal emails manually</p>
            </button>
            </div>
          </div>

          {/* Current Campaigns */}
          <div className="border-t pt-8 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Current Campaigns</h3>
            
            {campaigns.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No active campaigns</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.slice(0, 6).map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => {
                      // Resume campaign - hydrate and go back to creator
                      localStorage.setItem('campaignId', campaign.id);
                      localStorage.setItem('currentCampaign', campaign.name);
                      localStorage.setItem('resumingCampaign', 'true');
                      navigate('/campaign-creator');
                    }}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-md transition cursor-pointer relative"
                  >
                    {/* Delete Button - More Visible */}
                    <button
                      onClick={(e) => handleDeleteCampaign(e, campaign)}
                      className="absolute top-3 right-3 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition z-10 border border-red-200 hover:border-red-300"
                      title="Delete campaign"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    <div className="flex justify-between items-start mb-4 pr-8">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{campaign.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3 text-sm">{campaign.description || "No description"}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {campaign.contactList?.name || "N/A"} ({campaign.contactList?.totalContacts || 0} contacts)
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Created: {new Date(campaign.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
