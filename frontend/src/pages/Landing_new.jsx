// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import ParticleBackground from '../components/ParticleBackground';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signin');
  };

  const handleWatchDemo = () => {
    console.log('Watch demo clicked');
  };

  // Enhanced Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatingAnimation = {
    y: [-15, 15, -15],
    x: [-5, 5, -5],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const pulseAnimation = {
    scale: [1, 1.08, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const glowAnimation = {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.5)",
      "0 0 40px rgba(59, 130, 246, 0.8)",
      "0 0 20px rgba(59, 130, 246, 0.5)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl"
          animate={floatingAnimation}
        />
        <motion.div 
          className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-15 blur-2xl"
          animate={{ 
            ...floatingAnimation, 
            transition: { ...floatingAnimation.transition, delay: 1.5, duration: 5 } 
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-25 blur-xl"
          animate={{ 
            ...floatingAnimation, 
            transition: { ...floatingAnimation.transition, delay: 2.5, duration: 6 } 
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-30 blur-lg"
          animate={floatingAnimation}
        />
        
        {/* Additional decorative elements */}
        <motion.div 
          className="absolute top-1/4 left-1/2 w-2 h-2 bg-white rounded-full"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              delay: 1
            }
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-blue-300 rounded-full"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
            transition: {
              duration: 4,
              repeat: Infinity,
              delay: 2
            }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <div className="container mx-auto px-6 lg:px-8 pt-20 pb-16">
          <motion.div 
            className="text-center max-w-4xl mx-auto space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-full px-6 py-3 border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.3)" }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <SparklesIcon className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium text-gray-200">AI-Powered Healthcare Platform</span>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="text-white">Your Health, </span>
                <motion.span 
                  className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                >
                  Our Priority
                </motion.span>
              </h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                variants={itemVariants}
              >
                Experience the future of healthcare with AI-powered consultations, expert doctors, and 
                comprehensive health monitoring - all in one revolutionary platform.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <motion.button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={glowAnimation}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
              
              <motion.button
                onClick={handleWatchDemo}
                className="group px-8 py-4 bg-white/10 backdrop-blur-lg rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center space-x-2">
                  <PlayIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Watch Demo</span>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Grid Section */}
        <div className="container mx-auto px-6 lg:px-8 py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Feature 1 */}
            <motion.div
              variants={itemVariants}
              className="group relative p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-blue-400/50 transition-all duration-300"
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div 
                className="relative z-10"
                animate={pulseAnimation}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">For Patients</h3>
                <p className="text-gray-300 leading-relaxed">Complete healthcare at your fingertips</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>AI Health Consultations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>Book Doctor Appointments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>Health Records Management</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              className="group relative p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-green-400/50 transition-all duration-300"
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div 
                className="relative z-10"
                animate={{ ...pulseAnimation, transition: { ...pulseAnimation.transition, delay: 0.5 } }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <HeartIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">For Doctors</h3>
                <p className="text-gray-300 leading-relaxed">Manage patients efficiently</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>Patient Management</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>Appointment Scheduling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>Medical Records Access</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              className="group relative p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300"
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <motion.div 
                className="relative z-10"
                animate={{ ...pulseAnimation, transition: { ...pulseAnimation.transition, delay: 1 } }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Secure & Safe</h3>
                <p className="text-gray-300 leading-relaxed">HIPAA compliant platform</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>End-to-End Encryption</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>Secure Data Storage</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-400" />
                    <span>Privacy Protection</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-12 border border-white/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(59, 130, 246, 0.5)",
                      "0 0 20px rgba(59, 130, 246, 0.8)",
                      "0 0 10px rgba(59, 130, 246, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  10K+
                </motion.div>
                <p className="text-gray-300 font-medium">Happy Patients</p>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(34, 197, 94, 0.5)",
                      "0 0 20px rgba(34, 197, 94, 0.8)",
                      "0 0 10px rgba(34, 197, 94, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  500+
                </motion.div>
                <p className="text-gray-300 font-medium">Expert Doctors</p>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(168, 85, 247, 0.5)",
                      "0 0 20px rgba(168, 85, 247, 0.8)",
                      "0 0 10px rgba(168, 85, 247, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  24/7
                </motion.div>
                <p className="text-gray-300 font-medium">AI Support</p>
              </motion.div>

              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgba(251, 191, 36, 0.5)",
                      "0 0 20px rgba(251, 191, 36, 0.8)",
                      "0 0 10px rgba(251, 191, 36, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                >
                  99%
                </motion.div>
                <p className="text-gray-300 font-medium">Success Rate</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action Section */}
        <div className="container mx-auto px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8 max-w-4xl mx-auto"
          >
            <motion.h2 
              className="text-4xl md:text-6xl font-bold"
              animate={{
                backgroundImage: [
                  "linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)",
                  "linear-gradient(45deg, #EC4899, #3B82F6, #8B5CF6)",
                  "linear-gradient(45deg, #8B5CF6, #EC4899, #3B82F6)",
                  "linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent"
              }}
            >
              Ready to Transform Your Healthcare Experience?
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-300 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Join thousands of users who trust Medify for their healthcare needs
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={handleGetStarted}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl font-bold text-xl shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 40px rgba(168, 85, 247, 0.8)",
                    "0 0 60px rgba(236, 72, 153, 0.6)",
                    "0 0 40px rgba(168, 85, 247, 0.8)",
                    "0 0 20px rgba(59, 130, 246, 0.5)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <span className="relative z-10 flex items-center space-x-3">
                  <BoltIcon className="h-6 w-6" />
                  <span>Start Your Journey</span>
                  <ArrowRightIcon className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </motion.button>
              
              <motion.div 
                className="flex items-center space-x-3 text-gray-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex -space-x-2">
                  {[
                    "bg-gradient-to-r from-blue-400 to-blue-500",
                    "bg-gradient-to-r from-green-400 to-green-500", 
                    "bg-gradient-to-r from-purple-400 to-purple-500",
                    "bg-gradient-to-r from-pink-400 to-pink-500"
                  ].map((gradient, index) => (
                    <motion.div
                      key={index}
                      className={`w-10 h-10 ${gradient} rounded-full border-2 border-white/30`}
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, -10, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <p className="font-semibold">Join 10,000+ users</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm ml-1">4.9/5 rating</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
