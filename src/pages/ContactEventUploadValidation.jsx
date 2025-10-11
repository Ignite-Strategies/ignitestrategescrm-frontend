import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ContactEventUploadValidation() {
  const navigate = useNavigate();
  
  // Get upload results from localStorage
  const [uploadResults, setUploadResults] = useState(() => {
    const savedResults = localStorage.getItem('uploadResults');
    return savedResults ? JSON.parse(savedResults) : null;
  });

  const [selectedEvent, setSelectedEvent] = useState(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });

  const clearUploadData = () => {
    localStorage.removeItem('uploadFile');
    localStorage.removeItem('fieldMapping');
    localStorage.removeItem('selectedEvent');
    localStorage.removeItem('uploadResults');
  };

  if (!uploadResults || !selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Upload Results Found</h2>
          <p className="text-gray-600 mb-4">Please start the upload process again.</p>
          <button
            onClick={() => {
              clearUploadData();
              navigate("/contacts/event/upload");
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Start New Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✅ Upload Complete!
          </h1>
          <p className="text-gray-600">
            Your contacts have been successfully uploaded to <strong>{selectedEvent.title}</strong>
          </p>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {uploadResults.validCount || 0}
              </div>
              <div className="text-sm text-green-800">Contacts Uploaded</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {uploadResults.inserted || 0}
              </div>
              <div className="text-sm text-blue-800">New Contacts</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {uploadResults.updated || 0}
              </div>
              <div className="text-sm text-yellow-800">Updated Contacts</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {uploadResults.orgMembersCreated || 0}
              </div>
              <div className="text-sm text-purple-800">Org Members Created</div>
            </div>
          </div>

          {/* Assignment Details */}
          {uploadResults.assignments && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Assignment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Audience Type:</span>
                  <span className="ml-2 text-gray-800">
                    {uploadResults.assignments.audienceType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Default Stage:</span>
                  <span className="ml-2 text-gray-800">
                    {uploadResults.assignments.defaultStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Org Members Created:</span>
                  <span className="ml-2 text-gray-800">
                    {uploadResults.assignments.createOrgMembers ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {uploadResults.errors && uploadResults.errors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-red-600 mb-2">Issues Found ({uploadResults.errors.length})</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <ul className="space-y-1 text-sm text-red-800">
                  {uploadResults.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {uploadResults.errors.length > 5 && (
                    <li className="text-red-600">... and {uploadResults.errors.length - 5} more issues</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">What would you like to do next?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate(`/events/${selectedEvent.id}`)}
              className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 text-left transition"
            >
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-semibold">View Event</h3>
              </div>
              <p className="text-sm text-gray-600">See your event details and attendees</p>
            </button>

            <button
              onClick={() => navigate("/contacts/event/upload")}
              className="p-4 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 text-left transition"
            >
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="font-semibold">Upload More</h3>
              </div>
              <p className="text-sm text-gray-600">Add more contacts to this event</p>
            </button>

            <button
              onClick={() => navigate("/campaignhome")}
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-left transition"
            >
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-semibold">Start Campaign</h3>
              </div>
              <p className="text-sm text-gray-600">Create an email campaign for these contacts</p>
            </button>

            <button
              onClick={() => navigate("/contacts")}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition"
            >
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-semibold">All Contacts</h3>
              </div>
              <p className="text-sm text-gray-600">View and manage all your contacts</p>
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 text-left transition"
            >
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <h3 className="font-semibold">Dashboard</h3>
              </div>
              <p className="text-sm text-gray-600">Return to the main dashboard</p>
            </button>

            <button
              onClick={() => {
                clearUploadData();
                navigate("/contacteventmanual");
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 text-left transition"
            >
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="font-semibold">New Upload</h3>
              </div>
              <p className="text-sm text-gray-600">Start a completely new upload</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

