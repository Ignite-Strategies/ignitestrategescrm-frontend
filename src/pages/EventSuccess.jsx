import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function EventSuccess() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [event, setEvent] = useState(null);
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    loadEventAndCalculateGoals();
  }, [eventId]);

  const loadEventAndCalculateGoals = async () => {
    try {
      const response = await api.get(`/orgs/${orgId}/events/${eventId}`);
      const eventData = response.data;
      setEvent(eventData);

      // Calculate goals if fundraising goal is set
      if (eventData.fundraisingGoal > 0 && eventData.ticketCost > 0) {
        const totalNeeded = eventData.fundraisingGoal + (eventData.additionalExpenses || 0);
        const ticketsNeeded = Math.ceil(totalNeeded / eventData.ticketCost);
        const invitesNeeded = Math.ceil(ticketsNeeded / 0.25); // 25% conversion rate

        setGoals({
          totalNeeded,
          ticketsNeeded,
          invitesNeeded,
          conversionRate: 25
        });
      }
    } catch (error) {
      console.error("Error loading event:", error);
    }
  };

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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Created Successfully! 🎉</h1>
          <p className="text-gray-600 mb-6">
            {event ? event.name : "Your event"} is now set up in the system.
          </p>

          {/* Goal Calculations */}
          {goals && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-green-900 mb-4 text-lg">🎯 Your Goals Breakdown</h3>
              <div className="space-y-3 text-left">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Needed (Goal + Expenses)</p>
                  <p className="text-2xl font-bold text-gray-900">${goals.totalNeeded.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tickets You Need to Sell</p>
                  <p className="text-2xl font-bold text-indigo-600">{goals.ticketsNeeded} tickets</p>
                  <p className="text-xs text-gray-500 mt-1">@ ${event.ticketCost} per ticket</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Invites You Need to Send</p>
                  <p className="text-2xl font-bold text-purple-600">{goals.invitesNeeded} invites</p>
                  <p className="text-xs text-gray-500 mt-1">Assuming {goals.conversionRate}% conversion rate</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-blue-800 text-left">
              <div className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Set up your event pipeline to start targeting supporters</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Push supporters into the funnel and track their progress</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>Move people through stages: In Funnel → Personal Invite → Paid</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Track invites sent and tickets sold toward your goal</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/event/${eventId}/pipelines`)}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Set Up Pipelines →
            </button>

            <button
              onClick={() => navigate(`/event/${eventId}/engagement-advisory`)}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Goals & Audience Advisory
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

