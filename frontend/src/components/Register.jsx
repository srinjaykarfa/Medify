import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, UserGroupIcon, DocumentIcon, CameraIcon } from '@heroicons/react/24/outline';
import BASE_URL from '../config/api';

const Register = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient', // default role
    // Doctor-specific fields
    licenseNumber: '',
    specialization: '',
    experience: '',
    aadhaarCard: null,
    doctorCertificate: null,
    agreeToTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (only images allowed)
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (fileType === 'aadhaarCard') {
          setAadhaarPreview(e.target.result);
        } else if (fileType === 'doctorCertificate') {
          setCertificatePreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    // Validate doctor-specific fields if role is doctor
    if (formData.role === 'doctor') {
      if (!formData.licenseNumber || !formData.specialization || !formData.experience) {
        setError('Please fill all doctor-specific fields');
        setIsSubmitting(false);
        return;
      }
      if (!formData.aadhaarCard || !formData.doctorCertificate) {
        setError('Aadhaar card and doctor certificate are mandatory for doctor registration');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('username', formData.username);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('role', formData.role);
      
      if (formData.role === 'doctor') {
        submitData.append('license_number', formData.licenseNumber);
        submitData.append('specialization', formData.specialization);
        submitData.append('experience', formData.experience);
        submitData.append('aadhaar_card', formData.aadhaarCard);
        submitData.append('doctor_certificate', formData.doctorCertificate);
      }

      const response = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        body: submitData, // Use FormData instead of JSON for file upload
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('username', data.username || formData.email);
        localStorage.setItem('userRole', formData.role);
        if (onAuthSuccess) onAuthSuccess(data.access_token, data.username || formData.email);
        navigate('/chatbot'); // Redirect to a protected page
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className={`w-full bg-white rounded-2xl shadow-2xl overflow-hidden transition-all hover:shadow-3xl ${
        formData.role === 'doctor' ? 'max-w-2xl' : 'max-w-md'
      }`}>
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3" />
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
              Join Our Healthcare Platform
            </h2>
            <p className="mt-3 text-gray-600 text-sm">
              {formData.role === 'doctor' 
                ? 'Register as a medical professional and connect with patients' 
                : 'Create your account in seconds and take control of your health journey'}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.role === 'patient'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
                >
                  <div className="flex flex-col items-center text-center">
                    <UserIcon className="w-8 h-8 mb-2 text-blue-600" />
                    <span className="font-medium">Patient</span>
                    <span className="text-xs text-gray-500">Seeking medical care</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                </div>
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.role === 'doctor'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
                >
                  <div className="flex flex-col items-center text-center">
                    <UserGroupIcon className="w-8 h-8 mb-2 text-green-600" />
                    <span className="font-medium">Doctor</span>
                    <span className="text-xs text-gray-500">Medical professional</span>
                  </div>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>

            <InputField label="Username" name="username" type="text" value={formData.username} onChange={handleChange} placeholder="your_unique_username" />
            <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" />
            <PasswordField label="Password" name="password" value={formData.password} onChange={handleChange} show={showPassword} setShow={setShowPassword} />
            <PasswordField label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} show={showConfirmPassword} setShow={setShowConfirmPassword} />
            
            {/* Doctor-specific fields */}
            {formData.role === 'doctor' && (
              <div className="space-y-5 border-t pt-5">
                <h3 className="text-lg font-medium text-gray-900">Doctor Information</h3>
                
                <InputField 
                  label="Medical License Number" 
                  name="licenseNumber" 
                  type="text" 
                  value={formData.licenseNumber} 
                  onChange={handleChange} 
                  placeholder="Enter your medical license number" 
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <InputField 
                    label="Specialization" 
                    name="specialization" 
                    type="text" 
                    value={formData.specialization} 
                    onChange={handleChange} 
                    placeholder="e.g., Cardiology" 
                  />
                  <InputField 
                    label="Years of Experience" 
                    name="experience" 
                    type="number" 
                    value={formData.experience} 
                    onChange={handleChange} 
                    placeholder="Years" 
                  />
                </div>
                
                {/* Aadhaar Card Upload */}
                <FileUploadField
                  label="Aadhaar Card"
                  name="aadhaarCard"
                  onChange={(e) => handleFileChange(e, 'aadhaarCard')}
                  preview={aadhaarPreview}
                  required
                />
                
                {/* Doctor Certificate Upload */}
                <FileUploadField
                  label="Doctor Certificate"
                  name="doctorCertificate"
                  onChange={(e) => handleFileChange(e, 'doctorCertificate')}
                  preview={certificatePreview}
                  required
                />
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Doctor registrations will be verified by our admin team. 
                    You will receive an email confirmation once your account is approved.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-2">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 rounded-md"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-600 underline hover:text-blue-500">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-blue-600 underline hover:text-blue-500">Privacy Policy</Link>
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Join Now'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-blue-600 underline hover:text-blue-500">Sign in</Link>
          </div>

          <div className="mt-10 pt-4 border-t text-xs text-gray-600 flex justify-center space-x-4">
            <span>Trusted by healthcare professionals</span>
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span>HIPAA Compliant</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-4 px-8 text-white text-xs flex justify-between items-center">
          <p>© {new Date().getFullYear()} Your Healthcare Platform</p>
          <div className="flex space-x-2">
            <span className="bg-white bg-opacity-20 p-1 rounded-full">🔒</span>
            <span className="bg-white bg-opacity-20 p-1 rounded-full">💉</span>
            <span className="bg-white bg-opacity-20 p-1 rounded-full">🩺</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable input field
const InputField = ({ label, name, type = 'text', value, onChange, placeholder }) => (
  <div className="group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all sm:text-sm"
    />
  </div>
);

// Password field with show/hide
const PasswordField = ({ label, name, value, onChange, show, setShow }) => (
  <div className="group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <input
        id={name}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  </div>
);

// File upload field with preview
const FileUploadField = ({ label, name, onChange, preview, required = false }) => (
  <div className="group">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="space-y-3">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={name}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <DocumentIcon className="w-8 h-8 mb-2 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
          </div>
          <input
            id={name}
            name={name}
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
            required={required}
          />
        </label>
      </div>
      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg border"
          />
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
            <CameraIcon className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  </div>
);

export default Register;
