import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DemoSignup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Set fake auth data
      localStorage.setItem('firebaseId', 'demo-user-123');
      localStorage.setItem('email', email);
      localStorage.setItem('containerId', 'demo-container-123');
      
      console.log('🎬 DEMO: Signed up with', email);
      
      // Go to org selection
      navigate('/demo/org-select');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to High Impact Events</h1>
          <p className="text-slate-600">Enter your email to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {loading ? "Getting Started..." : "Continue"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            🎬 <strong>Demo Mode:</strong> This is a demonstration of the signup flow
          </p>
        </div>
      </div>
    </div>
  );
}
