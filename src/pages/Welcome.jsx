import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Welcome() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [canNavigate, setCanNavigate] = useState(false);

  useEffect(() => {
    // Don't clear localStorage - it's causing data loss issues
    hydrateOrg();
  }, []);

  const safeLogout = async () => {
    try {
      console.log('🚨 NUCLEAR LOGOUT - Clearing everything...');
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      // Clear localStorage
      localStorage.clear();
      
      // Force reload to clear any cached state
      window.location.href = '/signin';
    } catch (err) {
      console.error('Logout error:', err);
      // Force reload anyway
      window.location.href = '/signin';
    }
  };

  const hydrateOrg = async () => {
    try {
      const startTime = Date.now(); // Track start time for minimum 800ms delay
      
      console.log('🚀 UNIVERSAL HYDRATOR STARTING...');
      
      // Note: Firebase auth already handled by Splash.jsx
      // Welcome page assumes user is already authenticated
      
      // Get Firebase ID and user from localStorage (set by Splash.jsx)
      const firebaseId = localStorage.getItem('firebaseId');
      const firebaseUser = JSON.parse(localStorage.getItem('firebaseUser') || '{}');
      if (!firebaseId) {
        console.error('❌ No Firebase ID found - should have been set by Splash.jsx');
        navigate('/signin');
        return;
      }
      console.log('✅ Firebase ID from localStorage:', firebaseId);
      
      // UNIVERSAL HYDRATION - Get ALL data in one call using firebaseId!
      console.log('🚀 UNIVERSAL HYDRATION for firebaseId:', firebaseId);
      let hydrationData;
      try {
        const hydrationRes = await api.get(`/welcome/${firebaseId}`);
        hydrationData = hydrationRes.data;
        console.log('✅ Hydration complete:', hydrationData);
      } catch (error) {
        console.error('❌ Hydration API failed:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        console.error('❌ Status:', error.response?.status);
        
        // Show error and logout option
        setError(`Hydration failed: ${error.response?.data?.error || error.message}`);
        setShowLogout(true);
        setLoading(false);
        return;
      }
      
      const { adminId, orgId, eventId, containerId, admin, org, event } = hydrationData;
      
      // ROUTING LOGIC - Check what's missing
      console.log('🔍 Hydration data check:', { adminId, orgId, eventId, containerId });
      
      // 1. Check if admin exists (just need adminId)
      if (!adminId) {
        console.log('⚠️ No adminId found in hydration data');
        console.log('⚠️ AdminId:', adminId);
        setError(`No admin record found for this account. You may need to sign up first.`);
        setShowLogout(true);
        setLoading(false);
        return;
      }
      
      console.log('✅ Admin found! AdminId:', adminId);
      
      // 2. 🛡️ GUARD: Check if admin has containerId (fully set up in a container)
      if (!containerId) {
        console.log('🛑 GUARD: No containerId - admin not linked to any container');
        setError(`We found your account but you're not linked to an organization yet.`);
        setShowLogout(false);
        setLoading(false);
        // Route to org chooser (they can create or join)
        setTimeout(() => navigate('/org/choose'), 2000);
        return;
      }
      
      console.log('✅ Admin has containerId:', containerId);
      
      // 3. Check if user has an org - if not, route to org chooser
      if (!orgId) {
        console.log('⚠️ No orgId found - user needs to choose/join org');
        setError(`Welcome back! We don't see an organization for you. Let's get you set up.`);
        setShowLogout(false); // Don't show logout, show org chooser
        setLoading(false);
        // Route to org chooser after a brief delay
        setTimeout(() => navigate('/org/choose'), 2000);
        return;
      }
      
      console.log('✅ User has org! OrgId:', orgId);
      
      // 3. 🔥 CACHE EVERYTHING TO LOCALSTORAGE (IDs + Full Objects)
      // IDs (backwards compatibility)
      localStorage.setItem('adminId', adminId);
      localStorage.setItem('containerId', containerId);
      if (orgId) {
        localStorage.setItem('orgId', orgId);
      }
      if (eventId) {
        localStorage.setItem('eventId', eventId);
      }
      
      // FULL OBJECTS (new hydration pattern)
      if (admin) {
        localStorage.setItem('admin', JSON.stringify(admin));
        console.log('✅ Cached admin object');
      }
      if (org) {
        localStorage.setItem('org', JSON.stringify(org));
        console.log('✅ Cached org object:', org.name);
      }
      if (event) {
        localStorage.setItem('event', JSON.stringify(event));
        console.log('✅ Cached event object:', event.name);
      }
      
      // 3. Admin is logged in - show welcome screen!
      console.log('✅ Admin authenticated, showing welcome screen');
      
      // Set org name and member name for display
      setOrgName(hydrationData.orgName || org?.name || 'Your Organization');
      
      // Derive member name from admin object (firstName only) or firebaseUser
      const adminName = admin?.firstName || null;
      setMemberName(hydrationData.memberName || adminName || firebaseUser.displayName || 'Team Member');
      
      // Ensure loading screen shows for at least 800ms to prevent jarring flash
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(800 - elapsedTime, 0);
      
      setTimeout(() => {
        setLoading(false);
        // Allow navigation after another brief moment
        setTimeout(() => setCanNavigate(true), 300);
      }, remainingTime);
      
    } catch (error) {
      console.error('❌ Hydration error:', error);
      setTimeout(() => navigate('/signup'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white drop-shadow-2xl">
              Getting Your Org Data...
            </h1>
            <div className="flex justify-center pt-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-6">
        <div className="text-center space-y-8">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white drop-shadow-2xl">
              {error.includes('Welcome back') ? 'Welcome Back!' : 'Setup Required'}
            </h1>
            <p className="text-xl text-white/90 font-medium drop-shadow-lg">
              {error}
            </p>
            {error.includes('Welcome back') && (
              <p className="text-lg text-white/80">
                Redirecting to organization setup...
              </p>
            )}
          </div>

          {showLogout && (
            <div className="pt-4">
              <button
                onClick={safeLogout}
                className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:bg-red-700 transition transform hover:scale-105"
              >
                Clear Auth & Try Different Account
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-6">
      <div className="text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -top-6 -left-6 text-4xl animate-bounce">🎉</div>
            <div className="absolute -top-4 -right-6 text-3xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</div>
            
            <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black text-white drop-shadow-2xl">
            Let's Go, {memberName}!
          </h1>
          <p className="text-2xl text-white/90 font-medium drop-shadow-lg">
            {orgName} is ready to engage
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => canNavigate && navigate('/dashboard')}
            disabled={!canNavigate}
            className={`px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition transform ${
              canNavigate 
                ? 'bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-105 cursor-pointer' 
                : 'bg-white/50 text-indigo-400 cursor-not-allowed'
            }`}
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}