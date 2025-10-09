import { useNavigate } from "react-router-dom";

export default function CreateListOptions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Contact List</h1>
              <p className="text-gray-600">Choose how you'd like to build your audience</p>
            </div>
            <button
              onClick={() => navigate("/email")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Import Contacts */}
            <button
              onClick={() => navigate("/org-members/upload")}
              className="p-8 border-2 border-gray-200 rounded-lg hover:border-indigo-500 text-center transition group"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Contacts</h3>
              <p className="text-gray-600 mb-4">Upload a CSV file with your contacts</p>
              <span className="text-sm text-indigo-600 font-medium">Best for new data →</span>
            </button>

            {/* Select from Pipeline */}
            <button
              onClick={() => navigate("/contact-list-select")}
              className="p-8 border-2 border-gray-200 rounded-lg hover:border-purple-500 text-center transition group"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select from Pipeline</h3>
              <p className="text-gray-600 mb-4">Choose contacts from event pipeline stages</p>
              <span className="text-sm text-purple-600 font-medium">Best for campaigns →</span>
            </button>

            {/* Manual Selection */}
            <button
              onClick={() => navigate("/org-members")}
              className="p-8 border-2 border-gray-200 rounded-lg hover:border-green-500 text-center transition group"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manual Selection</h3>
              <p className="text-gray-600 mb-4">Hand-pick contacts from your master list</p>
              <span className="text-sm text-green-600 font-medium">Best for targeting →</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  <strong>Import Contacts</strong> for bulk upload, <strong>Pipeline Selection</strong> for event-based targeting, 
                  or <strong>Manual Selection</strong> for precise control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

