import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const LabReports = () => {
  console.log('LabReports component loaded successfully!');
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    report_name: '',
    test_date: '',
    lab_name: '',
    doctor_name: '',
    notes: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'patient') {
      navigate('/signin');
      return;
    }
    
    fetchReports();
    fetchAnalytics();
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/lab-reports/my-reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        toast.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/lab-reports/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.report_name || !uploadForm.test_date) {
      toast.error('Please fill all required fields');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('report_file', uploadForm.file);
      formData.append('report_name', uploadForm.report_name);
      formData.append('test_date', uploadForm.test_date);
      formData.append('lab_name', uploadForm.lab_name);
      formData.append('doctor_name', uploadForm.doctor_name);
      formData.append('notes', uploadForm.notes);

      const response = await fetch('/api/lab-reports/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Report uploaded and analyzed successfully!');
        setShowUploadModal(false);
        setUploadForm({
          report_name: '',
          test_date: '',
          lab_name: '',
          doctor_name: '',
          notes: '',
          file: null
        });
        fetchReports();
        fetchAnalytics();
        
        // Show analysis results
        if (data.analysis_results && data.analysis_results.length > 0) {
          setSelectedReport({
            ...data,
            analysis_results: data.analysis_results
          });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      toast.error('Network error');
    } finally {
      setUploading(false);
    }
  };

  const viewReportDetails = async (reportId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/lab-reports/report/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedReport(data);
      } else {
        toast.error('Failed to fetch report details');
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Network error');
    }
  };

  const deleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/lab-reports/report/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Report deleted successfully');
        fetchReports();
        fetchAnalytics();
      } else {
        toast.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Network error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'high':
      case 'low':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'high':
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading lab reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">Lab Reports</h1>
              <p className="text-gray-600 text-lg">Upload and analyze your medical lab reports</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Upload Report
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Reports</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.total_reports}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Normal Results</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.normal_results}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-red-100">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{analytics.critical_alerts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Health Score</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {analytics.total_reports > 0 ? 
                      Math.round((analytics.normal_results / (analytics.normal_results + analytics.critical_alerts)) * 100) : 
                      0
                    }%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Your Lab Reports</h2>
          
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-blue-700 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-4">Upload your first lab report to get AI-powered analysis</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 font-semibold"
              >
                Upload Your First Report
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-700 text-lg">{report.report_name}</h3>
                      <p className="text-sm text-gray-600">Test Date: {report.test_date}</p>
                      {report.lab_name && (
                        <p className="text-sm text-gray-600">Lab: {report.lab_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  {report.analysis_results && report.analysis_results.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Analysis Summary:</p>
                      <div className="space-y-1">
                        {report.analysis_results.slice(0, 2).map((analysis, index) => (
                          <div key={index} className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md border ${getStatusColor(analysis.status)}`}>
                            {getStatusIcon(analysis.status)}
                            <span>{analysis.test_name}: {analysis.status}</span>
                          </div>
                        ))}
                        {report.analysis_results.length > 2 && (
                          <p className="text-xs text-gray-500">+{report.analysis_results.length - 2} more tests</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewReportDetails(report.id)}
                      className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-700">Upload Lab Report</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Name *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.report_name}
                    onChange={(e) => setUploadForm({...uploadForm, report_name: e.target.value})}
                    placeholder="e.g., Blood Test, CBC, Lipid Profile"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Date *
                  </label>
                  <input
                    type="date"
                    value={uploadForm.test_date}
                    onChange={(e) => setUploadForm({...uploadForm, test_date: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lab Name
                  </label>
                  <input
                    type="text"
                    value={uploadForm.lab_name}
                    onChange={(e) => setUploadForm({...uploadForm, lab_name: e.target.value})}
                    placeholder="e.g., Apollo Diagnostics"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    value={uploadForm.doctor_name}
                    onChange={(e) => setUploadForm({...uploadForm, doctor_name: e.target.value})}
                    placeholder="e.g., Dr. Smith"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File *
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, PDF files</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm({...uploadForm, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-4 w-4" />
                        Upload & Analyze
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Report Details Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-blue-700">{selectedReport.report_name}</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p><strong>Test Date:</strong> {selectedReport.test_date}</p>
                  <p><strong>Lab:</strong> {selectedReport.lab_name || 'Not specified'}</p>
                  <p><strong>Doctor:</strong> {selectedReport.doctor_name || 'Not specified'}</p>
                  <p><strong>Upload Date:</strong> {new Date(selectedReport.upload_date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedReport.analysis_results && selectedReport.analysis_results.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-blue-700 mb-4">AI Analysis Results</h4>
                  <div className="space-y-4">
                    {selectedReport.analysis_results.map((analysis, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${getStatusColor(analysis.status)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold">{analysis.test_name}</h5>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(analysis.status)}
                            <span className="capitalize font-medium">{analysis.status}</span>
                          </div>
                        </div>
                        <p><strong>Value:</strong> {analysis.value}</p>
                        <p><strong>Reference Range:</strong> {analysis.reference_range}</p>
                        <p className="mt-2"><strong>Recommendation:</strong> {analysis.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.extracted_text && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-blue-700 mb-4">Extracted Text</h4>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.extracted_text}</pre>
                  </div>
                </div>
              )}

              {selectedReport.notes && (
                <div>
                  <h4 className="text-lg font-bold text-blue-700 mb-2">Notes</h4>
                  <p className="text-gray-700">{selectedReport.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabReports;
