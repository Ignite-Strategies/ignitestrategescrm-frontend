import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function ResolveErrors() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [errors, setErrors] = useState([]);
  const [originalFile, setOriginalFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get errors and original file from localStorage
    const savedErrors = localStorage.getItem('uploadErrors');
    const savedFile = localStorage.getItem('originalUploadFile');
    
    if (savedErrors) {
      setErrors(JSON.parse(savedErrors));
    }
    if (savedFile) {
      setOriginalFile(JSON.parse(savedFile));
    }
    
    if (!savedErrors) {
      navigate("/supporters");
    }
  }, [navigate]);

  const handleFixAndRetry = async () => {
    setLoading(true);
    
    try {
      // Re-upload the original file (user should have fixed it)
      const formData = new FormData();
      const blob = new Blob([originalFile.content], { type: 'text/csv' });
      const fileObj = new File([blob], originalFile.name, { type: 'text/csv' });
      formData.append("file", fileObj);

      const response = await api.post(`/orgs/${orgId}/supporters/csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Save results for validation page
      localStorage.setItem('uploadResults', JSON.stringify(response.data));
      
      // Clean up localStorage
      localStorage.removeItem('uploadErrors');
      localStorage.removeItem('originalUploadFile');
      
      // Navigate to validation page
      navigate("/supporters/upload/validation");
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      alert("Error uploading: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getErrorType = (error) => {
    if (error.error.includes('firstName')) return 'Missing First Name';
    if (error.error.includes('lastName')) return 'Missing Last Name';
    if (error.error.includes('email')) return 'Missing Email';
    if (error.error.includes('Invalid email')) return 'Invalid Email Format';
    return 'Other Error';
  };

  const getErrorSeverity = (error) => {
    if (error.error.includes('Missing') || error.error.includes('Invalid')) return 'error';
    return 'warning';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Resolve Import Errors</h1>
            <p className="text-gray-600">
              {errors.length} contacts couldn't be imported due to missing or invalid information.
            </p>
          </div>

          {/* Error Summary */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-sm font-semibold text-red-900">Required Information Missing</h3>
            </div>
            <p className="text-sm text-red-800">
              Each contact needs a first name, last name, and valid email address. 
              Fix these issues in your CSV file and try importing again.
            </p>
          </div>

          {/* Errors Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {errors.map((error, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {error.line}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        getErrorSeverity(error) === 'error' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getErrorType(error)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {error.error}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {error.data ? (
                        <div>
                          <div>{error.data.firstName || 'No first name'} {error.data.lastName || 'No last name'}</div>
                          <div>{error.data.email || 'No email'}</div>
                        </div>
                      ) : (
                        'No data available'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Fix These Errors</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>1. Open your CSV file</strong> in Excel, Google Sheets, or any spreadsheet editor</p>
              <p><strong>2. Find the rows listed above</strong> and add the missing information</p>
              <p><strong>3. Save your file</strong> and click "Fix & Retry Import" below</p>
              <p><strong>4. We'll re-process your file</strong> with the corrections</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleFixAndRetry}
              disabled={loading}
              className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Fix & Retry Import"}
            </button>
            <button
              onClick={() => navigate("/supporters")}
              className="border border-gray-300 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Skip & View Supporters
            </button>
            <button
              onClick={() => navigate("/supporters/upload")}
              className="border border-gray-300 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
