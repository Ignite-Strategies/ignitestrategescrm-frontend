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
      console.log('🚀 MASSIVE HYDRATION STARTING...');
      
      // 1. Fetch org first
      const orgRes = await api.get('/orgs/first').catch(() => null);
      
      // No org exists - redirect to create one
      if (!orgRes || !orgRes.data) {
        console.log('⚠️ No org found - redirecting to create org');
        navigate('/org/create');
        return;
      }
      
      const org = orgRes.data;
      
      console.log('✅ Org loaded:', org.name);
      
      // Store org in localStorage
      localStorage.setItem('orgId', org.id);
      localStorage.setItem('orgName', org.name);
      
      // 2. LOAD EVERYTHING IN PARALLEL
      const [eventsRes, supportersRes, templatesRes, contactListsRes] = await Promise.all([
        api.get(`/orgs/${org.id}/events`).catch(() => ({ data: [] })),
        api.get(`/orgs/${org.id}/supporters`).catch(() => ({ data: [] })),
        api.get(`/orgs/${org.id}/templates`).catch(() => ({ data: [] })),
        api.get(`/orgs/${org.id}/contact-lists`).catch(() => ({ data: [] }))
      ]);
      
      console.log(`✅ Events: ${eventsRes.data.length}`);
      console.log(`✅ Supporters: ${supportersRes.data.length}`);
      console.log(`✅ Templates: ${templatesRes.data.length}`);
      console.log(`✅ Contact Lists: ${contactListsRes.data.length}`);
      
      // 3. Store everything in localStorage for instant access
      localStorage.setItem('events', JSON.stringify(eventsRes.data));
      localStorage.setItem('supporters', JSON.stringify(supportersRes.data));
      localStorage.setItem('templates', JSON.stringify(templatesRes.data));
      localStorage.setItem('contactLists', JSON.stringify(contactListsRes.data));
      
      // 4. Store counts for dashboard
      localStorage.setItem('eventCount', eventsRes.data.length);
      localStorage.setItem('supporterCount', supportersRes.data.length);
      
      // 5. Find upcoming event
      const now = new Date();
      const upcomingEvent = eventsRes.data
        .filter(e => e.date && new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
      
      if (upcomingEvent) {
        localStorage.setItem('upcomingEvent', JSON.stringify(upcomingEvent));
        console.log('✅ Upcoming event:', upcomingEvent.name);
      }
      
      console.log('🎉 HYDRATION COMPLETE! APP IS LOADED!');
      
      setOrgName(org.name);
      setLoading(false);
    } catch (error) {
      console.error("❌ Hydration error:", error);
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
        
        <h1 className="text-4xl font-bold text-white mb-2">
          {loading ? "Loading..." : `Welcome to ${orgName}!`}
        </h1>
        <p className="text-xl text-white/80 mb-4">
          {loading ? "Hydrating your CRM..." : "Ready to go!"}
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

