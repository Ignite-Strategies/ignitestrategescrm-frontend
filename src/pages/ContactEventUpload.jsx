import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactEventUpload() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [step, setStep] = useState(1); // 1: Event Selection, 2: File Upload
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load events on component mount
  useState(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events?orgId=${orgId}`);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `First Name,Last Name,Email,Phone`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'event_contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setStep(2);
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Parse headers and save to localStorage for preview page
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(l => l.trim());
    const detectedHeaders = lines[0].split(',').map(h => h.trim());
    
    const fieldMapping = detectedHeaders.map(header => ({
      csvHeader: header,
      mappedField: mapHeaderToField(header)
    }));

    // Save file, mapping, and event data for preview page
    localStorage.setItem('uploadFile', JSON.stringify({
      name: selectedFile.name,
      type: selectedFile.type,
      content: text
    }));
    localStorage.setItem('fieldMapping', JSON.stringify(fieldMapping));
    localStorage.setItem('selectedEvent', JSON.stringify(selectedEvent));
    
    // Navigate to preview page
    navigate("/contacts/event/upload/preview");
  };

  const mapHeaderToField = (header) => {
    const normalized = header.toLowerCase().trim();
    const fieldMap = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'fname': 'firstName',
      'last name': 'lastName',
      'lastname': 'lastName',
      'lname': 'lastName',
      'email': 'email',
      'email address': 'email',
      'phone': 'phone',
      'phone number': 'phone',
      'mobile': 'phone',
      'cell': 'phone'
    };
    return fieldMap[normalized] || 'unmapped';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/contacts/upload")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Contact Upload
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Upload Event Contacts
          </h1>
          <p className="text-gray-600">
            Upload contacts for your upcoming event
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Choose Event</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Upload File</span>
            </div>
          </div>
        </div>

        {/* Step 1: Event Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Which event are you uploading contacts for?</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No events found. Create an event first.</p>
                  <button
                    onClick={() => navigate("/events")}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Go to Events
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEventSelect(event)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 text-left transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleDateString()} - {event.location}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: File Upload */}
        {step === 2 && selectedEvent && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-900 mb-2">✅ Event Selected</h3>
              <p className="text-sm text-emerald-800">
                <strong>{selectedEvent.title}</strong> - {new Date(selectedEvent.startDate).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Contact File</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Download Template</h3>
                    <p className="text-sm text-gray-600">Get the correct format for your CSV file</p>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Download CSV Template
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-2">Upload CSV File</p>
                    <p className="text-gray-600">Click to browse or drag and drop your CSV file</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
