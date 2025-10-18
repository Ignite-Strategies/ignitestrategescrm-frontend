import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EngageEmailCrew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    campaignName: "",
    subject: "",
    previewText: "",
    emailBody: "",
    ctaText: "Join Us",
    ctaLink: ""
  });

  const templates = [
    {
      name: "Weekly Check-In",
      subject: "How's Your Week Going? 💪",
      body: "Hey [First Name],\n\nJust checking in to see how you're doing this week. Remember, consistency beats perfection every time.\n\nWhat's one win you've had this week?\n\nKeep showing up,\n[Your Name]",
      preview: "Quick motivation for your crew"
    },
    {
      name: "Challenge Launch",
      subject: "New Challenge: Are You In? 🔥",
      body: "What's up [First Name]!\n\nWe're launching a 7-day challenge starting Monday. The goal? Show up every single day.\n\nNo excuses. No backing down. Just pure commitment.\n\nAre you in?\n\n[Challenge Details]",
      preview: "Rally your members for action"
    },
    {
      name: "Member Spotlight",
      subject: "You Need to Meet [Member Name]",
      body: "Hey [First Name],\n\nI want to introduce you to one of our champions - [Member Name].\n\nThey started just like you, and here's what happened next...\n\n[Story]",
      preview: "Celebrate and inspire"
    }
  ];

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      campaignName: template.name,
      subject: template.subject,
      emailBody: template.body
    });
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleGenerate = () => {
    alert("🪄 AI Generation coming soon! For now, use the templates or write your own.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/engage")}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          ← Back to Engagement Hub
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">✉️</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Email Your Crew</h1>
              <p className="text-slate-600 mt-2">
                Pre-built templates for engaging with your active members
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Templates Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">📋 Templates</h2>
            <p className="text-sm text-slate-600 mb-6">
              Click a template to auto-fill the form →
            </p>
            
            <div className="space-y-4">
              {templates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-left p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-400 transition-all"
                >
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{template.subject}</p>
                  <div className="text-xs text-blue-600 italic">{template.preview}</div>
                </button>
              ))}
            </div>

            {/* AI Placeholder */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 text-purple-700 font-semibold hover:text-purple-900"
              >
                <span>🪄</span>
                <span>Generate with AI (Coming Soon)</span>
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">✏️ Compose</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.campaignName}
                  onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                  placeholder="e.g., Weekly Check-In"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., How's Your Week Going? 💪"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Preview Text
                </label>
                <input
                  type="text"
                  value={formData.previewText}
                  onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                  placeholder="Quick motivation for your crew"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Body
                </label>
                <textarea
                  value={formData.emailBody}
                  onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                  placeholder="Write your message here..."
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="Join Us"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    CTA Link
                  </label>
                  <input
                    type="url"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleCopyToClipboard(formData.emailBody)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={() => navigate("/campaign-creator")}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  ✉️ Send via Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

