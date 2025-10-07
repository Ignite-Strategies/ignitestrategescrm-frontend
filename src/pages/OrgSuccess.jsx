import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";

export default function OrgSuccess() {
  const orgId = getOrgId();
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
          <p className="text-gray-600 mb-2">Your CRM is ready.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              📋 Let's get your current supporters into your CRM
            </h2>
            <p className="text-sm text-blue-700">
              This is your <span className="font-semibold">master supporter list</span> - the foundation for all events.
              Upload a CSV or add them manually later.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/org/post-create")}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

