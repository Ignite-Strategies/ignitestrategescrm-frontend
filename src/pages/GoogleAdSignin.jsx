import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleAdSignin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return') || '/recruit/google';
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Demo credentials
  const DEMO_EMAIL = "name@gmail.com";
  const DEMO_PASSWORD = "hardcodedpw";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulate API call delay
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        console.log('✅ Google Ads demo auth successful');
        
        // Generate fake Google Ads tokens
        const tokens = {
          access_token: 'fake_access_token_' + Date.now(),
          refresh_token: 'fake_refresh_token_xyz123',
          developer_token: 'fake_developer_token_abc456',
          login_customer_id: '123-456-7890',
          expires_in: 3600,
          token_type: 'Bearer',
          email: email
        };

        // Send tokens back to parent window via postMessage
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_ADS_AUTH_SUCCESS',
            tokens: tokens
          }, '*');
          
          console.log('📤 Tokens sent to parent window');
          window.close();
        } else {
          // Fallback if no parent window
          alert('Google Ads connected! (Demo mode)');
          navigate(returnUrl);
        }
      } else {
        setError('Invalid credentials. Try name@gmail.com / hardcodedpw');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Connect Google Ads</h1>
          <p className="text-slate-600">Sign in to your Google Ads account</p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">🎬 Demo Credentials:</h3>
          <p className="text-sm text-blue-800">
            Email: <code className="bg-blue-100 px-1 rounded">name@gmail.com</code><br/>
            Password: <code className="bg-blue-100 px-1 rounded">hardcodedpw</code>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Google Account Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@gmail.com"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            This is a demo OAuth flow for Google Ads integration
          </p>
        </div>
      </div>
    </div>
  );
}
