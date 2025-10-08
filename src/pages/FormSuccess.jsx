import { useNavigate, useLocation } from "react-router-dom";

export default function FormSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Form Created Successfully! 📝</h1>
          <p className="text-gray-600 mb-6">
            {formData.name || "Your form"} is now ready to collect submissions.
          </p>

          {formData.slug && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-cyan-900 mb-3 text-lg">🔗 Your Form URL</h3>
              <div className="bg-white p-4 rounded-lg mb-3">
                <code className="text-sm text-gray-700 break-all">
                  https://f3capital.com/forms/{formData.slug}
                </code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://f3capital.com/forms/${formData.slug}`);
                  alert("URL copied to clipboard!");
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                📋 Copy URL
              </button>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-blue-800 text-left">
              <div className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Embed this form on your landing page or share the direct link</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>When people submit, they'll automatically be added as {formData.audienceType} contacts</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>They'll be placed in the "{formData.targetStage}" stage of your funnel</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Track all submissions in the Forms dashboard</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/forms")}
              className="w-full bg-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-cyan-700 transition"
            >
              View All Forms
            </button>

            <button
              onClick={() => navigate("/forms/create")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Create Another Form
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

