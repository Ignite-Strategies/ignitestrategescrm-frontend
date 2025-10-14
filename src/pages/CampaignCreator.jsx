import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * CampaignCreator - Step 1: Create Campaign & Generate ID
 * Simple campaign name input → generates campaignId → proceeds to list selection
 */
export default function CampaignCreator() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [campaignName, setCampaignName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!campaignName.trim()) {
      setError("Please enter a campaign name");
      return;
    }
    
    if (!orgId) {
      setError("No organization selected");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Create campaign - Prisma auto-generates the ID via cuid()
      const response = await api.post("/campaigns", {
        orgId,
        name: campaignName.trim(),
        description: `Campaign created ${new Date().toLocaleDateString()}`,
        status: "draft"
      });
      
      const campaign = response.data;
      console.log("✅ Campaign created with ID:", campaign.id);
      
      // 🎯 SURGICAL localStorage: Store ONLY campaign flow data
      localStorage.setItem('currentCampaignId', campaign.id);
      localStorage.setItem('currentCampaignName', campaign.name);
      localStorage.setItem('campaignFlowStarted', new Date().toISOString());
      
      console.log("💾 Stored in localStorage:", {
        campaignId: campaign.id,
        campaignName: campaign.name
      });
      
      // Navigate to list selection (Step 2)
      navigate(`/contact-list-manager?campaignId=${campaign.id}`);
      
    } catch (err) {
      console.error("❌ Error creating campaign:", err);
      setError(err.response?.data?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Launch Your Campaign</h1>
            <p className="text-lg text-gray-600">Step 1 of 3: Name your campaign</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-600">Step 1: Campaign Name</span>
              <span className="text-sm text-gray-500">33% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: '33%' }}></div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCreateCampaign} className="space-y-6">
            <div>
              <label htmlFor="campaignName" className="block text-sm font-semibold text-gray-700 mb-3">
                Campaign Name *
              </label>
              <input
                id="campaignName"
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Spring Fundraiser 2025, Member Outreach, Event Invites"
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                autoFocus
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Give your campaign a descriptive name to help you identify it later
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/campaignhome")}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-semibold"
              >
                ← Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !campaignName.trim()}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">What happens next?</h4>
                <p className="text-sm text-blue-800">
                  After saving, you'll select your contact list, then write your message. 
                  Your campaign ID will be auto-generated and saved.
                </p>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/campaignhome")}
              className="text-sm text-gray-600 hover:text-indigo-600 transition"
            >
              ← Back to Campaign Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

