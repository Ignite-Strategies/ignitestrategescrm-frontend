import { useState, useEffect } from 'react';

export default function ConnectGoogleAds() {
  const [isConnected, setIsConnected] = useState(false);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for postMessage from popup
    const handleMessage = (event) => {
      console.log('📨 Received message:', event.data);
      
      if (event.data.type === 'GOOGLE_ADS_AUTH_SUCCESS') {
        console.log('✅ Google Ads connected!', event.data.tokens);
        setTokens(event.data.tokens);
        setIsConnected(true);
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleConnect = () => {
    console.log('🔗 Opening Google Ads auth popup...');
    setLoading(true);
    
    // Open popup window
    const popup = window.open(
      'http://localhost:4000/auth/popup',
      'googleAdsAuth',
      'width=500,height=600,left=400,top=200'
    );
    
    // Check if popup was blocked
    if (!popup) {
      alert('Popup blocked! Please allow popups for this site.');
      setLoading(false);
      return;
    }
    
    // Optional: Monitor if popup was closed without completing auth
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        if (!isConnected) {
          console.log('⚠️ Popup closed without completing auth');
          setLoading(false);
        }
      }
    }, 500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setTokens(null);
    console.log('🔌 Disconnected Google Ads');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        padding: '40px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ fontSize: '64px', textAlign: 'center', marginBottom: '20px' }}>
          {isConnected ? '✅' : '🔗'}
        </div>
        
        <h1 style={{ 
          fontSize: '32px', 
          textAlign: 'center', 
          marginBottom: '10px',
          color: '#1a202c'
        }}>
          Google Ads Demo
        </h1>
        
        <p style={{ 
          textAlign: 'center', 
          color: '#718096',
          marginBottom: '30px'
        }}>
          {isConnected ? 'Account Connected' : 'Connect your Google Ads account'}
        </p>

        {!isConnected ? (
          <>
            <div style={{
              background: '#bee3f8',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#2c5282'
            }}>
              <strong>Demo Mode:</strong> This will open a popup asking for credentials.<br/>
              Use: <code>name@gmail.com</code> / <code>hardcodedpw</code>
            </div>
            
            <button
              onClick={handleConnect}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {loading ? '⏳ Opening popup...' : '🔗 Connect Google Ads'}
            </button>
          </>
        ) : (
          <>
            <div style={{
              background: '#c6f6d5',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                color: '#22543d', 
                marginBottom: '12px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                ✓ Connection Successful
              </h3>
              <div style={{ fontSize: '13px', color: '#2f855a' }}>
                <strong>Email:</strong> {tokens.email}<br/>
                <strong>Customer ID:</strong> {tokens.login_customer_id}<br/>
                <strong>Token Type:</strong> {tokens.token_type}
              </div>
            </div>
            
            <details style={{ marginBottom: '20px' }}>
              <summary style={{ 
                cursor: 'pointer', 
                padding: '12px',
                background: '#f7fafc',
                borderRadius: '8px',
                fontWeight: '600'
              }}>
                📋 View Tokens (Demo)
              </summary>
              <pre style={{
                background: '#1a202c',
                color: '#48bb78',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '12px',
                fontSize: '12px',
                overflow: 'auto'
              }}>
{JSON.stringify(tokens, null, 2)}
              </pre>
            </details>
            
            <button
              onClick={handleDisconnect}
              style={{
                width: '100%',
                padding: '14px',
                background: '#fc8181',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}

