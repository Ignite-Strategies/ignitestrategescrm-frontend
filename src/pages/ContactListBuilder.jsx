import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Contact List Builder - Modern Wizard Interface
 * Unified creation flow for all list types
 */
export default function ContactListBuilder() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [step, setStep] = useState(1); // 1: Type, 2: Configure, 3: Preview, 4: Create
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form data
  const [listData, setListData] = useState({
    name: "",
    description: "",
    type: ""
  });
  
  // Configuration data
  const [config, setConfig] = useState({
    eventId: "",
    audienceType: "",
    stages: []
  });
  
  // Preview data
  const [preview, setPreview] = useState({
    contacts: [],
    count: 0
  });
  
  // Lookup data
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(null);
  
  useEffect(() => {
    loadFormData();
  }, [orgId]);
  
  const loadFormData = async () => {
    try {
      const response = await api.get(`/contact-lists/form-data?orgId=${orgId}`);
      setFormData(response.data);
      
      // Load events separately
      const eventsResponse = await api.get(`/orgs/${orgId}/events`);
      setEvents(eventsResponse.data);
    } catch (err) {
      console.error("Error loading form data:", err);
      setError("Failed to load form data");
    }
  };
  
  const handleTypeSelect = (type) => {
    setListData({ ...listData, type });
    setStep(2);
  };
  
  const handlePreview = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Create a temporary list to get contacts
      const criteria = buildCriteria();
      const tempList = {
        orgId,
        name: "temp_preview",
        type: listData.type,
        criteria
      };
      
      const listResponse = await api.post("/contact-lists", tempList);
      const listId = listResponse.data.id;
      
      // Get contacts from the list
      const contactsResponse = await api.get(`/contact-lists/${listId}/contacts`);
      setPreview({
        contacts: contactsResponse.data.slice(0, 10), // First 10 for preview
        count: contactsResponse.data.length
      });
      
      // Delete the temp list
      await api.delete(`/contact-lists/${listId}`);
      
      setStep(3);
    } catch (err) {
      console.error("Error generating preview:", err);
      setError(err.response?.data?.error || "Failed to generate preview");
    } finally {
      setLoading(false);
    }
  };
  
  const buildCriteria = () => {
    switch (listData.type) {
      case "event_attendee":
        return {
          eventId: config.eventId,
          audienceType: config.audienceType,
          stages: config.stages
        };
      default:
        return {};
    }
  };
  
  const handleCreate = async () => {
    if (!listData.name) {
      setError("Please enter a list name");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const criteria = buildCriteria();
      const payload = {
        orgId,
        name: listData.name,
        description: listData.description,
        type: listData.type,
        criteria
      };
      
      await api.post("/contact-lists", payload);
      
      // Success! Navigate back to list manager
      navigate("/contact-list-manager", { 
        state: { message: `List "${listData.name}" created with ${preview.count} contacts!` }
      });
    } catch (err) {
      console.error("Error creating list:", err);
      setError(err.response?.data?.error || "Failed to create list");
    } finally {
      setLoading(false);
    }
  };
  
  const getSelectedEvent = () => {
    return events.find(e => e._id === config.eventId);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate("/contact-list-manager")}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                ← Back to Lists
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Contact List</h1>
            <p className="text-gray-600">Build a targeted list for your campaigns</p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Type" },
                { num: 2, label: "Configure" },
                { num: 3, label: "Preview" },
                { num: 4, label: "Create" }
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.num ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {s.num}
                    </div>
                    <span className={`text-xs mt-2 ${
                      step >= s.num ? "text-indigo-600 font-medium" : "text-gray-500"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`h-1 flex-1 ${
                      step > s.num ? "bg-indigo-600" : "bg-gray-200"
                    }`} style={{ marginTop: "-24px" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Step 1: Select List Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select List Type</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* All Contacts */}
                <button
                  onClick={() => handleTypeSelect("contact")}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition text-center group"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Contacts</h3>
                  <p className="text-sm text-gray-600">Everyone in your CRM</p>
                  {formData && (
                    <p className="text-xs text-gray-500 mt-3">
                      {formData.listTypes.find(t => t.value === "contact")?.count || 0} contacts
                    </p>
                  )}
                </button>
                
                {/* Org Members */}
                <button
                  onClick={() => handleTypeSelect("org_member")}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-md transition text-center group"
                >
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Org Members</h3>
                  <p className="text-sm text-gray-600">Your master member list</p>
                  {formData && (
                    <p className="text-xs text-gray-500 mt-3">
                      {formData.listTypes.find(t => t.value === "org_member")?.count || 0} members
                    </p>
                  )}
                </button>
                
                {/* Event Attendees */}
                <button
                  onClick={() => handleTypeSelect("event_attendee")}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-md transition text-center group"
                >
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Attendees</h3>
                  <p className="text-sm text-gray-600">Filter by event & pipeline stage</p>
                  {formData && (
                    <p className="text-xs text-gray-500 mt-3">
                      {formData.events?.length || 0} events available
                    </p>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 2: Configure List */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Configure Your List</h2>
              
              {/* List Name & Description */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    value={listData.name}
                    onChange={(e) => setListData({ ...listData, name: e.target.value })}
                    placeholder="e.g., Bros & Brews 2025 Prospects"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={listData.description}
                    onChange={(e) => setListData({ ...listData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe this list and when you'd use it..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              {/* Type-specific configuration */}
              {listData.type === "event_attendee" && (
                <div className="space-y-6 mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Event Filters</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Event *
                    </label>
                    <select
                      value={config.eventId}
                      onChange={(e) => setConfig({ ...config, eventId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Choose an event...</option>
                      {events.map(event => (
                        <option key={event._id} value={event._id}>
                          {event.name} - {new Date(event.startDateTime).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audience Type
                    </label>
                    <select
                      value={config.audienceType}
                      onChange={(e) => setConfig({ ...config, audienceType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">All audiences</option>
                      <option value="org_member">F3 Members</option>
                      <option value="family_prospect">Friends & Family</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pipeline Stages (select multiple)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "in_funnel", label: "In Funnel" },
                        { value: "general_awareness", label: "General Awareness" },
                        { value: "personal_invite", label: "Personal Invite" },
                        { value: "expressed_interest", label: "Expressed Interest" },
                        { value: "soft_commit", label: "Soft Commit" },
                        { value: "paid", label: "Paid" },
                        { value: "cant_attend", label: "Can't Attend" }
                      ].map((stage) => (
                        <label key={stage.value} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.stages.includes(stage.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setConfig({ ...config, stages: [...config.stages, stage.value] });
                              } else {
                                setConfig({ ...config, stages: config.stages.filter(s => s !== stage.value) });
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{stage.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {(listData.type === "contact" || listData.type === "org_member") && (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg mb-8">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Ready to Preview</h4>
                      <p className="text-sm text-blue-800">
                        This list will include all {listData.type === "contact" ? "contacts" : "org members"} in your database.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handlePreview}
                  disabled={loading || !listData.name || (listData.type === "event_attendee" && !config.eventId)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {loading ? "Loading..." : "Preview List →"}
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Preview */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Preview Your List</h2>
              
              {/* Summary */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">{listData.name}</h3>
                    <p className="text-sm text-green-700">{listData.description || "No description"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-green-900">{preview.count}</p>
                    <p className="text-sm text-green-700">contacts</p>
                  </div>
                </div>
              </div>
              
              {/* Contact Preview */}
              {preview.contacts.length > 0 ? (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Sample Contacts (showing first 10)</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.contacts.map((contact) => (
                          <tr key={contact.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {contact.goesBy || contact.firstName} {contact.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{contact.email}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{contact.phone || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg mb-6">
                  <p className="text-gray-500">No contacts match your criteria</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back to Configure
                </button>
                <button
                  onClick={handleCreate}
                  disabled={loading || preview.count === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {loading ? "Creating..." : `Create List (${preview.count} contacts)`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

