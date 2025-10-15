import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function UploadPreview() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [csvPreviewData, setCsvPreviewData] = useState([]);
  
  // Event assignment options
  const [addToEvent, setAddToEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState('org_members');
  const [selectedStage, setSelectedStage] = useState('aware');
  const [availableStages, setAvailableStages] = useState([]);
  
  // Get file and field mapping from URL state or localStorage
  const [file, setFile] = useState(() => {
    const savedFile = localStorage.getItem('uploadFile');
    return savedFile ? JSON.parse(savedFile) : null;
  });
  
  const [fieldMapping, setFieldMapping] = useState(() => {
    const savedMapping = localStorage.getItem('fieldMapping');
    return savedMapping ? JSON.parse(savedMapping) : [];
  });

  // Call backend universal preview endpoint for parsing and mapping
  useEffect(() => {
    const loadPreviewFromBackend = async () => {
    if (file && file.content) {
        try {
          const formData = new FormData();
          const blob = new Blob([file.content], { type: 'text/csv' });
          formData.append('file', blob, file.name);
          formData.append('uploadType', 'orgMember');
          formData.append('orgId', orgId);

          const response = await api.post('/contacts/upload/preview', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          if (response.data.success) {
            // Use backend's parsed and mapped data
            const mappings = response.data.fieldMappingSuggestions.map(suggestion => ({
              csvHeader: suggestion.csvHeader,
              mappedField: suggestion.suggestedField
            }));
            setFieldMapping(mappings);
            
            // Convert backend's mapped objects to array format for table display
            const previewRows = response.data.preview.map(record => {
              return mappings.map(mapping => record[mapping.mappedField] || '');
            });
            setCsvPreviewData(previewRows);
            
            // Cache in localStorage for retrieval
            localStorage.setItem('fieldMapping', JSON.stringify(mappings));
            localStorage.setItem('csvPreviewData', JSON.stringify(previewRows));
            
            console.log('✅ Backend preview loaded:', response.data);
            console.log('📊 Preview rows:', previewRows);
            console.log('💾 Cached to localStorage');
          }
        } catch (error) {
          console.error('❌ Backend preview failed, using local parsing:', error);
          // Fallback to local parsing if backend fails
          const lines = file.content.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim());
        return values;
      });
      setCsvPreviewData(rows);
    }
      }
    };

    loadPreviewFromBackend();
  }, [file, orgId]);

  // Hydrate available events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await api.get(`/orgs/${orgId}/events`);
        setAvailableEvents(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedEvent(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };
    loadEvents();
  }, [orgId]);

  // For OrgMember uploads, we don't need audience stages
  // This is only needed for EventAttendee uploads

  const availableFields = [
    { value: 'unmapped', label: 'Ignore this column' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'fullName', label: 'Full Name (will be parsed)' }, // Add fullName option
    { value: 'goesBy', label: 'Goes By (Nickname)' },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'street', label: 'Street Address' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State' },
    { value: 'zip', label: 'ZIP Code' },
    { value: 'employer', label: 'Employer/Company' },
    { value: 'yearsWithOrganization', label: 'Years With Organization' }
  ];

  const handleFieldMappingChange = (index, newField) => {
    const updatedMapping = [...fieldMapping];
    updatedMapping[index].mappedField = newField;
    setFieldMapping(updatedMapping);
    localStorage.setItem('fieldMapping', JSON.stringify(updatedMapping));
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
      'full name': 'fullName', // Add fullName mapping
      'fullname': 'fullName',
      'name': 'fullName',
      'complete name': 'fullName',
      'goes by': 'goesBy',
      'goesby': 'goesBy',
      'nickname': 'goesBy',
      'preferred name': 'goesBy',
      'email': 'email',
      'email address': 'email',
      'phone': 'phone',
      'phone number': 'phone',
      'street': 'street',
      'street address': 'street',
      'city': 'city',
      'state': 'state',
      'zip': 'zip',
      'zip code': 'zip',
      'employer': 'employer',
      'company': 'employer',
      'organization': 'employer',
      'years with organization': 'yearsWithOrganization',
      'years with org': 'yearsWithOrganization'
    };
    return fieldMap[normalized] || 'unmapped';
  };

  const handleUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    
    // Create a proper File object from the saved file data
    const blob = new Blob([file.content], { type: 'text/csv' });
    const fileObj = new File([blob], file.name, { type: 'text/csv' });
    formData.append("file", fileObj);
    formData.append("orgId", orgId); // Send orgId in body, not URL
    formData.append("uploadType", "orgMember");
    
    // Add event assignment data if checked
    if (addToEvent && selectedEvent) {
      formData.append("addToEvent", "true");
      formData.append("eventId", selectedEvent);
      formData.append("audienceType", selectedAudience);
      formData.append("currentStage", selectedStage);
    }

    try {
      const response = await api.post(`/contacts/upload/save`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadResults(response.data);
      
      // Navigate to success page with results in state (not localStorage!)
      navigate("/org-members/upload/success", {
        state: { uploadResults: response.data }
      });
      
      // Clean up localStorage
      localStorage.removeItem('uploadFile');
      localStorage.removeItem('fieldMapping');
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      alert("Error uploading: " + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center text-indigo-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-indigo-600 text-white">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Upload</span>
            </div>
            <div className="h-px w-20 mx-4 bg-indigo-600"></div>
            <div className="flex items-center text-indigo-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-indigo-600 text-white">
                2
              </div>
              <span className="ml-2 text-sm font-medium">Preview</span>
            </div>
            <div className="h-px w-20 mx-4 bg-gray-300"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-gray-300">
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Main Content - Vertical Layout */}
        <div className="space-y-8">
          
          {/* Field Mapping Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Field Mapping</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-900">CSV Field Detection</h3>
            </div>
            <p className="text-sm text-blue-800">
              We detected these columns in your CSV. Use the dropdowns to map your columns to our fields. 
              Green checkmarks show successful mappings.
            </p>
          </div>

          {/* Field Mapping Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Your CSV Column</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maps To Our Field</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mapping Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fieldMapping?.map((field, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {field.csvHeader}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <select
                        value={field.mappedField}
                        onChange={(e) => handleFieldMappingChange(idx, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {availableFields.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {field.mappedField === 'unmapped' ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Not Recognized
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          ✓ Mapped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Missing Required Fields Warning */}
          {fieldMapping && (
            (() => {
              const mappedFields = fieldMapping.map(f => f.mappedField);
              // Check if we have firstName+lastName OR fullName (which will be parsed)
              const hasNameFields = (mappedFields.includes('firstName') && mappedFields.includes('lastName')) || mappedFields.includes('fullName');
              const missingRequired = [];
              if (!hasNameFields) missingRequired.push('firstName, lastName, or fullName');
              if (!mappedFields.includes('email')) missingRequired.push('email');
              return missingRequired.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-red-900">Missing Required Fields</h3>
                  </div>
                  <p className="text-sm text-red-800">
                    Your CSV is missing these required fields: <strong>{missingRequired.join(', ')}</strong>. 
                    Please add these columns or rename existing columns to match our field names. Note: "Full Name" will be automatically parsed into First Name and Last Name.
                  </p>
                </div>
              );
            })()
          )}
          </div>

          {/* Data Preview Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Data Preview</h2>
              
              {csvPreviewData.length > 0 ? (
                <div>
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {fieldMapping.map((field, idx) => (
                            <th key={idx} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {field.csvHeader}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvPreviewData.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-3 py-2 text-gray-700">
                                {cell || <span className="text-gray-400 italic">empty</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Showing first 5 rows. Total: {file?.content.split('\n').filter(l => l.trim()).length - 1} rows
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No data preview available</p>
                </div>
              )}
          </div>

          {/* Event Assignment Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow p-6 border border-indigo-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Add to Event</h2>
              
              <div className="space-y-4">
                <label className="flex items-center cursor-pointer bg-white rounded-lg p-3 border border-indigo-200">
                  <input
                    type="checkbox"
                    checked={addToEvent}
                    onChange={(e) => setAddToEvent(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Add to event</span>
                </label>

                {addToEvent && (
                  <div className="space-y-4 bg-white rounded-lg p-4 border border-indigo-200">
                    {/* Event Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                      <select
                        value={selectedEvent || ''}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <option value="">Choose an event...</option>
                        {availableEvents.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.name} {event.eventDate ? `- ${new Date(event.eventDate).toLocaleDateString()}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Audience Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Audience Type</label>
                      <select
                        value={selectedAudience}
                        onChange={(e) => setSelectedAudience(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        <option value="org_members">Org Members</option>
                        <option value="friends_family">Friends & Family</option>
                        <option value="community_partners">Community Partners</option>
                        <option value="business_sponsor">Business Sponsor</option>
                        <option value="champions">Champions</option>
                      </select>
                    </div>

                    {/* Stage Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Stage</label>
                      <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {availableStages.map(stage => (
                          <option key={stage} value={stage}>
                            {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
          <button
            onClick={() => navigate("/org-members/upload")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {uploading ? "Importing..." : "Import My Contacts"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
