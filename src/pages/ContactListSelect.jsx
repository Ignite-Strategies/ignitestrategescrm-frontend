import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactListSelect() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  // Step state
  const [step, setStep] = useState(1); // 1: Pipeline, 2: Event, 3: Stage, 4: Select Contacts, 5: Create List
  
  // Selection state
  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [listName, setListName] = useState("");
  
  // Data state
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pipeline options
  const PIPELINE_OPTIONS = [
    { value: "org_member", label: "F3 Members", description: "Organization members and supporters" },
    { value: "family_prospect", label: "Family Prospects", description: "Friends, family, co-workers, neighbors" }
  ];

  // Stage options
  const STAGE_OPTIONS = [
    { value: "aware", label: "Aware" },
    { value: "member", label: "Prospective Attendee" },
    { value: "soft_commit", label: "Soft Commit" },
    { value: "paid", label: "Paid" },
    { value: "lost", label: "Can't Make It" }
  ];

  useEffect(() => {
    loadEvents();
  }, [orgId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orgs/${orgId}/events`);
      setEvents(response.data);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!selectedEvent || !selectedPipeline || !selectedStage) return;
    
    try {
      setLoading(true);
      setError("");
      
      // Create a temporary contact list to get contacts
      const tempList = {
        orgId,
        name: "temp",
        type: "pipeline",
        criteria: {
          eventId: selectedEvent,
          audienceType: selectedPipeline,
          stage: selectedStage
        }
      };
      
      // Create the list
      const listResponse = await api.post("/contact-lists", tempList);
      const listId = listResponse.data._id;
      
      // Get contacts from the list
      const contactsResponse = await api.get(`/contact-lists/${listId}/contacts`);
      setContacts(contactsResponse.data);
      
      // Delete the temp list
      await api.delete(`/contact-lists/${listId}`);
      
      setStep(4);
    } catch (err) {
      console.error("Error loading contacts:", err);
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handlePipelineSelect = (pipeline) => {
    setSelectedPipeline(pipeline);
    setStep(2);
  };

  const handleEventSelect = (eventId) => {
    setSelectedEvent(eventId);
    setStep(3);
  };

  const handleStageSelect = (stage) => {
    setSelectedStage(stage);
    loadContacts();
  };

  const handleContactToggle = (contactId) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c._id)));
    }
  };

  const handleCreateList = async () => {
    if (!listName.trim()) {
      setError("Please enter a list name");
      return;
    }
    
    if (selectedContacts.size === 0) {
      setError("Please select at least one contact");
      return;
    }
    
    try {
      setLoading(true);
      
      // Create the contact list
      const listData = {
        orgId,
        name: listName,
        description: `${PIPELINE_OPTIONS.find(p => p.value === selectedPipeline)?.label} - ${events.find(e => e._id === selectedEvent)?.name} - ${STAGE_OPTIONS.find(s => s.value === selectedStage)?.label}`,
        type: "manual",
        supporterIds: contacts
          .filter(c => c.type === 'supporter' && selectedContacts.has(c._id))
          .map(c => c._id),
        prospectIds: contacts
          .filter(c => c.type === 'prospect' && selectedContacts.has(c._id))
          .map(c => c._id)
      };
      
      await api.post("/contact-lists", listData);
      
      alert(`Contact list "${listName}" created successfully with ${selectedContacts.size} contacts!`);
      navigate("/contact-lists");
    } catch (err) {
      console.error("Error creating list:", err);
      setError("Failed to create contact list");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPipelineLabel = () => {
    return PIPELINE_OPTIONS.find(p => p.value === selectedPipeline)?.label || "";
  };

  const getSelectedEventLabel = () => {
    return events.find(e => e._id === selectedEvent)?.name || "";
  };

  const getSelectedStageLabel = () => {
    return STAGE_OPTIONS.find(s => s.value === selectedStage)?.label || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Contact List</h1>
              <p className="text-gray-600">Select contacts from your event pipeline</p>
            </div>
            <button
              onClick={() => navigate("/contact-lists")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Lists
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    stepNum <= step ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 5 && (
                    <div className={`w-16 h-1 mx-2 ${
                      stepNum < step ? "bg-indigo-600" : "bg-gray-200"
                    }`} />
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

          {/* Step 1: Select Pipeline */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Select Pipeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PIPELINE_OPTIONS.map((pipeline) => (
                  <button
                    key={pipeline.value}
                    onClick={() => handlePipelineSelect(pipeline.value)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 text-left transition"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{pipeline.label}</h3>
                    <p className="text-gray-600">{pipeline.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Event */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. Select Event</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Pipeline: <span className="font-medium">{getSelectedPipelineLabel()}</span></p>
              </div>
              
              {loading ? (
                <div className="text-center py-8">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No events found.</p>
                  <button
                    onClick={() => navigate("/events/create")}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Create Your First Event
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <button
                      key={event._id}
                      onClick={() => handleEventSelect(event._id)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 text-left transition"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{event.name}</h3>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Select Stage */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Select Pipeline Stage</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Pipeline: <span className="font-medium">{getSelectedPipelineLabel()}</span> | 
                  Event: <span className="font-medium">{getSelectedEventLabel()}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STAGE_OPTIONS.map((stage) => (
                  <button
                    key={stage.value}
                    onClick={() => handleStageSelect(stage.value)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 text-center transition"
                  >
                    <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Select Contacts */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Select Contacts</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {getSelectedPipelineLabel()} | {getSelectedEventLabel()} | {getSelectedStageLabel()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {contacts.length} contacts found
                </p>
              </div>
              
              {loading ? (
                <div className="text-center py-8">Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No contacts found in this pipeline stage.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <button
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      {selectedContacts.size === contacts.length ? "Deselect All" : "Select All"}
                    </button>
                    <p className="text-sm text-gray-600">
                      {selectedContacts.size} of {contacts.length} selected
                    </p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    {contacts.map((contact) => (
                      <div
                        key={contact._id}
                        className={`p-4 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 ${
                          selectedContacts.has(contact._id) ? "bg-indigo-50" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact._id)}
                          onChange={() => handleContactToggle(contact._id)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {contact.goesBy || contact.firstName} {contact.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {contact.email} • {contact.type === 'supporter' ? 'Supporter' : 'Prospect'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setStep(3)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setStep(5)}
                      disabled={selectedContacts.size === 0}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      Create List ({selectedContacts.size} contacts)
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 5: Create List */}
          {step === 5 && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">5. Create List</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name
                </label>
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter list name (e.g., 'Q1 Fundraising Prospects')"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">List Summary</h3>
                <p className="text-sm text-gray-600">
                  <strong>Pipeline:</strong> {getSelectedPipelineLabel()}<br/>
                  <strong>Event:</strong> {getSelectedEventLabel()}<br/>
                  <strong>Stage:</strong> {getSelectedStageLabel()}<br/>
                  <strong>Contacts:</strong> {selectedContacts.size} selected
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleCreateList}
                  disabled={loading || !listName.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create List"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
