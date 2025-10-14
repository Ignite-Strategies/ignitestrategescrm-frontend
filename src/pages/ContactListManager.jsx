import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Unified Contact List Manager - Production Ready
 * Consolidates all list creation methods into one clean interface
 */
export default function ContactListManager() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  
  // View states
  const [view, setView] = useState("all"); // all | create | detail
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
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      setLists(response.data);
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
                onUse={() => navigate(`/sequence-creator?listId=${list.id}`)}
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
 * Individual List Card Component
 */
function ListCard({ list, onDelete, onDuplicate, onUse, onView }) {
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
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Contacts:</span>
            <span className="font-semibold text-gray-900">{list.totalContacts || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Used:</span>
            <span className="font-semibold text-gray-900">{list.usageCount || 0} times</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Updated:</span>
            <span className="text-gray-500">{new Date(list.lastUpdated || list.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={onUse}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            Use in Campaign
          </button>
        </div>
      </div>
    </div>
  );
}

