import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  // Get data from Firebase user FIRST (source of truth), then admin object
  React.useEffect(() => {
    // FIREBASE USER FIRST - this is the source of truth!
    import("../firebase").then(({ auth }) => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        console.log("🔥 FIREBASE USER: Getting data from Firebase user");
        const name = firebaseUser.displayName || "";
        const firstName = name.split(' ')[0] || "";
        const lastName = name.split(' ').slice(1).join(' ') || "";
        
        setFormData({
          firstName: firstName,
          lastName: lastName,
          email: firebaseUser.email || "",
          phone: ""
        });
        return; // Exit - Firebase user is the source of truth
      }
      
      // Fallback: Try admin object if no Firebase user
      const adminStr = localStorage.getItem("admin");
      if (adminStr) {
        try {
          const admin = JSON.parse(adminStr);
          setFormData({
            firstName: admin.firstName || "",
            lastName: admin.lastName || "",
            email: admin.email || "",
            phone: admin.phone || ""
          });
        } catch (error) {
          console.error("Error parsing admin object:", error);
        }
      }
    });
  }, []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get adminId from localStorage (set by Welcome hydration)
      const adminId = localStorage.getItem("adminId");
      
      if (!adminId) {
        alert("Session expired. Please sign in again.");
        navigate("/signup");
        return;
      }

      console.log("📝 Updating Admin profile...");
      
      // Update Admin with profile info
      await api.patch(`/admin/${adminId}`, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });

      console.log("✅ Admin profile updated!");
      
      // Set profile complete flag
      localStorage.setItem("hasProfile", "true");
      
      // Go to create/join org
      navigate("/org/choose");
    } catch (error) {
      console.error("❌ Profile setup error:", error);
      alert("Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-indigo-600">Step 1 of 2</span>
              <span className="text-sm text-gray-500">Almost there!</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome! Let's Get You Started</h1>
          <p className="text-gray-700 leading-relaxed mb-4">
            We're excited to get you started engaging your organization. EngageSmart exists to help you and your teams cultivate strong members.
          </p>
          <p className="text-gray-600 mb-2">
            It looks like you're the first user - all good! We'll get you set up, your org set up, and help you onboard anyone else you want to bring to the team.
          </p>
          <p className="text-sm font-semibold text-indigo-600 mb-8">
            Let's get started! First, tell us who you are:
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                value={formData.email}
                placeholder="From Google"
              />
              <p className="text-xs text-gray-500 mt-1">From your Google account</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Creating Profile..." : "Continue →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

