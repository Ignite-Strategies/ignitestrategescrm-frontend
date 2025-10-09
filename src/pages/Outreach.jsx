import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { signInWithGoogle } from "../lib/googleAuth";

export default function Outreach() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [gmailAuthenticated, setGmailAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [gmailAccessToken, setGmailAccessToken] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGmailAuth = async () => {
    setLoading(true);
    
    try {
      console.log("Starting Gmail auth from Outreach...");
      
      const result = await signInWithGoogle();
      console.log("Gmail auth result:", result);
      setUserEmail(result.email);
      setGmailAccessToken(result.accessToken);
      setGmailAuthenticated(true);
      alert(`Authenticated with ${result.email}! You can now send personal emails.`);
    } catch (error) {
      console.error("Gmail auth error:", error);
      alert("Failed to authenticate with Gmail. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    // Check if Gmail is authenticated
    if (!gmailAuthenticated) {
      alert("Please authenticate with Gmail first to send personal emails.");
      return;
    }
    
    if (!formData.to || !formData.subject || !formData.message) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/email/send", {
        to: formData.to,
        subject: formData.subject,
        body: formData.message
      }, {
        headers: {
          Authorization: `Bearer ${gmailAccessToken}`
        }
      });

      if (response.data.success) {
        setSuccess(`Email sent successfully to ${formData.to}!`);
        setFormData({ to: "", subject: "", message: "" });
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setError(err.response?.data?.error || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => navigate("/email")}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  ← Campaign Dashboard
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  ← Dashboard
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Personal Outreach</h1>
              <p className="text-gray-600">Send 1:1 personal emails to individual contacts</p>
            </div>
          </div>

          {/* Gmail Auth Status */}
          {!gmailAuthenticated && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Gmail Authentication Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">Authenticate with your Gmail to send personal emails</p>
                </div>
                <button
                  type="button"
                  onClick={handleGmailAuth}
                  disabled={loading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition"
                >
                  {loading ? "Authenticating..." : "Connect Gmail"}
                </button>
              </div>
            </div>
          )}

          {gmailAuthenticated && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Authenticated with {userEmail} - Ready to send personal emails
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSend} className="space-y-6">
            
            {/* To Field */}
            <div>
              <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                To Email Address *
              </label>
              <input
                type="email"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="contact@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject Line *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Quick check-in about the event..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={12}
                placeholder="Hi [Name],&#10;&#10;Hope you're doing well! I wanted to reach out personally about..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                This will be sent as HTML. You can use basic formatting like &lt;b&gt;bold&lt;/b&gt; and &lt;br&gt; for line breaks.
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Send Button */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate("/email")}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Tips */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Outreach Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Keep it personal and conversational</li>
              <li>• Mention specific details about your relationship</li>
              <li>• Be clear about what you're asking for</li>
              <li>• Keep it concise - people are busy</li>
              <li>• Follow up if you don't hear back in a week</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
