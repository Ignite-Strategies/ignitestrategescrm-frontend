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
      
      // Hydrate adminId if user is an admin
      try {
        const adminRes = await api.get(`/admins/contact/${orgMember.contactId}`);
        if (adminRes.data) {
          localStorage.setItem('adminId', adminRes.data.id);
          console.log('✅ Admin ID hydrated:', adminRes.data.id);
        }
      } catch (error) {
        console.log('⚠️ User is not an admin, no adminId stored');
      }
      
      setOrgName(org.name);
      setHasEvents(events.length > 0);
      setSupporterCount(supporters.length);
      setLoading(false);
      
      // Route based on whether they have an active event
      if (events.length === 0) {
        console.log('📍 No events → Routing to post-create fork');
        setTimeout(() => {
          navigate('/org/post-create');
        }, 1500);
      } else {
        console.log('✅ Has events → Dashboard ready');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
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
      </div>
    </div>
  );
}

