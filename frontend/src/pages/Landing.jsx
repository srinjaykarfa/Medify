// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  PlayCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  BeakerIcon,
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import doctorImage from '../assets/Screenshot.png';

const Landing = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { number: '50K+', label: 'Happy Patients', icon: HeartIcon },
    { number: '1000+', label: 'Expert Doctors', icon: UserGroupIcon },
    { number: '24/7', label: 'Emergency Care', icon: ClockIcon },
    { number: '99%', label: 'Success Rate', icon: StarIcon }
  ];

  const features = [
    {
      icon: CalendarDaysIcon,
      title: 'Easy Booking',
      description: 'Book appointments with verified doctors in seconds',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Consultation',
      description: 'Get instant medical advice from our AI assistant',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'Emergency Care',
      description: '24/7 emergency services with real-time location',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: BeakerIcon,
      title: 'Lab Reports',
      description: 'Digital lab reports with AI-powered analysis',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Mother of 2',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      text: 'Medify has transformed how I manage my family\'s health. The AI assistant is incredibly helpful!'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      image: 'https://randomuser.me/api/portraits/men/44.jpg',
      text: 'As a doctor, I appreciate how Medify connects me with patients efficiently and securely.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Working Professional',
      image: 'https://randomuser.me/api/portraits/women/58.jpg',
      text: 'The emergency feature saved my life during a heart attack. Quick response and excellent care!'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  const handleAppointmentClick = () => {
    navigate('/appointments');
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLearnMore = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Floating Medical Icons Animation */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 0 
              }}
              animate={{ 
                y: [0, -50, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 10 + Math.random() * 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              {i % 6 === 0 && <HeartIcon className="h-8 w-8" />}
              {i % 6 === 1 && <ShieldCheckIcon className="h-6 w-6" />}
              {i % 6 === 2 && <UserGroupIcon className="h-7 w-7" />}
              {i % 6 === 3 && <AcademicCapIcon className="h-8 w-8" />}
              {i % 6 === 4 && <SparklesIcon className="h-6 w-6" />}
              {i % 6 === 5 && <BeakerIcon className="h-7 w-7" />}
            </motion.div>
          ))}
        </div>

        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -80, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-15 blur-3xl"
          animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              {/* Hero Badge */}
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SparklesIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white/90 text-sm font-medium">
                  AI-Powered Healthcare Platform
                </span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                className="text-5xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <span className="text-white">Your Health,</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  Our Priority
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl text-white/80 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Connect with trusted doctors, get AI-powered consultations, and manage your health 
                journey with our comprehensive healthcare platform.
              </motion.p>

              {/* Social Proof */}
              <motion.div 
                className="flex items-center space-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex -space-x-3">
                  {testimonials.map((person, index) => (
                    <motion.img
                      key={index}
                      className="inline-block h-12 w-12 rounded-full ring-4 ring-white/20"
                      src={person.image}
                      alt={person.name}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-white/80 text-sm mt-1">
                    Trusted by <span className="font-semibold text-cyan-400">50,000+</span> patients
                  </p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  onClick={handleGetStarted}
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-semibold text-white shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started Free
                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: '100%' }}
                    whileHover={{ x: 0 }}
                  />
                </motion.button>

                <motion.button
                  onClick={handleLearnMore}
                  className="group flex items-center justify-center px-8 py-4 border-2 border-white/30 rounded-2xl font-semibold text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlayCircleIcon className={`mr-2 h-6 w-6 transition-transform ${isPlaying ? 'scale-110' : ''}`} />
                  Watch Demo
                </motion.button>
              </motion.div>

              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className={`text-center p-4 rounded-xl backdrop-blur-sm border border-white/20 ${
                      currentStat === index ? 'bg-white/20 scale-105' : 'bg-white/10'
                    } transition-all duration-300`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <stat.icon className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.number}</div>
                    <div className="text-sm text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="relative">
                {/* Floating Cards */}
                <motion.div 
                  className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-2xl z-10"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-xl">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Appointment Confirmed</p>
                      <p className="text-xs text-gray-600">Dr. Sarah Wilson - Today 10:00 AM</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-2xl z-10"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <HeartIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Health Score: 95/100</p>
                      <p className="text-xs text-gray-600">Excellent health status</p>
                    </div>
                  </div>
                </motion.div>

                {/* Main Image */}
                <motion.div 
                  className="relative overflow-hidden rounded-3xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={doctorImage}
                    alt="Trusted Doctors"
                    className="w-full h-auto max-w-lg mx-auto drop-shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <motion.section 
          className="py-20 bg-white/5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Medify?</span>
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Experience the future of healthcare with our cutting-edge features designed to make your health journey seamless and efficient.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  
                  {/* Hover Effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Users Say</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-6">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full ring-4 ring-white/20"
                    />
                    <div className="ml-4">
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-white/70 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-white/80 leading-relaxed">"{testimonial.text}"</p>
                  
                  <div className="flex mt-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Health Journey?</span>
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of patients and doctors who trust Medify for their healthcare needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.button
                  onClick={handleAppointmentClick}
                  className="group relative overflow-hidden px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-white text-lg shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Book Your First Appointment
                    <CalendarDaysIcon className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>

                <motion.button
                  onClick={() => navigate('/emergency')}
                  className="group flex items-center justify-center px-10 py-5 border-2 border-red-400 rounded-2xl font-bold text-red-400 hover:bg-red-400 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExclamationTriangleIcon className="mr-3 h-6 w-6 group-hover:animate-pulse" />
                  Emergency? Get Help Now
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex justify-center items-center space-x-8 mt-12 pt-8 border-t border-white/20"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 text-white/60">
                  <ShieldCheckIcon className="h-6 w-6" />
                  <span className="font-medium">HIPAA Compliant</span>
                </div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="flex items-center space-x-2 text-white/60">
                  <GlobeAltIcon className="h-6 w-6" />
                  <span className="font-medium">Available Worldwide</span>
                </div>
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                <div className="flex items-center space-x-2 text-white/60">
                  <SparklesIcon className="h-6 w-6" />
                  <span className="font-medium">AI-Powered</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Landing;
