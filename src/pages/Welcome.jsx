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
      
      // UNIVERSAL HYDRATION - Get ALL data in one call
      console.log('🚀 UNIVERSAL HYDRATION for orgMemberId:', orgMemberId);
      let hydrationData;
      try {
        const hydrationRes = await api.get(`/hydration/${orgMemberId}`);
        hydrationData = hydrationRes.data;
        console.log('✅ Hydration complete:', hydrationData);
      } catch (error) {
        console.error('❌ Hydration failed:', error);
        navigate('/signup');
        return;
      }
      
      const { orgMember, org, events, supporters, admin } = hydrationData;
      
      // ROUTING LOGIC - Check what's missing
      
      // 1. Check if phone number is set (profile complete)
      if (!orgMember.phone) {
        console.log('⚠️ No phone, complete profile first');
        navigate('/profile-setup');
        return;
      }
      
      // 2. Check if org exists
      if (!orgMember.orgId) {
        console.log('⚠️ No org linked, go to org/choose');
        navigate('/org/choose');
        return;
      }
      
      // 3. SAVE ALL DATA TO LOCALSTORAGE
      localStorage.setItem('orgId', org.id);
      localStorage.setItem('orgName', org.name);
      localStorage.setItem('contactId', orgMember.contactId);
      
      // Get the first event for eventId
      const eventId = events.length > 0 ? events[0].id : null;
      if (eventId) {
        localStorage.setItem('eventId', eventId);
      }
      
      // Save adminId if exists
      if (admin) {
        localStorage.setItem('adminId', admin.id);
        console.log('✅ Admin ID saved:', admin.id);
      }
      
      // 4. Check if events exist
      if (events.length === 0) {
        console.log('⚠️ No events, go to event creation');
        setOrgName(org.name);
        setHasEvents(false);
        setSupporterCount(supporters.length);
        setLoading(false);
        navigate('/event/create');
        return;
      }
      
      // 5. All good - go to dashboard
      console.log('✅ All data exists, routing to dashboard');
      setOrgName(org.name);
      setHasEvents(events.length > 0);
      setSupporterCount(supporters.length);
      setLoading(false);
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Hydration error:', error);
      navigate('/signup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to {orgName}!</h1>
          <p className="text-gray-600 mb-6">
            {hasEvents ? `You have ${supporterCount} supporters and events ready to go!` : 'Let\'s get your first event set up!'}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-cyan-700 transition"
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}