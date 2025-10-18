import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrgId } from "../lib/org";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://eventscrm-backend.vercel.app";

export default function GoogleAdCreator() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1); // 1=persona, 2=generate, 3=review
  
  // Persona selection
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  
  // Generated campaign
  const [generatedCampaign, setGeneratedCampaign] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Campaign edits
  const [campaignData, setCampaignData] = useState({
    campaignName: "",
    keywords: [],
    negativeKeywords: [],
    headlines: ["", "", ""],
    descriptions: ["", ""],
    dailyBudget: 20
  });

  useEffect(() => {
    loadPersonas();
  }, [orgId]);

  const loadPersonas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/personas?orgId=${orgId}`);
      if (response.ok) {
        const data = await response.json();
        setPersonas(data);
      }
    } catch (error) {
      console.error("Error loading personas:", error);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!selectedPersona) {
      alert("Please select a persona first");
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log("🤖 Generating campaign from persona...");
      
      const response = await fetch(`${API_BASE_URL}/api/googleads/campaigns/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersona.id,
          orgId,
          objective: "awareness",
          dailyBudget: 20
        })
      });

      if (response.ok) {
        const campaign = await response.json();
        console.log("✅ Campaign generated:", campaign);
        
        setGeneratedCampaign(campaign);
        setCampaignData({
          campaignName: campaign.campaignName,
          keywords: campaign.keywords || [],
          negativeKeywords: campaign.negativeKeywords || [],
          headlines: campaign.headlines || ["", "", ""],
          descriptions: campaign.descriptions || ["", ""],
          dailyBudget: 20
        });
        setCurrentStep(3); // Go to review
      } else {
        const error = await response.json();
        alert(`AI Generation failed: ${error.error || "Unknown error"}\n\nMake sure OPENAI_API_KEY is set in backend.`);
      }
    } catch (error) {
      console.error("Error generating campaign:", error);
      alert("Failed to generate campaign. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCampaign = () => {
    const copyText = `Campaign: ${campaignData.campaignName}

Keywords: ${campaignData.keywords.join(", ")}
Negative Keywords: ${campaignData.negativeKeywords.join(", ")}

Headlines:
${campaignData.headlines.map((h, i) => `${i+1}. ${h}`).join("\n")}

Descriptions:
${campaignData.descriptions.map((d, i) => `${i+1}. ${d}`).join("\n")}

Daily Budget: $${campaignData.dailyBudget}`;
    
    navigator.clipboard.writeText(copyText);
    alert("Campaign copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/recruit")}
          className="mb-6 text-green-600 hover:text-green-800 flex items-center gap-2 font-medium"
        >
          ← Back to Recruit
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🔍</div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Google Ads Creator</h1>
              <p className="text-slate-600 mt-2">
                Persona-powered campaign generation
              </p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                {currentStep > 1 ? '✓' : '1'}
              </div>
              <span className="font-semibold">Select Persona</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                {currentStep > 2 ? '✓' : '2'}
              </div>
              <span className="font-semibold">Generate</span>
            </div>
            <div className="flex-1 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>
                3
              </div>
              <span className="font-semibold">Review & Copy</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Select Persona */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 1: Choose Your Persona</h2>
            <p className="text-slate-600 mb-6">Select who you're targeting with this campaign</p>

            {personas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-5xl mb-4">🧩</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Personas Yet</h3>
                <p className="text-slate-600 mb-6">Create a persona first to power AI campaign generation</p>
                <button
                  onClick={() => navigate("/personas")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Create Your First Persona
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setSelectedPersona(persona);
                      setCurrentStep(2);
                    }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-green-300"
                  >
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{persona.personaName}</h3>
                    <p className="text-sm text-slate-600 mb-3">{persona.demographics}</p>
                    <div className="text-xs text-green-600 font-semibold">Select & Generate →</div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate("/personas")}
              className="mt-6 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
            >
              + Create New Persona
            </button>
          </div>
        )}

        {/* STEP 2: Generate */}
        {currentStep === 2 && selectedPersona && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 2: Generate Campaign</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Selected Persona:</h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <h4 className="text-2xl font-bold text-slate-900 mb-3">{selectedPersona.personaName}</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Demographics:</span>
                    <p className="text-slate-600">{selectedPersona.demographics}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Pain Point:</span>
                    <p className="text-slate-600">{selectedPersona.painPoint}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Desire:</span>
                    <p className="text-slate-600">{selectedPersona.desire}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Tone:</span>
                    <p className="text-slate-600">{selectedPersona.tone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Choose Different Persona
              </button>
              
              <button
                onClick={handleGenerateCampaign}
                disabled={isGenerating}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg disabled:opacity-50"
              >
                {isGenerating ? (
                  <>🤖 Generating with AI...</>
                ) : (
                  <>🪄 Generate Campaign with AI</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {currentStep === 3 && generatedCampaign && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Step 3: Review & Copy Campaign</h2>
            
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignData.campaignName}
                  onChange={(e) => setCampaignData({ ...campaignData, campaignName: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Keywords</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {campaignData.keywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ad Headlines (30 chars max each)</label>
                {campaignData.headlines.map((headline, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={headline}
                    onChange={(e) => {
                      const newHeadlines = [...campaignData.headlines];
                      newHeadlines[idx] = e.target.value;
                      setCampaignData({ ...campaignData, headlines: newHeadlines });
                    }}
                    maxLength={30}
                    placeholder={`Headline ${idx + 1}`}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-2"
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descriptions (90 chars max each)</label>
                {campaignData.descriptions.map((desc, idx) => (
                  <textarea
                    key={idx}
                    value={desc}
                    onChange={(e) => {
                      const newDescs = [...campaignData.descriptions];
                      newDescs[idx] = e.target.value;
                      setCampaignData({ ...campaignData, descriptions: newDescs });
                    }}
                    maxLength={90}
                    placeholder={`Description ${idx + 1}`}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-2"
                  />
                ))}
              </div>

              {/* AI Reasoning */}
              {generatedCampaign.reasoning && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Strategy:</h4>
                  <p className="text-sm text-blue-800">{generatedCampaign.reasoning}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                ← Regenerate
              </button>
              
              <button
                onClick={handleCopyCampaign}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                📋 Copy Campaign Details
              </button>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Next:</strong> Copy these details and paste into Google Ads Manager. Full API integration coming soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

