import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Welcome() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasEvents, setHasEvents] = useState(false);
  const [supporterCount, setSupporterCount] = useState(0);

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
      // Load org, events, and contacts in parallel
      const [orgRes, eventsRes, supportersRes] = await Promise.all([
        api.get(`/orgs/${orgId}`),
        api.get(`/orgs/${orgId}/events`),
        api.get(`/orgs/${orgId}/supporters`)
      ]);
      
      const org = orgRes.data;
      const events = eventsRes.data || [];
      const supporters = supportersRes.data || [];
      
      console.log('✅ Org loaded:', org.name);
      console.log('✅ Events:', events.length);
      console.log('✅ Contacts:', supporters.length);
      
      // Store in localStorage
      localStorage.setItem('orgId', org.id);
      localStorage.setItem('orgName', org.name);
      
      setOrgName(org.name);
      setHasEvents(events.length > 0);
      setSupporterCount(supporters.length);
      setLoading(false);
      
      // If first time (no events, no contacts), route to PostOrgCreate fork
      if (events.length === 0 && supporters.length === 0) {
        console.log('📍 First time setup → Routing to post-create fork');
        setTimeout(() => {
          navigate('/org/post-create');
        }, 1500);
      } else {
        console.log('✅ Returning user → Dashboard ready');
      }
      
    } catch (error) {
      console.error("❌ Hydration error:", error);
      navigate('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-block p-6 bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        {loading ? (
          <>
            <h1 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
              Welcome back!
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Getting things ready for you...
            </p>
            <div className="flex justify-center">
              <div className="w-64 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-[loading_1.5s_ease-in-out]"></div>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Let's go engage {orgName}!
            </h1>
            <p className="text-2xl text-white/90 mb-8 font-medium">
              Your dashboard is ready 🚀
            </p>
            
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-white text-cyan-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/95 hover:scale-105 transition-all shadow-2xl"
            >
              Open Dashboard →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

