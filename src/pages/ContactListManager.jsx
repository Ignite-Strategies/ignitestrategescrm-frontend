import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * ContactListManager - FINAL VERSION 🎯
 * Beautiful modal campaign selector + all core actions
 */
export default function ContactListManager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  
  // Get campaignId from URL if in campaign flow
  const campaignId = searchParams.get('campaignId');
  const isInCampaignFlow = !!campaignId;
  
  const [lists, setLists] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Simple filter states
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedListForUse, setSelectedListForUse] = useState(null);
  const [availableCampaigns, setAvailableCampaigns] = useState([]);
  
  useEffect(() => {
    loadData();
  }, [orgId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading lists and campaigns...');
      
      const [listsRes, campaignsRes] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      const lists = listsRes.data || [];
      const campaigns = campaignsRes.data || [];
      
      console.log('📊 Data loaded:', {
        listsCount: lists.length,
        campaignsCount: campaigns.length
      });
      
      // Simple assignment status
      const listsWithStatus = lists.map(list => {
        const assignedCampaigns = campaigns.filter(c => c.contactListId === list.id);
        const isAssigned = assignedCampaigns.length > 0;
        
        return {
          ...list,
          isAssigned,
          assignedCampaigns
        };
      });
      
      setLists(listsWithStatus);
      setCampaigns(campaigns);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // CORE ACTIONS
  
  const handleUseList = async (list) => {
    if (list.isAssigned) {
      alert(`"${list.name}" is already assigned to a campaign. Use "Unassign" first to free it.`);
      return;
    }

    // Get available draft campaigns
    const available = campaigns.filter(c => c.status === 'draft' && !c.contactListId);
    
    if (available.length === 0) {
      // No draft campaigns - create new one
      const confirmNew = window.confirm(
        `No draft campaigns available.\n\nCreate a new campaign for "${list.name}"?`
      );
      
      if (!confirmNew) return;
      
      try {
        const newCampaign = await api.post("/campaigns", {
          orgId,
          name: `${list.name} Campaign`,
          description: `Campaign for ${list.name}`,
          status: "draft",
        });
        
        await api.patch(`/campaigns/${newCampaign.data.id}`, {
          contactListId: list.id
        });
        
        navigate('/campaign-creator', { 
          state: { campaignId: newCampaign.data.id } 
        });
      } catch (err) {
        console.error("Error creating campaign:", err);
        alert("Failed to create campaign: " + err.message);
      }
      return;
    }
    
    // Show modal with available campaigns
    setSelectedListForUse(list);
    setAvailableCampaigns(available);
    setShowCampaignModal(true);
  };

  const handleSelectCampaign = async (campaign) => {
    if (!selectedListForUse) return;
    
    try {
      console.log(`🔗 Assigning "${selectedListForUse.name}" to "${campaign.name}"`);
      
      await api.patch(`/campaigns/${campaign.id}`, {
        contactListId: selectedListForUse.id
      });
      
      setShowCampaignModal(false);
      navigate('/campaign-creator', { 
        state: { campaignId: campaign.id } 
      });
    } catch (err) {
      console.error("Error assigning list:", err);
      alert("Failed to assign list: " + err.message);
    }
  };

  const handleCreateNewCampaign = async () => {
    if (!selectedListForUse) return;
    
    const campaignName = prompt(`Enter name for new campaign:`);
    if (!campaignName) return;
    
    try {
      const newCampaign = await api.post("/campaigns", {
        orgId,
        name: campaignName,
        description: `Campaign for ${selectedListForUse.name}`,
        status: "draft",
      });
      
      await api.patch(`/campaigns/${newCampaign.data.id}`, {
        contactListId: selectedListForUse.id
      });
      
      setShowCampaignModal(false);
      navigate('/campaign-creator', { 
        state: { campaignId: newCampaign.data.id } 
      });
    } catch (err) {
      console.error("Error creating campaign:", err);
      alert("Failed to create campaign: " + err.message);
    }
  };

  const handleUnassignList = async (list) => {
    if (!list.isAssigned) {
      alert("This list is not assigned to any campaign.");
      return;
    }

    const confirmed = window.confirm(
      `Unassign "${list.name}" from all campaigns?\n\nThis will free the list for use in other campaigns.`
    );
    
    if (!confirmed) return;

    try {
      // Unassign from all campaigns
      for (const campaign of list.assignedCampaigns) {
        const forceParam = campaign.status === 'sent' ? '?force=true' : '';
        await api.patch(`/campaigns/${campaign.id}${forceParam}`, {
          contactListId: null
        });
      }
      
      // Reload data
      await loadData();
      alert(`"${list.name}" has been unassigned from all campaigns.`);
      
    } catch (err) {
      console.error("Error unassigning list:", err);
      alert("Failed to unassign list: " + err.message);
    }
  };

  const handleDeleteList = async (list) => {
    const confirmed = window.confirm(
      `Delete "${list.name}"?\n\nThis will permanently remove the list and all its contacts.`
    );
    
    if (!confirmed) return;

    try {
      await api.delete(`/contact-lists/${list.id}`);
      await loadData();
      alert(`"${list.name}" has been deleted.`);
    } catch (err) {
      console.error("Error deleting list:", err);
      alert("Failed to delete list: " + err.message);
    }
  };

  const handleViewList = (list) => {
    navigate(`/contact-list-detail/${list.id}`);
  };

  // Filter lists
  const filteredLists = lists.filter(list => 
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {isInCampaignFlow && (
            <div className="mb-4">
              <button
                onClick={() => navigate('/campaign-creator', { state: { campaignId } })}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Campaigns
              </button>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900">Contact Lists</h1>
          <p className="text-gray-600 mt-1">Manage and organize your contact segments</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/contact-list-builder")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + Create New List
            </button>
            
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Lists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLists.map((list) => (
            <div key={list.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {list.name}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  list.isAssigned 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {list.isAssigned ? 'Assigned' : 'Available'}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {list.description || "No description"}
              </p>
              
              <div className="text-xs text-gray-500 mb-4">
                <p>Type: {list.type}</p>
                <p>Contacts: {list.totalContacts || 0}</p>
                {list.isAssigned && (
                  <p className="text-orange-600 font-medium">
                    Assigned to: {list.assignedCampaigns.map(c => c.name).join(', ')}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewList(list)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                >
                  View
                </button>
                
                {!list.isAssigned ? (
                  <button
                    onClick={() => handleUseList(list)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                  >
                    Use
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnassignList(list)}
                    className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition"
                  >
                    Unassign
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteList(list)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredLists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No contact lists found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm ? 'Try adjusting your search' : 'Create your first list to get started'}
            </p>
          </div>
        )}
      </div>

      {/* CAMPAIGN SELECTOR MODAL 🎯 */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <h2 className="text-2xl font-bold">Select Campaign</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Choose a campaign for "{selectedListForUse?.name}"
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {availableCampaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {campaign.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Draft
                      </span>
                      <span className="text-xs text-gray-500">
                        ID: {campaign.id.slice(0, 8)}...
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewCampaign}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + Create New Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}