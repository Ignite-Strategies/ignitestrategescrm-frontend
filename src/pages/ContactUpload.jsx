import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ContactUpload() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [events, setEvents] = useState([]);
  const [selectedPurpose, setSelectedPurpose] = useState(""); // event, campaign, or general

  useEffect(() => {
    loadEvents();
  }, [orgId]);

  const loadEvents = async () => {
    try {
      const response = await api.get(`/orgs/${orgId}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const downloadTemplate = () => {
    const template = `First Name,Last Name,Email,Phone`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_simple_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Parse and save for preview
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(l => l.trim());
    const detectedHeaders = lines[0].split(',').map(h => h.trim());
    
    const fieldMapping = detectedHeaders.map(header => ({
      csvHeader: header,
      mappedField: mapHeaderToField(header)
    }));

    localStorage.setItem('uploadFile', JSON.stringify({
      name: selectedFile.name,
      type: selectedFile.type,
      content: text
    }));
    localStorage.setItem('fieldMapping', JSON.stringify(fieldMapping));
    localStorage.setItem('uploadPurpose', selectedPurpose); // Save purpose for later
    
    navigate("/org-members/upload/preview");
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
      'phone number': 'phone'
    };
    return fieldMap[normalized] || 'unmapped';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Quick Contact Upload</h1>
              <p className="text-gray-600">
                Add contacts fast - just name, email, and phone. We'll help you organize them.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Dashboard
            </button>
          </div>

          {/* The Magic: Map to Pipeline on Ingest */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">The HubSpot Killer</h3>
                <p className="text-indigo-100 text-sm">Upload contacts → Map to pipeline → Done. No filling out endless fields upfront.</p>
              </div>
            </div>
          </div>

          {/* Step 1: Choose Purpose */}
          {!selectedPurpose && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What are these contacts for?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Event */}
                <button
                  onClick={() => setSelectedPurpose("event")}
                  className="p-6 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition text-left"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Event Attendees</h3>
                  <p className="text-sm text-gray-600">Add them directly to an event pipeline</p>
                </button>

                {/* Campaign */}
                <button
                  onClick={() => setSelectedPurpose("campaign")}
                  className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Email Campaign</h3>
                  <p className="text-sm text-gray-600">Create a new campaign list</p>
                </button>

                {/* General */}
                <button
                  onClick={() => setSelectedPurpose("general")}
                  className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">General Contacts</h3>
                  <p className="text-sm text-gray-600">Add to master list, organize later</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Upload */}
          {selectedPurpose && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Upload Your Contacts</h2>
                  <p className="text-gray-600">
                    Selected: <span className="font-semibold text-indigo-600">
                      {selectedPurpose === 'event' && '🎯 Event Attendees'}
                      {selectedPurpose === 'campaign' && '📧 Email Campaign'}
                      {selectedPurpose === 'general' && '👥 General Contacts'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPurpose("")}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Change
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Manual Entry */}
                <button
                  onClick={() => navigate("/org-members/manual")}
                  className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 hover:shadow-lg transition text-left"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Manually</h3>
                  <p className="text-sm text-gray-600">Enter contacts one by one</p>
                </button>

                {/* CSV Upload */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV</h3>
                  <p className="text-sm text-gray-600 mb-4">Quick bulk import</p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={downloadTemplate}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
                    >
                      📥 Download Simple Template
                    </button>
                    
                    <label className="block">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-indigo-400 transition cursor-pointer text-sm"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">📋 Simple Template Includes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ First Name</li>
                  <li>✓ Last Name</li>
                  <li>✓ Email</li>
                  <li>✓ Phone</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  That's it! No endless fields. Upload fast, organize smart.
                </p>
              </div>
            </div>
          )}

          {/* Info: Org Members Link */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Need to add internal team members?</h4>
                <p className="text-sm text-blue-800 mb-2">
                  For staff, board, and volunteers with detailed org info, use the 
                  <button
                    onClick={() => navigate("/org-members/upload")}
                    className="font-semibold hover:underline ml-1"
                  >
                    Org Member Upload
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

