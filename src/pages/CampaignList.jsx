import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function CampaignList() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleDeleteCampaign = async (campaignId, campaignName) => {
    if (!confirm(`Delete campaign "${campaignName}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/campaigns/${campaignId}`);
      alert("Campaign deleted successfully!");
      loadCampaigns();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert(`Failed to delete: ${err.response?.data?.error || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Campaigns</h1>
              <p className="text-gray-600">Manage your email campaigns</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/campaignhome")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Campaign Home
              </button>
              <button
                onClick={() => navigate("/campaignhome")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + New Campaign
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Campaigns List */}
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first email campaign to get started</p>
              <button
                onClick={() => navigate("/campaignhome")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                      {campaign.description && (
                        <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                      )}
                      
                      {/* Campaign Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {campaign.contactList?.totalContacts || 0} contacts
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {campaign.sequences?.length || 0} sequences
                        </span>
                      </div>
                      
                      {/* Status */}
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/campaignsequences/${campaign.id}`)}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id, campaign.name)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Sequences Preview */}
                  {campaign.sequences && campaign.sequences.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Sequences:</h4>
                      <div className="flex flex-wrap gap-2">
                        {campaign.sequences.slice(0, 3).map((seq, index) => (
                          <span key={seq.id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {seq.order}: {seq.name}
                          </span>
                        ))}
                        {campaign.sequences.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{campaign.sequences.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Contact List Info */}
                  {campaign.contactList && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Target:</strong> {campaign.contactList.name}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
