import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function Forms() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [forms, setForms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, inactive

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading forms with orgId:', orgId);
      console.log('🔍 Forms API URL:', `/forms?orgId=${orgId}`);
      console.log('🔍 Events API URL:', `/orgs/${orgId}/events`);
      
      const [formsRes, eventsRes] = await Promise.all([
        api.get(`/forms?orgId=${orgId}`),
        api.get(`/orgs/${orgId}/events`)
      ]);
      
      console.log('✅ Forms response:', formsRes.data);
      console.log('✅ Events response:', eventsRes.data);
      
      setForms(formsRes.data || []);
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error("❌ Error loading forms:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      setForms([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventName = (eventId, eventObj) => {
    // Use embedded event object first, fallback to events array, then "Unknown Event"
    if (eventObj?.name) return eventObj.name;
    const event = events.find(e => e.id === eventId);
    return event?.name || "Unknown Event";
  };

  const deleteForm = async (formId) => {
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return;
    }
    
    try {
      await api.delete(`/forms/saver/${formId}`);
      loadData(); // Reload the list
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("Failed to delete form");
    }
  };

  const filteredForms = forms.filter(form => {
    if (filter === "active") return form.isActive;
    if (filter === "inactive") return !form.isActive;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-cyan-600 hover:text-cyan-700 text-sm mb-2 inline-flex items-center"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Forms</h1>
              <p className="text-gray-600 mt-1">Create and manage event intake forms</p>
            </div>
            <button
              onClick={() => navigate("/forms/create")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              + Create Form
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Total Forms</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{forms.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Active Forms</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {forms.filter(f => f.isActive).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Total Submissions</div>
            <div className="text-3xl font-bold text-cyan-600 mt-2">
              {forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium">Avg. Conversion</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              {forms.length > 0 ? Math.round((forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0) / forms.length) * 10) / 10 : 0}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-cyan-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Forms
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "active"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "inactive"
                ? "bg-gray-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Inactive
          </button>
        </div>

        {/* Forms List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Loading forms...</div>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Forms Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first form to start collecting submissions
            </p>
            <button
              onClick={() => navigate("/forms/create")}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Create Your First Form
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-6 cursor-pointer"
                onClick={() => navigate(`/forms/${form.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{form.name || form.publicTitle || 'Untitled Form'}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          form.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {form.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      {form.description || "No description"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📅 {getEventName(form.eventId, form.event)}</span>
                      <span>•</span>
                      <span>📊 {form.submissionCount || 0} submissions</span>
                      <span>•</span>
                      <span>🎯 Target: {form.targetStage || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          `https://ticketing.f3capitalimpact.org/forms/${form.slug}`
                        );
                        alert("Form URL copied to clipboard!");
                      }}
                      className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                    >
                      📋 Copy URL
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/forms/create?editId=${form.id}`);
                      }}
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteForm(form.id);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

