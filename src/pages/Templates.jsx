import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function Templates() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterChannel, setFilterChannel] = useState("all"); // "all", "email", "slack", "sms"
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create template form
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    channel: "email",
    subject: "",
    body: "",
    variables: []
  });

  const CHANNELS = [
    { 
      value: "email", 
      label: "Email", 
      icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      color: "indigo"
    },
    { 
      value: "slack", 
      label: "Slack", 
      icon: "M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 01-2.52-2.523 2.526 2.526 0 012.52-2.52h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.523h-6.313z",
      color: "purple"
    },
    { 
      value: "sms", 
      label: "SMS", 
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      color: "green"
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, [orgId]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/templates?orgId=${orgId}`);
      setTemplates(response.data);
    } catch (err) {
      console.error("Error loading templates:", err);
      // Show empty state instead of error for now
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/templates", {
        orgId,
        ...newTemplate
      });
      setShowCreateModal(false);
      setNewTemplate({
        name: "",
        description: "",
        channel: "email",
        subject: "",
        body: "",
        variables: []
      });
      loadTemplates();
    } catch (err) {
      console.error("Error creating template:", err);
      setError("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await api.delete(`/templates/${templateId}`);
        loadTemplates();
      } catch (err) {
        console.error("Error deleting template:", err);
        setError("Failed to delete template");
      }
    }
  };

  const getChannelColor = (channel) => {
    const channelObj = CHANNELS.find(c => c.value === channel);
    return channelObj?.color || "gray";
  };

  const getChannelIcon = (channel) => {
    const channelObj = CHANNELS.find(c => c.value === channel);
    return channelObj?.icon || "";
  };

  const filteredTemplates = templates.filter(template => {
    if (filterChannel === "all") return true;
    return template.channel === filterChannel;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Templates</h1>
              <p className="text-gray-600">Create reusable templates for email, Slack, and SMS</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/campaigns")}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back to Campaigns
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
              >
                + Create Template
              </button>
            </div>
          </div>

          {/* Channel Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setFilterChannel("all")}
              className={`px-4 py-2 font-medium transition ${
                filterChannel === "all"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Templates
            </button>
            {CHANNELS.map(channel => (
              <button
                key={channel.value}
                onClick={() => setFilterChannel(channel.value)}
                className={`px-4 py-2 font-medium transition flex items-center gap-2 ${
                  filterChannel === channel.value
                    ? `text-${channel.color}-600 border-b-2 border-${channel.color}-600`
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={channel.icon} />
                </svg>
                {channel.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && !showCreateModal ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Templates Yet</h3>
            <p className="text-gray-600 mb-6">Create your first message template for emails, Slack, or SMS</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          /* Template Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const channelColor = getChannelColor(template.channel);
              const channelIcon = getChannelIcon(template.channel);
              
              return (
                <div
                  key={template._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 bg-${channelColor}-100 rounded-lg`}>
                      <svg className={`w-5 h-5 text-${channelColor}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={channelIcon} />
                      </svg>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${channelColor}-100 text-${channelColor}-700`}>
                      {template.channel.toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  )}
                  
                  {template.subject && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Subject:</p>
                      <p className="text-sm text-gray-700 line-clamp-1">{template.subject}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Body:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{template.body}</p>
                  </div>
                  
                  {template.usageCount > 0 && (
                    <p className="text-xs text-gray-500 mb-4">Used {template.usageCount} times</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/templates/${template._id}/edit`)}
                      className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template._id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Template Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Template</h3>
              
              <form onSubmit={handleCreateTemplate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Event Invitation"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Brief description of when to use this"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                  <div className="grid grid-cols-3 gap-4">
                    {CHANNELS.map(channel => (
                      <button
                        key={channel.value}
                        type="button"
                        onClick={() => setNewTemplate({...newTemplate, channel: channel.value})}
                        className={`p-4 border-2 rounded-lg text-center transition ${
                          newTemplate.channel === channel.value
                            ? `border-${channel.color}-500 bg-${channel.color}-50`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <svg className={`w-6 h-6 mx-auto mb-2 ${
                          newTemplate.channel === channel.value ? `text-${channel.color}-600` : "text-gray-400"
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={channel.icon} />
                        </svg>
                        <p className={`text-sm font-medium ${
                          newTemplate.channel === channel.value ? `text-${channel.color}-700` : "text-gray-600"
                        }`}>{channel.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {newTemplate.channel === "email" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                    <input
                      type="text"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., You're Invited: {{eventName}}"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                  <textarea
                    rows={8}
                    value={newTemplate.body}
                    onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={
                      newTemplate.channel === "sms" 
                        ? "Hey {{firstName}}! Quick invite for {{eventName}} on {{date}}. Interested? Reply YES!"
                        : newTemplate.channel === "slack"
                        ? "Hey {{firstName}} 👋 We've got {{eventName}} coming up on {{date}}. Want to join?"
                        : "Hi {{firstName}},\n\nYou're invited to {{eventName}}!\n\nDate: {{date}}\nTime: {{time}}\nLocation: {{location}}"
                    }
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Use variables like {'{{firstName}}'}, {'{{eventName}}'}, {'{{date}}'} for personalization
                  </p>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
