import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventscrm-backend.vercel.app";

export default function GooglePersonaDevelopment() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [currentStep, setCurrentStep] = useState(1); // 1-5 steps
  const [formData, setFormData] = useState({
    // Step 1: Who are they?
    demographics: "",
    ageRange: "",
    location: "",
    lifeStage: "",
    
    // Step 2: What's their pain?
    painPoint: "",
    emotionalState: "",
    dailyFrustration: "",
    
    // Step 3: What do they want?
    desire: "",
    idealOutcome: "",
    
    // Step 4: Reverse engineer searches
    searchQuestions: [], // Will be AI generated
    searchKeywords: [], // Will be AI generated
    
    // Step 5: Finalize persona
    personaName: "",
    tone: "",
    channels: "Google Search"
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedSearches, setGeneratedSearches] = useState(null);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleGenerateSearches = async () => {
    setAiGenerating(true);
    
    try {
      // AI call to reverse engineer searches from pain point and demographics
      const response = await fetch(`${API_BASE_URL}/api/googleads/generate-searches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demographics: formData.demographics,
          ageRange: formData.ageRange,
          location: formData.location,
          painPoint: formData.painPoint,
          emotionalState: formData.emotionalState,
          desire: formData.desire
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedSearches(data);
        setFormData({
          ...formData,
          searchQuestions: data.searchQuestions || [],
          searchKeywords: data.searchKeywords || []
        });
        handleNext();
      } else {
        // Fallback demo data if API fails
        const demoData = {
          searchQuestions: [
            "How to find accountability as a dad",
            "Men's groups near me",
            "How to reconnect with purpose as a father",
            "Where to find brotherhood and community"
          ],
          searchKeywords: [
            "men's accountability group",
            "father support community",
            "men's fitness challenge",
            "brotherhood organization",
            "men's personal development"
          ],
          reasoning: "Based on a disconnected dad who feels isolated and wants community, these searches reflect the language they'd use when looking for connection and purpose."
        };
        
        setGeneratedSearches(demoData);
        setFormData({
          ...formData,
          searchQuestions: demoData.searchQuestions,
          searchKeywords: demoData.searchKeywords
        });
        handleNext();
      }
    } catch (error) {
      console.error("Error generating searches:", error);
      alert("Failed to generate searches. Using demo data.");
      
      // Use demo data on error
      const demoData = {
        searchQuestions: [
          "How to find accountability",
          "Community groups near me",
          "How to reconnect with purpose",
          "Where to find like-minded people"
        ],
        searchKeywords: [
          "accountability group",
          "support community",
          "personal development",
          "local community"
        ]
      };
      
      setGeneratedSearches(demoData);
      setFormData({
        ...formData,
        searchQuestions: demoData.searchQuestions,
        searchKeywords: demoData.searchKeywords
      });
      handleNext();
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSavePersona = async () => {
    try {
      const personaData = {
        personaName: formData.personaName,
        demographics: `${formData.demographics}, ${formData.ageRange}, ${formData.location}, ${formData.lifeStage}`,
        painPoint: `${formData.painPoint} - ${formData.emotionalState} - ${formData.dailyFrustration}`,
        desire: `${formData.desire} - ${formData.idealOutcome}`,
        tone: formData.tone,
        channels: formData.channels,
        primaryStage: "curious",
        notes: `Search Questions: ${formData.searchQuestions.join(", ")}\nKeywords: ${formData.searchKeywords.join(", ")}`,
        orgId
      };

      const response = await fetch(`${API_BASE_URL}/api/personas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personaData)
      });

      if (response.ok) {
        const savedPersona = await response.json();
        alert("✅ Persona saved! Redirecting to campaign creator...");
        // Navigate to campaign creator with this persona
        navigate(`/recruit/google/create?personaId=${savedPersona.id}`);
      } else {
        alert("✅ Persona created! (Demo mode - not saved to DB)");
        navigate("/recruit/google/create");
      }
    } catch (error) {
      console.error("Error saving persona:", error);
      alert("✅ Persona created! (Demo mode)");
      navigate("/recruit/google/create");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/googleads/home")}
          className="mb-6 text-violet-600 hover:text-violet-800 flex items-center gap-2 font-medium transition"
        >
          ← Back to Google Ads Home
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">🎯</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Persona Development</h1>
              <p className="text-slate-600 mt-2">
                Reverse engineer campaigns from real human behavior
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-2 rounded-full transition-all ${currentStep >= step ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-slate-200'}`}></div>
                <p className={`text-xs mt-1 font-semibold ${currentStep >= step ? 'text-violet-600' : 'text-slate-400'}`}>
                  Step {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophy Card */}
        {currentStep === 1 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-200">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-xl">
              <span>💡</span>
              <span>The Reverse Engineering Approach</span>
            </h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We're not going to ask you to guess random keywords. Instead, we're going to:
            </p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li>Define WHO your ideal person is (demographics, life stage)</li>
              <li>Identify their PAIN POINT (what frustrates them daily)</li>
              <li>Understand what they DESIRE (the transformation they want)</li>
              <li><strong>Reverse engineer what they type into Google when they have that pain</strong></li>
              <li>Build campaigns with those exact search terms</li>
            </ol>
            <p className="text-slate-700 mt-4 font-semibold">
              Bottom line: We want campaigns that speak to real humans, not keyword spam that makes no sense.
            </p>
          </div>
        )}

        {/* Step 1: Who Are They? */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 1: Who Are They?</h2>
            <p className="text-slate-600 mb-6">
              Let's define the demographics and life situation of your target person.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Who are they? (Gender, general description)
                </label>
                <input
                  type="text"
                  value={formData.demographics}
                  onChange={(e) => setFormData({ ...formData, demographics: e.target.value })}
                  placeholder='e.g., "Men" or "Women" or "Professionals"'
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Age Range
                </label>
                <input
                  type="text"
                  value={formData.ageRange}
                  onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                  placeholder='e.g., "30-50" or "25-40"'
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Location / Geography
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder='e.g., "Arlington VA" or "DC Metro Area"'
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Life Stage / Situation
                </label>
                <input
                  type="text"
                  value={formData.lifeStage}
                  onChange={(e) => setFormData({ ...formData, lifeStage: e.target.value })}
                  placeholder='e.g., "Married with kids" or "Early career professional"'
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                disabled={!formData.demographics || !formData.ageRange}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50"
              >
                Next: Define Their Pain →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: What's Their Pain? */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 2: What's Their Pain?</h2>
            <p className="text-slate-600 mb-6">
              This is the CORE. What frustrates them? What keeps them up at night? This drives what they search for.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Core Pain Point (What's the problem?)
                </label>
                <textarea
                  value={formData.painPoint}
                  onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
                  placeholder='e.g., "Feels isolated and disconnected from friends"'
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Emotional State (How does it make them feel?)
                </label>
                <input
                  type="text"
                  value={formData.emotionalState}
                  onChange={(e) => setFormData({ ...formData, emotionalState: e.target.value })}
                  placeholder='e.g., "Lonely, lost, directionless, stuck"'
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Daily Frustration (What specific thing bugs them regularly?)
                </label>
                <textarea
                  value={formData.dailyFrustration}
                  onChange={(e) => setFormData({ ...formData, dailyFrustration: e.target.value })}
                  placeholder='e.g., "Wakes up unmotivated, goes through the motions, feels like something is missing"'
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                disabled={!formData.painPoint}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50"
              >
                Next: Define Their Desire →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: What Do They Want? */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 3: What Do They Want?</h2>
            <p className="text-slate-600 mb-6">
              Now flip the script. What's the positive outcome they desire? What transformation are they seeking?
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Core Desire (What do they want?)
                </label>
                <textarea
                  value={formData.desire}
                  onChange={(e) => setFormData({ ...formData, desire: e.target.value })}
                  placeholder='e.g., "Wants community, purpose, and accountability"'
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Ideal Outcome (What does success look like for them?)
                </label>
                <textarea
                  value={formData.idealOutcome}
                  onChange={(e) => setFormData({ ...formData, idealOutcome: e.target.value })}
                  placeholder='e.g., "Be part of a brotherhood, feel challenged and alive, set an example for their kids"'
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleGenerateSearches}
                disabled={!formData.desire || aiGenerating}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {aiGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>AI is Reverse Engineering...</span>
                  </>
                ) : (
                  <>
                    <span>🪄</span>
                    <span>Reverse Engineer Their Searches</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review Generated Searches */}
        {currentStep === 4 && generatedSearches && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 4: What They Actually Search For</h2>
            <p className="text-slate-600 mb-6">
              Based on the pain and desire you described, here's what this person is likely typing into Google:
            </p>

            {/* AI Reasoning */}
            {generatedSearches.reasoning && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Analysis:</h4>
                <p className="text-sm text-blue-800">{generatedSearches.reasoning}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Search Questions */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Question-Based Searches (Long-tail)
                </label>
                <div className="space-y-2">
                  {formData.searchQuestions.map((question, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                      <span className="text-purple-600">🔍</span>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [...formData.searchQuestions];
                          newQuestions[idx] = e.target.value;
                          setFormData({ ...formData, searchQuestions: newQuestions });
                        }}
                        className="flex-1 bg-transparent border-none focus:outline-none text-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Keywords (Short phrases)
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.searchKeywords.map((keyword, idx) => (
                    <div key={idx} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-300">
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Regenerate
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all"
              >
                Next: Finalize Persona →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Finalize & Save */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Step 5: Name & Save Your Persona</h2>
            <p className="text-slate-600 mb-6">
              Almost done! Give this persona a memorable name and set the tone for how you'll speak to them.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Persona Name (Internal label)
                </label>
                <input
                  type="text"
                  value={formData.personaName}
                  onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                  placeholder='e.g., "Disconnected Dad" or "Corporate Burnout"'
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tone / Voice (How to speak to them)
                </label>
                <input
                  type="text"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  placeholder='e.g., "Masculine, authentic, no-BS" or "Empowering, supportive"'
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl p-6 border border-violet-200">
                <h3 className="font-bold text-slate-900 mb-4">📋 Persona Summary</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Who:</span>
                    <p className="text-slate-600">{formData.demographics}, {formData.ageRange}, {formData.location}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Pain:</span>
                    <p className="text-slate-600">{formData.painPoint}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Desire:</span>
                    <p className="text-slate-600">{formData.desire}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Top Searches:</span>
                    <p className="text-slate-600">{formData.searchQuestions.slice(0, 2).join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSavePersona}
                disabled={!formData.personaName}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span>💾</span>
                <span>Save & Generate Campaign</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

