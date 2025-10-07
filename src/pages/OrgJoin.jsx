import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function OrgJoin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => {
    checkForInvites();
  }, []);

  const checkForInvites = async () => {
    try {
      const userEmail = localStorage.getItem("email");
      console.log("🔍 Checking for invites for:", userEmail);
      
      // TODO: Backend endpoint to check for pending invites by email
      // const res = await api.get(`/org-invites/by-email/${userEmail}`);
      // setPendingInvites(res.data);
      
    } catch (error) {
      console.error("Error checking invites:", error);
    }
  };

  const handleJoinByEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify email matches an invite
      const res = await api.post("/org-invites/verify", {
        email: email || localStorage.getItem("email")
      });

      if (!res.data.orgId) {
        alert("No invitation found for this email. Please contact your organization administrator.");
        setLoading(false);
        return;
      }

      const orgId = res.data.orgId;
      const orgName = res.data.orgName;
      
      // Link OrgMember to the org
      const orgMemberId = localStorage.getItem("orgMemberId");
      await api.patch(`/org-members/${orgMemberId}`, {
        orgId: orgId,
        role: "manager" // Invited users are managers
      });

      // Store org data
      localStorage.setItem("orgId", orgId);
      localStorage.setItem("orgName", orgName);
      localStorage.setItem("hasOrg", "true");

      console.log("✅ Joined organization:", orgName);
      navigate("/dashboard");

    } catch (error) {
      console.error("❌ Join error:", error);
      alert("Unable to join organization. Make sure you were invited!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join an Organization</h1>
          <p className="text-gray-600 mb-8">
            Enter your email to check if you've been invited to an organization
          </p>

          {/* Pending Invites (if any) */}
          {pendingInvites.length > 0 && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="font-semibold text-green-900 mb-2">✅ You have pending invites!</h2>
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{invite.orgName}</p>
                    <p className="text-sm text-gray-600">Invited by {invite.invitedBy}</p>
                  </div>
                  <button
                    onClick={() => handleJoinByEmail({ preventDefault: () => {} })}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleJoinByEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                value={email || localStorage.getItem("email") || ""}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
              <p className="text-sm text-gray-500 mt-2">
                Your organization admin should have sent you an invitation to this email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Checking Invitation..." : "Join Organization"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm mb-2">Don't have an invitation?</p>
            <button
              onClick={() => navigate("/org/choose")}
              className="text-indigo-600 font-semibold hover:underline"
            >
              ← Back to options
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-8 bg-white/50 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li>1. Your organization admin invites you by entering your email</li>
            <li>2. You sign up with that same email address</li>
            <li>3. We verify the invitation and add you to the organization</li>
            <li>4. You get instant access to all events and contacts!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

