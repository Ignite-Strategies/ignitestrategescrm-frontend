import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Contact List Detail Page
 * View, edit, and manage individual contact lists
 */
export default function ContactListDetail() {
  const navigate = useNavigate();
  const { listId } = useParams();
  const orgId = getOrgId();
  
  const [list, setList] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  // Edit form
  const [editData, setEditData] = useState({
    name: "",
    description: ""
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 20;
  
  useEffect(() => {
    loadListData();
  }, [listId]);
  
  const loadListData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading contact list detail for ID:', listId);
      
      // Load list details
      console.log('📡 API call: GET /contact-lists/' + listId);
      const listResponse = await api.get(`/contact-lists/${listId}`);
      console.log('✅ List data received:', listResponse.data);
      setList(listResponse.data);
      setEditData({
        name: listResponse.data.name,
        description: listResponse.data.description || ""
      });
      
      // Load contacts
      console.log('📡 API call: GET /contact-lists/' + listId + '/contacts');
      const contactsResponse = await api.get(`/contact-lists/${listId}/contacts`);
      setContacts(contactsResponse.data);
    } catch (err) {
      console.error("Error loading list:", err);
      setError("Failed to load list details");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    setError("");
    
    try {
      await api.patch(`/contact-lists/${listId}`, editData);
      setList({ ...list, ...editData });
      setEditMode(false);
    } catch (err) {
      console.error("Error updating list:", err);
      setError(err.response?.data?.error || "Failed to update list");
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${list.name}"? This cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/contact-lists/${listId}`);
      navigate("/contact-list-manager", {
        state: { message: `List "${list.name}" deleted successfully` }
      });
    } catch (err) {
      console.error("Error deleting list:", err);
      setError("Failed to delete list");
    }
  };
  
  const handleRefresh = async () => {
    if (list.type !== "event_attendee") {
      alert("Only dynamic event lists can be refreshed");
      return;
    }
    
    try {
      setLoading(true);
      await api.post(`/contact-lists/${listId}/refresh`);
      await loadListData();
    } catch (err) {
      console.error("Error refreshing list:", err);
      setError("Failed to refresh list");
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["First Name", "Last Name", "Email", "Phone"];
    const rows = contacts.map(contact => [
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phone || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${list.name.replace(/[^a-z0-9]/gi, "_")}_contacts.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
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
  
  // Pagination
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(contacts.length / contactsPerPage);
  
  if (loading && !list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading list...</p>
        </div>
      </div>
    );
  }
  
  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">List not found</p>
          <button
            onClick={() => navigate("/contact-list-manager")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Lists
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/contact-list-manager")}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back to Lists
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {list.type === "event_attendee" && (
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium disabled:opacity-50"
                >
                  🔄 Refresh
                </button>
              )}
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
              >
                📥 Export CSV
              </button>
              {list.campaignStatus?.assigned ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    In Use ({list.campaignStatus.totalCampaigns} campaign{list.campaignStatus.totalCampaigns !== 1 ? 's' : ''})
                  </span>
                  <button
                    onClick={() => navigate('/contact-list-manager')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                  >
                    Manage Lists
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/compose?listId=${listId}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                >
                  📧 Use in Campaign
                </button>
              )}
            </div>
          </div>
          
          {/* List Info */}
          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setEditData({ name: list.name, description: list.description || "" });
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(list.type)}`}>
                      {getTypeLabel(list.type)}
                    </span>
                  </div>
                  <p className="text-gray-600">{list.description || "No description provided"}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Contacts</p>
                  <p className="text-2xl font-bold text-blue-900">{contacts.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium mb-1">Times Used</p>
                  <p className="text-2xl font-bold text-green-900">{list.usageCount || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium mb-1">Last Updated</p>
                  <p className="text-sm font-medium text-purple-900">
                    {new Date(list.lastUpdated || list.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium mb-1">Last Used</p>
                  <p className="text-sm font-medium text-orange-900">
                    {list.lastUsed ? new Date(list.lastUsed).toLocaleDateString() : "Never"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Contacts Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Contacts ({contacts.length})
              </h2>
              {loading && <p className="text-sm text-gray-500">Refreshing...</p>}
            </div>
          </div>
          
          {contacts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No contacts in this list</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-indigo-700 font-semibold">
                                {(contact.goesBy || contact.firstName || "?")[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {contact.firstName} {contact.lastName}
                              </div>
                              {contact.orgMember && (
                                <div className="text-xs text-purple-600">Org Member</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.phone || "—"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {indexOfFirstContact + 1} to {Math.min(indexOfLastContact, contacts.length)} of {contacts.length} contacts
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


