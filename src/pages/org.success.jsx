import { useParams, useNavigate } from "react-router-dom";

export default function OrgSuccess() {
  const { orgId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Created!</h1>
          <p className="text-gray-600 mb-8">Your CRM is ready. Time to create events and manage supporters.</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/dashboard/${orgId}`)}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => navigate(`/org/${orgId}/users`)}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Upload Supporters First
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

