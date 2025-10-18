import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RecruitEventbrite() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [mockEvents] = useState([
    {
      id: "evt_001",
      name: "Community Workout & Coffee",
      date: "2025-11-15T09:00:00",
      location: "Central Park",
      attendees: 45,
      capacity: 75,
      status: "published"
    },
    {
      id: "evt_002",
      name: "30-Day Challenge Kickoff",
      date: "2025-11-22T18:00:00",
      location: "Downtown Gym",
      attendees: 28,
      capacity: 50,
      status: "published"
    },
    {
      id: "evt_003",
      name: "Leadership Summit 2025",
      date: "2025-12-01T10:00:00",
      location: "Convention Center",
      attendees: 12,
      capacity: 100,
      status: "draft"
    }
  ]);

  const handleConnectEventbrite = () => {
    // This would normally trigger OAuth flow
    alert("Eventbrite OAuth integration coming soon! For MVP, we'll show mock data.");
    setIsConnected(true);
  };

  const handleSyncEvent = (eventId) => {
    alert(`Event ${eventId} synced! (This will pull attendees into your CRM in production)`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/engage")}
          className="mb-6 text-orange-600 hover:text-orange-800 flex items-center gap-2 font-medium"
        >
          ← Back to Engagement Hub
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🎟️</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900">Eventbrite Integration</h1>
              <p className="text-slate-600 mt-2">
                Sync your public events and automatically pull attendees into your CRM
              </p>
            </div>
            {!isConnected ? (
              <button
                onClick={handleConnectEventbrite}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                🔗 Connect Eventbrite
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <span className="text-xl">✓</span>
                <span className="font-semibold">Connected</span>
              </div>
            )}
          </div>
        </div>

        {!isConnected ? (
          /* Not Connected State */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">🔌</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Connect Your Eventbrite Account
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Once connected, you'll be able to view all your Eventbrite events here and automatically sync attendees into your CRM. No more manual imports!
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-semibold text-slate-900 mb-2">Auto-Sync Events</h3>
                <p className="text-sm text-slate-600">See all your Eventbrite events in one place</p>
              </div>
              <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl mb-3">👥</div>
                <h3 className="font-semibold text-slate-900 mb-2">Import Attendees</h3>
                <p className="text-sm text-slate-600">Pull attendee data directly into your CRM</p>
              </div>
              <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-slate-900 mb-2">Real-Time Updates</h3>
                <p className="text-sm text-slate-600">Stay synced with ticket sales and RSVPs</p>
              </div>
            </div>

            <button
              onClick={handleConnectEventbrite}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            >
              🔗 Connect Eventbrite Account
            </button>
          </div>
        ) : (
          /* Connected State - Show Events */
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Your Eventbrite Events</h2>
                <button
                  onClick={() => alert("Syncing all events... (API integration coming soon)")}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
                >
                  🔄 Sync All
                </button>
              </div>

              <div className="space-y-4">
                {mockEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-6 rounded-lg border-2 border-slate-200 hover:border-orange-300 transition-all bg-gradient-to-r from-slate-50 to-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{event.name}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            event.status === 'published' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {event.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-lg">📅</span>
                            <span className="text-sm">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-lg">📍</span>
                            <span className="text-sm">{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="text-lg">👥</span>
                            <span className="text-sm">
                              {event.attendees} / {event.capacity} attendees
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                              style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {Math.round((event.attendees / event.capacity) * 100)}% capacity
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <button
                          onClick={() => handleSyncEvent(event.id)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all whitespace-nowrap"
                        >
                          ⬇️ Import Attendees
                        </button>
                        <button
                          onClick={() => alert(`Viewing ${event.name} details...`)}
                          className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                <span>How It Works</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">1.</span>
                  <span>Your Eventbrite events automatically sync to this dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">2.</span>
                  <span>Click "Import Attendees" to pull ticket buyers into your CRM</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">3.</span>
                  <span>Attendees are automatically added to your org's contact list</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">4.</span>
                  <span>Use pipelines and campaigns to engage with your new attendees</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* AI Placeholder */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-dashed border-purple-300">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🪄</div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                Smart Event Recommendations (Coming Soon)
              </h3>
              <p className="text-sm text-slate-700">
                AI will analyze your past events and suggest optimal dates, pricing, and marketing strategies for future events.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

