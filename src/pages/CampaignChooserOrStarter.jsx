import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * CampaignChooserOrStarter - THE FORK
 * Explicit choice: Start fresh OR resume existing
 * No accidental hydration!
 */
export default function CampaignChooserOrStarter() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadCampaigns();
  }, [orgId]);
  
  const loadCampaigns = async () => {
    try {
      if (orgId) {
        const response = await api.get(`/campaigns?orgId=${orgId}`);
        // Only show draft campaigns
        const draftCampaigns = response.data.filter(c => c.status === 'draft');
        setCampaigns(draftCampaigns);
      }
    } catch (err) {
      console.error("Error loading campaigns:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartFresh = () => {
    console.log('🆕 Starting fresh campaign');
    navigate('/campaign-creator');
  };
  
  const handleResume = (campaign) => {
    console.log('🔄 Resuming campaign:', campaign.name);
    
    // Resume with URL params
    const listId = campaign.contactListId;
    if (listId) {
      navigate(`/campaign-creator?campaignId=${campaign.id}&listId=${listId}`);
    } else {
      navigate(`/campaign-creator?campaignId=${campaign.id}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Campaign Center</h1>
            <p className="text-gray-600">Start a new campaign or pick up where you left off</p>
          </div>
          
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/campaignhome')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Campaign Home
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Option 1: Start Fresh */}
            <button
              onClick={handleStartFresh}
              className="w-full p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 transition text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">🚀 Start a New Campaign</h3>
                  <p className="text-gray-600">Create a fresh campaign from scratch</p>
                </div>
                <svg className="w-6 h-6 text-indigo-400 group-hover:text-indigo-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            {/* Option 2: Resume Existing */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔄 Pick Up Where You Left Off</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading campaigns...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600">No draft campaigns found</p>
                  <p className="text-sm text-gray-500 mt-1">Start a new campaign above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <button
                      key={campaign.id}
                      onClick={() => handleResume(campaign)}
                      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                            {campaign.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                            {campaign.contactList && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                Has List
                              </span>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

