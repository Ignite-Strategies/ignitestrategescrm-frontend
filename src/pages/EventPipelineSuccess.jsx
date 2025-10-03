import { useParams, useNavigate } from "react-router-dom";

export default function EventPipelineSuccess() {
  const { eventId } = useParams();
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pipeline Created Successfully! 🎯</h1>
          <p className="text-gray-600 mb-6">
            Great! Your F3 Member pipeline is ready to go.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Add your master F3 contacts to the pipeline</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Track their progress through stages: Member → Soft Commit → Paid</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Move contacts through stages as they engage</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Graduate paid contacts to final attendee records</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800 text-sm">
              <strong>💡 Pro Tip:</strong> F3 Members will be your most crucial audience - they have the highest conversion rate and are most likely to attend and bring friends!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/event/${eventId}/pipelines`)}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Add F3 Members to Pipeline →
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Manage Pipelines from Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
