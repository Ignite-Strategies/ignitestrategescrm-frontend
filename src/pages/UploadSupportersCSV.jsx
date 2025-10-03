import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function UploadSupportersCSV() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview/Validate, 3: Confirm
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [preview, setPreview] = useState({ valid: [], errors: [] });

  const downloadTemplate = () => {
    const template = `First Name,Goes By,Last Name,Email,Phone,Street,City,State,Zip,Employer,Years With Organization`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supporters_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    // Parse just the headers to show field mapping
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(l => l.trim());
    const detectedHeaders = lines[0].split(',').map(h => h.trim());
    
    setPreview({ 
      valid: [], 
      errors: [], 
      detectedHeaders,
      fieldMapping: detectedHeaders.map(header => ({
        csvHeader: header,
        mappedField: mapHeaderToField(header)
      }))
    });
    setStep(2);
  };

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
    formData.append("file", file);

    try {
      const response = await api.post(`/orgs/${orgId}/supporters/csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadResults(response.data);
      setStep(3);
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
            <div className={`flex items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Upload</span>
            </div>
            <div className={`h-px w-20 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Validate</span>
            </div>
            <div className={`h-px w-20 mx-4 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-300'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Supporters</h2>
            <p className="text-gray-600 mb-8">
              Add your organization's master supporter list to the CRM.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Manual Entry */}
              <button
                onClick={() => navigate("/supporters/manual")}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 hover:shadow-lg transition text-left"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Manually Enter</h3>
                <p className="text-sm text-gray-600">Add supporters one by one through the interface</p>
              </button>

              {/* CSV Upload */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-indigo-400 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV</h3>
                <p className="text-sm text-gray-600 mb-4">Bulk import from a CSV file</p>
                
                <div className="space-y-3">
                  <button
                    onClick={downloadTemplate}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm"
                  >
                    Download Template
                  </button>
                  
                  <label className="block">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:border-indigo-400 transition cursor-pointer text-sm"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate("/supporters")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Field Mapping Preview */}
        {step === 2 && (
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
                  {preview.fieldMapping?.map((field, idx) => (
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
                        ) : ['firstName', 'lastName', 'email'].includes(field.mappedField) ? (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Required *
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
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
            {preview.fieldMapping && (
              (() => {
                const mappedFields = preview.fieldMapping.map(f => f.mappedField);
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
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ← Back
              </button>
              <button
                onClick={() => handleUpload()}
                disabled={uploading}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload CSV"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete!</h2>
            {uploadResults && (
              <div className="text-gray-600 mb-4">
                <p>Successfully imported {uploadResults.inserted || 0} supporters</p>
                {uploadResults.updated > 0 && <p>Updated {uploadResults.updated} existing supporters</p>}
                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <p className="text-orange-600">{uploadResults.errors.length} rows had errors and were skipped</p>
                )}
              </div>
            )}
            <p className="text-sm text-gray-500">Redirecting to supporters page...</p>
          </div>
        )}
      </div>
    </div>
  );
}

