import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

/**
 * Test Enterprise Email - SendGrid Testing
 * Quick interface to test email sending through SendGrid
 */
export default function TestEnterpriseEmail() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  
  const [formData, setFormData] = useState({
    toEmail: "",
    toName: "",
    subject: "Test Email from CRM",
    text: "This is a test email to verify SendGrid integration.",
    html: "<p>This is a <strong>test email</strong> to verify SendGrid integration.</p>"
  });
  
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  
  // Batch test state
  const [batchEmails, setBatchEmails] = useState("");
  const [batchSending, setBatchSending] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchDelay, setBatchDelay] = useState(4); // seconds
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSendSingle = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setResult(null);
    
    try {
      const response = await api.post("/test-email/send", formData);
      setResult(response.data);
      console.log("Email sent successfully:", response.data);
    } catch (err) {
      console.error("Error sending email:", err);
      setError(err.response?.data?.error || err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };
  
  const handleSendBatch = async (e) => {
    e.preventDefault();
    setBatchSending(true);
    setError("");
    setBatchResults([]);
    
    // Parse emails (one per line or comma-separated)
    const emails = batchEmails
      .split(/[\n,]/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));
    
    if (emails.length === 0) {
      setError("Please enter at least one valid email address");
      setBatchSending(false);
      return;
    }
    
    console.log(`Sending to ${emails.length} emails with ${batchDelay}s delay...`);
    
    const results = [];
    
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const startTime = Date.now();
      
      try {
        const response = await api.post("/test-email/send", {
          ...formData,
          toEmail: email,
          toName: email.split('@')[0]
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const result = {
          email,
          status: "success",
          duration: `${duration}ms`,
          messageId: response.data.messageId,
          timestamp: new Date().toLocaleTimeString()
        };
        
        results.push(result);
        setBatchResults([...results]);
        console.log(`✅ Sent to ${email} (${duration}ms)`);
        
      } catch (err) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const result = {
          email,
          status: "failed",
          duration: `${duration}ms`,
          error: err.response?.data?.error || err.message,
          timestamp: new Date().toLocaleTimeString()
        };
        
        results.push(result);
        setBatchResults([...results]);
        console.error(`❌ Failed to send to ${email}:`, err);
      }
      
      // Wait before next email (except for last one)
      if (i < emails.length - 1) {
        console.log(`⏳ Waiting ${batchDelay} seconds...`);
        await new Promise(resolve => setTimeout(resolve, batchDelay * 1000));
      }
    }
    
    setBatchSending(false);
    console.log(`✅ Batch complete! ${results.filter(r => r.status === "success").length}/${emails.length} sent`);
  };
  
  const handleQuickTest = () => {
    setFormData({
      toEmail: "adam@example.com",
      toName: "Adam",
      subject: "Quick Test - " + new Date().toLocaleTimeString(),
      text: "This is a quick test email.",
      html: "<p>This is a <strong>quick test</strong> email sent at " + new Date().toLocaleTimeString() + "</p>"
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 SendGrid Email Tester</h1>
              <p className="text-gray-600">Test enterprise email sending through SendGrid API</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Single Email Test */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Single Email Test</h2>
              <button
                onClick={handleQuickTest}
                className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              >
                Quick Fill
              </button>
            </div>
            
            <form onSubmit={handleSendSingle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Email *
                </label>
                <input
                  type="email"
                  name="toEmail"
                  value={formData.toEmail}
                  onChange={handleInputChange}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Name
                </label>
                <input
                  type="text"
                  name="toName"
                  value={formData.toName}
                  onChange={handleInputChange}
                  placeholder="Recipient Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Email subject line"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plain Text
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Plain text version"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content
                </label>
                <textarea
                  name="html"
                  value={formData.html}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="<p>HTML version</p>"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {sending ? "Sending..." : "Send Test Email"}
              </button>
            </form>
            
            {/* Result Display */}
            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ Email Sent Successfully!</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Message ID:</strong> {result.messageId || result.id}</p>
                  <p><strong>Status:</strong> {result.status || "Sent"}</p>
                  <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">❌ Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>
          
          {/* Batch Email Test */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Batch Email Test</h2>
            
            <form onSubmit={handleSendBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Addresses (one per line or comma-separated)
                </label>
                <textarea
                  value={batchEmails}
                  onChange={(e) => setBatchEmails(e.target.value)}
                  rows={6}
                  placeholder="test1@example.com&#10;test2@example.com&#10;test3@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
                  disabled={batchSending}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {batchEmails.split(/[\n,]/).filter(e => e.trim() && e.includes('@')).length} valid emails
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay Between Emails (seconds)
                </label>
                <input
                  type="number"
                  value={batchDelay}
                  onChange={(e) => setBatchDelay(parseInt(e.target.value) || 4)}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={batchSending}
                />
              </div>
              
              <button
                type="submit"
                disabled={batchSending || !batchEmails.trim()}
                className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {batchSending ? "Sending Batch..." : "Send Batch Emails"}
              </button>
            </form>
            
            {/* Batch Results */}
            {batchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Batch Results ({batchResults.filter(r => r.status === "success").length}/{batchResults.length} sent)
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {batchResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-sm ${
                        result.status === "success"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs">{result.email}</span>
                        <span className={`text-xs font-semibold ${
                          result.status === "success" ? "text-green-700" : "text-red-700"
                        }`}>
                          {result.status === "success" ? "✅ Sent" : "❌ Failed"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{result.timestamp}</span>
                        <span>{result.duration}</span>
                      </div>
                      {result.error && (
                        <p className="text-xs text-red-700 mt-1">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {batchSending && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-800">
                    Sending batch... {batchResults.length} of {batchEmails.split(/[\n,]/).filter(e => e.trim() && e.includes('@')).length} sent
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Info Panel */}
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Testing Info</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Single Email Test</h3>
              <p className="text-sm text-purple-800">
                Quick test to verify SendGrid API connection and email delivery.
              </p>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-pink-900 mb-2">Batch Email Test</h3>
              <p className="text-sm text-pink-800">
                Send to multiple recipients with configurable delay (rate limiting test).
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Rate Limits</h3>
              <p className="text-sm text-blue-800">
                SendGrid free tier: 100 emails/day. Paid plans: varies. Test responsibly!
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Make sure SendGrid API key is configured in backend</li>
              <li>Check spam folder if emails don't arrive</li>
              <li>Verify sender email is authenticated in SendGrid</li>
              <li>Batch delay prevents rate limit issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

