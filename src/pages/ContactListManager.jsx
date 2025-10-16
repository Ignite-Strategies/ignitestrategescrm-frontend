import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Unified Contact List Manager - Production Ready
 * Step 2: Pick or create a contact list
 * Consolidates all list creation methods into one clean interface
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
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  
  // View states
  const [view, setView] = useState("all"); // all | create | detail | select-campaign
  const [selectedList, setSelectedList] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  useEffect(() => {
    loadLists();
  }, [orgId]);
  
  const loadLists = async () => {
    try {
      setLoading(true);
      const [listsRes, campaignsRes] = await Promise.all([
        api.get(`/contact-lists?orgId=${orgId}`),
        api.get(`/campaigns?orgId=${orgId}`)
      ]);
      
      // Enrich lists with campaign status
      const enrichedLists = listsRes.data.map(list => {
        const linkedCampaigns = campaignsRes.data.filter(c => c.contactListId === list.id);
        const draftCampaigns = linkedCampaigns.filter(c => c.status === 'draft');
        const sentCampaigns = linkedCampaigns.filter(c => c.status === 'sent');
        const activeCampaigns = linkedCampaigns.filter(c => c.status === 'active');
        
        return {
          ...list,
          campaignStatus: {
            assigned: draftCampaigns.length > 0,
            used: sentCampaigns.length > 0 || activeCampaigns.length > 0,
            totalCampaigns: linkedCampaigns.length,
            draftCampaigns,
            sentCampaigns,
            activeCampaigns
          }
        };
      });
      
      setLists(enrichedLists);
      setCampaigns(campaignsRes.data); // Store campaigns for selector
    } catch (err) {
      console.error("Error loading lists:", err);
      setError("Failed to load contact lists");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteList = async (listId) => {
    if (!window.confirm("Are you sure you want to delete this list?")) return;
    
    try {
      await api.delete(`/contact-lists/${listId}`);
      setLists(lists.filter(list => list.id !== listId));
    } catch (err) {
      console.error("Error deleting list:", err);
      setError("Failed to delete list");
    }
  };
  
  const handleDuplicateList = async (list) => {
    try {
      const response = await api.post("/contact-lists", {
        ...list,
        name: `${list.name} (Copy)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      });
      setLists([response.data, ...lists]);
    } catch (err) {
      console.error("Error duplicating list:", err);
      setError("Failed to duplicate list");
    }
  };
  
  // Filter lists
  const filteredLists = lists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || list.type === typeFilter;
    return matchesSearch && matchesType;
  });
  
  // Stats
  const stats = {
    total: lists.length,
    contacts: lists.reduce((sum, list) => sum + (list.totalContacts || 0), 0),
    orgMembers: lists.filter(list => list.type === "org_member").length,
    eventBased: lists.filter(list => list.type === "event_attendee").length
  };
  
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
          {/* Campaign Flow Progress */}
          {isInCampaignFlow && (
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-600">Step 2: Select Contact List</span>
                <span className="text-sm text-gray-500">66% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: '66%' }}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Campaign: <span className="font-semibold">{localStorage.getItem('currentCampaignName') || 'Unnamed'}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isInCampaignFlow ? (
                  <button
                    onClick={() => navigate("/campaign-creator")}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    ← Back to Campaign
                  </button>
                ) : (
                  <>
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
                  </>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isInCampaignFlow ? '📋 Pick Your Contact List' : 'Contact Lists'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isInCampaignFlow 
                  ? 'Choose an existing list or create a new one for your campaign' 
                  : 'Manage and organize your contact segments'}
              </p>
            </div>
            
            <button
              onClick={() => {
                if (isInCampaignFlow) {
                  // In campaign flow: Pass campaignId to list builder
                  navigate(`/contact-list-builder?campaignId=${campaignId}`);
                } else {
                  // Standalone: Just create list
                  navigate("/contact-list-builder");
                }
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New List
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">Total Lists</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1">Total Contacts</p>
              <p className="text-3xl font-bold text-green-900">{stats.contacts.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium mb-1">Org Member Lists</p>
              <p className="text-3xl font-bold text-purple-900">{stats.orgMembers}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700 font-medium mb-1">Event Lists</p>
              <p className="text-3xl font-bold text-orange-900">{stats.eventBased}</p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lists..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="contact">General Contacts</option>
              <option value="org_member">Org Members</option>
              <option value="event_attendee">Event Attendees</option>
            </select>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Lists Grid */}
        {filteredLists.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || typeFilter !== "all" ? "No lists match your filters" : "No contact lists yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Create your first list to start organizing your contacts"}
            </p>
            {!searchTerm && typeFilter === "all" && (
              <button
                onClick={() => navigate("/contact-list-builder")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Your First List
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onDelete={handleDeleteList}
                onDuplicate={handleDuplicateList}
                onUse={async () => {
                  if (isInCampaignFlow) {
                    // Campaign flow: Attach to specific campaign and return
                    await api.patch(`/campaigns/${campaignId}`, {
                      contactListId: list.id
                    });
                    navigate(`/campaign-creator?campaignId=${campaignId}&listId=${list.id}`);
                  } else {
                    // Standalone: Show campaign selector modal
                    setSelectedList(list);
                    setView('select-campaign');
                  }
                }}
                onUnassign={async () => {
                  // Find the draft campaign using this list
                  const draftCampaign = list.campaignStatus?.draftCampaigns[0];
                  if (!draftCampaign) {
                    alert('No draft campaign found to unassign from');
                    return;
                  }
                  
                  const confirmMsg = `Unassign "${list.name}" from campaign "${draftCampaign.name}"?\n\nThis will free up the list for use in other campaigns.`;
                  if (!window.confirm(confirmMsg)) return;
                  
                  try {
                    // Unassign by setting contactListId to null
                    await api.patch(`/campaigns/${draftCampaign.id}`, {
                      contactListId: null
                    });
                    
                    console.log(`✅ Unassigned list from campaign: ${draftCampaign.name}`);
                    
                    // Reload lists to update status
                    await loadLists();
                  } catch (err) {
                    console.error('Error unassigning list:', err);
                    alert(`Failed to unassign list: ${err.response?.data?.error || err.message}`);
                  }
                }}
                onView={() => navigate(`/contact-list/${list.id}`)}
              />
            ))}
          </div>
        )}
        
        {/* Campaign Selector Modal */}
        {view === 'select-campaign' && selectedList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Attach "{selectedList.name}" to Campaign
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Select which campaign to use this list with
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setView('all');
                      setSelectedList(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No campaigns yet</p>
                    <button
                      onClick={() => navigate('/campaign-creator')}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Create Your First Campaign
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map(campaign => (
                      <button
                        key={campaign.id}
                        onClick={async () => {
                          try {
                            // Attach list to campaign
                            await api.patch(`/campaigns/${campaign.id}`, {
                              contactListId: selectedList.id
                            });
                            
                            // Navigate to campaign creator with both IDs
                            navigate(`/campaign-creator?campaignId=${campaign.id}&listId=${selectedList.id}`);
                          } catch (err) {
                            console.error('Error attaching list:', err);
                            setError('Failed to attach list to campaign');
                          }
                        }}
                        className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-left"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {campaign.contactList 
                                ? `Currently using: ${campaign.contactList.name}`
                                : 'No list assigned yet'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/campaign-creator')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-center"
                  >
                    <div className="text-2xl mb-2">➕</div>
                    <div className="font-semibold text-gray-900">Create New Campaign</div>
                    <div className="text-sm text-gray-600">Start a fresh campaign with this list</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Campaign Status Badge - 4-State System
 */
function CampaignStatusBadge({ status }) {
  if (!status) {
    return <span className="text-gray-500 text-xs">Loading...</span>;
  }
  
  // Priority order: used > assigned > available
  if (status.used) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        Used ({status.sentCampaigns.length + status.activeCampaigns.length})
      </span>
    );
  }
  
  if (status.assigned) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
        Assigned ({status.draftCampaigns.length})
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
      Available
    </span>
  );
}

/**
 * Individual List Card Component
 */
function ListCard({ list, onDelete, onDuplicate, onUse, onUnassign, onView }) {
  const [showActions, setShowActions] = useState(false);
  
  const getTypeColor = (type) => {
    switch (type) {
      case "org_member": return "bg-purple-100 text-purple-700";
      case "event_attendee": return "bg-orange-100 text-orange-700";
      case "contact": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };
  
  const getTypeLabel = (type) => {
    switch (type) {
      case "org_member": return "Org Members";
      case "event_attendee": return "Event Attendees";
      case "contact": return "General Contacts";
      default: return type;
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {list.name}
            </h3>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(list.type)}`}>
              {getTypeLabel(list.type)}
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onDuplicate(list);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Duplicate List
                </button>
                <button
                  onClick={() => {
                    onDelete(list.id);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete List
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {list.description || "No description provided"}
        </p>
        
        {/* Stats */}
        <div className="space-y-2 mb-4 text-sm">
          
          {/* Campaign Status (4-state system) */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status:</span>
            <CampaignStatusBadge status={list.campaignStatus} />
          </div>
          
          {/* In Use Badge */}
          {list.campaignStatus?.totalCampaigns > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Use:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                {list.campaignStatus.totalCampaigns} campaign(s)
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Updated:</span>
            <span className="text-gray-500">{new Date(list.lastUpdated || list.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* SIMPLE COLORED BUTTONS */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onView}
            className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            View
          </button>
          <button
            onClick={() => onDuplicate(list)}
            className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Duplicate
          </button>
          <button
            onClick={() => onDelete(list.id)}
            className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
          {list.campaignStatus?.assigned ? (
            <button
              onClick={onUnassign}
              className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              Unassign
            </button>
          ) : (
            <button
              onClick={onUse}
              className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Use
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

