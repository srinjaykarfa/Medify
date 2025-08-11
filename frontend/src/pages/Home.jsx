import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  UserIcon,
  PlusCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import HeroSection from "../components/Herosection";
import FeatureRow from "../components/Feature";
import FAQSection from "../components/Faqsection";
import Footer from "../components/Footer";

// Feature icons
import quickCheckupIcon from "../assets/quick-checkup.png.png";
import healthMetricsIcon from "../assets/health-metrics.png.png";
import appointmentsIcon from "../assets/appointments.png.png";
import emergencyIcon from "../assets/emergency.png.png";
import dashboardIcon from "../assets/dashboard.png.png";

// Partner logos
import wbhsLogo from "../assets/wbhs.png";
import cghsLogo from "../assets/cghslogo.jpg";
import licLogo from "../assets/lichs.png";
import hdfchsLogo from "../assets/hdfchs.jpg";
import bobhsLogo from "../assets/bobhs.png";
import tcshsLogo from "../assets/tcshs.webp";

// 🔵 Styled Partner Section
const PartnersSection = () => {
  const partners = [
    { name: "WBHS", logo: wbhsLogo },
    { name: "CGHS", logo: cghsLogo },
    { name: "LIC", logo: licLogo },
    { name: "HDFCHS", logo: hdfchsLogo },
    { name: "BOBHS", logo: bobhsLogo },
    { name: "TCSHS", logo: tcshsLogo },
  ];

  return (
    <div className="px-6 md:px-20 py-12 bg-white">
      <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-10 text-center">
        We are attached with -
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex flex-col items-center bg-blue-50 hover:bg-blue-100 transition-all rounded-xl p-4 shadow-sm hover:shadow-md"
          >
            <div className="h-16 w-16 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-10 w-10 object-contain"
              />
            </div>
            <p className="text-sm font-semibold text-blue-700 text-center">
              {partner.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Role-based Dashboard Cards
const PatientDashboard = () => {
  const patientFeatures = [
    {
      name: "Quick Checkup",
      description: "Get instant health assessment",
      icon: HeartIcon,
      link: "/quick-checkup",
      color: "bg-red-500",
    },
    {
      name: "Health Metrics",
      description: "Track your health data",
      icon: ChartBarIcon,
      link: "/health-metrics",
      color: "bg-blue-500",
    },
    {
      name: "Book Appointment",
      description: "Schedule with doctors",
      icon: CalendarIcon,
      link: "/appointments",
      color: "bg-green-500",
    },
    {
      name: "AI Chat Assistant",
      description: "Get instant medical advice",
      icon: ChatBubbleLeftRightIcon,
      link: "/chatbot",
      color: "bg-purple-500",
    },
    {
      name: "Emergency",
      description: "Emergency contacts & info",
      icon: ShieldCheckIcon,
      link: "/emergency",
      color: "bg-red-600",
    },
    {
      name: "Profile",
      description: "Manage your profile",
      icon: UserIcon,
      link: "/profile",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {patientFeatures.map((feature, index) => (
        <motion.div
          key={feature.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            to={feature.link}
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`${feature.color} p-3 rounded-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

const DoctorDashboard = () => {
  const doctorFeatures = [
    {
      name: "Doctor Dashboard",
      description: "Manage appointments & patients",
      icon: ChartBarIcon,
      link: "/doctor-dashboard",
      color: "bg-blue-600",
    },
    {
      name: "Patient Consultations",
      description: "View and manage consultations",
      icon: UserGroupIcon,
      link: "/doctor-dashboard",
      color: "bg-green-600",
    },
    {
      name: "Emergency Cases",
      description: "Handle emergency situations",
      icon: ShieldCheckIcon,
      link: "/emergency",
      color: "bg-red-600",
    },
    {
      name: "Profile Settings",
      description: "Update doctor profile",
      icon: UserIcon,
      link: "/profile",
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
      {doctorFeatures.map((feature, index) => (
        <motion.div
          key={feature.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            to={feature.link}
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`${feature.color} p-3 rounded-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const adminFeatures = [
    {
      name: "Admin Dashboard",
      description: "System overview & management",
      icon: ChartBarIcon,
      link: "/admin-dashboard",
      color: "bg-purple-600",
    },
    {
      name: "User Management",
      description: "Manage all users",
      icon: UserGroupIcon,
      link: "/admin-dashboard",
      color: "bg-blue-600",
    },
    {
      name: "Doctor Verification",
      description: "Approve/reject doctors",
      icon: ShieldCheckIcon,
      link: "/admin-dashboard",
      color: "bg-green-600",
    },
    {
      name: "System Settings",
      description: "Configure system settings",
      icon: CogIcon,
      link: "/admin-dashboard",
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
      {adminFeatures.map((feature, index) => (
        <motion.div
          key={feature.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link
            to={feature.link}
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-purple-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`${feature.color} p-3 rounded-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

const GuestHomePage = () => {
  const features = [
    {
      name: "Quick Checkup",
      description: "Get a quick health assessment based on your symptoms",
      icon: quickCheckupIcon,
      link: "/quick-checkup",
    },
    {
      name: "Health Metrics",
      description: "Track and monitor your health measurements",
      icon: healthMetricsIcon,
      link: "/health-metrics",
    },
    {
      name: "Appointments",
      description: "Manage your medical appointments",
      icon: appointmentsIcon,
      link: "/appointments",
    },
    {
      name: "Emergency",
      description: "Access emergency contacts and information",
      icon: emergencyIcon,
      link: "/emergency",
    },
    {
      name: "Dashboard",
      description: "View your health overview and statistics",
      icon: dashboardIcon,
      link: "/dashboard",
    },
  ];

  return (
    <>
      <HeroSection />
      <FeatureRow features={features} />
      <FAQSection />
      <PartnersSection />
    </>
  );
};

export default function Home() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    
    setIsAuthenticated(!!token && !!username);
    setUserName(username);
    setUserRole(role);
  }, []);

  const renderRoleBasedContent = () => {
    if (!isAuthenticated) {
      return <GuestHomePage />;
    }

    switch (userRole) {
      case 'patient':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto py-12">
              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-gray-800 mb-4"
                >
                  Welcome back, {userName}! 👋
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-gray-600"
                >
                  Your health journey continues here
                </motion.p>
              </div>
              <PatientDashboard />
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
            <div className="container mx-auto py-12">
              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-gray-800 mb-4"
                >
                  Dr. {userName} 🩺
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-gray-600"
                >
                  Manage your practice and help patients
                </motion.p>
              </div>
              <DoctorDashboard />
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="container mx-auto py-12">
              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-gray-800 mb-4"
                >
                  Admin Panel ⚙️
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl text-gray-600"
                >
                  System management and oversight
                </motion.p>
              </div>
              <AdminDashboard />
            </div>
          </div>
        );

      default:
        return <GuestHomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-150 to-blue-300 flex flex-col">
      {renderRoleBasedContent()}
      <Footer visible={true} />
    </div>
  );
}
