import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function SetupEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [daysUntilEvent, setDaysUntilEvent] = useState(0);
  const [answers, setAnswers] = useState({
    venueReserved: null,
    announcementSent: null,
    teamSize: "1",
    hasCommittee: null,
    collateralNeeded: []
  });

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
      
      // Auto-calculate days until event
      if (res.data.date) {
        const eventDate = new Date(res.data.date);
        const today = new Date();
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilEvent(diffDays > 0 ? diffDays : 0);
      }
    } catch (error) {
      console.error("Error loading event:", error);
    }
  };

  const toggleCollateral = (item) => {
    setAnswers(prev => ({
      ...prev,
      collateralNeeded: prev.collateralNeeded.includes(item)
        ? prev.collateralNeeded.filter(i => i !== item)
        : [...prev.collateralNeeded, item]
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Future: OpenAI call here to generate smart task suggestions
      // const aiSuggestions = await openai.generateTasks({ ...answers, daysUntilEvent });
      
      // Navigate to suggestions page with survey answers
      navigate(`/event/${eventId}/task-suggestions`, {
        state: { 
          answers: { ...answers, daysUntilEvent },
          event 
        }
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to proceed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const collateralOptions = [
    "Flyer/Poster",
    "Social Media Graphics",
    "Email Template",
    "Landing Page",
    "Video Content",
    "Presentation Deck"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Event Tasks</h1>
            {event && (
              <p className="text-gray-600">
                {event.name} • {daysUntilEvent} days until event
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Answer a few questions to get personalized task suggestions
            </p>
          </div>

          {/* Long Form Survey */}
          <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-8">
            
            {/* Question 1: Venue Reserved */}
            <div className="pb-6 border-b">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Have you reserved a venue?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, venueReserved: true })}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition ${
                    answers.venueReserved === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, venueReserved: false })}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition ${
                    answers.venueReserved === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  ❌ No
                </button>
              </div>
            </div>

            {/* Question 2: Announcement Sent */}
            <div className="pb-6 border-b">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Have you made an initial announcement to your key members?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, announcementSent: true })}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition ${
                    answers.announcementSent === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, announcementSent: false })}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition ${
                    answers.announcementSent === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  ❌ No
                </button>
              </div>
            </div>

            {/* Question 3: Team Size */}
            <div className="pb-6 border-b">
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                How large is your team?
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Be honest — "it's just me right now" is a valid answer
              </p>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                value={answers.teamSize}
                onChange={(e) => setAnswers({ ...answers, teamSize: e.target.value })}
                placeholder="1"
                required
              />
            </div>

            {/* Question 4: Has Committee */}
            <div className="pb-6 border-b">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Do you have a committee or team to help?
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, hasCommittee: true })}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition ${
                    answers.hasCommittee === true
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, hasCommittee: false })}
                  className={`flex-1 py-3 px-6 rounded-lg border-2 transition ${
                    answers.hasCommittee === false
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  ❌ No
                </button>
              </div>
            </div>

            {/* Auto-Calculated Days */}
            <div className="pb-6 border-b">
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Days Until Event
              </label>
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg text-center">
                <p className="text-5xl font-bold text-purple-600">{daysUntilEvent}</p>
                <p className="text-sm text-gray-600 mt-2">days until {event?.name}</p>
              </div>
            </div>

            {/* Question 5: Collateral Needed */}
            <div className="pb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                What collateral do you need?
              </label>
              <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {collateralOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleCollateral(option)}
                    className={`py-3 px-4 rounded-lg border-2 transition text-left ${
                      answers.collateralNeeded.includes(option)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <span className="mr-2">
                      {answers.collateralNeeded.includes(option) ? '✅' : '⬜'}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Generating Tasks..." : "Generate Task Suggestions →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
