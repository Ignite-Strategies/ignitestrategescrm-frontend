import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OrgMemberUploadSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadResults, setUploadResults] = useState(null);

  useEffect(() => {
    // Get results from navigation state (passed from Preview page)
    if (location.state?.uploadResults) {
      setUploadResults(location.state.uploadResults);
    } else {
      // Fallback to localStorage if state is lost
      const savedResults = localStorage.getItem('orgMemberUploadResults');
      if (savedResults) {
        setUploadResults(JSON.parse(savedResults));
        localStorage.removeItem('orgMemberUploadResults'); // Clean up
      } else {
        // No results found, redirect
        navigate("/org-members");
      }
    }
  }, [location, navigate]);

  if (!uploadResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Backend returns: contacts, orgMembers, eventAttendees, validCount, errorCount, errors
  const totalProcessed = uploadResults.totalProcessed || 0;
  const successCount = uploadResults.validCount || 0;
  const errorCount = uploadResults.errorCount || 0;
  const contactsCreated = uploadResults.contacts || 0;
  const orgMembersCreated = uploadResults.orgMembers || 0;
  const eventAttendeesCreated = uploadResults.eventAttendees || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Complete!</h1>
          <p className="text-gray-600">Your org members have been successfully imported.</p>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Import Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Processed */}
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">{totalProcessed}</div>
              <div className="text-sm text-blue-900 font-medium">Total Rows Processed</div>
            </div>

            {/* Success */}
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">{successCount}</div>
              <div className="text-sm text-green-900 font-medium">
                Successfully Imported
                <div className="text-xs text-green-700 mt-1">
                  {contactsCreated} contacts · {orgMembersCreated} org members
                  {eventAttendeesCreated > 0 && ` · ${eventAttendeesCreated} event attendees`}
                </div>
              </div>
            </div>

            {/* Errors */}
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">{errorCount}</div>
              <div className="text-sm text-red-900 font-medium">Errors/Skipped</div>
            </div>
          </div>

          {/* Event Assignment Info */}
          {eventAttendeesCreated > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-indigo-900">Added to Event</h3>
              </div>
              <p className="text-sm text-indigo-800">
                <strong>{eventAttendeesCreated}</strong> contacts were successfully added to the event as attendees.
              </p>
            </div>
          )}

          {/* Errors Detail */}
          {errorCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2">Errors Encountered:</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {uploadResults.errors.map((error, idx) => (
                  <div key={idx} className="text-sm text-red-800">
                    • {error.email}: {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">What's Next?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/org-members")}
              className="p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition text-left group"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-500 transition">
                  <svg className="w-6 h-6 text-indigo-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">View Org Members</h4>
                  <p className="text-sm text-gray-600">See your complete member list</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/events")}
              className="p-6 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition text-left group"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-500 transition">
                  <svg className="w-6 h-6 text-emerald-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Manage Events</h4>
                  <p className="text-sm text-gray-600">View event pipelines & tracking</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/org-members/upload")}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition text-left group"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-300 transition">
                  <svg className="w-6 h-6 text-gray-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Upload More</h4>
                  <p className="text-sm text-gray-600">Add additional org members</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition text-left group"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-500 transition">
                  <svg className="w-6 h-6 text-purple-600 group-hover:text-white transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Back to Dashboard</h4>
                  <p className="text-sm text-gray-600">Return to main dashboard</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


