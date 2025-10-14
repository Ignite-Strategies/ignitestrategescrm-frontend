import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * CreateListOptions - PRIMARY Contact List Creation Hub
 * The main entry point for all list creation methods
 */
export default function CreateListOptions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if we're in campaign flow
  const campaignId = searchParams.get('campaignId');
  const isInCampaignFlow = !!campaignId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Create a Contact List</h1>
              <p className="text-gray-600">Choose how you'd like to build your audience</p>
              {isInCampaignFlow && (
                <p className="text-sm text-indigo-600 mt-1">
                  Campaign: <span className="font-semibold">{localStorage.getItem('currentCampaignName') || 'Unnamed'}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => {
                if (isInCampaignFlow) {
                  navigate(`/contact-list-manager?campaignId=${campaignId}`);
                } else {
                  navigate("/contact-list-manager");
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>

          {/* Options Grid - MVP + Future State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 1. Smart Lists - MVP (ContactListBuilder merged here) */}
            <button
              onClick={() => {
                if (isInCampaignFlow) {
                  navigate(`/contact-list-builder?campaignId=${campaignId}`);
                } else {
                  navigate("/contact-list-builder");
                }
              }}
              className="p-8 border-2 border-indigo-300 rounded-lg hover:border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 text-center transition group shadow-sm"
            >
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">⚡ Smart Lists</h3>
              <p className="text-gray-600 mb-4">Pre-built lists ready to use (All Org Members, Test List)</p>
              <span className="text-sm text-indigo-600 font-semibold">🚀 MVP - Live Now →</span>
            </button>

            {/* 2. Upload from CSV - MVP */}
            <button
              onClick={() => navigate("/org-members/upload")}
              className="p-8 border-2 border-green-300 rounded-lg hover:border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-center transition group shadow-sm"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">📤 Upload CSV</h3>
              <p className="text-gray-600 mb-4">Import contacts from a spreadsheet</p>
              <span className="text-sm text-green-600 font-semibold">🚀 MVP - Live Now →</span>
            </button>

            {/* 3. Pipeline Selector - MVP */}
            <button
              onClick={() => navigate("/contact-upload-chooser")}
              className="p-8 border-2 border-purple-300 rounded-lg hover:border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-center transition group shadow-sm"
            >
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🎯 Pipeline Upload</h3>
              <p className="text-gray-600 mb-4">Select from event pipeline stages</p>
              <span className="text-sm text-purple-600 font-semibold">🚀 MVP - Live Now →</span>
            </button>
          </div>

          {/* Future State Options - Coming Soon */}
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">🔮 Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Manual Selection - Future */}
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center opacity-60 cursor-not-allowed">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">👥 Manual Selection</h3>
                <p className="text-gray-500 mb-4">Hand-pick specific contacts one by one</p>
                <span className="text-xs text-gray-500">Coming in v2</span>
              </div>

              {/* Integration Sync - Future */}
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center opacity-60 cursor-not-allowed">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">🔄 Integration Sync</h3>
                <p className="text-gray-500 mb-4">Import from MailChimp, HubSpot, etc.</p>
                <span className="text-xs text-gray-500">Coming in v2</span>
              </div>

              {/* Tag-Based Lists - Future */}
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center opacity-60 cursor-not-allowed">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">🏷️ Tag-Based Lists</h3>
                <p className="text-gray-500 mb-4">Create lists based on contact tags</p>
                <span className="text-xs text-gray-500">Coming in v2</span>
              </div>

            </div>
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

