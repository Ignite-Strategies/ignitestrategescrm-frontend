import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getOrgId } from "../lib/org";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventscrm-backend.vercel.app";

export default function GoogleCampaignBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgId = getOrgId();
  const personaId = searchParams.get("personaId"); // Optional - if coming from persona flow

  const [currentStep, setCurrentStep] = useState(1); // 1-5 steps
  const [aiSuggesting, setAiSuggesting] = useState(false);

  // Campaign data
  const [campaignData, setCampaignData] = useState({
    // Step 1: Campaign Basics
    name: "",
    objective: "awareness", // awareness, clicks, conversions
    dailyBudget: 20,
    startDate: "",
    endDate: "",

    // Step 2: Keywords (the heart)
    keywords: [],
    negativeKeywords: [],
    keywordInput: "", // temp input field

    // Step 3: Targeting
    locations: ["Arlington VA"],
    ageRanges: [],
    genders: [],
    languages: ["en"],

    // Step 4: Ad Copy
    headlines: ["", "", ""],
    descriptions: ["", ""],

    // Step 5: Landing Page
    finalUrl: "",
    callToAction: "Learn More"
  });

  const [suggestedKeywords, setSuggestedKeywords] = useState([]);

  // Add keyword
  const addKeyword = () => {
    if (campaignData.keywordInput.trim()) {
      setCampaignData({
        ...campaignData,
        keywords: [...campaignData.keywords, campaignData.keywordInput.trim()],
        keywordInput: ""
      });
    }
  };

  // Remove keyword
  const removeKeyword = (index) => {
    const newKeywords = campaignData.keywords.filter((_, i) => i !== index);
    setCampaignData({ ...campaignData, keywords: newKeywords });
  };

  // AI suggest keywords
  const handleAISuggest = async () => {
    setAiSuggesting(true);
    
    try {
      // Call backend to get keyword suggestions
      // For now, demo suggestions
      const demoSuggestions = [
        "men's accountability group",
        "brotherhood community near me",
        "men's fitness challenge",
        "personal development group",
        "leadership training men",
        "accountability partner program"
      ];
      
      setSuggestedKeywords(demoSuggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
    } finally {
      setAiSuggesting(false);
    }
  };

  // Add suggested keyword
  const addSuggestedKeyword = (keyword) => {
    if (!campaignData.keywords.includes(keyword)) {
      setCampaignData({
        ...campaignData,
        keywords: [...campaignData.keywords, keyword]
      });
    }
  };

  // Save campaign
  const handleSaveCampaign = async () => {
    try {
      console.log("💾 Saving campaign:", campaignData);
      
      // Format data for backend
      const payload = {
        orgId,
        personaId: personaId || null,
        name: campaignData.name,
        objective: campaignData.objective,
        dailyBudget: parseFloat(campaignData.dailyBudget),
        startDate: campaignData.startDate || null,
        endDate: campaignData.endDate || null,
        adGroups: [
          {
            name: `${campaignData.name} - Ad Group 1`,
            keywords: campaignData.keywords,
            negativeKeywords: campaignData.negativeKeywords,
            locations: campaignData.locations,
            ageRanges: campaignData.ageRanges,
            genders: campaignData.genders,
            languages: campaignData.languages,
            ads: [
              {
                headline1: campaignData.headlines[0],
                headline2: campaignData.headlines[1],
                headline3: campaignData.headlines[2],
                description: campaignData.descriptions[0],
                description2: campaignData.descriptions[1],
                finalUrl: campaignData.finalUrl,
                displayUrl: new URL(campaignData.finalUrl).hostname,
                callToAction: campaignData.callToAction
              }
            ]
          }
        ]
      };

      const response = await fetch(`${API_BASE_URL}/api/googleads/campaigns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const campaign = await response.json();
        alert("✅ Campaign created! Ready to push to Google Ads.");
        navigate("/recruit/google");
      } else {
        alert("❌ Failed to create campaign. Check console.");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("❌ Error saving campaign");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/recruit/google")}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
        >
          ← Back to Google Ads
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Campaign Builder</h1>
          <p className="text-slate-600">Build your Google Ads campaign step-by-step</p>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-2 rounded-full ${currentStep >= step ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-200'}`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Campaign Basics */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 1: Campaign Basics</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  placeholder="e.g., F3 Disconnected Dads - Nov 2024"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Daily Budget ($)
                  </label>
                  <input
                    type="number"
                    value={campaignData.dailyBudget}
                    onChange={(e) => setCampaignData({ ...campaignData, dailyBudget: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">How much you spend per day</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Objective
                  </label>
                  <select
                    value={campaignData.objective}
                    onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  >
                    <option value="awareness">Awareness (Impressions)</option>
                    <option value="clicks">Clicks (Traffic)</option>
                    <option value="conversions">Conversions (Sign-ups)</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={campaignData.startDate}
                    onChange={(e) => setCampaignData({ ...campaignData, startDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={campaignData.endDate}
                    onChange={(e) => setCampaignData({ ...campaignData, endDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!campaignData.name}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                Next: Add Keywords →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Keywords */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Step 2: Keywords</h2>
            <p className="text-slate-600 mb-6">
              What search terms should trigger your ads? Add your own or get AI suggestions.
            </p>

            {/* AI Suggest Button */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Need ideas?</p>
                  <p className="text-sm text-slate-600">AI can suggest keywords based on your campaign</p>
                </div>
                <button
                  onClick={handleAISuggest}
                  disabled={aiSuggesting}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50"
                >
                  {aiSuggesting ? "Thinking..." : "🪄 Suggest Keywords"}
                </button>
              </div>
            </div>

            {/* AI Suggestions */}
            {suggestedKeywords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">💡 Suggested Keywords (click to add):</h3>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map((keyword, idx) => (
                    <button
                      key={idx}
                      onClick={() => addSuggestedKeyword(keyword)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        campaignData.keywords.includes(keyword)
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
                      }`}
                    >
                      {campaignData.keywords.includes(keyword) ? '✓ ' : '+ '}{keyword}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Keyword Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Add Keywords Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={campaignData.keywordInput}
                  onChange={(e) => setCampaignData({ ...campaignData, keywordInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Type a keyword and press Enter"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg"
                />
                <button
                  onClick={addKeyword}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Current Keywords */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Your Keywords ({campaignData.keywords.length})
              </h3>
              {campaignData.keywords.length === 0 ? (
                <p className="text-slate-500 text-sm">No keywords added yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {campaignData.keywords.map((keyword, idx) => (
                    <div key={idx} className="group flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full border border-blue-300">
                      <span className="text-sm font-medium">{keyword}</span>
                      <button
                        onClick={() => removeKeyword(idx)}
                        className="text-blue-600 hover:text-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={campaignData.keywords.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                Next: Targeting →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Targeting */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 3: Who Should See This?</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location(s)
                </label>
                <input
                  type="text"
                  value={campaignData.locations[0] || ""}
                  onChange={(e) => setCampaignData({ ...campaignData, locations: [e.target.value] })}
                  placeholder="e.g., Arlington VA, DC Metro Area"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                />
                <p className="text-xs text-slate-500 mt-1">Where your target audience is located</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Age Range (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., 30-50"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gender (Optional)
                </label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-lg">
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition"
              >
                Next: Write Ad Copy →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Ad Copy */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 4: Write Your Ad</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Headlines (3 required, max 30 chars each)
                </label>
                {[0, 1, 2].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={30}
                    value={campaignData.headlines[idx]}
                    onChange={(e) => {
                      const newHeadlines = [...campaignData.headlines];
                      newHeadlines[idx] = e.target.value;
                      setCampaignData({ ...campaignData, headlines: newHeadlines });
                    }}
                    placeholder={`Headline ${idx + 1}`}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-2"
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descriptions (2 required, max 90 chars each)
                </label>
                {[0, 1].map((idx) => (
                  <textarea
                    key={idx}
                    maxLength={90}
                    rows={2}
                    value={campaignData.descriptions[idx]}
                    onChange={(e) => {
                      const newDescs = [...campaignData.descriptions];
                      newDescs[idx] = e.target.value;
                      setCampaignData({ ...campaignData, descriptions: newDescs });
                    }}
                    placeholder={`Description ${idx + 1}`}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-2"
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(5)}
                disabled={!campaignData.headlines[0] || !campaignData.headlines[1] || !campaignData.descriptions[0]}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                Next: Landing Page →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Landing Page & Review */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 5: Where Should They Go?</h2>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Landing Page URL *
                </label>
                <input
                  type="url"
                  value={campaignData.finalUrl}
                  onChange={(e) => setCampaignData({ ...campaignData, finalUrl: e.target.value })}
                  placeholder="https://yoursite.com/join"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Call to Action
                </label>
                <select
                  value={campaignData.callToAction}
                  onChange={(e) => setCampaignData({ ...campaignData, callToAction: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                >
                  <option value="Learn More">Learn More</option>
                  <option value="Sign Up">Sign Up</option>
                  <option value="Join Now">Join Now</option>
                  <option value="Get Started">Get Started</option>
                  <option value="Register">Register</option>
                </select>
              </div>
            </div>

            {/* Campaign Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 mb-8">
              <h3 className="font-bold text-slate-900 mb-4">📋 Campaign Summary</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {campaignData.name}</div>
                <div><strong>Daily Budget:</strong> ${campaignData.dailyBudget}</div>
                <div><strong>Keywords:</strong> {campaignData.keywords.length} added</div>
                <div><strong>Location:</strong> {campaignData.locations[0]}</div>
                <div><strong>Headlines:</strong> {campaignData.headlines.filter(h => h).length}/3</div>
                <div><strong>Landing Page:</strong> {campaignData.finalUrl || "Not set"}</div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSaveCampaign}
                disabled={!campaignData.finalUrl}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50"
              >
                💾 Save Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

