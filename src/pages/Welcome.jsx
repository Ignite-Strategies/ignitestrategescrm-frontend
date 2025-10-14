import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/auth";
import api from "../lib/api";

export default function Welcome() {
  const navigate = useNavigate();
  const [orgName, setOrgName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't clear localStorage - it's causing data loss issues
    hydrateOrg();
  }, []);

  const hydrateOrg = async () => {
    try {
      console.log('🚀 UNIVERSAL HYDRATOR STARTING...');
      
      // Get Firebase user with retry mechanism
      let firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        console.log('⚠️ No Firebase user immediately, waiting for auth state...');
        
        // Wait for auth state to initialize
        const unsubscribe = auth.onAuthStateChanged((user) => {
          if (user) {
            console.log('✅ Firebase user found after wait:', user.uid);
            unsubscribe(); // Stop listening
            hydrateOrg(); // Retry hydration
          } else {
            console.log('❌ Still no Firebase user after wait, go to signup');
            unsubscribe(); // Stop listening
            setTimeout(() => navigate('/signup'), 2000);
          }
        });
        
        return; // Exit this attempt
      }
      
      const firebaseId = firebaseUser.uid;
      console.log('✅ Firebase ID:', firebaseId);
      
      // UNIVERSAL HYDRATION - Get ALL data in one call using firebaseId!
      console.log('🚀 UNIVERSAL HYDRATION for firebaseId:', firebaseId);
      let hydrationData;
      try {
        const hydrationRes = await api.get(`/hydration/${firebaseId}`);
        hydrationData = hydrationRes.data;
        console.log('✅ Hydration complete:', hydrationData);
      } catch (error) {
        console.error('❌ Hydration failed:', error);
        setTimeout(() => navigate('/signup'), 3000);
        return;
      }
      
      const { adminId, orgId, eventId, admin } = hydrationData;
      
      // ROUTING LOGIC - Check what's missing
      
      // 1. Check if admin exists
      if (!adminId || !admin) {
        console.log('⚠️ No admin found, go to signup');
        navigate('/signup');
        return;
      }
      
      // 2. Check if org exists
      if (!orgId) {
        console.log('⚠️ No org linked, go to org/choose');
        navigate('/org/choose');
        return;
      }
      
      // 3. SAVE CORE IDS TO LOCALSTORAGE
      localStorage.setItem('adminId', adminId);
      localStorage.setItem('orgId', orgId);
      if (eventId) {
        localStorage.setItem('eventId', eventId);
      }
      
      // 4. HYDRATE EVENTATTENDEE SCHEMA CONFIG
      try {
        const schemaResponse = await api.get('/schema/event-attendee');
        const { audienceTypes, stages } = schemaResponse.data;
        
        localStorage.setItem('eventAttendeeSchema', JSON.stringify({
          audienceTypes,
          stages,
          hydratedAt: new Date().toISOString()
        }));
        
        console.log('✅ EventAttendee schema hydrated:', { audienceTypes, stages });
      } catch (error) {
        console.error('❌ Failed to hydrate EventAttendee schema:', error);
        // Don't block the flow - schema will be fetched on demand
      }
      
      // 5. Check if event exists
      if (!eventId) {
        console.log('⚠️ No event, go to event creation');
        navigate('/event/create');
        return;
      }
      
      // 6. All good - show welcome screen!
      console.log('✅ All data exists, showing welcome screen');
      setOrgName('Your Organization'); // We'll fetch org name later if needed
      setMemberName(admin.role || 'Admin');
      setLoading(false);
      
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
            onClick={() => navigate('/dashboard')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:bg-indigo-50 transition transform hover:scale-105"
          >
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}