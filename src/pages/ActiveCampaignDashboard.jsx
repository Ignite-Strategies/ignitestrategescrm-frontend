import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * ActiveCampaignDashboard
 * Shows sent campaigns vs draft campaigns
 * Allows viewing results, deleting test campaigns
 */
export default function ActiveCampaignDashboard() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all", "draft", "sent"
  
  useEffect(() => {
    loadCampaigns();
  }, [orgId]);
  
  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns?orgId=${orgId}`);
      setCampaigns(response.data);
    } catch (err) {
      console.error("Error loading campaigns:", err);
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (campaignId, campaignName) => {
    if (!window.confirm(`Are you sure you want to delete "${campaignName}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/campaigns/${campaignId}`);
      alert(`✅ Campaign "${campaignName}" deleted!`);
      loadCampaigns(); // Refresh list
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert(`❌ Failed to delete campaign: ${err.response?.data?.error || err.message}`);
    }
  };
  
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === "all") return true;
    return campaign.status === filter;
  });
  
  const draftCount = campaigns.filter(c => c.status === "draft").length;
  const sentCount = campaigns.filter(c => c.status === "sent").length;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Campaign Dashboard</h1>
            <p className="text-gray-600">Manage your email campaigns</p>
          </div>
          <button
            onClick={() => navigate('/campaign-creator')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            + New Campaign
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
              <div className="text-4xl">📧</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-gray-900">{draftCount}</p>
              </div>
              <div className="text-4xl">✏️</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Sent</p>
                <p className="text-3xl font-bold text-gray-900">{sentCount}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-white rounded-t-xl shadow-md p-4 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All ({campaigns.length})
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "draft"
                  ? "bg-yellow-100 text-yellow-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Drafts ({draftCount})
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "sent"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Sent ({sentCount})
            </button>
          </div>
        </div>
        
        {/* Campaigns List */}
        <div className="bg-white rounded-b-xl shadow-md">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {filteredCampaigns.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === "all" ? "No campaigns yet" : `No ${filter} campaigns`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "all"
                  ? "Create your first campaign to get started"
                  : `You don't have any ${filter} campaigns`}
              </p>
              {filter === "all" && (
                <button
                  onClick={() => navigate('/campaign-creator')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Create Campaign
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {campaign.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : campaign.status === 'sent'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {campaign.status === 'draft' ? '📝 Draft' : '✅ Sent'}
                        </span>
                      </div>
                      
                      {campaign.description && (
                        <p className="text-gray-600 mb-3">{campaign.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Contact List:</span>
                          <p className="text-gray-600">
                            {campaign.contactList?.name || "No list assigned"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Subject:</span>
                          <p className="text-gray-600">
                            {campaign.subject || "No subject"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Created:</span>
                          <p className="text-gray-600">
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-6">
                      {campaign.status === 'draft' ? (
                        <button
                          onClick={() => navigate(`/campaign-creator?campaignId=${campaign.id}${campaign.contactListId ? `&listId=${campaign.contactListId}` : ''}`)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          ✏️ Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/campaign-success?campaignId=${campaign.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          👁️ View Results
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(campaign.id, campaign.name)}
                        className="px-4 py-2 border-2 border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

