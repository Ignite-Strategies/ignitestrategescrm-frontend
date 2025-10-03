import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function UploadPreview() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  
  // Get file and field mapping from URL state or localStorage
  const [file, setFile] = useState(() => {
    const savedFile = localStorage.getItem('uploadFile');
    return savedFile ? JSON.parse(savedFile) : null;
  });
  
  const [fieldMapping, setFieldMapping] = useState(() => {
    const savedMapping = localStorage.getItem('fieldMapping');
    return savedMapping ? JSON.parse(savedMapping) : [];
  });

  const mapHeaderToField = (header) => {
    const normalized = header.toLowerCase().trim();
    const fieldMap = {
      'first name': 'firstName',
      'firstname': 'firstName',
      'fname': 'firstName',
      'goes by': 'goesBy',
      'goesby': 'goesBy',
      'nickname': 'goesBy',
      'preferred name': 'goesBy',
      'last name': 'lastName',
      'lastname': 'lastName',
      'lname': 'lastName',
      'email': 'email',
      'email address': 'email',
      'phone': 'phone',
      'phone number': 'phone',
      'street': 'street',
      'street address': 'street',
      'city': 'city',
      'state': 'state',
      'zip': 'zip',
      'zip code': 'zip',
      'employer': 'employer',
      'company': 'employer',
      'organization': 'employer',
      'years with organization': 'yearsWithOrganization',
      'years with org': 'yearsWithOrganization'
    };
    return fieldMap[normalized] || 'unmapped';
  };

  const handleUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    
    // Create a proper File object from the saved file data
    const blob = new Blob([file.content], { type: 'text/csv' });
    const fileObj = new File([blob], file.name, { type: 'text/csv' });
    formData.append("file", fileObj);

    try {
      const response = await api.post(`/orgs/${orgId}/supporters/csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadResults(response.data);
      
      // Clean up localStorage
      localStorage.removeItem('uploadFile');
      localStorage.removeItem('fieldMapping');
      
      setTimeout(() => {
        navigate("/supporters");
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      alert("Error uploading: " + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
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
            <div className="h-px w-20 mx-4 bg-gray-300"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-gray-300">
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Field Mapping Preview */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Field Mapping</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-blue-900">CSV Field Detection</h3>
            </div>
            <p className="text-sm text-blue-800">
              We detected these columns in your CSV. Required fields are marked with *. 
              Unmapped fields will be ignored.
            </p>
          </div>

          {/* Field Mapping Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CSV Column</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maps To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fieldMapping?.map((field, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {field.csvHeader}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {field.mappedField === 'unmapped' ? (
                        <span className="text-gray-400 italic">Not mapped</span>
                      ) : (
                        <span className="font-medium">{field.mappedField}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {field.mappedField === 'unmapped' ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          Ignored
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Mapped
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Missing Required Fields Warning */}
          {fieldMapping && (
            (() => {
              const mappedFields = fieldMapping.map(f => f.mappedField);
              const missingRequired = ['firstName', 'lastName', 'email'].filter(req => !mappedFields.includes(req));
              return missingRequired.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-sm font-semibold text-red-900">Missing Required Fields</h3>
                  </div>
                  <p className="text-sm text-red-800">
                    Your CSV is missing these required fields: <strong>{missingRequired.join(', ')}</strong>. 
                    Please add these columns or rename existing columns to match our field names.
                  </p>
                </div>
              );
            })()
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/supporters/upload")}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {uploading ? "Importing..." : "Import My Contacts"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
