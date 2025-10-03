import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ListManagement() {
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    type: "manual",
    filters: {
      supporterFilters: {},
      prospectFilters: {}
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const orgId = getOrgId();
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      setLists(response.data);
    } catch (error) {
      console.error("Error loading lists:", error);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orgId = getOrgId();
      await api.post("/contact-lists", {
        ...createForm,
        orgId,
        createdBy: "admin"
      });
      
      setShowCreateForm(false);
      setCreateForm({
        name: "",
        description: "",
        type: "manual",
        filters: {
          supporterFilters: {},
          prospectFilters: {}
        }
      });
      loadLists();
    } catch (error) {
      console.error("Error creating list:", error);
      alert("Error creating list: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm("Are you sure you want to delete this list?")) return;
    
    try {
      await api.delete(`/contact-lists/${listId}`);
      loadLists();
    } catch (error) {
      console.error("Error deleting list:", error);
      alert("Error deleting list: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Lists</h1>
              <p className="text-gray-600">Create and manage targeted contact lists for email campaigns</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + Create New List
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Contact List</h2>
                
                <form onSubmit={handleCreateList} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      List Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., High Value Supporters, Local Friends"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe this list and when you'd use it..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      List Type *
                    </label>
                    <select
                      value={createForm.type}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="manual">Manual List (add contacts individually)</option>
                      <option value="dynamic">Dynamic List (auto-updates based on criteria)</option>
                      <option value="pipeline">Pipeline List (from event pipeline)</option>
                      <option value="tag_based">Tag-Based List (contacts with specific tags)</option>
                    </select>
                  </div>

                  {/* Quick List Options */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3">Quick List Options:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setCreateForm(prev => ({ 
                          ...prev, 
                          name: "All F3 Members",
                          description: "All supporters in your master CRM",
                          type: "dynamic"
                        }))}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                      >
                        All F3 Members
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateForm(prev => ({ 
                          ...prev, 
                          name: "High Engagement",
                          description: "Supporters with high engagement level",
                          type: "dynamic"
                        }))}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                      >
                        High Engagement
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateForm(prev => ({ 
                          ...prev, 
                          name: "Friends & Family",
                          description: "All family prospects and friends",
                          type: "dynamic"
                        }))}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                      >
                        Friends & Family
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateForm(prev => ({ 
                          ...prev, 
                          name: "Local Contacts",
                          description: "Contacts in your local area",
                          type: "tag_based"
                        }))}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm"
                      >
                        Local Contacts
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {loading ? "Creating..." : "Create List"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div key={list._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/compose?listId=${list._id}`)}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => handleDeleteList(list._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{list.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Contacts:</span>
                    <span className="font-medium">{list.totalContacts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{list.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium">{new Date(list.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Used:</span>
                    <span className="font-medium">{list.usageCount} times</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {lists.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contact lists yet</h3>
              <p className="text-gray-600 mb-6">Create your first list to start targeting your contacts</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                + Create Your First List
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
