import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  CalendarIcon,
  XMarkIcon,
  Bars3Icon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import logo from '../assets/logo_arogya.png';

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = () => {
      const auth = localStorage.getItem('isAuthenticated');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
      const username = localStorage.getItem('userName') || localStorage.getItem('username');
      const role = localStorage.getItem('userRole');

      if (auth === 'true' && token && username) {
        setIsAuthenticated(true);
        setUser({
          name: username,
          role: role === 'patient' ? 'Patient' : 
                role === 'doctor' ? 'Doctor' : 
                role === 'admin' ? 'Admin' : 'User',
        });
      }
    };

    checkAuthStatus();
  }, [userRole]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, setIsMobileMenuOpen]);

  // Patient navigation only (since sidebar is only shown for patients)
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'AI Chat', href: '/chat', icon: ChatBubbleLeftIcon },
    { name: 'Quick Checkup', href: '/quick-checkup', icon: UserCircleIcon },
    { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
    { name: 'Health Metrics', href: '/health-metrics', icon: HeartIcon },
    { name: 'Health Predict', href: '/health-predict', icon: HeartIcon },
    {
      name: 'Emergency',
      href: '/emergency',
      icon: ExclamationTriangleIcon,
      className: 'mt-auto text-red-500 hover:text-red-400 hover:bg-red-50/10',
    },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('userName');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('verificationStatus');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  const sidebarClasses = `fixed md:relative inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  const overlayClasses = `fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity ${
    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
  }`;

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden text-blue-500 hover:text-blue-600 transition-colors"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className={overlayClasses} onClick={() => setIsMobileMenuOpen(false)} />

      <div className={sidebarClasses}>
        <div className="w-full min-h-screen bg-gradient-to-b from-blue-500 to-blue-400 text-white shadow-lg rounded-r-3xl flex flex-col">
          {/* Mobile close button */}
          <div className="flex justify-end p-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Logo + Text */}
          <div className="flex items-center p-4 border-b border-white/20">
            <img src={logo} alt="Medify+" className="h-10 w-auto rounded-md" />
            <span className="ml-3 text-white text-2xl font-extrabold tracking-tight">
              MEDIFY+
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col px-4 space-y-2 mt-8">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    item.className || ''
                  } ${
                    isActive
                      ? item.name === 'Emergency'
                        ? 'bg-red-500/20 text-red-500 shadow-lg'
                        : 'bg-white/20 text-white shadow-lg'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon
                    className={`h-6 w-6 ${
                      item.name === 'Emergency' ? 'text-red-500' : ''
                    }`}
                  />
                  <span className="ml-3">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and sign out */}
          <div className="p-4 border-t border-white/20">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-white/80" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-white/60">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  <span className="ml-3">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span className="ml-3">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
