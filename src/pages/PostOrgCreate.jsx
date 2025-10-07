import { useNavigate } from "react-router-dom";

export default function PostOrgCreate() {
  const navigate = useNavigate();
  const orgName = localStorage.getItem("orgName") || "your organization";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl mb-6">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
            Organization Created!
          </h1>
          <p className="text-2xl text-white/90">
            What would you like to do first?
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary CTA: Create Event */}
          <button
            onClick={() => navigate("/event/create")}
            className="bg-white rounded-2xl shadow-2xl p-8 text-left hover:scale-105 transition-all group relative overflow-hidden"
          >
            {/* Recommended Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              RECOMMENDED
            </div>
            
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Create Your First Event
            </h2>
            <p className="text-gray-600 mb-6">
              Set up your first event with goals, venue, and pipeline tracking. Events are the heart of your CRM.
            </p>
            
            <div className="flex items-center text-cyan-600 font-semibold group-hover:translate-x-2 transition">
              Get Started
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Secondary CTA: Load Contacts */}
          <button
            onClick={() => navigate("/supporters/upload")}
            className="bg-white rounded-2xl shadow-xl p-8 text-left hover:scale-105 transition-all group"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Load Your Contacts
            </h2>
            <p className="text-gray-600 mb-6">
              Upload your org members via CSV to build your master contact list before creating events.
            </p>
            
            <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition">
              Upload CSV
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Tertiary CTA: Explore Dashboard */}
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white rounded-2xl shadow-xl p-8 text-left hover:scale-105 transition-all group"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Explore Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Take a look around and explore all the features at your own pace.
            </p>
            
            <div className="flex items-center text-gray-600 font-semibold group-hover:translate-x-2 transition">
              Let's Explore
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Helper Text */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            💡 Tip: Most orgs start by creating an event, then loading contacts to invite
          </p>
        </div>
      </div>
    </div>
  );
}

