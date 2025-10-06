import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function AuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const googleId = localStorage.getItem("googleId");
      if (!googleId) {
        console.log("❌ No googleId, redirect to signup");
        navigate("/signup");
        return;
      }

      console.log("🔍 Checking OrgMember for googleId:", googleId);
      
      // Check if OrgMember exists with this googleId
      const res = await api.get(`/org-members/by-google/${googleId}`).catch(() => null);
      
      if (!res || !res.data) {
        // No OrgMember yet → Profile setup
        console.log("⚠️ No OrgMember found, go to profile setup");
        navigate("/profile-setup");
        return;
      }
      
      const orgMember = res.data;
      console.log("✅ OrgMember found:", orgMember.email);
      
      // Store full OrgMember data
      localStorage.setItem("orgMemberId", orgMember.id);
      localStorage.setItem("orgId", orgMember.orgId || "");
      
      if (!orgMember.orgId) {
        // Has profile but no org → Create or join org
        console.log("⚠️ No org linked, go to create/join org");
        navigate("/org/choose");
        return;
      }
      
      // Has everything → Go to dashboard
      console.log("✅ Full profile, go to dashboard");
      navigate("/dashboard");
      
    } catch (error) {
      console.error("❌ Auth check error:", error);
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <p className="text-white text-lg">Checking your account...</p>
      </div>
    </div>
  );
}

