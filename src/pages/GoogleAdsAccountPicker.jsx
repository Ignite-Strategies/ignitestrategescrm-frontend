import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/api";

export default function GoogleAdsAccountPicker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const connectionId = searchParams.get('connectionId');
  
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (connectionId) {
      fetchAccounts();
    } else {
      setError("Missing connection ID");
      setLoading(false);
    }
  }, [connectionId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching Google Ads accounts for connection:', connectionId);
      
      const response = await api.get(`/google-ads-account-selection/list?connectionId=${connectionId}`);
      
      if (response.data.accounts && response.data.accounts.length > 0) {
        setAccounts(response.data.accounts);
        console.log(`✅ Found ${response.data.accounts.length} accounts`);
      } else {
        setError("No Google Ads accounts found. Make sure you have at least one Google Ads account.");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching accounts:', error);
      setError(error.response?.data?.details || error.message || 'Failed to load accounts');
      setLoading(false);
    }
  };

  const handleSelectAccount = async (account) => {
    try {
      setSaving(true);
      console.log('💾 Selecting account:', account);
      
      const response = await api.post('/google-ads-account-selection/select', {
        connectionId: connectionId,
        customerId: account.customerId,
        accountName: account.accountName,
        currency: account.currency,
        timezone: account.timezone
      });
      
      console.log('✅ Account selected:', response.data);
      
      // Redirect to success page
      navigate(`/google-oauth-success?service=ads&email=${account.accountName}`);
      
    } catch (error) {
      console.error('❌ Error selecting account:', error);
      setError(error.response?.data?.details || error.message || 'Failed to save account selection');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Your Accounts...</h2>
            <p className="text-gray-600">Fetching your Google Ads accounts</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/settings/integrations')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Select Your Google Ads Account
          </h1>
          <p className="text-gray-600">
            Choose which Google Ads account you'd like to use with EngageSmart
          </p>
        </div>

        {/* Account List */}
        <div className="space-y-3 mb-6">
          {accounts.map((account, index) => (
            <button
              key={account.customerId}
              onClick={() => handleSelectAccount(account)}
              disabled={saving}
              className={`w-full p-5 border-2 rounded-xl text-left transition-all hover:scale-[1.02] ${
                selectedAccount?.customerId === account.customerId
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {account.accountName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 ml-11">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">ID:</span>
                      <span className="font-mono">{account.customerId}</span>
                    </div>
                    {account.currency && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Currency:</span>
                        <span>{account.currency}</span>
                      </div>
                    )}
                  </div>
                </div>
                <svg 
                  className="w-6 h-6 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Need to create an account?</h4>
              <p className="text-sm text-yellow-800">
                If you don't see your account here, you can{' '}
                <a 
                  href="https://ads.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-semibold hover:text-yellow-900"
                >
                  create a new Google Ads account
                </a>
                {' '}and come back to reconnect.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/settings/integrations')}
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            ← Back to Settings
          </button>
        </div>
      </div>
    </div>
  );
}

