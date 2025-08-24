import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  UserGroupIcon, 
  DocumentIcon, 
  CameraIcon,
  HeartIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import BASE_URL from '../config/api';

const Register = ({ onAuthSuccess, setIsAuthenticated, setUserRole }) => {
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
  const [currentStep, setCurrentStep] = useState(1);

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
        
        // Store authentication data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userName', data.username || formData.username);
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('accessToken', data.access_token);
        
        // Update app state
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUserRole) setUserRole(formData.role);
        
        // Show success message and redirect based on role
        if (formData.role === 'doctor') {
          alert('Registration successful! Your account is pending admin verification. Please sign in after approval.');
          navigate('/signin');
        } else {
          alert('Registration successful! Redirecting to your dashboard...');
          
          // Redirect based on role
          if (formData.role === 'patient') {
            navigate('/dashboard');
          } else if (formData.role === 'admin') {
            navigate('/admin-dashboard');
          }
        }
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        {/* Floating Medical Icons Animation */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/20"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 0 
              }}
              animate={{ 
                y: [0, -30, 0],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                duration: 8 + Math.random() * 6,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 5 === 0 && <HeartIcon className="h-6 w-6" />}
              {i % 5 === 1 && <ShieldCheckIcon className="h-5 w-5" />}
              {i % 5 === 2 && <UserIcon className="h-7 w-7" />}
              {i % 5 === 3 && <AcademicCapIcon className="h-6 w-6" />}
              {i % 5 === 4 && <SparklesIcon className="h-5 w-5" />}
            </motion.div>
          ))}
        </div>

        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-20 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -40, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Registration Container */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`relative z-10 w-full mx-4 transition-all duration-500 ${
          formData.role === 'doctor' ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="text-center p-8 pb-6">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <SparklesIcon className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Medify</span>
            </motion.h1>
            
            <motion.p 
              className="text-white/80 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {formData.role === 'doctor' 
                ? 'Connect with patients and make a difference' 
                : 'Your health journey starts here'}
            </motion.p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mx-8 mb-6 bg-red-500/20 backdrop-blur-sm border border-red-500/30 p-4 text-red-100 text-sm rounded-xl"
              >
                <div className="flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 mr-3 text-red-400" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-8 pb-8 max-h-[70vh] overflow-y-auto scrollbar-medical">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-lg font-semibold text-white mb-4">Choose Your Role</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      role: 'patient', 
                      icon: UserIcon, 
                      title: 'Patient', 
                      desc: 'Seeking medical care',
                      gradient: 'from-blue-500 to-purple-600',
                      iconColor: 'text-blue-400'
                    },
                    { 
                      role: 'doctor', 
                      icon: UserGroupIcon, 
                      title: 'Doctor', 
                      desc: 'Medical professional',
                      gradient: 'from-emerald-500 to-teal-600',
                      iconColor: 'text-emerald-400'
                    }
                  ].map((option, index) => (
                    <motion.div
                      key={option.role}
                      className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                        formData.role === option.role
                          ? 'bg-white/20 border-2 border-white/40 shadow-lg scale-105'
                          : 'bg-white/10 border border-white/20 hover:bg-white/15'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, role: option.role }))}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="p-6 text-center">
                        <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${option.gradient} rounded-full mb-4 shadow-lg`}>
                          <option.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-white text-lg mb-2">{option.title}</h3>
                        <p className="text-white/70 text-sm">{option.desc}</p>
                        
                        {formData.role === option.role && (
                          <motion.div
                            className="absolute top-3 right-3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                          </motion.div>
                        )}
                      </div>
                      
                      <input
                        type="radio"
                        name="role"
                        value={option.role}
                        checked={formData.role === option.role}
                        onChange={handleChange}
                        className="sr-only"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Basic Information */}
              <div className={`grid gap-6 transition-all duration-500 ${
                formData.role === 'doctor' ? 'md:grid-cols-2' : 'grid-cols-1'
              }`}>
                <AnimatedInputField 
                  label="Username" 
                  name="username" 
                  type="text" 
                  value={formData.username} 
                  onChange={handleChange} 
                  placeholder="your_username" 
                  delay={0.6}
                />
                <AnimatedInputField 
                  label="Email Address" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="john.doe@example.com" 
                  delay={0.7}
                />
                <AnimatedPasswordField 
                  label="Password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  show={showPassword} 
                  setShow={setShowPassword}
                  delay={0.8}
                />
                <AnimatedPasswordField 
                  label="Confirm Password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  show={showConfirmPassword} 
                  setShow={setShowConfirmPassword}
                  delay={0.9}
                />
              </div>
              
              {/* Doctor-specific fields */}
              <AnimatePresence>
                {formData.role === 'doctor' && (
                  <motion.div 
                    className="space-y-6 border-t border-white/20 pt-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <AcademicCapIcon className="h-6 w-6 text-emerald-400" />
                      <h3 className="text-xl font-semibold text-white">Medical Credentials</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <AnimatedInputField 
                        label="Medical License Number" 
                        name="licenseNumber" 
                        type="text" 
                        value={formData.licenseNumber} 
                        onChange={handleChange} 
                        placeholder="Enter license number" 
                        delay={1.0}
                      />
                      <AnimatedInputField 
                        label="Specialization" 
                        name="specialization" 
                        type="text" 
                        value={formData.specialization} 
                        onChange={handleChange} 
                        placeholder="e.g., Cardiology" 
                        delay={1.1}
                      />
                      <AnimatedInputField 
                        label="Years of Experience" 
                        name="experience" 
                        type="number" 
                        value={formData.experience} 
                        onChange={handleChange} 
                        placeholder="Years" 
                        delay={1.2}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <AnimatedFileUploadField
                        label="Aadhaar Card"
                        name="aadhaarCard"
                        onChange={(e) => handleFileChange(e, 'aadhaarCard')}
                        preview={aadhaarPreview}
                        icon={IdentificationIcon}
                        required
                        delay={1.3}
                      />
                      
                      <AnimatedFileUploadField
                        label="Doctor Certificate"
                        name="doctorCertificate"
                        onChange={(e) => handleFileChange(e, 'doctorCertificate')}
                        preview={certificatePreview}
                        icon={DocumentIcon}
                        required
                        delay={1.4}
                      />
                    </div>
                    
                    <motion.div 
                      className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 }}
                    >
                      <div className="flex items-start space-x-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-100 font-medium">Verification Required</p>
                          <p className="text-xs text-yellow-200 mt-1">
                            Doctor registrations require admin verification. You'll receive email confirmation once approved.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Terms Agreement */}
              <motion.div 
                className="flex items-start space-x-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
              >
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-500 rounded-md border-white/30 bg-white/10 focus:ring-emerald-400"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-white/90">
                  I agree to the{' '}
                  <Link to="/terms" className="text-emerald-400 underline hover:text-emerald-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-emerald-400 underline hover:text-emerald-300">
                    Privacy Policy
                  </Link>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || !formData.agreeToTerms}
                className="w-full relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 relative z-10 disabled:opacity-50">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                      />
                      Creating your account...
                    </div>
                  ) : (
                    'Join the Future of Healthcare'
                  )}
                </div>
                
                {/* Button shimmer effect */}
                <motion.div 
                  className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.button>
            </form>

            {/* Sign In Link */}
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
            >
              <p className="text-white/80">
                Already have an account?{' '}
                <Link 
                  to="/signin" 
                  className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-semibold hover:underline transition-all duration-300"
                >
                  Sign In Here
                </Link>
              </p>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="flex justify-center items-center space-x-6 mt-8 pt-6 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.9 }}
            >
              <div className="flex items-center space-x-2 text-white/60 text-xs">
                <ShieldCheckIcon className="h-4 w-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="flex items-center space-x-2 text-white/60 text-xs">
                <HeartIcon className="h-4 w-4" />
                <span>Trusted by Professionals</span>
              </div>
              <div className="w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="flex items-center space-x-2 text-white/60 text-xs">
                <SparklesIcon className="h-4 w-4" />
                <span>AI-Powered Care</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Animated Input Field Component
