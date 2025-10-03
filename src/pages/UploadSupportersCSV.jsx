import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getOrgId } from "../lib/org";

export default function UploadSupportersCSV() {
  const navigate = useNavigate();
  const orgId = getOrgId();
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview/Validate, 3: Confirm
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState({ valid: [], errors: [] });
  const [uploading, setUploading] = useState(false);

  const downloadTemplate = () => {
    const template = `firstName,lastName,email,phone,street,city,state,zip,employer,yearsWithOrganization,eventsAttended,categoryOfEngagement,pipeline,tags
John,Doe,john@example.com,555-1234,123 Main St,Raleigh,NC,27601,Acme Corp,5,12,member,active,"f3:ao,monthly_donor"
Jane,Smith,jane@example.com,555-5678,456 Oak Ave,Durham,NC,27707,Self-Employed,2,3,volunteer,active,"volunteer,community:leader"
Bob,Wilson,bob@example.com,555-9999,789 Elm St,Chapel Hill,NC,27514,Local Business,10,25,champion,champion,"role:sponsor,major_donor"`;
    
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
    
    // Parse and validate CSV client-side
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const valid = [];
    const errors = [];
    
    lines.slice(1).forEach((line, index) => {
      const lineNum = index + 2;
      const values = line.split(',');
      
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i]?.trim() || '';
      });
      
      // Validate required fields
      if (!row.firstName || !row.lastName || !row.email) {
        errors.push({
          line: lineNum,
          data: row,
          error: !row.firstName ? 'Missing firstName' : !row.lastName ? 'Missing lastName' : 'Missing email'
        });
      } else if (!row.email.includes('@')) {
        errors.push({
          line: lineNum,
          data: row,
          error: 'Invalid email format'
        });
      } else {
        valid.push({
          line: lineNum,
          data: row
        });
      }
    });
    
    setPreview({ valid, errors });
    setStep(2);
  };

  const handleUpload = async (skipErrors = false) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post(`/orgs/${orgId}/supporters/csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setStep(3);
      setTimeout(() => {
        navigate("/supporters");
      }, 2000);
    } catch (error) {
      alert("Error uploading: " + error.message);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Supporters CSV</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 mb-2 font-semibold">Required Fields:</p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4">
                <li>• <code className="bg-blue-100 px-1 rounded">firstName</code>, <code className="bg-blue-100 px-1 rounded">lastName</code> - Name fields</li>
                <li>• <code className="bg-blue-100 px-1 rounded">email</code> - Email address (must be unique)</li>
              </ul>
              <p className="text-sm text-blue-900 mt-3 mb-2 font-semibold">Optional Fields:</p>
              <ul className="text-xs text-blue-800 space-y-1 ml-4">
                <li>• <code className="bg-blue-100 px-1 rounded">phone</code> - Phone number</li>
                <li>• <code className="bg-blue-100 px-1 rounded">street, city, state, zip</code> - Address fields</li>
                <li>• <code className="bg-blue-100 px-1 rounded">employer</code> - Company/employer name</li>
                <li>• <code className="bg-blue-100 px-1 rounded">yearsWithOrganization</code> - Number of years</li>
                <li>• <code className="bg-blue-100 px-1 rounded">eventsAttended</code> - Number of events</li>
                <li>• <code className="bg-blue-100 px-1 rounded">categoryOfEngagement</code> - member, donor, volunteer, sponsor, partner, general</li>
                <li>• <code className="bg-blue-100 px-1 rounded">pipeline</code> - prospect, active, champion, inactive</li>
                <li>• <code className="bg-blue-100 px-1 rounded">tags</code> - Tags in quotes: "f3:ao,monthly_donor"</li>
              </ul>
            </div>

            <div className="mb-6">
              <button
                onClick={downloadTemplate}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mb-4 block"
              >
                📥 Download Template CSV
              </button>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition"
              />
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

        {/* Step 2: Preview & Validate */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Validate</h2>
            
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-700">{preview.valid.length}</div>
                <div className="text-sm text-green-600">Valid Rows</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-700">{preview.errors.length}</div>
                <div className="text-sm text-red-600">Errors Found</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-700">{preview.valid.length + preview.errors.length}</div>
                <div className="text-sm text-blue-600">Total Rows</div>
              </div>
            </div>

            {/* Errors */}
            {preview.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">⚠️ Rows with Errors</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {preview.errors.map((err, idx) => (
                    <div key={idx} className="text-sm text-red-800 mb-2">
                      <span className="font-semibold">Line {err.line}:</span> {err.error}
                      <span className="text-xs text-red-600 ml-2">({err.data.name || 'no name'} - {err.data.email || 'no email'})</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  These rows will be <span className="font-semibold">skipped</span>. Only valid rows will be imported.
                </p>
              </div>
            )}

            {/* Valid Preview */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Valid Rows (Preview)</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Line</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phone</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {preview.valid.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-600">{row.line}</td>
                        <td className="px-4 py-2 text-gray-900">{row.data.firstName} {row.data.lastName}</td>
                        <td className="px-4 py-2 text-gray-600">{row.data.email}</td>
                        <td className="px-4 py-2 text-gray-600">{row.data.phone || '-'}</td>
                        <td className="px-4 py-2 text-gray-600">{row.data.categoryOfEngagement || 'general'}</td>
                        <td className="px-4 py-2 text-gray-600">{row.data.pipeline || 'prospect'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.valid.length > 10 && (
                  <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
                    ... and {preview.valid.length - 10} more rows
                  </div>
                )}
              </div>
            </div>

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
                disabled={uploading || preview.valid.length === 0}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {uploading ? "Uploading..." : `Import ${preview.valid.length} Supporters`}
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
            <p className="text-gray-600 mb-4">
              Successfully imported {preview.valid.length} supporters
            </p>
            <p className="text-sm text-gray-500">Redirecting to supporters page...</p>
          </div>
        )}
      </div>
    </div>
  );
}

