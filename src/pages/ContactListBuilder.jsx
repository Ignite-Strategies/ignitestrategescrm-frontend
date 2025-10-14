import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Smart Contact List Builder - Simple & Focused
 * Pre-selected smart lists + basic custom options
 * Can be used standalone OR within campaign flow
 */
export default function ContactListBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  // Check if we're in campaign flow
  const campaignId = searchParams.get('campaignId');
  const isInCampaignFlow = !!campaignId;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Data
  const [orgMembers, setOrgMembers] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    loadOrgMembers();
  }, [orgId]);
  
  const loadOrgMembers = async () => {
    try {
      const response = await api.get(`/orgmembers?orgId=${orgId}`);
      setOrgMembers(response.data);
    } catch (err) {
      console.error("Error loading org members:", err);
      setError("Failed to load org members");
    }
  };
  
  const handlePreview = () => {
    setShowPreview(!showPreview);
  };
  
  const handleUseList = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Create the smart list via API
      const response = await api.post("/contact-lists", {
        orgId,
        name: "All Org Members",
        description: "All organization members",
        type: "smart",
        smartListType: "all_org_members"
      });
      
      const listId = response.data.id;
      alert(`✅ Smart list "All Org Members" created!`);
      
      // Navigate based on flow
      if (isInCampaignFlow) {
        // Campaign flow: Store listId and go back to CampaignCreator
        localStorage.setItem('listId', listId);
        navigate('/campaign-creator');
      } else {
        // Standalone: Go back to manager
        navigate('/contact-list-manager');
      }
      
    } catch (err) {
      console.error("Error creating smart list:", err);
      setError(err.response?.data?.error || "Failed to create smart list");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Create Contact List</h1>
              <p className="text-gray-600">Choose from smart lists or customize your own</p>
            </div>
            <button
              onClick={() => {
                if (isInCampaignFlow) {
                  navigate(`/contact-list-manager?campaignId=${campaignId}`);
                } else {
                  navigate("/contact-list-manager");
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
          
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {/* Smart Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* All Org Members List */}
            <div className="p-8 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition">
              <div className="text-6xl mb-4 text-center">👥</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">All Org Members</h2>
              <p className="text-gray-600 mb-4 text-center">All organization members</p>
              
              <div className="text-3xl font-bold text-indigo-600 mb-6 text-center">
                {orgMembers.length} contacts
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/contact-list-view")}
                  className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Preview
                </button>
                
                <button
                  onClick={handleUseList}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition font-medium"
                >
                  {loading ? "Creating..." : "Use"}
                </button>
              </div>
            </div>
          </div>
          
          {/* Preview Section */}
          {showPreview && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview: All Org Members ({orgMembers.length} contacts)
              </h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {orgMembers.slice(0, 10).map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div>
                      <span className="font-medium">{member.firstName} {member.lastName}</span>
                      <span className="text-gray-500 ml-2">{member.email}</span>
                    </div>
                  </div>
                ))}
                {orgMembers.length > 10 && (
                  <div className="text-center text-gray-500 py-2">
                    ... and {orgMembers.length - 10} more contacts
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}