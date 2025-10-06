import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function SetupEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({
    venueReserved: null,
    announcementSent: null,
    teamSize: "",
    hasCommittee: null,
    daysUntilEvent: "",
    collateralNeeded: []
  });

  const updateAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Generate tasks based on survey answers
      const taskConfig = {
        venueReserved: answers.venueReserved,
        announcementSent: answers.announcementSent,
        teamSize: parseInt(answers.teamSize) || 1,
        hasCommittee: answers.hasCommittee,
        daysUntilEvent: parseInt(answers.daysUntilEvent) || 30,
        collateralNeeded: answers.collateralNeeded
      };

      await api.post(`/events/${eventId}/tasks/generate`, taskConfig);
      navigate(`/event/${eventId}/tasks`);
    } catch (error) {
      console.error("Error generating tasks:", error);
      alert("Failed to generate tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      question: "Have you reserved a venue?",
      type: "yesno",
      field: "venueReserved"
    },
    {
      question: "Have you made an initial announcement to your key members?",
      type: "yesno",
      field: "announcementSent"
    },
    {
      question: "How large is your team?",
      subtitle: "Be honest — it's just me right now is a valid answer",
      type: "number",
      field: "teamSize",
      placeholder: "1"
    },
    {
      question: "Do you have a committee or team to help?",
      type: "yesno",
      field: "hasCommittee"
    },
    {
      question: "How many days until your event?",
      type: "number",
      field: "daysUntilEvent",
      placeholder: "30"
    },
    {
      question: "What collateral do you need?",
      subtitle: "Select all that apply",
      type: "multi",
      field: "collateralNeeded",
      options: [
        "Flyer/Poster",
        "Social Media Graphics",
        "Email Template",
        "Landing Page",
        "Video Content",
        "Presentation Deck"
      ]
    }
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const canProceed = () => {
    if (!currentStep) return false;
    const answer = answers[currentStep.field];
    
    if (currentStep.type === "yesno") return answer !== null;
    if (currentStep.type === "number") return answer && answer.length > 0;
    if (currentStep.type === "multi") return true; // Multi-select can be empty
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Setup Survey</h1>
            <p className="text-gray-600">Help us create a custom task list for your event</p>
            <div className="mt-4 flex justify-center gap-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === step
                      ? "w-8 bg-indigo-600"
                      : idx < step
                      ? "w-2 bg-indigo-400"
                      : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          {currentStep && (
            <div className="mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.question}</h2>
                {currentStep.subtitle && (
                  <p className="text-gray-600">{currentStep.subtitle}</p>
                )}
              </div>

              {/* Yes/No */}
              {currentStep.type === "yesno" && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateAnswer(currentStep.field, true)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      answers[currentStep.field] === true
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">✅</div>
                      <div className="font-semibold">Yes</div>
                    </div>
                  </button>
                  <button
                    onClick={() => updateAnswer(currentStep.field, false)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      answers[currentStep.field] === false
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">❌</div>
                      <div className="font-semibold">No</div>
                    </div>
                  </button>
                </div>
              )}

              {/* Number Input */}
              {currentStep.type === "number" && (
                <div>
                  <input
                    type="number"
                    value={answers[currentStep.field]}
                    onChange={(e) => updateAnswer(currentStep.field, e.target.value)}
                    placeholder={currentStep.placeholder}
                    className="w-full px-6 py-4 text-2xl border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
                    min="1"
                  />
                </div>
              )}

              {/* Multi-Select */}
              {currentStep.type === "multi" && (
                <div className="grid grid-cols-2 gap-4">
                  {currentStep.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const current = answers[currentStep.field] || [];
                        const updated = current.includes(option)
                          ? current.filter(o => o !== option)
                          : [...current, option];
                        updateAnswer(currentStep.field, updated);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        (answers[currentStep.field] || []).includes(option)
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          (answers[currentStep.field] || []).includes(option)
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-gray-300"
                        }`}>
                          {(answers[currentStep.field] || []).includes(option) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {isLastStep ? (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate My Tasks 🚀"}
              </button>
            ) : (
              <button
                onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                disabled={!canProceed()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate(`/event/${eventId}/tasks`)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip survey and use default tasks
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 What happens next?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ We'll create a custom task list based on your answers</p>
            <p>✅ Tasks will be prioritized by urgency and importance</p>
            <p>✅ You can add, edit, or remove tasks anytime</p>
            <p className="text-indigo-600 font-medium mt-4">
              🔮 Future: AI will suggest tasks based on your event type, size, and timeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

