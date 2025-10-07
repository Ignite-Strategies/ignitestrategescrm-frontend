import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Welcome() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any stale org IDs before hydrating
    localStorage.removeItem('orgId');
    localStorage.removeItem('orgName');
    localStorage.removeItem('events');
    localStorage.removeItem('supporters');
    
    hydrateOrg();
  }, []);

  const hydrateOrg = async () => {
    try {
      console.log('🚀 UNIVERSAL HYDRATOR STARTING...');
      
      const orgMemberId = localStorage.getItem("orgMemberId");
      if (!orgMemberId) {
        console.log('❌ No orgMemberId, go to signup');
        navigate('/signup');
        return;
      }
      
      // Get OrgMember to check if they have an org
      const memberRes = await api.get(`/org-members/${orgMemberId}`);
      const orgMember = memberRes.data;
      
      console.log('✅ OrgMember loaded:', orgMember.email);
      
      // Wait 1800ms before routing (smooth transition, no yank!)
      setTimeout(() => {
        // Check if phone number is set (profile complete)
        if (!orgMember.phone) {
          console.log('⚠️ No phone, complete profile first');
          navigate('/profile-setup');
          return;
        }
        
        if (!orgMember.orgId) {
          // Has profile but no org → Choose create or join
          console.log('⚠️ No org linked, go to org/choose');
          navigate('/org/choose');
          return;
        }
        
        // Has org → Load org data and go to dashboard
        loadOrgAndNavigate(orgMember.orgId);
      }, 1800);
      
    } catch (error) {
      console.error("❌ Hydration error:", error);
      navigate('/signup');
    }
  };
  
  const loadOrgAndNavigate = async (orgId) => {
    try {
      const orgRes = await api.get(`/orgs/${orgId}`);
      const org = orgRes.data;
      
      console.log('✅ Org loaded:', org.name);
      
      // Store in localStorage
      localStorage.setItem('orgId', org.id);
      localStorage.setItem('orgName', org.name);
      
      setOrgName(org.name);
      setLoading(false);
      
      console.log('✅ Hydration complete!');
    } catch (error) {
      console.error("❌ Hydration error:", error);
      navigate('/signup');
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
        
        <h1 className="text-4xl font-bold text-white mb-2">
          {loading ? "Welcome!" : `Welcome to ${orgName}!`}
        </h1>
        <p className="text-xl text-white/80 mb-4">
          {loading ? "We're getting you set up to engage your community!" : "Ready to go!"}
        </p>
        
        {/* Show org ID for debugging */}
        {!loading && (
          <>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-xs text-white/60 mb-1">Org ID:</p>
              <p className="text-sm text-white/90 font-mono break-all">
                {localStorage.getItem('orgId')}
              </p>
            </div>
            
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-white/90 transition shadow-lg"
            >
              Continue to Dashboard →
            </button>
          </>
        )}
        
        {loading && (
          <div className="flex justify-center">
            <div className="w-64 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full animate-[loading_1.5s_ease-in-out]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

