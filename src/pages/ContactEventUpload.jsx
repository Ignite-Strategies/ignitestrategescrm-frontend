import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";
import api from "../lib/api";

export default function ContactEventUpload() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load events and check for existing selection
  useEffect(() => {
    if (!orgId) {
      console.error('❌ Missing orgId in localStorage');
      navigate('/dashboard');
      return;
    }
    
    loadEvents();
  }, [orgId, navigate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${orgId}/events`);
      setEvents(response.data);
      
      // Check if we already have an event selected
      const existingEventId = localStorage.getItem('eventId');
      const existingEvent = JSON.parse(localStorage.getItem('currentEvent') || 'null');
      
      if (existingEventId && existingEvent) {
        setSelectedEvent(existingEvent);
      }
      
      console.log('✅ Loaded events:', response.data.length);
    } catch (error) {
      console.error('❌ Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = (event) => {
    console.log('🎯 Selected event for upload:', event);
    setSelectedEvent(event);
    
    // Store in localStorage
    localStorage.setItem('eventId', event.id);
    localStorage.setItem('currentEvent', JSON.stringify(event));
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

  const handleFileSelect = async (e) => {
    console.log('🔍 File input changed:', e.target.files);
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 Selected file:', selectedFile.name, selectedFile.type, selectedFile.size);

    try {
      // Parse headers and save to localStorage for preview page
      const text = await selectedFile.text();
      console.log('📄 File content length:', text.length);
      console.log('📄 First 200 chars:', text.substring(0, 200));
      
      const lines = text.split('\n').filter(l => l.trim());
      console.log('📊 Total lines:', lines.length);
      
      const detectedHeaders = lines[0].split(',').map(h => h.trim());
      console.log('🏷️ Detected headers:', detectedHeaders);
      
      const fieldMapping = detectedHeaders.map(header => ({
        csvHeader: header,
        mappedField: mapHeaderToField(header)
      }));
      console.log('🗺️ Field mapping:', fieldMapping);

      // Save file, mapping, and event for preview page
      const fileData = {
        name: selectedFile.name,
        type: selectedFile.type,
        content: text
      };
      localStorage.setItem('uploadFile', JSON.stringify(fileData));
      localStorage.setItem('fieldMapping', JSON.stringify(fieldMapping));
      console.log('💾 Saving selectedEvent to localStorage:', selectedEvent);
      localStorage.setItem('selectedEvent', JSON.stringify(selectedEvent));
      
      console.log('💾 Saved to localStorage:', {
        uploadFile: fileData.name,
        fieldMapping: fieldMapping.length,
        selectedEvent: selectedEvent?.name
      });
      
      // Navigate to preview page
      console.log('🚀 Navigating to preview page...');
      navigate("/contacts/event/upload/preview");
    } catch (error) {
      console.error('❌ Error processing file:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 Upload Event Contacts
          </h1>
          <p className="text-gray-600">
            Upload contacts for <strong>"{selectedEvent?.name || 'Select an Event'}"</strong>
          </p>
        </div>

        {/* Event Selection */}
        {!selectedEvent && !loading && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Event</h2>
            <p className="text-gray-600 mb-4">Choose which event you want to upload contacts for:</p>
            
            {events.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600 mb-4">You need to create an event first.</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => selectEvent(event)}
                    className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600">
                          {event.name}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <span className="mr-4">{event.date || 'No date set'}</span>
                          <span>{event.eventVenueName || 'No venue set'}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Event Info */}
        {selectedEvent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900">✅ Event Selected</h3>
                <p className="text-green-800">
                  {selectedEvent.name} • {selectedEvent.date || 'No date'} • {selectedEvent.eventVenueName || 'No venue'}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Change Event
              </button>
            </div>
          </div>
        )}

        {/* File Upload - Only show if event is selected */}
        {selectedEvent && (
          <div className="space-y-6">
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
                  onClick={() => console.log('🎯 File upload label clicked!')}
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
