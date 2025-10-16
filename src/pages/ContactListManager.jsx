import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * ContactListManager - Production Ready with Conflict Detection
 * Shows which lists are in use and prevents conflicts
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
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
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
        campaignsCount: campaigns.length,
        campaigns: campaigns.map(c => ({ id: c.id, name: c.name, status: c.status, contactListId: c.contactListId }))
      });
      
      // Enrich lists with conflict detection
      const enrichedLists = lists.map(list => {
        const linkedCampaigns = campaigns.filter(c => c.contactListId === list.id);
        const draftCampaigns = linkedCampaigns.filter(c => c.status === 'draft');
        const sentCampaigns = linkedCampaigns.filter(c => c.status === 'sent');
        const activeCampaigns = linkedCampaigns.filter(c => c.status === 'active');
        
        // Determine conflict level
        let conflictLevel = 'none';
        let conflictMessage = '';
        
        if (draftCampaigns.length > 0) {
          conflictLevel = 'draft';
          conflictMessage = `⚠️ In draft campaign${draftCampaigns.length > 1 ? 's' : ''}: ${draftCampaigns.map(c => c.name).join(', ')}`;
        } else if (sentCampaigns.length > 0) {
          conflictLevel = 'sent';
          conflictMessage = `🚨 Sent in campaign${sentCampaigns.length > 1 ? 's' : ''}: ${sentCampaigns.map(c => c.name).join(', ')}`;
        } else if (activeCampaigns.length > 0) {
          conflictLevel = 'active';
          conflictMessage = `🔄 Active in campaign${activeCampaigns.length > 1 ? 's' : ''}: ${activeCampaigns.map(c => c.name).join(', ')}`;
        }
        
        const enrichedList = {
          ...list,
          campaignStatus: {
            assigned: draftCampaigns.length > 0,
            used: sentCampaigns.length > 0 || activeCampaigns.length > 0,
            totalCampaigns: linkedCampaigns.length,
            draftCampaigns,
            sentCampaigns,
            activeCampaigns,
            conflictLevel,
            conflictMessage
          }
        };
        
        console.log(`📋 List "${list.name}":`, {
          conflictLevel,
          conflictMessage,
          linkedCampaigns: linkedCampaigns.length
        });
        
        return enrichedList;
      });
      
      setLists(enrichedLists);
      setCampaigns(campaigns);
    } catch (err) {
      console.error("Error loading data:", err);
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
  
  const handleUnassignList = async (list) => {
    if (!list.campaignStatus?.assigned) return;
    
    const campaignNames = list.campaignStatus.draftCampaigns.map(c => c.name).join(', ');
    if (!confirm(`Unassign "${list.name}" from campaign(s): ${campaignNames}?`)) return;
    
    try {
      for (const campaign of list.campaignStatus.draftCampaigns) {
        await api.patch(`/campaigns/${campaign.id}`, {
          contactListId: null
        });
      }
      loadData(); // Reload lists
    } catch (err) {
      alert('Failed to unassign list: ' + err.message);
    }
  };

  const handleUseList = async (list) => {
    try {
      // Load available campaigns (draft ones)
      const campaignsRes = await api.get(`/campaigns?orgId=${orgId}&status=draft`);
      const availableCampaigns = campaignsRes.data;
      
      if (availableCampaigns.length === 0) {
        // No draft campaigns - create one
        const campaignName = prompt(`Create a new campaign for "${list.name}":`);
        if (!campaignName) return;
        
        const response = await api.post("/campaigns", {
          orgId,
          name: campaignName.trim(),
          description: `Campaign for ${list.name}`,
          status: "draft",
        });
        
        const newCampaign = response.data;
        
        // Attach list to new campaign
        await api.patch(`/campaigns/${newCampaign.id}`, {
          contactListId: list.id
        });
        
        // Navigate to CampaignCreator with the new campaign
        navigate('/campaign-creator', { 
          state: { campaignId: newCampaign.id } 
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
        alert('Campaign not found. Please try again.');
        return;
      }
      
      // Attach list to selected campaign
      await api.patch(`/campaigns/${campaign.id}`, {
        contactListId: list.id
      });
      
      // Navigate to CampaignCreator with the campaign
      navigate('/campaign-creator', { 
        state: { campaignId: campaign.id } 
      });
      
    } catch (err) {
      console.error('Error using list:', err);
      
      // Handle conflict detection
      if (err.response?.status === 409) {
        const conflictData = err.response.data;
        const conflictNames = conflictData.conflicts.map(c => `${c.name} (${c.status})`).join(', ');
        
        const proceed = confirm(
          `⚠️ CONFLICT DETECTED!\n\n` +
          `"${list.name}" is already used by:\n${conflictNames}\n\n` +
          `This means some contacts might receive duplicate emails.\n\n` +
          `Do you want to proceed anyway?`
        );
        
        if (proceed) {
          // Force the attachment by calling the API again with a flag
          try {
            await api.patch(`/campaigns/${campaign.id}`, {
              contactListId: list.id,
              forceConflict: true
            });
            
            navigate('/campaign-creator', { 
              state: { campaignId: campaign.id } 
            });
          } catch (forceErr) {
            alert('Failed to force conflict resolution: ' + forceErr.message);
          }
        }
      } else {
        alert('Failed to use list: ' + err.message);
      }
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
              <h1 className="text-3xl font-bold text-gray-900">Contact Lists</h1>
              <p className="text-gray-600 mt-1">Manage and organize your contact segments</p>
            </div>
            
            <button
              onClick={() => navigate("/contact-list-builder")}
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
                onUnassign={handleUnassignList}
                onView={() => navigate(`/contact-list/${list.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Campaign Status Badge - Shows conflict status
 */
function CampaignStatusBadge({ status }) {
  if (!status) {
    return <span className="text-gray-500 text-xs">Loading...</span>;
  }
  
  if (status.conflictLevel === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        🚨 Sent in Campaign
      </span>
    );
  }
  
  if (status.conflictLevel === 'draft') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
        ⚠️ In Draft Campaign
      </span>
    );
  }
  
  if (status.conflictLevel === 'active') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        🔄 Active Campaign
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
      ✅ Available
    </span>
  );
}

/**
 * Individual List Card Component
 */
function ListCard({ list, onDelete, onDuplicate, onUnassign, onView }) {
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
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {list.description || "No description provided"}
        </p>
        
        {/* CONFLICT WARNING */}
        {list.campaignStatus?.conflictLevel !== 'none' && (
          <div className={`mb-4 p-3 rounded-lg ${list.campaignStatus.conflictLevel === 'sent' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${list.campaignStatus.conflictLevel === 'sent' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
              <span className={`text-sm font-medium ${list.campaignStatus.conflictLevel === 'sent' ? 'text-red-800' : 'text-orange-800'}`}>
                {list.campaignStatus.conflictLevel === 'sent' ? '🚨 Sent in Campaign' : '⚠️ In Draft Campaign'}
              </span>
            </div>
            <div className={`text-xs ${list.campaignStatus.conflictLevel === 'sent' ? 'text-red-700' : 'text-orange-700'}`}>
              {list.campaignStatus.conflictMessage}
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="space-y-2 mb-4 text-sm">
          {/* Campaign Status */}
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
          
          {/* SMART BUTTON LOGIC */}
          {list.campaignStatus?.conflictLevel === 'none' ? (
            <button
              onClick={() => handleUseList(list)}
              className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              Use
            </button>
          ) : (
            <button
              onClick={() => alert(`Resolve conflicts for ${list.name}: ${list.campaignStatus.conflictMessage}`)}
              className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Resolve Conflicts
            </button>
          )}
          
          {list.campaignStatus?.assigned && (
            <button
              onClick={() => onUnassign(list)}
              className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              Unassign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}