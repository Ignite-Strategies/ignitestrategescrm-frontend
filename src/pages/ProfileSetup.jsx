import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: localStorage.getItem("firstName") || "",
    lastName: localStorage.getItem("lastName") || "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const googleId = localStorage.getItem("googleId");
      const email = localStorage.getItem("email");
      const photoURL = localStorage.getItem("photoURL");

      console.log("📝 Creating OrgMember profile...");
      
      // Create OrgMember (no orgId yet)
      const res = await api.post("/org-members", {
        googleId,
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        photoURL,
        role: null // No role until they create/join org
      });

      const orgMember = res.data;
      console.log("✅ OrgMember created:", orgMember.id);
      
      localStorage.setItem("orgMemberId", orgMember.id);
      
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 mb-8">Tell us a bit about yourself</p>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                type="tel"
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

