import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Welcome() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateOrg();
  }, []);

  const hydrateOrg = async () => {
    try {
      // Fetch first org (auto-hydrate)
      const orgRes = await api.get('/orgs/first');
      const org = orgRes.data;
      
      // Store in localStorage
      localStorage.setItem('orgId', org.id);
      localStorage.setItem('orgName', org.name);
      
      setOrgName(org.name);
      setLoading(false);
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error hydrating org:", error);
      // Still redirect even if error
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-block p-4 bg-white/20 rounded-full animate-pulse">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">Welcome Back!</h1>
        <p className="text-xl text-white/80 mb-8">Taking you to your {orgName || "organization"} dashboard...</p>
        
        <div className="flex justify-center">
          <div className="w-64 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-[loading_1.5s_ease-in-out]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

