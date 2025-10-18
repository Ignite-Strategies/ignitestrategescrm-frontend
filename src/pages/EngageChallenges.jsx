import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EngageChallenges() {
  const navigate = useNavigate();
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const challenges = [
    {
      id: 1,
      name: "3x Workouts This Week",
      emoji: "💪",
      duration: "7 days",
      difficulty: "Beginner",
      description: "Complete 3 workouts in the next 7 days. Post proof in the group!",
      rules: [
        "Any workout counts (gym, home, outdoor)",
        "Minimum 20 minutes per session",
        "Post your workout selfie in the group",
        "Tag 3 friends to join you"
      ],
      copyText: "🔥 NEW CHALLENGE ALERT! 🔥\n\n3 workouts in 7 days. That's it. No excuses.\n\nWho's in? Drop a 💪 in the comments.\n\nRules:\n✅ Any workout counts\n✅ 20 min minimum\n✅ Post proof\n✅ Tag 3 friends\n\nLet's GO!"
    },
    {
      id: 2,
      name: "Bring a Friend Week",
      emoji: "👥",
      duration: "7 days",
      difficulty: "Easy",
      description: "Invite one friend to join you for a workout or meeting this week.",
      rules: [
        "Invite must be to someone new (not already a member)",
        "Share a photo of you + your friend",
        "Both of you attend together",
        "Friend doesn't have to join org (yet!)"
      ],
      copyText: "👥 BRING A FRIEND CHALLENGE 👥\n\nThis week's mission: Bring ONE friend to experience what we do.\n\nIt's that simple.\n\nNo pressure on them to join. Just show them what we're about.\n\nWho are you bringing? Tag them below! 👇"
    },
    {
      id: 3,
      name: "30-Day Consistency",
      emoji: "📅",
      duration: "30 days",
      difficulty: "Advanced",
      description: "Show up every single day for 30 days straight. No breaks.",
      rules: [
        "Must attend or log activity daily",
        "One rest day allowed per week",
        "Check in on the group thread daily",
        "Support others in the challenge"
      ],
      copyText: "📅 THE BIG ONE: 30-DAY CONSISTENCY CHALLENGE 📅\n\nFor 30 days, you show up. Every. Single. Day.\n\nThis isn't about perfection. It's about commitment.\n\n✅ Daily activity (workout, walk, stretch)\n✅ Check in on our group\n✅ 1 rest day/week allowed\n✅ Support the crew\n\nWho's ready to prove what they're made of?\n\nComment 'I'M IN' to join."
    },
    {
      id: 4,
      name: "Share Your Story",
      emoji: "📖",
      duration: "1 week",
      difficulty: "Easy",
      description: "Record a 60-second video sharing your transformation or why you're here.",
      rules: [
        "60 seconds max",
        "Be authentic, not polished",
        "Share what brought you here",
        "Post in the group or send to leadership"
      ],
      copyText: "📖 STORY TIME CHALLENGE 📖\n\nYour story matters. Your journey inspires others.\n\nThis week: Record a 60-second video.\n\n💬 What brought you here?\n💬 What's changed since you joined?\n💬 What's one thing you're grateful for?\n\nDon't overthink it. Just be real.\n\nShare it in the group. Let's celebrate YOU."
    },
    {
      id: 5,
      name: "Random Act of Leadership",
      emoji: "🎁",
      duration: "3 days",
      difficulty: "Medium",
      description: "Do something kind or helpful for another member without being asked.",
      rules: [
        "Must be unprompted",
        "Can be big or small",
        "Share what you did (anonymously if you want)",
        "Encourage others to pay it forward"
      ],
      copyText: "🎁 RANDOM ACT OF LEADERSHIP 🎁\n\nThis week's challenge is different.\n\nDo something kind for another member. Without being asked.\n\n✅ Encourage someone struggling\n✅ Help someone with their form\n✅ Bring an extra water for a friend\n✅ Send a text checking in\n\nBig or small. Just do it.\n\nLeadership isn't a title. It's action."
    }
  ];

  const handleCopyChallenge = (challenge) => {
    navigator.clipboard.writeText(challenge.copyText);
    alert(`"${challenge.name}" copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
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
            <div className="text-5xl">💪</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Challenge of the Week</h1>
              <p className="text-slate-600 mt-2">
                Pre-built challenges to rally your members and drive engagement
              </p>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-orange-300"
              onClick={() => setSelectedChallenge(challenge)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{challenge.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{challenge.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                        {challenge.duration}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 mb-4">{challenge.description}</p>

              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-slate-700">Rules:</h4>
                <ul className="space-y-1">
                  {challenge.rules.map((rule, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">✓</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyChallenge(challenge);
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
              >
                📋 Copy Challenge Text
              </button>
            </div>
          ))}
        </div>

        {/* Selected Challenge Detail Modal */}
        {selectedChallenge && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50"
            onClick={() => setSelectedChallenge(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedChallenge.emoji}</span>
                  <h2 className="text-3xl font-bold text-slate-900">{selectedChallenge.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">📢 Copy/Paste Text:</h3>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {selectedChallenge.copyText}
                </pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleCopyChallenge(selectedChallenge)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Placeholder */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-dashed border-purple-300">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🪄</div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                Custom Challenge Generator (Coming Soon)
              </h3>
              <p className="text-sm text-slate-700">
                AI will help you create custom challenges tailored to your org's unique culture and goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

