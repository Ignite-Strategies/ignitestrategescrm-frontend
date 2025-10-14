import { useNavigate } from "react-router-dom";

/**
 * CampaignListHydratorHome - THE FORK
 * Step 2 of campaign flow: Choose how to get your contact list
 * Uses localStorage (no URL params needed!)
 */
export default function CampaignListHydratorHome() {
  const navigate = useNavigate();
  
  // Get from localStorage (single source of truth)
  const campaignId = localStorage.getItem('campaignId');
  const campaignName = localStorage.getItem('currentCampaign') || 'Your Campaign';

  if (!campaignId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ No Campaign Selected</h1>
          <p className="text-gray-600 mb-6">Please start from Campaign Creator.</p>
          <button
            onClick={() => navigate('/campaign-creator')}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Start New Campaign
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate('/campaignhome')}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Back to Campaign Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📋 Choose Your Contact List
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Step 2 of 3: How do you want to get your contacts?
          </p>
          <p className="text-sm text-indigo-600 font-semibold">
            Campaign: {campaignName}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 pb-6 border-b max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-600">Step 2: Choose List</span>
            <span className="text-sm text-gray-500">66% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* THE FORK - Two Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Option 1: Pick Existing List */}
          <button
            onClick={() => navigate('/contact-list-manager')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  📌 Pick Existing List
                </h2>
                <p className="text-gray-600 mb-4">
                  Choose from your saved contact lists - quick and easy!
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Use previously created lists
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Preview contacts before selecting
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fastest option
                  </li>
                </ul>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-end text-indigo-600 font-semibold group-hover:translate-x-2 transition">
                Choose Existing List →
              </div>
            </div>
          </button>

          {/* Option 2: Create New List */}
          <button
            onClick={() => navigate('/create-list-options')}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  ✨ Create New List
                </h2>
                <p className="text-gray-600 mb-4">
                  Build a fresh contact list from scratch - full control!
                </p>
                
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Smart lists (All Org Members)
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Upload from CSV
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Pipeline-based selection
                  </li>
                </ul>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-end text-green-600 font-semibold group-hover:translate-x-2 transition">
                Create New List →
              </div>
            </div>
          </button>

        </div>

        {/* Info Footer */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> If you already have lists created, picking an existing one is faster. 
              If you need specific contacts, create a new list with custom filters.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

