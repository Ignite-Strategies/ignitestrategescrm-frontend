import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DemoOrgSelect() {
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState("");

  // Mock organizations associated with the email
  const mockOrgs = [
    {
      id: "f3-capital",
      name: "F3 Capital",
      description: "Fitness, Fellowship, and Faith community",
      memberCount: 156,
      eventCount: 12
    },
    {
      id: "bros-and-brews",
      name: "Bros & Brews Arlington",
      description: "Men's networking and accountability group",
      memberCount: 89,
      eventCount: 8
    }
  ];

  const handleContinue = () => {
    if (!selectedOrg) return;
    
    // Set the selected org
    localStorage.setItem('orgId', selectedOrg);
    
    const org = mockOrgs.find(o => o.id === selectedOrg);
    console.log('🎬 DEMO: Selected org', org?.name);
    
    // Go to dashboard
    navigate('/dashboard');
  };

  const handleCreateNew = () => {
    navigate('/demo/org-create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏢</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Choose Your Organization</h1>
          <p className="text-slate-600">
            We found these organizations associated with your email
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {mockOrgs.map((org) => (
            <button
              key={org.id}
              onClick={() => setSelectedOrg(org.id)}
              className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                selectedOrg === org.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{org.name}</h3>
                  <p className="text-slate-600 mb-2">{org.description}</p>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span>{org.memberCount} members</span>
                    <span>{org.eventCount} events</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedOrg === org.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300'
                }`}>
                  {selectedOrg === org.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCreateNew}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition"
          >
            Create New Organization
          </button>
          
          <button
            onClick={handleContinue}
            disabled={!selectedOrg}
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            Continue
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            🎬 <strong>Demo Mode:</strong> These are example organizations for demonstration
          </p>
        </div>
      </div>
    </div>
  );
}
