import { useNavigate, useLocation } from 'react-router-dom';

export default function ListCreatedSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { listName, contactCount, listId } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">List Created! 🎉</h1>
          
          <div className="bg-green-50 rounded-xl p-6 mb-8">
            <p className="text-2xl font-bold text-green-800 mb-2">{listName}</p>
            <p className="text-lg text-green-700">{contactCount} contacts ready to reach</p>
          </div>

          <p className="text-gray-600 mb-8 text-lg">What would you like to do next?</p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate('/campaignhome', { state: { listId } })}
              className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Campaign to This List
            </button>

            <button
              onClick={() => navigate('/contact-list-manager')}
              className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All My Lists
            </button>

            <button
              onClick={() => navigate('/contact-list-builder')}
              className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Another List
            </button>

            <button
              onClick={() => navigate('/org-dashboard')}
              className="w-full text-gray-600 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

