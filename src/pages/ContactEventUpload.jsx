import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";

export default function ContactEventUpload() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const eventId = localStorage.getItem('eventId');
  
  // Check if we have the required data
  useEffect(() => {
    if (!orgId || !eventId) {
      console.error('Missing orgId or eventId in localStorage');
      navigate('/dashboard');
    }
  }, [orgId, eventId, navigate]);

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

    // Save file and mapping for preview page (eventId already in localStorage)
    localStorage.setItem('uploadFile', JSON.stringify({
      name: selectedFile.name,
      type: selectedFile.type,
      content: text
    }));
    localStorage.setItem('fieldMapping', JSON.stringify(fieldMapping));
    
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
            Upload contacts for your current event
          </p>
        </div>

        {/* File Upload */}
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
      </div>
    </div>
  );
}
