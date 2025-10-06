import { useNavigate } from "react-router-dom";

export default function OrgChoose() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">One More Step!</h1>
          <p className="text-xl text-gray-600">Do you want to create a new organization or join an existing one?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Organization */}
          <button
            onClick={() => navigate("/org/create")}
            className="bg-white rounded-2xl shadow-xl p-12 hover:shadow-2xl transition text-left group"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Create Organization</h2>
            <p className="text-gray-600 mb-4">
              Start fresh! Set up your organization, customize your CRM, and invite your team.
            </p>
            <p className="text-indigo-600 font-semibold group-hover:underline">
              Create New Org →
            </p>
          </button>

          {/* Join Organization */}
          <button
            onClick={() => navigate("/org/join")}
            className="bg-white rounded-2xl shadow-xl p-12 hover:shadow-2xl transition text-left group"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Join Organization</h2>
            <p className="text-gray-600 mb-4">
              Have an invite code? Join your team's existing organization and start collaborating.
            </p>
            <p className="text-emerald-600 font-semibold group-hover:underline">
              Join Existing Org →
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

