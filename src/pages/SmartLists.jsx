import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Smart Lists - Pre-hydrated contact sets
 * Shows dynamic lists based on your actual data
 */
export default function SmartLists() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [smartLists, setSmartLists] = useState([]);
  
  useEffect(() => {
    loadSmartLists();
  }, [orgId]);
  
  const loadSmartLists = async () => {
    try {
      setLoading(true);
      
      // Load all the data we need for smart lists
      const [orgMembersResponse, eventsResponse] = await Promise.all([
        api.get(`/orgmembers?orgId=${orgId}`),
        api.get(`/orgs/${orgId}/events`)
      ]);
      
      const orgMembers = orgMembersResponse.data || [];
      const events = eventsResponse.data || [];
      
      // Create smart lists based on actual data
      const smartListsData = [
        {
          id: "all-org-members",
          name: "All Org Members",
          description: "Everyone in your organization",
          type: "smart",
          contactCount: orgMembers.length,
          icon: "👥",
          color: "blue",
          data: orgMembers
        },
        {
          id: "recent-members",
          name: "Recent Members",
          description: "Members added in the last 30 days",
          type: "smart",
          contactCount: orgMembers.filter(member => {
            const createdAt = new Date(member.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt > thirtyDaysAgo;
          }).length,
          icon: "🆕",
          color: "green",
          data: orgMembers.filter(member => {
            const createdAt = new Date(member.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdAt > thirtyDaysAgo;
          })
        },
        {
          id: "all-events",
          name: "All Events",
          description: "All your events",
          type: "smart",
          contactCount: events.length,
          icon: "📅",
          color: "purple",
          data: events
        }
      ];
      
      setSmartLists(smartListsData);
      
    } catch (err) {
      console.error("Error loading smart lists:", err);
      setError("Failed to load smart lists");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUseList = (list) => {
    // Navigate to campaign creator with this list pre-selected
    localStorage.setItem('listId', list.id);
    navigate(`/campaign-creator?listId=${list.id}&listName=${encodeURIComponent(list.name)}`);
  };
  
  const getColorClasses = (color) => {
    switch (color) {
      case "blue": return "bg-blue-50 border-blue-200 text-blue-700";
      case "green": return "bg-green-50 border-green-200 text-green-700";
      case "purple": return "bg-purple-50 border-purple-200 text-purple-700";
      case "orange": return "bg-orange-50 border-orange-200 text-orange-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading smart lists...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Dashboard
                </button>
                <button
                  onClick={() => navigate("/campaignhome")}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Campaigns
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Smart Lists</h1>
              <p className="text-gray-600 mt-1">Pre-hydrated contact sets based on your data</p>
            </div>
            
            <button
              onClick={() => navigate("/campaign-creator")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Sequence
            </button>
          </div>
          
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
        
        {/* Smart Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {smartLists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition group cursor-pointer"
              onClick={() => handleUseList(list)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{list.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {list.name}
                      </h3>
                      <p className="text-sm text-gray-600">{list.description}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getColorClasses(list.color)}`}>
                    Smart List
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-indigo-600">
                    {list.contactCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {list.contactCount === 1 ? 'contact' : 'contacts'}
                  </div>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseList(list);
                  }}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Use This List
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {smartLists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Smart Lists Available</h3>
            <p className="text-gray-600 mb-6">
              Smart lists will appear here once you have data in your system
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

