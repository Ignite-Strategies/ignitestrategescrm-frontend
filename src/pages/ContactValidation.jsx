import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ContactValidation() {
  const navigate = useNavigate();
  const [uploadResults, setUploadResults] = useState(null);

  useEffect(() => {
    // Get results from localStorage (passed from UploadPreview)
    const results = localStorage.getItem('uploadResults');
    if (results) {
      setUploadResults(JSON.parse(results));
      // Clean up localStorage
      localStorage.removeItem('uploadResults');
    } else {
      // No results found, redirect to supporters
      navigate("/org-members");
    }
  }, [navigate]);

  if (!uploadResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const totalProcessed = uploadResults.inserted + uploadResults.updated + (uploadResults.errors?.length || 0);
  const successCount = uploadResults.inserted + uploadResults.updated;
  const errorCount = uploadResults.errors?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center text-indigo-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-indigo-600 text-white">
                1
              </div>
              <span className="ml-2 text-sm font-medium">Upload</span>
            </div>
            <div className="h-px w-20 mx-4 bg-indigo-600"></div>
            <div className="flex items-center text-indigo-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-indigo-600 text-white">
                2
              </div>
              <span className="ml-2 text-sm font-medium">Preview</span>
            </div>
            <div className="h-px w-20 mx-4 bg-indigo-600"></div>
            <div className="flex items-center text-indigo-600">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-indigo-600 text-white">
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Complete!</h1>
            <p className="text-xl text-gray-600">
              {successCount} of {totalProcessed} contacts imported successfully
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-700 mb-2">{uploadResults.inserted}</div>
              <div className="text-sm text-green-600">New Contacts Added</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-700 mb-2">{uploadResults.updated}</div>
              <div className="text-sm text-blue-600">Existing Contacts Updated</div>
              <div className="text-xs text-blue-500 mt-1">Same email = updated info</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-red-700 mb-2">{errorCount}</div>
              <div className="text-sm text-red-600">Contacts Skipped</div>
            </div>
          </div>

          {/* Error Details */}
          {errorCount > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacts That Couldn't Be Imported</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {uploadResults.errors.map((error, idx) => (
                  <div key={idx} className="text-sm text-red-800 mb-2 flex items-start gap-2">
                    <span className="font-semibold text-red-600">Row {error.line}:</span>
                    <span>{error.error}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                These contacts were skipped due to missing required information or formatting issues. 
                You can fix these in your CSV and try importing again.
              </p>
            </div>
          )}

          {/* Success Message */}
          {successCount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-green-900">Great job!</h3>
              </div>
              <p className="text-green-800">
                Your contacts have been successfully imported and are now available in your supporter list. 
                All imported contacts have been set to "general" category and can be updated later.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/org-members")}
              className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              View My Supporters
            </button>
            {errorCount > 0 && (
              <button
                onClick={() => {
                  // Save errors for resolve page
                  localStorage.setItem('uploadErrors', JSON.stringify(uploadResults.errors));
                  localStorage.setItem('originalUploadFile', localStorage.getItem('uploadFile'));
                  navigate("/org-members/upload/resolve");
                }}
                className="bg-orange-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Resolve {errorCount} Errors
              </button>
            )}
            <button
              onClick={() => navigate("/org-members/upload")}
              className="border border-gray-300 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Import More Contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
