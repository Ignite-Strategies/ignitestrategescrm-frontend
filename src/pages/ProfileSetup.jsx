import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: localStorage.getItem("firstName") || "",
    lastName: localStorage.getItem("lastName") || "",
    email: localStorage.getItem("email") || "",
    phone: ""
  });

  // Get email from Firebase user if not in localStorage
  React.useEffect(() => {
    if (!formData.email) {
      // Try to get from Firebase auth
      import("../firebase").then(({ auth }) => {
        if (auth.currentUser?.email) {
          setFormData(prev => ({ ...prev, email: auth.currentUser.email }));
        }
      });
    }
  }, []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orgMemberId = localStorage.getItem("orgMemberId");
      
      if (!orgMemberId) {
        alert("Session expired. Please sign in again.");
        navigate("/signup");
        return;
      }

      console.log("📝 Updating OrgMember profile with phone...");
      
      // Update OrgMember with phone number
      await api.patch(`/orgmembers/${orgMemberId}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });

      console.log("✅ Profile updated!");
      
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to High Impact Events!</h1>
          <p className="text-gray-600 mb-8">Please finish setting up your profile so you can create your org and start creating magical events.</p>

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

