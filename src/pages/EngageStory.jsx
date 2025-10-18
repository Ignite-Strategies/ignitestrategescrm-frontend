import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EngageStory() {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState("youtube"); // youtube or upload
  const [formData, setFormData] = useState({
    title: "",
    memberName: "",
    youtubeUrl: "",
    description: "",
    tags: ""
  });
  const [videoFile, setVideoFile] = useState(null);

  const storyPrompts = [
    {
      emoji: "💡",
      question: "What brought you to this organization?",
      tip: "Share the moment or struggle that led you here"
    },
    {
      emoji: "🚀",
      question: "What's changed since you joined?",
      tip: "Talk about specific transformations (physical, mental, social)"
    },
    {
      emoji: "🎯",
      question: "What's your current goal?",
      tip: "Give others something to rally behind"
    },
    {
      emoji: "💪",
      question: "What's one win you're proud of?",
      tip: "Big or small - celebrate your progress"
    },
    {
      emoji: "👥",
      question: "Who in the group has impacted you most?",
      tip: "Give credit and build community"
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
      } else {
        alert("Please upload a video file");
      }
    }
  };

  const handleSubmit = () => {
    if (uploadMethod === "youtube" && !formData.youtubeUrl) {
      alert("Please enter a YouTube URL");
      return;
    }
    if (uploadMethod === "upload" && !videoFile) {
      alert("Please upload a video file");
      return;
    }
    alert("🎉 Story saved! (This will connect to your backend in production)");
  };

  const handleCopyPrompts = () => {
    const promptsText = storyPrompts.map(p => `${p.emoji} ${p.question}`).join("\n");
    navigator.clipboard.writeText(promptsText);
    alert("Story prompts copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/engage")}
          className="mb-6 text-purple-600 hover:text-purple-800 flex items-center gap-2 font-medium"
        >
          ← Back to Engagement Hub
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🎥</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Member Story Video</h1>
              <p className="text-slate-600 mt-2">
                Showcase transformation stories that inspire your entire community
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Story Prompts & Tips */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">📝 Story Prompts</h2>
                <button
                  onClick={handleCopyPrompts}
                  className="text-sm px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  Copy All
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Use these questions to guide your member interviews
              </p>
              
              <div className="space-y-4">
                {storyPrompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{prompt.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {prompt.question}
                        </h3>
                        <p className="text-sm text-slate-600 italic">
                          {prompt.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                <span>Best Practices</span>
              </h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>Keep it short:</strong> 60-90 seconds is perfect</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>Be authentic:</strong> Raw beats polished every time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>Show emotion:</strong> Vulnerability connects people</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span><strong>End with a challenge:</strong> Inspire others to act</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📤 Upload Story</h2>

            {/* Upload Method Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setUploadMethod("youtube")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  uploadMethod === "youtube"
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                📺 YouTube Link
              </button>
              <button
                onClick={() => setUploadMethod("upload")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  uploadMethod === "upload"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                📁 Upload File
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Story Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., John's 30-Day Transformation"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Member Name
                </label>
                <input
                  type="text"
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {uploadMethod === "youtube" ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Paste the full YouTube URL from the address bar
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Upload Video File
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      {videoFile ? (
                        <div>
                          <div className="text-4xl mb-2">✅</div>
                          <p className="font-semibold text-slate-900">{videoFile.name}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="text-4xl mb-2">📤</div>
                          <p className="font-semibold text-slate-900">Click to upload video</p>
                          <p className="text-sm text-slate-600 mt-1">MP4, MOV, or AVI</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    💡 Tip: Upload to YouTube first for better performance
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the story..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., transformation, fitness, leadership"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  💾 Save Story
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Placeholder */}
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-dashed border-purple-300">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🪄</div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">
                AI Story Editor (Coming Soon)
              </h3>
              <p className="text-sm text-slate-700">
                Auto-generate captions, create highlight reels, and optimize your member stories with AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

