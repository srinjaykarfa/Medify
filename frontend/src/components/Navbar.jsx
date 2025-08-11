import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import SignOutpg from './SignOutpg';

const Navbar = ({ setIsMobileMenuOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Only authenticated if both access_token and username are present
  const accessToken = localStorage.getItem('access_token');
  const userName = localStorage.getItem('username');
  const isAuthenticated = !!accessToken && !!userName;

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Proper sign out: clear all auth data and redirect to home page
  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setShowSignOutModal(false);
    navigate('/');
    window.location.reload(); // Ensure state is reset
  };

  return (
    <>
      <nav className="bg-transparent shadow-md backdrop-blur-md border-b border-gray-200 z-50 relative">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>

            {/* Center navigation links */}
            <div className="hidden md:flex space-x-10 mx-auto">
              <Link
                to="/about"
                className="text-blue-500 text-lg font-semibold tracking-wide transition duration-300 hover:text-blue-700 hover:scale-105"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-blue-500 text-lg font-semibold tracking-wide transition duration-300 hover:text-blue-700 hover:scale-105"
              >
                Contact
              </Link>
            </div>

            {/* Right side - User menu icon */}
            <div className="flex items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-blue-500 text-lg font-semibold tracking-wide transition duration-300 hover:text-blue-700 hover:scale-105"
                >
                  <UserCircleIcon className="h-6 w-6 text-blue-500" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl z-50 animate-fade-in p-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 rounded-md"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/appointments"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 rounded-md"
                    >
                      My Appointments
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - empty for clean look */}
            <div className="flex items-center">
              {/* Placeholder for future elements if needed */}
            </div>
          </div>
        </div>
      </nav>

      {/* Sign Out Modal */}
      <SignOutpg isOpen={showSignOutModal} setIsOpen={setShowSignOutModal} />
    </>
  );
};

export default Navbar;
