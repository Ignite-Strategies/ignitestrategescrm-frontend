import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ReadTheError() {
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadResults, setUploadResults] = useState(null);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Get upload results from location state or localStorage
    const results = location.state?.uploadResults || JSON.parse(localStorage.getItem('uploadResults') || 'null');
    
    if (results) {
      setUploadResults(results);
      setErrorCount(results.errorCount || 0);
      console.log('🔍 Upload results:', results);
      console.log('❌ Errors found:', results.errors);
    } else {
      console.log('❌ No upload results found');
      navigate('/org-members');
    }
  }, [location.state, navigate]);

  if (!uploadResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">Loading Error Details...</div>
          <div className="text-gray-600">Fetching upload results...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload Error Details</h1>
              <p className="text-gray-600 mt-2">
                Detailed breakdown of what went wrong during the upload
              </p>
            </div>
            <button
              onClick={() => navigate('/org-members')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              ← Back to Org Members
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{uploadResults.contactsCreated || 0}</div>
            <div className="text-sm text-gray-600">Contacts Created</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{uploadResults.contactsUpdated || 0}</div>
            <div className="text-sm text-gray-600">Contacts Updated</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{uploadResults.orgMembersCreated || 0}</div>
            <div className="text-sm text-gray-600">Org Members Created</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-gray-600">Errors/Skipped</div>
          </div>
        </div>

        {/* Error Details */}
        {errorCount > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Error Breakdown</h2>
              <p className="text-gray-600 mt-1">
                {errorCount} contacts couldn't be processed. Here's what went wrong:
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {uploadResults.errors.map((error, idx) => (
                  <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-red-900 mb-2">
                          Contact #{idx + 1}
                        </div>
                        
                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Email:</div>
                            <div className="text-sm text-gray-900">
                              {error.record?.email || 'Not provided'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Name:</div>
                            <div className="text-sm text-gray-900">
                              {error.record?.firstName || 'N/A'} {error.record?.lastName || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Phone:</div>
                            <div className="text-sm text-gray-900">
                              {error.record?.phone || 'Not provided'}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Line Number:</div>
                            <div className="text-sm text-gray-900">
                              {error.record?.lineNumber || 'Unknown'}
                            </div>
                          </div>
                        </div>

                        {/* Error Details */}
                        <div className="mt-3">
                          <div className="text-sm font-medium text-red-700 mb-2">Error Details:</div>
                          <div className="bg-red-100 border border-red-300 rounded p-3">
                            {error.errors && Array.isArray(error.errors) ? (
                              <ul className="space-y-1">
                                {error.errors.map((err, errIdx) => (
                                  <li key={errIdx} className="text-sm text-red-800">
                                    • {err}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-red-800">
                                {error.error || 'Unknown error occurred'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Raw Error Data (for debugging) */}
                        <details className="mt-3">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Show raw error data (for debugging)
                          </summary>
                          <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2 overflow-auto">
                            {JSON.stringify(error, null, 2)}
                          </pre>
                        </details>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {errorCount === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-800 font-semibold text-lg mb-2">
              🎉 No Errors Found!
            </div>
            <div className="text-green-700">
              All contacts were processed successfully.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate('/org-members')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View Org Members
          </button>
          <button
            onClick={() => navigate('/org-members/upload')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Upload More Contacts
          </button>
        </div>
      </div>
    </div>
  );
}
