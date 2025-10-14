import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Contact List View - Preview and Select Contacts
 * Shows all org members with checkboxes for selection
 */
export default function ContactListView() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orgMembers, setOrgMembers] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [listName, setListName] = useState("All Org Members");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    loadOrgMembers();
  }, [orgId]);
  
  const loadOrgMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orgmembers?orgId=${orgId}`);
      
      // Handle both array and object response formats
      const members = Array.isArray(response.data) 
        ? response.data 
        : response.data.members || [];
      
      setOrgMembers(members);
      
      // Auto-select all org members (use contactId, not id!)
      setSelectedContacts(new Set(members.map(m => m.contactId)));
    } catch (err) {
      console.error("Error loading org members:", err);
      setError("Failed to load org members");
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleContact = (contactId) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = () => {
    const allIds = new Set(filteredMembers.map(m => m.id));
    setSelectedContacts(allIds);
  };
  
  const handleDeselectAll = () => {
    setSelectedContacts(new Set());
  };
  
  const handleSaveList = async () => {
    if (!listName.trim()) {
      setError("Please enter a list name");
      return;
    }
    
    if (selectedContacts.size === 0) {
      setError("Please select at least one contact");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const selectedContactIds = Array.from(selectedContacts);
      
      await api.post("/contact-lists/from-selection", {
        orgId,
        name: listName.trim(),
        description: "Selected org members",
        selectedContactIds
      });
      
      alert(`✅ Contact list "${listName}" created with ${selectedContactIds.length} contacts!`);
      
      // Check if we're in campaign flow
      const campaignId = new URLSearchParams(window.location.search).get('campaignId');
      if (campaignId) {
        // Campaign flow: Return to CampaignCreator with both params
        navigate(`/campaign-creator?campaignId=${campaignId}&listId=${response.data.id}`);
      } else {
        // Standalone: Go back to manager
        navigate("/contact-list-manager");
      }
      
    } catch (err) {
      console.error("Error creating list:", err);
      
      // Make unique constraint error clearer
      if (err.response?.data?.error?.includes("Unique constraint failed")) {
        setError("⚠️ List name already exists! Please choose a different name like 'My Org Members' or 'All Members 2024'");
      } else {
        setError(err.response?.data?.error || "Failed to create contact list");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Filter members based on search
  const filteredMembers = orgMembers.filter(member => 
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Select Contacts</h1>
              <p className="text-gray-600">Choose which org members to include in your list</p>
            </div>
            <button
              onClick={() => navigate("/contact-list-builder")}
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
          
          {/* List Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Name *
            </label>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter list name..."
            />
          </div>
          
          {/* Stats */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-indigo-600">
                  {selectedContacts.size}
                </span>
                <span className="text-gray-600 ml-1">of {orgMembers.length} selected</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>
          
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Contact List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading contacts...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No contacts found
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.contactId}
                  className={`p-4 border-2 rounded-lg transition ${
                    selectedContacts.has(member.contactId)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(member.contactId)}
                      onChange={() => handleToggleContact(member.contactId)}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Save Button */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {selectedContacts.size > 0 && (
                  <span>Ready to create list with <strong>{selectedContacts.size} contacts</strong></span>
                )}
              </div>
              <button
                onClick={handleSaveList}
                disabled={loading || selectedContacts.size === 0}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {loading ? "Creating..." : "Create List"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
