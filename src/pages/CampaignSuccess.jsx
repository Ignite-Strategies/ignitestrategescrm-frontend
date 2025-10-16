import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";

/**
 * CampaignSuccess - Simple success page
 * Just shows "Congrats bro - here's what sent and what now"
 */
export default function CampaignSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get campaign data from navigation state
  const { campaignId, contactCount, campaignName } = location.state || {};
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (campaignId) {
      loadCampaignData();
    } else {
      setError("No campaign data found");
      setLoading(false);
    }
  }, [campaignId]);
  
  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${campaignId}`);
      setCampaign(response.data);
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError("Failed to load campaign data");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign results...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <h1 className="text-4xl font-bold text-red-700 mb-4">❌ Error</h1>
          <p className="text-lg text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-2xl">
        <h1 className="text-4xl font-bold text-green-700 mb-4">🎉 Congrats Bro! 🎉</h1>
        
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Campaign "{campaignName || campaign?.name || 'Unknown'}" Sent Successfully!
          </h2>
          <p className="text-lg text-gray-700">
            Your email campaign has been delivered to <strong>{contactCount || campaign?.contactList?.contactCount || 'Unknown'}</strong> contacts.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">📊 What Just Happened:</h3>
          <ul className="text-left text-green-700 space-y-2">
            <li>✅ Campaign created and configured</li>
            <li>✅ Contact list attached</li>
            <li>✅ Message personalized for each contact</li>
            <li>✅ Emails sent via Gmail API</li>
            <li>✅ Campaign marked as "sent"</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🚀 What's Next:</h3>
          <ul className="text-left text-blue-700 space-y-2">
            <li>📈 Monitor email engagement and responses</li>
            <li>📝 Create follow-up campaigns if needed</li>
            <li>👥 Build new contact lists for future campaigns</li>
            <li>📊 Track campaign performance and analytics</li>
          </ul>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/campaigns')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            📧 View All Campaigns
          </button>
          <button
            onClick={() => navigate('/contact-list-manager')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            📋 Manage Lists
          </button>
          <button
            onClick={() => navigate('/campaign-creator')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            ➕ Create New Campaign
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Campaign ID: <span className="font-mono">{campaignId}</span>
        </p>
      </div>
    </div>
  );
}