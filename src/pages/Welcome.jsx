import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Welcome() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasEvents, setHasEvents] = useState(false);
  const [supporterCount, setSupporterCount] = useState(0);
  
  // DEBUG STATE
  const [debugMode, setDebugMode] = useState(true); // Show debug panel
  const [hydrationStatus, setHydrationStatus] = useState({
    orgMemberId: '❓',
    orgMember: '❓',
    org: '❓',
    events: '❓',
    supporters: '❓',
    admin: '❓',
    contactId: '❓',
    eventId: '❓'
  });

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
      setHydrationStatus(prev => ({ ...prev, orgMemberId: orgMemberId ? '✅' : '❌' }));
      
      if (!orgMemberId) {
        console.log('❌ No orgMemberId, go to signup');
        setTimeout(() => navigate('/signup'), 3000);
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
        setHydrationStatus(prev => ({ ...prev, orgMember: '❌ API FAILED' }));
        setTimeout(() => navigate('/signup'), 3000);
        return;
      }
      
      const { orgMember, org, events, supporters, admin } = hydrationData;
      
      // UPDATE DEBUG STATUS
      setHydrationStatus(prev => ({
        ...prev,
        orgMember: orgMember ? '✅' : '❌',
        org: org ? '✅' : '❌',
        events: events?.length > 0 ? `✅ (${events.length})` : '❌',
        supporters: supporters?.length >= 0 ? `✅ (${supporters.length})` : '❌',
        admin: admin ? '✅' : '❌',
        contactId: orgMember?.contactId ? '✅' : '❌',
        eventId: events?.length > 0 ? '✅' : '❌'
      }));
      
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
      
      // 5. All good - show welcome screen for 1500ms, then user can click to dashboard
      console.log('✅ All data exists, showing welcome screen');
      setOrgName(org.name);
      setHasEvents(events.length > 0);
      setSupporterCount(supporters.length);
      setLoading(false);
      // Don't auto-navigate, let user click the button
      
    } catch (error) {
      console.error('❌ Hydration error:', error);
      setHydrationStatus(prev => ({ ...prev, orgMember: '❌ ERROR' }));
      setTimeout(() => navigate('/signup'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
          
          {/* DEBUG PANEL */}
          {debugMode && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-cyan-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">🔍 Hydration Debug Panel</h2>
                <button 
                  onClick={() => setDebugMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Hide
                </button>
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span>OrgMember ID:</span>
                  <span className="font-bold">{hydrationStatus.orgMemberId}</span>
                </div>
                <div className="flex justify-between">
                  <span>OrgMember Data:</span>
                  <span className="font-bold">{hydrationStatus.orgMember}</span>
                </div>
                <div className="flex justify-between">
                  <span>Organization:</span>
                  <span className="font-bold">{hydrationStatus.org}</span>
                </div>
                <div className="flex justify-between">
                  <span>Events:</span>
                  <span className="font-bold">{hydrationStatus.events}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supporters:</span>
                  <span className="font-bold">{hydrationStatus.supporters}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Record:</span>
                  <span className="font-bold">{hydrationStatus.admin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact ID:</span>
                  <span className="font-bold">{hydrationStatus.contactId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Event ID:</span>
                  <span className="font-bold">{hydrationStatus.eventId}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome to {orgName}!</h1>
          <p className="text-gray-600 mb-6 text-center">
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
        
        {/* DEBUG PANEL */}
        {debugMode && (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">✅ Hydration Complete</h2>
              <button 
                onClick={() => setDebugMode(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>OrgMember ID:</span>
                <span className="font-bold">{hydrationStatus.orgMemberId}</span>
              </div>
              <div className="flex justify-between">
                <span>OrgMember Data:</span>
                <span className="font-bold">{hydrationStatus.orgMember}</span>
              </div>
              <div className="flex justify-between">
                <span>Organization:</span>
                <span className="font-bold">{hydrationStatus.org}</span>
              </div>
              <div className="flex justify-between">
                <span>Events:</span>
                <span className="font-bold">{hydrationStatus.events}</span>
              </div>
              <div className="flex justify-between">
                <span>Supporters:</span>
                <span className="font-bold">{hydrationStatus.supporters}</span>
              </div>
              <div className="flex justify-between">
                <span>Admin Record:</span>
                <span className="font-bold">{hydrationStatus.admin}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact ID:</span>
                <span className="font-bold">{hydrationStatus.contactId}</span>
              </div>
              <div className="flex justify-between">
                <span>Event ID:</span>
                <span className="font-bold">{hydrationStatus.eventId}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}