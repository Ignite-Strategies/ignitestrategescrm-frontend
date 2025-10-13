import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function FormUserUpdate() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [formResponse, setFormResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadForms();
  }, [orgId]);

  const loadForms = async () => {
    try {
      const response = await api.get(`/forms?orgId=${orgId}`);
      setForms(response.data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
    }
  };

  const loadAttendees = async (formId) => {
    try {
      setLoading(true);
      // Get all EventAttendees that submitted this form
      const response = await api.get(`/events/attendees?formId=${formId}`);
      setAttendees(response.data || []);
    } catch (error) {
      console.error('Error loading attendees:', error);
      // Fallback: try to get attendees from a specific event if we know the form
      const form = forms.find(f => f.id === formId);
      if (form?.eventId) {
        const eventResponse = await api.get(`/events/${form.eventId}/attendees`);
        const formSubmissions = eventResponse.data.filter(attendee => 
          attendee.submittedFormId === formId
        );
        setAttendees(formSubmissions);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFormResponse = (attendee) => {
    setSelectedAttendee(attendee);
    setFormResponse(attendee.notes || {});
  };

  const mapFormData = (formData) => {
    const mapped = {
      spouseOrOther: null,
      howManyInParty: null,
      likelihoodToAttendId: null
    };

    // Map "Will you bring your M or anyone else?" → spouseOrOther
    const bringingMResponse = formData.bringing_m 
      || formData.will_bring_spouse 
      || formData.bringing_spouse;
    
    if (bringingMResponse) {
      mapped.spouseOrOther = bringingMResponse.toLowerCase().includes('yes') ? 'spouse' : 'solo';
    }

    // Map "If going, how many in your party?" → howManyInParty
    const howManyInParty = formData.how_many_in_party 
      || formData.party_size
      || formData.partySize;
    
    if (howManyInParty) {
      mapped.howManyInParty = parseInt(howManyInParty);
    }

    // Map "How likely are you to attend?" → likelihoodToAttendId
    const likelihoodString = formData.how_likely_to_attend 
      || formData.likelihood_to_attend
      || formData.likelihood;
    
    if (likelihoodString) {
      // Map response text to values (same logic as orgMemberFormRoute)
      const likelihoodMap = {
        "i'm in": 1,
        "planning to be there": 1,
        "im in": 1,
        "most likely": 2,
        "confirming logistics": 2,
        "probably yes": 2,
        "chaos intervenes": 2,
        "probably": 2,
        "morale support": 4,
        "just here for": 4,
        "support from afar": 4
      };
      
      const lowerResponse = likelihoodString.toLowerCase();
      let likelihoodValue = 2; // Default: medium
      
      for (const [key, value] of Object.entries(likelihoodMap)) {
        if (lowerResponse.includes(key)) {
          likelihoodValue = value;
          break;
        }
      }
      
      mapped.likelihoodToAttendId = likelihoodValue;
    }

    return mapped;
  };

  const saveMappedData = async () => {
    if (!selectedAttendee || !formResponse) return;

    try {
      const mappedData = mapFormData(formResponse);
      
      // Update the EventAttendee record
      await api.patch(`/event-attendees/${selectedAttendee.id}`, mappedData);
      
      alert('✅ Form data mapped and saved successfully!');
      
      // Reload attendees to show updated data
      if (selectedFormId) {
        await loadAttendees(selectedFormId);
      }
      
    } catch (error) {
      console.error('Error saving mapped data:', error);
      alert('❌ Failed to save mapped data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form User Update</h1>
              <p className="text-gray-600">Map form responses to structured fields</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Step 1: Select Form */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Form</h2>
            <select
              value={selectedFormId}
              onChange={(e) => {
                setSelectedFormId(e.target.value);
                if (e.target.value) {
                  loadAttendees(e.target.value);
                } else {
                  setAttendees([]);
                }
              }}
              className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a form...</option>
              {forms.map(form => (
                <option key={form.id} value={form.id}>
                  {form.title} ({form.slug})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Attendee */}
          {selectedFormId && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Select Attendee</h2>
              {loading ? (
                <p className="text-gray-600">Loading attendees...</p>
              ) : attendees.length === 0 ? (
                <p className="text-gray-600">No attendees found for this form.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attendees.map(attendee => (
                    <div
                      key={attendee.id}
                      onClick={() => loadFormResponse(attendee)}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedAttendee?.id === attendee.id 
                          ? 'border-indigo-500 bg-indigo-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {attendee.contact?.firstName} {attendee.contact?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {attendee.contact?.email}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Stage: {attendee.currentStage}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: View & Map Form Response */}
          {selectedAttendee && formResponse && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Form Response & Mapping</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Raw Form Response */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Raw Form Response (JSON)</h3>
                  <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(formResponse, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Mapped Fields */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Mapped to Structured Fields</h3>
                  <div className="space-y-4">
                    
                    {/* Spouse/Other */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Who's Coming (spouseOrOther)
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        {(() => {
                          const bringingMResponse = formResponse.bringing_m 
                            || formResponse.will_bring_spouse 
                            || formResponse.bringing_spouse;
                          const spouseOrOther = bringingMResponse 
                            ? (bringingMResponse.toLowerCase().includes('yes') ? 'spouse' : 'solo')
                            : 'solo';
                          return (
                            <div>
                              <div className="font-medium text-blue-900">{spouseOrOther}</div>
                              <div className="text-xs text-blue-700">
                                From: "{bringingMResponse || 'Not specified'}"
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Party Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Party Size (howManyInParty)
                      </label>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        {(() => {
                          const howManyInParty = formResponse.how_many_in_party 
                            || formResponse.party_size
                            || formResponse.partySize;
                          return (
                            <div>
                              <div className="font-medium text-green-900">{howManyInParty || 'Not specified'}</div>
                              <div className="text-xs text-green-700">
                                From: {Object.keys(formResponse).filter(k => 
                                  ['how_many_in_party', 'party_size', 'partySize'].includes(k)
                                ).join(', ') || 'No party size field'}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Likelihood */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Likelihood (likelihoodToAttendId)
                      </label>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        {(() => {
                          const likelihoodString = formResponse.how_likely_to_attend 
                            || formResponse.likelihood_to_attend
                            || formResponse.likelihood;
                          return (
                            <div>
                              <div className="font-medium text-purple-900">
                                {likelihoodString || 'Not specified'}
                              </div>
                              <div className="text-xs text-purple-700">
                                From: {Object.keys(formResponse).filter(k => 
                                  ['how_likely_to_attend', 'likelihood_to_attend', 'likelihood'].includes(k)
                                ).join(', ') || 'No likelihood field'}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={saveMappedData}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      💾 Save Mapped Data to EventAttendee
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
