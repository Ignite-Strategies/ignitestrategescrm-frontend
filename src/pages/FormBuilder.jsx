import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  radio: { type: "radio", label: "Radio Buttons", required: false, options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" }
  ]},
  textarea: { type: "textarea", label: "Long Text", placeholder: "Enter details...", required: false },
  checkbox: { type: "checkbox", label: "Checkbox", required: false, options: [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" }
  ]}
};

export default function FormBuilder() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  // Form config - Internal
  const [formName, setFormName] = useState("");
  const [description, setDescription] = useState(""); // Internal notes
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [targetStage, setTargetStage] = useState("aware");
  
  // Form config - Public Facing
  const [publicTitle, setPublicTitle] = useState("");
  const [publicDescription, setPublicDescription] = useState("");
  
  // Standard fields (hardcoded, always required, not editable)
  const STANDARD_FIELDS = [
    { id: "firstName", type: "text", label: "First Name", placeholder: "Enter first name", required: true, order: 1, isStandard: true },
    { id: "lastName", type: "text", label: "Last Name", placeholder: "Enter last name", required: true, order: 2, isStandard: true },
    { id: "email", type: "email", label: "Email Address", placeholder: "email@example.com", required: true, order: 3, isStandard: true },
    { id: "phone", type: "tel", label: "Phone Number", placeholder: "(555) 555-5555", required: true, order: 4, isStandard: true }
  ];
  
  const [fields, setFields] = useState([...STANDARD_FIELDS]);
  
  // Data from API
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit mode
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadEvents();
    if (editId) {
      loadFormData();
    }
  }, [orgId, editId]);

  const loadEvents = async () => {
    try {
      const res = await api.get(`/orgs/${orgId}/events`);
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const loadFormData = async () => {
    try {
      console.log("🔍 Loading form data for editId:", editId);
      const res = await api.get(`/forms/hydrator/${editId}/edit`);
      const { eventForm, publicForm } = res.data;
      console.log("📋 Form data loaded:", { eventForm, publicForm });
      
      // Populate form data from EventForm and PublicForm
      setFormName(eventForm?.internalName || publicForm?.title || "");
      setDescription(eventForm?.internalPurpose || "");
      setSelectedEvent(publicForm.eventId);
      setSelectedPipeline(publicForm.audienceType);
      setTargetStage(publicForm.targetStage);
      setPublicTitle(publicForm.title);
      setPublicDescription(publicForm.description);
      
      console.log("✅ Form fields populated");
      
      // Load custom fields if they exist (from PublicForm)
      const allFields = [...STANDARD_FIELDS]; // Start with standard fields
      
      if (publicForm.customFields && publicForm.customFields.length > 0) {
        console.log("🔧 Loading custom fields:", publicForm.customFields);
        
        // Filter out standard fields (name, email, phone) and only keep actual custom fields
        const customFieldsOnly = publicForm.customFields.filter(field => 
          !['name', 'firstName', 'lastName', 'email', 'phone'].includes(field.id)
        );
        
        const customFields = customFieldsOnly.map(field => {
          let options = undefined;
          if (field.options && field.options !== 'null') {
            try {
              options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
            } catch (e) {
              console.warn("Failed to parse options for field:", field.label, field.options);
            }
          }
          
          return {
            id: field.id,
            type: field.type || field.fieldType, // Support both formats
            label: field.label,
            placeholder: field.placeholder || '',
            required: field.required !== undefined ? field.required : field.isRequired, // Support both formats
            options: options,
            order: field.order || field.displayOrder, // Support both formats
            isStandard: false
          };
        });
        
        allFields.push(...customFields);
        console.log("✅ Custom fields loaded:", customFields);
      }
      
      setFields(allFields);
      
      setIsEditing(true);
      console.log("🎯 Edit mode activated");
    } catch (error) {
      console.error("❌ Error loading form data:", error);
    }
  };

  // Helper: Create persistent field ID from label
  const createFieldId = (label) => {
    return label.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const addField = (templateKey) => {
    const template = FIELD_TEMPLATES[templateKey];
    const newField = {
      ...template,
      id: `field_${Date.now()}`, // Temporary - will update when user sets label
      order: fields.length + 1
    };
    setFields([...fields, newField]);
  };

  const removeField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const updateField = (fieldId, updates) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return { ...f, ...updates };
      }
      return f;
    }));
  };

  const finalizeFieldId = (fieldId) => {
    setFields(fields.map(f => {
      if (f.id === fieldId && f.label) {
        const newId = createFieldId(f.label);
        return { ...f, id: newId };
      }
      return f;
    }));
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
      
      // Filter out standard fields - only send REAL custom fields
      const customFields = fields.filter(f => !f.isStandard);
      
      const formConfig = {
        orgId,
        eventId: selectedEvent,
        audienceType: selectedPipeline, // Backend will find/create pipeline
        internalName: formName,
        internalPurpose: description, // Internal notes/purpose
        slug,
        publicTitle: publicTitle || formName, // Use public title or fallback to internal name
        publicDescription: publicDescription, // Public-facing description
        targetStage,
        fields: customFields.map(f => ({
          id: f.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          order: f.order,
          ...((f.type === "select" || f.type === "radio" || f.type === "checkbox") && { options: f.options }),
          ...(f.type === "number" && { min: f.min, max: f.max })
        })),
        isActive: true
      };

      let res;
      if (isEditing) {
        res = await api.patch(`/forms/saver/${editId}`, formConfig);
        console.log("✅ Form updated:", res.data);
      } else {
        res = await api.post("/forms/saver", formConfig);
        console.log("✅ Form created:", res.data);
      }
      
      // Response now contains { publicForm, eventForm }
      const { publicForm, eventForm } = res.data;
      
      navigate("/forms/success", { 
        state: { 
          name: eventForm?.internalName || publicForm.title,
          slug: publicForm.slug,
          audienceType: publicForm.audienceType,
          targetStage: publicForm.targetStage
        } 
      });
    } catch (error) {
      console.error("Error creating form:", error);
      alert(error.response?.data?.error || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  const [availableStages, setAvailableStages] = useState([]);

  // Hydrate stages when pipeline (audience) changes
  useEffect(() => {
    const loadStagesForAudience = async () => {
      try {
        if (selectedPipeline) {
          const response = await api.get(`/schema/audience-stages/${selectedPipeline}`);
          if (response.data.success) {
            const stages = response.data.stages;
            setAvailableStages(stages);
            if (stages.length > 0) {
              setTargetStage(stages[0]); // Reset to first stage
            }
          }
        }
      } catch (error) {
        console.error('Error loading stages for audience:', error);
      }
    };

    loadStagesForAudience();
  }, [selectedPipeline]);

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
                      <option value="community_partners">Community Partners</option>
                      <option value="business_sponsor">Business Sponsor</option>
                      <option value="champions">Champions</option>
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
                    {availableStages.map(stage => (
                      <option key={stage} value={stage}>
                        {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                    <span className="mr-2">📋</span> Dropdown (one selection)
                  </button>
                  <button
                    type="button"
                    onClick={() => addField('radio')}
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
                    <div key={field.id} className={`border rounded-lg p-4 ${field.isStandard ? 'border-gray-300 bg-gray-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          {field.isStandard ? (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">{field.label}</span>
                              <span className="text-red-500">*</span>
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Required</span>
                            </div>
                          ) : (
                            <>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                onBlur={() => finalizeFieldId(field.id)}
                                className="font-semibold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-cyan-500 outline-none w-full"
                                placeholder="Field Label"
                              />
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </>
                          )}
                        </div>
                        {!field.isStandard && (
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
                        )}
                      </div>

                      {field.type === "select" || field.type === "radio" || field.type === "checkbox" ? (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-500 mb-1">Options:</div>
                          {field.options.map((opt, i) => (
                            <div key={i} className="flex gap-2">
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => {
                                  const newOptions = [...field.options];
                                  newOptions[i] = { ...opt, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                                placeholder="Option label"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newOptions = field.options.filter((_, idx) => idx !== i);
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="px-2 text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const newOptions = [...field.options, { value: `option${field.options.length + 1}`, label: `Option ${field.options.length + 1}` }];
                              updateField(field.id, { options: newOptions });
                            }}
                            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                          >
                            + Add Option
                          </button>
                        </div>
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

                      {!field.isStandard && (
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
                      )}
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
                  {loading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Form" : "Create Form")}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

