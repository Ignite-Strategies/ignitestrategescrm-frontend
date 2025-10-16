import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * ContactListManager - SIMPLIFIED VERSION
 * Core actions: Use, Unassign, Delete, View
 * Simple Assigned/Available status
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

    try {
      // Get available draft campaigns
      const availableCampaigns = campaigns.filter(c => c.status === 'draft' && !c.contactListId);
      
      if (availableCampaigns.length === 0) {
        // Create new campaign
        const newCampaign = await api.post("/campaigns", {
          orgId,
          name: `${list.name} Campaign`,
          description: `Campaign for ${list.name}`,
          status: "draft",
        });
        
        // Assign list to new campaign
        await api.patch(`/campaigns/${newCampaign.data.id}`, {
          contactListId: list.id
        });
        
        // Navigate to CampaignCreator
        navigate('/campaign-creator', { 
          state: { campaignId: newCampaign.data.id } 
        });
        return;
      }
      
      // Show campaign selector
      const campaignOptions = availableCampaigns.map(c => `${c.name} (${c.id})`).join('\n');
      const selectedCampaign = prompt(
        `Select a campaign for "${list.name}":\n\n${campaignOptions}\n\nEnter campaign name:`
      );
      
      if (!selectedCampaign) return;
      
      // Find the selected campaign
      const campaign = availableCampaigns.find(c => 
        c.name.toLowerCase() === selectedCampaign.toLowerCase()
      );
      
      if (!campaign) {
        alert("Campaign not found!");
        return;
      }
      
      // Assign list to campaign
      await api.patch(`/campaigns/${campaign.id}`, {
        contactListId: list.id
      });
      
      // Navigate to CampaignCreator
      navigate('/campaign-creator', { 
        state: { campaignId: campaign.id } 
      });
      
    } catch (err) {
      console.error("Error using list:", err);
      alert("Failed to use list: " + err.message);
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
          <h1 className="text-3xl font-bold text-gray-900">Contact Lists - SIMPLIFIED</h1>
          <p className="text-gray-600 mt-1">Simple list management with core actions</p>
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
    </div>
  );
}