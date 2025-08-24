import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaFacebookF, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  UserIcon,
  LockClosedIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import BASE_URL from '../config/api';

const Signin = ({ setIsAuthenticated, onAuthSuccess, setUserRole }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      console.log('Attempting login to:', `${BASE_URL}/api/users/login`);
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ email, password }),
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        
        // Store authentication data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('userName', data.username);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('verificationStatus', data.verification_status);
        
        // Update app state
        if (setIsAuthenticated) setIsAuthenticated(true);
        if (setUserRole) setUserRole(data.role);
        
        // Check if doctor and not verified
        if (data.role === 'doctor' && data.verification_status !== 'approved') {
          setError('Your doctor account is pending verification. Please wait for admin approval.');
          setLoading(false);
          return;
        }
        
        // Redirect based on role
        if (data.role === 'patient') {
          navigate('/dashboard');
        } else if (data.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard'); // Default fallback
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || `Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check if the backend is running on port 8000.');
      } else {
        setError('An error occurred during sign in: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userName', provider + 'User');
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Floating Medical Icons */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/20"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 0 
              }}
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 4 === 0 && <HeartIcon className="h-8 w-8" />}
              {i % 4 === 1 && <ShieldCheckIcon className="h-6 w-6" />}
              {i % 4 === 2 && <UserIcon className="h-7 w-7" />}
              {i % 4 === 3 && <div className="w-3 h-3 bg-white/30 rounded-full" />}
            </motion.div>
          ))}
        </div>

        {/* Animated Waves */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full h-64 opacity-30"
          initial={{ x: -100 }}
          animate={{ x: 100 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 1440 320" className="w-full h-full">
            <path 
              fill="rgba(255,255,255,0.1)" 
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </motion.div>
      </div>

      {/* Main Login Container */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <HeartIcon className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            
            <motion.p 
              className="text-white/80 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to your <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Medify</span> account
            </motion.p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 p-4 mb-6 text-red-100 text-sm rounded-xl"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3 animate-pulse"></div>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className={`h-5 w-5 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-blue-400' : 'text-white/60'
                  }`} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-blue-400' : 'text-white/60'
                  }`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="flex justify-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-white/80 hover:text-white transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </motion.div>

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                    />
                    Signing you in...
                  </div>
                ) : (
                  'Sign In'
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

          {/* Divider */}
          <motion.div 
            className="mt-8 mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/10 backdrop-blur-sm text-white/80 text-sm rounded-full">
                  or continue with
                </span>
              </div>
            </div>
          </motion.div>

          {/* Social Login */}
          <motion.div 
            className="flex justify-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { icon: FaGoogle, color: 'from-red-500 to-red-600', provider: 'Google' },
              { icon: FaFacebookF, color: 'from-blue-600 to-blue-700', provider: 'Facebook' },
              { icon: FaGithub, color: 'from-gray-700 to-gray-800', provider: 'Github' }
            ].map((social, index) => (
              <motion.button
                key={social.provider}
                onClick={() => handleOAuthLogin(social.provider)}
                disabled={loading}
                className={`p-4 bg-gradient-to-r ${social.color} rounded-xl text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <social.icon className="h-5 w-5" />
              </motion.button>
            ))}
          </motion.div>

          {/* Sign Up Link */}
          <motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <p className="text-white/80">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-semibold hover:underline transition-all duration-300"
              >
                Create Account
              </Link>
            </p>
          </motion.div>

          {/* Terms */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <p className="text-xs text-white/60">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-white/80 hover:text-white underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-white/80 hover:text-white underline">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Bottom Decoration */}
        <motion.div 
          className="flex justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white/40 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signin;