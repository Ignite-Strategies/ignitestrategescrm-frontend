import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactUpload() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [step, setStep] = useState(1); // 1: Fork, 2: Upload, 3: Field Match, 4: Assign, 5: Complete
  const [uploadType, setUploadType] = useState(null); // 'org' or 'event'
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedContacts, setUploadedContacts] = useState([]);
  
  // Assignment options - Events default since they chose "Event Attendees"
  const [assignments, setAssignments] = useState({
    orgMembers: false,
    events: ['default'] // Default to events since they chose event attendees
  });

  const downloadTemplate = () => {
    const template = `First Name,Last Name,Email,Phone`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFile(file);
    setError("");

    // Preview CSV
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header.toLowerCase().replace(' ', '_')] = values[index] || '';
        });
        return row;
      });

      setPreviewData(data.slice(0, 5)); // Show first 5 rows
    };
    reader.readAsText(file);
  };

  const uploadContacts = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orgId', orgId);

      const response = await api.post('/contacts/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPreviewData(response.data.preview || []);
      setFieldMapping(response.data.fieldMapping || []);
      setHeaders(response.data.headers || []);
      setStep(3); // Move to field matching step
      
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const completeAssignment = async () => {
    setLoading(true);
    try {
      // Actually save the contacts
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orgId', orgId);

      const response = await api.post('/contacts/save', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadedContacts(response.data.contacts || []);
      setStep(5); // Complete step
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Complete! 🎉</h1>
            <p className="text-gray-600 mb-8">
              Successfully uploaded {uploadedContacts.length} contacts and assigned them as requested.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/contacts")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                View Contacts
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {step === 1 ? "Upload Contacts" : "Assign Contacts"}
              </h1>
              <p className="text-gray-600">
                {step === 1 
                  ? "Upload your contacts first, then choose where to assign them."
                  : "Choose where to assign your uploaded contacts."
                }
              </p>
            </div>
            <button
              onClick={() => navigate("/contacts")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 4 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                4
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 5 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 5 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                5
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Choose</span>
              <span>Upload</span>
              <span>Match</span>
              <span>Assign</span>
              <span>Complete</span>
            </div>
          </div>

          {step === 1 && (
            <>
              {/* Step 1: Choose Upload Type */}
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What are you uploading?</h2>
                  <p className="text-gray-600 mb-8">Choose the type of contacts to help us customize your upload experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Organization Members */}
                  <button
                    onClick={() => {
                      setUploadType('org');
                      navigate('/org-members/upload');
                    }}
                    className="p-8 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-indigo-500 transition">
                        <svg className="w-8 h-8 text-indigo-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">🏢 Organization Members</h3>
                        <p className="text-sm text-gray-600">Staff, board, volunteers, core team</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Upload your internal team with detailed information: roles, departments, contact preferences, and organizational data.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">Detailed Fields</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">Org Structure</span>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">Team Management</span>
                    </div>
                  </button>

                  {/* Event Attendees */}
                  <button
                    onClick={() => {
                      setUploadType('event');
                      setStep(2);
                    }}
                    className="p-8 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition text-left group"
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-emerald-500 transition">
                        <svg className="w-8 h-8 text-emerald-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">📅 Event Attendees</h3>
                        <p className="text-sm text-gray-600">Prospects, participants, registrants</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Quick upload for event participants: just name, email, phone. Map to your event pipeline after upload.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">Simple Fields</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">Event Pipeline</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">Quick Import</span>
                    </div>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Not sure?</strong> Organization Members is for your internal team, Event Attendees is for prospects and participants.
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Step 1: Upload */}
              <div className="space-y-6">
                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📥 Download Template</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Use our simple template: First Name, Last Name, Email, Phone
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Download CSV Template
                  </button>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {file ? file.name : "Choose CSV file"}
                    </p>
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                  </label>
                </div>

                {/* Preview */}
                {previewData.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Preview (first 5 rows):</h3>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {Object.keys(previewData[0]).map(key => (
                              <th key={key} className="text-left py-2 px-3 font-semibold">
                                {key.replace('_', ' ')}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-b">
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="py-2 px-3">{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={uploadContacts}
                  disabled={!file || loading}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    file && !loading
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Uploading...' : 'Upload Contacts'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Step 3: Field Matching */}
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">✅ CSV Parsed Successfully</h3>
                  <p className="text-sm text-blue-800">
                    Found {previewData.length} valid records. Check the field mapping below:
                  </p>
                </div>

                {/* Field Mapping */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Field Mapping</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fieldMapping.map((mapping, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <span className="font-medium text-gray-900">{mapping.csvHeader}</span>
                            <span className="text-gray-500 ml-2">→</span>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            mapping.mappedField === 'firstName' ? 'bg-green-100 text-green-700' :
                            mapping.mappedField === 'lastName' ? 'bg-green-100 text-green-700' :
                            mapping.mappedField === 'email' ? 'bg-green-100 text-green-700' :
                            mapping.mappedField === 'phone' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {mapping.mappedField === 'unmapped' ? 'Ignored' : mapping.mappedField}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <p><span className="text-green-600">●</span> Green fields are required and will be imported</p>
                    <p><span className="text-blue-600">●</span> Blue fields are optional</p>
                    <p><span className="text-gray-600">●</span> Gray fields will be ignored</p>
                  </div>
                </div>

                {/* Preview */}
                {previewData.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Preview (first 5 rows):</h3>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
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
                              <td className="py-2 px-3">{row.firstName}</td>
                              <td className="py-2 px-3">{row.lastName}</td>
                              <td className="py-2 px-3">{row.email}</td>
                              <td className="py-2 px-3">{row.phone || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Looks Good Button */}
                <button
                  onClick={() => setStep(4)}
                  className="w-full py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Looks Good - Continue to Assignment
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              {/* Step 4: Assignment */}
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Upload Complete</h3>
                  <p className="text-sm text-green-800">
                    Successfully uploaded {previewData.length} contacts. Now choose where to assign them:
                  </p>
                </div>

                {/* Assignment Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Assign to:</h3>
                  
                  {/* Org Members - Optional */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="flex items-center mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignments.orgMembers}
                        onChange={(e) => setAssignments(prev => ({ ...prev, orgMembers: e.target.checked }))}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-900">🏢 Org Members (Optional)</h4>
                        <p className="text-sm text-gray-600">Also add as internal team members</p>
                      </div>
                    </label>
                    
                    {assignments.orgMembers && (
                      <div className="ml-8">
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-200">
                          <strong>💡 Dual Assignment</strong>
                          <p className="text-xs mt-1">Contacts will be both event attendees AND org members</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Events - Default selected */}
                  <div className="p-4 border border-emerald-200 rounded-lg bg-emerald-50">
                    <label className="flex items-center mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignments.events.length > 0}
                        onChange={(e) => {
                          if (!e.target.checked) {
                            setAssignments(prev => ({ ...prev, events: [] }));
                          } else {
                            setAssignments(prev => ({ ...prev, events: ['default'] }));
                          }
                        }}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <div className="ml-3">
                        <h4 className="font-semibold text-gray-900">📅 Events</h4>
                        <p className="text-sm text-gray-600">Assign to your upcoming event</p>
                      </div>
                    </label>
                    
                    {assignments.events.length > 0 && (
                      <div className="ml-8 space-y-2">
                        <p className="text-sm text-gray-600">Will be assigned to:</p>
                        <div className="bg-emerald-100 p-3 rounded text-sm text-emerald-800 border border-emerald-200">
                          <strong>🎯 Your Upcoming Event</strong>
                          <p className="text-xs mt-1">Contacts will be added to your event pipeline for easy management</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Complete Button */}
                <button
                  onClick={completeAssignment}
                  disabled={loading || (!assignments.orgMembers && assignments.events.length === 0)}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    !loading && (assignments.orgMembers || assignments.events.length > 0)
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Assigning...' : 'Complete Assignment'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}