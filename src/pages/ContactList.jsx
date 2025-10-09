import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactList() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [lists, setLists] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [newListType, setNewListType] = useState("pipeline");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For pipeline-based lists
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [events, setEvents] = useState([]);

  // For tag-based lists
  const [tagName, setTagName] = useState("");
  const [tagValue, setTagValue] = useState("");

  useEffect(() => {
    loadLists();
    loadEvents();
  }, [orgId]);

  const loadLists = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/contact-lists?orgId=${orgId}`);
      setLists(response.data);
    } catch (err) {
      console.error("Error loading contact lists:", err);
      setError("Failed to load contact lists.");
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await api.get(`/orgs/${orgId}/events`);
      setEvents(response.data);
    } catch (err) {
      console.error("Error loading events:", err);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      let criteria = {};
      
      if (newListType === "pipeline") {
        criteria = {
          eventId: selectedEvent,
          audienceType: selectedAudience,
          stage: selectedStage
        };
      } else if (newListType === "tag_based") {
        criteria = {
          tagName: tagName,
          tagValue: tagValue
        };
      }

      await api.post("/contact-lists", {
        orgId,
        name: newListName,
        description: newListDescription,
        type: newListType,
        criteria: criteria
      });
      
      setNewListName("");
      setNewListDescription("");
      setShowCreateModal(false);
      loadLists();
    } catch (err) {
      console.error("Error creating list:", err);
      setError("Failed to create list.");
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm("Are you sure you want to delete this contact list?")) {
      try {
        await api.delete(`/contact-lists/${listId}`);
        loadLists();
      } catch (err) {
        console.error("Error deleting list:", err);
        setError("Failed to delete list.");
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading contact lists...</div>;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => navigate("/email")}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  ← Campaign Dashboard
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  ← Dashboard
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Lists</h1>
              <p className="text-gray-600">Create dynamic contact lists based on pipeline stages and tags</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              + Create New List
            </button>
          </div>

          {lists.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="mb-4">No contact lists created yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Create Your First List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map(list => (
                <div key={list._id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{list.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{list.description || "No description provided."}</p>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div>Type: {list.type}</div>
                    <div>Contacts: {list.contacts?.length || 0}</div>
                    {list.criteria && (
                      <div className="mt-1">
                        {list.type === "pipeline" && (
                          <div>Event: {list.criteria.eventId}</div>
                        )}
                        {list.type === "tag_based" && (
                          <div>Tag: {list.criteria.tagName} = {list.criteria.tagValue}</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => navigate(`/send-email?listId=${list._id}`)}
                      className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 font-medium"
                    >
                      Send Emails
                    </button>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                        View
                      </button>
                      <button 
                        onClick={() => handleDeleteList(list._id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create List Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Contact List</h3>
                <form onSubmit={handleCreateList} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">List Type</label>
                    <select
                      value={newListType}
                      onChange={(e) => setNewListType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="pipeline">Pipeline Stage</option>
                      <option value="tag_based">Tag Based</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  {newListType === "pipeline" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                        <select
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Select an event</option>
                          {events.map(event => (
                            <option key={event._id} value={event._id}>{event.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Audience Type</label>
                        <select
                          value={selectedAudience}
                          onChange={(e) => setSelectedAudience(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Select audience</option>
                          <option value="org_member">F3 Members</option>
                          <option value="family_prospect">Friends & Family</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                        <select
                          value={selectedStage}
                          onChange={(e) => setSelectedStage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="">Select stage</option>
                          <option value="member">Prospective Attendee</option>
                          <option value="soft_commit">Soft Commit</option>
                          <option value="paid">Paid</option>
                          <option value="lost">Can't Make It</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {newListType === "tag_based" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                        <input
                          type="text"
                          value={tagName}
                          onChange={(e) => setTagName(e.target.value)}
                          placeholder="e.g., knows_organizer"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tag Value</label>
                        <input
                          type="text"
                          value={tagValue}
                          onChange={(e) => setTagValue(e.target.value)}
                          placeholder="e.g., true"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Create List
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
