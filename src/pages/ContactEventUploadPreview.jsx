// Uses EventAttendee model directly - NO old pipeline configs!
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactEventUploadPreview() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  
  // Get file, field mapping, and event from localStorage
  const [file, setFile] = useState(() => {
    const savedFile = localStorage.getItem('uploadFile');
    console.log('🔍 Preview page - uploadFile from localStorage:', savedFile);
    return savedFile ? JSON.parse(savedFile) : null;
  });
  
  const [fieldMapping, setFieldMapping] = useState(() => {
    const savedMapping = localStorage.getItem('fieldMapping');
    console.log('🔍 Preview page - fieldMapping from localStorage:', savedMapping);
    return savedMapping ? JSON.parse(savedMapping) : [];
  });

  const [selectedEvent, setSelectedEvent] = useState(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    console.log('🔍 Preview page - selectedEvent from localStorage:', savedEvent);
    const parsed = savedEvent ? JSON.parse(savedEvent) : null;
    console.log('🔍 Preview page - parsed selectedEvent:', parsed);
    return parsed;
  });

  // Debug logging
  console.log('📊 Preview page state:', {
    file: file?.name || 'null',
    fieldMapping: fieldMapping?.length || 0,
    selectedEvent: selectedEvent?.name || selectedEvent?.title || 'null'
  });

  const [assignmentMode, setAssignmentMode] = useState('all_same'); // 'all_same' or 'individual'
  const [defaultStage, setDefaultStage] = useState('prospect');
  const [individualAssignments, setIndividualAssignments] = useState({});
  const [createOrgMembers, setCreateOrgMembers] = useState(false); // Option to create OrgMember records
  
  // Event assignment options
  const [addToEvent, setAddToEvent] = useState(true); // Default to adding to event
  const [selectedEventForAssignment, setSelectedEventForAssignment] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);

  const availableFields = [
    { value: 'unmapped', label: 'Ignore this column' },
    { value: 'fullName', label: 'Full Name (will split into First/Last)' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'goesBy', label: 'Goes By (Nickname)' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' }
  ];

  // Dynamic stage options - will be loaded from event config
  const [stageOptions, setStageOptions] = useState([]);
  const [availableAudiences, setAvailableAudiences] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState('');

  // Load available events and set default
  useEffect(() => {
    const loadAvailableEvents = async () => {
      try {
        const response = await api.get(`/orgs/${orgId}/events`);
        setAvailableEvents(response.data);
        
        // Set default event (current event or first available)
        if (selectedEvent?.id) {
          setSelectedEventForAssignment(selectedEvent);
        } else if (response.data.length > 0) {
          setSelectedEventForAssignment(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };
    
    if (orgId) {
      loadAvailableEvents();
    }
  }, [orgId, selectedEvent]);

  // Load available audience types and stages for this event
  useEffect(() => {
    const loadEventData = async () => {
      if (!selectedEventForAssignment?.id) return;
      
      try {
        console.log('🔍 Loading event data for:', selectedEvent.id);
        
        // Hydrate audience types and stages from localStorage first, then API
        let audienceTypes, stages;
        
        try {
          // Try localStorage first
          const cachedSchema = localStorage.getItem('eventAttendeeSchema');
          if (cachedSchema) {
            const { audienceTypes: cachedAudiences, stages: cachedStages } = JSON.parse(cachedSchema);
            audienceTypes = cachedAudiences;
            stages = cachedStages;
            console.log('✅ Using cached EventAttendee schema from localStorage');
          } else {
            throw new Error('No cached schema');
          }
        } catch (cacheError) {
          console.log('⚠️ No cached schema, fetching from API...');
          const schemaResponse = await api.get('/schema/event-attendee');
          const schemaData = schemaResponse.data;
          audienceTypes = schemaData.audienceTypes;
          stages = schemaData.stages;
          
          // Cache it for next time
          localStorage.setItem('eventAttendeeSchema', JSON.stringify({
            ...schemaData,
            hydratedAt: new Date().toISOString()
          }));
          console.log('✅ EventAttendee schema fetched and cached');
        }
        
        setAvailableAudiences(audienceTypes);
        console.log('🔍 Available audience types:', audienceTypes);
        
        // Set default audience
        if (audienceTypes.length > 0) {
          setSelectedAudience(audienceTypes[0]);
        }
        
        const stageOpts = stages.map(stage => ({ 
          value: stage, 
          label: stage.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }));
        
        setStageOptions(stageOpts);
        setDefaultStage(stageOpts[0].value);
        
      } catch (error) {
        console.error('❌ Failed to load event data:', error);
        // Fallback - empty everything to force user to fix hydration
        setAvailableAudiences([]);
        setStageOptions([]);
      }
    };
    
    loadEventData();
  }, [selectedEvent?.id]);

  const handleFieldMappingChange = (index, newField) => {
    const updatedMapping = [...fieldMapping];
    updatedMapping[index].mappedField = newField;
    setFieldMapping(updatedMapping);
    localStorage.setItem('fieldMapping', JSON.stringify(updatedMapping));
  };

  // Simple name parser for frontend preview (matches backend logic)
  const parseFullName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') {
      return { firstName: '', lastName: '' };
    }
    
    const cleanName = fullName.trim().replace(/\s+/g, ' ');
    const nameParts = cleanName.split(' ');
    
    if (nameParts.length === 0) return { firstName: '', lastName: '' };
    if (nameParts.length === 1) return { firstName: nameParts[0], lastName: '' };
    if (nameParts.length === 2) return { firstName: nameParts[0], lastName: nameParts[1] };
    
    // For 3+ parts, take first as first name, last as last name
    return { 
      firstName: nameParts[0], 
      lastName: nameParts[nameParts.length - 1] 
    };
  };

  const parsePreviewData = () => {
    if (!file) return [];
    
    const lines = file.content.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1, 6).map(line => { // First 5 rows for preview
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        const mapping = fieldMapping.find(m => m.csvHeader === header);
        if (mapping && mapping.mappedField !== 'unmapped') {
          const value = values[index] || '';
          
          // Handle fullName parsing for preview
          if (mapping.mappedField === 'fullName') {
            const parsed = parseFullName(value);
            row.firstName = parsed.firstName;
            row.lastName = parsed.lastName;
            row.fullName = value; // Keep original for reference
          } else {
            row[mapping.mappedField] = value;
          }
        }
      });
      return row;
    });
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      const blob = new Blob([file.content], { type: file.type });
      formData.append('file', blob, file.name);
      formData.append('orgId', orgId);
      formData.append('eventId', selectedEvent.id);
      formData.append('assignments', JSON.stringify({
        mode: assignmentMode,
        defaultStage,
        individualAssignments,
        audienceType: selectedAudience,
        createOrgMembers: createOrgMembers,
        addToEvent: addToEvent,
        eventId: addToEvent ? selectedEventForAssignment?.id : null
      }));

      const response = await api.post('/contacts/event/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadResults(response.data);
      
      // Save results to localStorage for validation page
      localStorage.setItem('uploadResults', JSON.stringify(response.data));
      
      // Navigate to validation page
      navigate("/contacts/event/upload/validation");

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  const previewData = parsePreviewData();

  if (!file || !selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Upload Data Found</h2>
          <p className="text-gray-600 mb-4">Please start the upload process again.</p>
          <button
            onClick={() => navigate("/contacts/event/upload")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Start Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/contacts/event/upload")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Upload
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Preview & Configure
          </h1>
          <p className="text-gray-600">
            Review field mapping and configure assignments for <strong>{selectedEvent.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Field Mapping */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Field Mapping</h2>
              
              <div className="space-y-3">
                {fieldMapping.map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{mapping.csvHeader}</span>
                    </div>
                    <select
                      value={mapping.mappedField}
                      onChange={(e) => handleFieldMappingChange(index, e.target.value)}
                      className="px-3 py-1 border rounded-md text-sm"
                    >
                      {availableFields.map(field => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignment Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Assignment Configuration</h2>
              
              <div className="space-y-4">
                {/* Step 1: Select Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Audience Type
                  </label>
                  {availableAudiences.length > 0 ? (
                    <select
                      value={selectedAudience}
                      onChange={(e) => setSelectedAudience(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">Choose an audience...</option>
                      {availableAudiences.map(audience => (
                        <option key={audience} value={audience}>
                          {audience.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                      Can't find any audiences for this event
                    </div>
                  )}
                </div>

                {/* Step 2: Assignment Mode (only if audience selected) */}
                {selectedAudience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      How do you want to assign stages?
                    </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="all_same"
                        checked={assignmentMode === 'all_same'}
                        onChange={(e) => setAssignmentMode(e.target.value)}
                        className="mr-2"
                      />
                      <span>All same stage</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="individual"
                        checked={assignmentMode === 'individual'}
                        onChange={(e) => setAssignmentMode(e.target.value)}
                        className="mr-2"
                      />
                      <span>Let me pick for each contact</span>
                    </label>
                  </div>
                </div>
                )}

                {/* Step 3: Stage Selection (only if audience selected) */}
                {selectedAudience && stageOptions.length > 0 && assignmentMode === 'all_same' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Stage
                    </label>
                    <select
                      value={defaultStage}
                      onChange={(e) => setDefaultStage(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      {stageOptions.map(stage => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 4: OrgMember Creation Option */}
                {selectedAudience && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createOrgMembers}
                        onChange={(e) => setCreateOrgMembers(e.target.checked)}
                        className="mr-3 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          ⬆️ Elevate to Org Members
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          Create extended CRM records with additional fields (address, employer, notes, etc.)
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {stageOptions.length === 0 && (
                  <div className="text-sm text-yellow-700 p-3 bg-yellow-50 rounded border border-yellow-200">
                    ⚠️ Failed to load stages from schema config. Check network connection and backend.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Preview (First 5 Rows)</h2>
              
              {previewData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-semibold">First Name</th>
                        <th className="text-left py-2 px-3 font-semibold">Last Name</th>
                        <th className="text-left py-2 px-3 font-semibold">Email</th>
                        <th className="text-left py-2 px-3 font-semibold">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-3">{row.firstName || '—'}</td>
                          <td className="py-2 px-3">{row.lastName || '—'}</td>
                          <td className="py-2 px-3">{row.email || '—'}</td>
                          <td className="py-2 px-3">{row.phone || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No preview data available</p>
              )}
            </div>

            {/* Upload Button */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  `Upload ${previewData.length} Contacts to ${selectedEvent?.name || selectedEvent?.title || 'Event'}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

