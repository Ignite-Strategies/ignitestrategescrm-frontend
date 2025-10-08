import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

// Field type templates
const FIELD_TEMPLATES = {
  text: { type: "text", label: "Text Field", placeholder: "Enter text", required: false },
  email: { type: "email", label: "Email Address", placeholder: "email@example.com", required: true },
  tel: { type: "tel", label: "Phone Number", placeholder: "(555) 555-5555", required: false },
  number: { type: "number", label: "Number", placeholder: "0", required: false, min: 0 },
  select: { type: "select", label: "Dropdown", required: false, options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" }
  ]},
  textarea: { type: "textarea", label: "Long Text", placeholder: "Enter details...", required: false },
  checkbox: { type: "checkbox", label: "Checkbox", required: false }
};

export default function FormBuilder() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  // Form config - Internal
  const [formName, setFormName] = useState("");
  const [description, setDescription] = useState(""); // Internal notes
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [targetStage, setTargetStage] = useState("soft_commit");
  
  // Form config - Public Facing
  const [publicTitle, setPublicTitle] = useState("");
  const [publicDescription, setPublicDescription] = useState("");
  const [fields, setFields] = useState([
    { ...FIELD_TEMPLATES.text, id: "name", label: "Full Name", required: true, order: 1 },
    { ...FIELD_TEMPLATES.email, id: "email", order: 2 },
    { ...FIELD_TEMPLATES.tel, id: "phone", label: "Phone Number", required: true, order: 3 }
  ]);
  
  // Data from API
  const [events, setEvents] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [orgId]);

  useEffect(() => {
    if (selectedEvent) {
      loadPipelines(selectedEvent);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      const res = await api.get(`/orgs/${orgId}/events`);
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadPipelines = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/pipelines`);
      setPipelines(res.data || []);
    } catch (error) {
      console.error("Error loading pipelines:", error);
      setPipelines([]);
    }
  };

  const addField = (templateKey) => {
    const template = FIELD_TEMPLATES[templateKey];
    const newField = {
      ...template,
      id: `field_${Date.now()}`,
      order: fields.length + 1
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const updateField = (fieldId, updates) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const moveField = (fieldId, direction) => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (direction === "up" && index > 0) {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      setFields(newFields.map((f, i) => ({ ...f, order: i + 1 })));
    } else if (direction === "down" && index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]];
      setFields(newFields.map((f, i) => ({ ...f, order: i + 1 })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formName || !selectedEvent || !selectedPipeline) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const slug = formName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const formConfig = {
        orgId,
        eventId: selectedEvent,
        audienceType: selectedPipeline, // Backend will find/create pipeline
        name: formName,
        slug,
        publicTitle: publicTitle || formName, // Use public title or fallback to internal name
        publicDescription: publicDescription || description,
        targetStage,
        fields: fields.map(f => ({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          order: f.order,
          ...(f.type === "select" && { options: f.options }),
          ...(f.type === "number" && { min: f.min, max: f.max })
        })),
        isActive: true
      };

      const res = await api.post("/forms", formConfig);
      alert("Form created successfully!");
      navigate("/forms");
    } catch (error) {
      console.error("Error creating form:", error);
      alert(error.response?.data?.error || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  const STAGES = [
    { value: "in_funnel", label: "In Funnel" },
    { value: "general_awareness", label: "General Awareness" },
    { value: "personal_invite", label: "Personal Invite" },
    { value: "expressed_interest", label: "Expressed Interest" },
    { value: "soft_commit", label: "Soft Commit" },
    { value: "paid", label: "Paid" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate("/forms")}
            className="text-cyan-600 hover:text-cyan-700 text-sm mb-2 inline-flex items-center"
          >
            ← Back to Forms
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Form</h1>
          <p className="text-gray-600 mt-1">Build a custom intake form for your event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Internal Only Header */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-1">Internal Only</h2>
              <p className="text-sm text-gray-300">
                The below is to help you when recalling this form and determining who the target is. You can always move people around in the pipeline but this automatically collects them in a pipeline location.
              </p>
            </div>
            
            {/* Form Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Form Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Form Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Bros & Brews Soft Commit"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purpose
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="e.g., Landing page soft commit for public signups"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event *
                  </label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select event...</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEvent && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Audience Type *
                    </label>
                    <select
                      value={selectedPipeline}
                      onChange={(e) => setSelectedPipeline(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select audience...</option>
                      <option value="org_members">Org Members</option>
                      <option value="friends_family">Friends & Family</option>
                      <option value="landing_page_public">Public Contacts</option>
                      <option value="community_partners">Community Partners</option>
                      <option value="cold_outreach">Cold Outreach</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Stage *
                  </label>
                  <select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  >
                    {STAGES.map(stage => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Field Library */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎨 Add Fields</h2>
              
              {/* Contact Details */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Contact Details</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => addField('text')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-cyan-50 border border-gray-300 hover:border-cyan-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">📝</span> Name
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('email')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-cyan-50 border border-gray-300 hover:border-cyan-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">📧</span> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('tel')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-cyan-50 border border-gray-300 hover:border-cyan-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">📱</span> Phone
                  </button>
                </div>
              </div>
              
              {/* Answer Type */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Answer Type</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => addField('text')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">📝</span> Short Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('textarea')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">💬</span> Long Answer
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('number')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-green-50 border border-gray-300 hover:border-green-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">🔢</span> Number
                  </button>
                </div>
              </div>
              
              {/* Multiple Choice */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Multiple Choice</h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => addField('select')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-purple-50 border border-gray-300 hover:border-purple-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">🔘</span> Radio (one selection)
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('checkbox')}
                    className="w-full px-4 py-2.5 bg-white hover:bg-purple-50 border border-gray-300 hover:border-purple-400 text-gray-900 rounded-lg text-sm font-medium transition text-left flex items-center"
                  >
                    <span className="mr-2">✅</span> Checkbox (multiple selection)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Public Facing Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Public Preview (What People See)</h2>
              
              {/* Public Title & Description - EDITABLE */}
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <input
                  type="text"
                  value={publicTitle}
                  onChange={(e) => setPublicTitle(e.target.value)}
                  className="text-2xl font-bold text-gray-900 mb-2 w-full bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-cyan-500 outline-none"
                  placeholder="Your Form Title Here"
                />
                <textarea
                  value={publicDescription}
                  onChange={(e) => setPublicDescription(e.target.value)}
                  className="text-gray-600 w-full bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-cyan-500 outline-none resize-none"
                  placeholder="Add explainer text to help people understand what to do..."
                  rows="2"
                />
              </div>
              
              {fields.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  Add fields from the left to build your form
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-cyan-500 outline-none"
                            placeholder="Field Label"
                          />
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => moveField(field.id, "up")}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveField(field.id, "down")}
                            disabled={index === fields.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeField(field.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {field.type === "select" ? (
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                          {field.options.map((opt, i) => (
                            <option key={i}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          placeholder={field.placeholder}
                          rows="3"
                          disabled
                        />
                      ) : (
                        <input
                          type={field.type}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          placeholder={field.placeholder}
                          disabled
                        />
                      )}

                      <div className="mt-2 flex gap-4 text-sm">
                        <label className="flex items-center gap-2 text-gray-600">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          />
                          Required
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {fields.length > 0 && (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Form"}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