const AnimatedInputField = ({ label, name, type = 'text', value, onChange, placeholder, delay = 0 }) => (
  <motion.div 
    className="space-y-2"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
  >
    <label htmlFor={name} className="block text-sm font-medium text-white/90">
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
      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
    />
  </motion.div>
);

// Animated Password Field Component
const AnimatedPasswordField = ({ label, name, value, onChange, show, setShow, delay = 0 }) => (
  <motion.div 
    className="space-y-2"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
  >
    <label htmlFor={name} className="block text-sm font-medium text-white/90">
      {label}
    </label>
    <div className="relative">
      <input
        id={name}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        required
        className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  </motion.div>
);

// Animated File Upload Field Component
const AnimatedFileUploadField = ({ label, name, onChange, preview, icon: Icon, required = false, delay = 0 }) => (
  <motion.div 
    className="space-y-3"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <label htmlFor={name} className="block text-sm font-medium text-white/90">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="space-y-3">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={name}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all duration-300"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Icon className="w-8 h-8 mb-2 text-white/60" />
            <p className="mb-2 text-sm text-white/80">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-white/60">PNG, JPG or JPEG (MAX. 5MB)</p>
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
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-cover rounded-xl border border-white/20"
          />
          <div className="absolute top-2 right-2 bg-emerald-500 text-white p-2 rounded-full">
            <CheckCircleIcon className="w-4 h-4" />
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default Register;
