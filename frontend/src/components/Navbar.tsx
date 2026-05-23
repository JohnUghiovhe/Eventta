import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isCreator } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <nav className="bg-navDark dark:bg-gray-800 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-amber-400 dark:text-indigo-400 text-2xl font-bold flex items-center">
               {SYSTEM_MESSAGES.appName}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/events"
              className="text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              Events
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                {isCreator ? (
                  <>
                    <Link
                      to="/my-events"
                      className="text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                    >
                      My Events
                    </Link>
                    <Link
                      to="/analytics"
                      className="text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                    >
                      Analytics
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/my-tickets"
                    className="text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                  >
                    My Tickets
                  </Link>
                )}
              </>
            )}

            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.firstName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span>{user?.firstName}</span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-50">
                      <Link
                        to="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="block px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg transition-colors"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 last:rounded-b-lg transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/events"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
            >
              Events
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                >
                  Dashboard
                </Link>
                {isCreator ? (
                  <>
                    <Link
                      to="/my-events"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                    >
                      My Events
                    </Link>
                    <Link
                      to="/analytics"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                    >
                      Analytics
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/my-tickets"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                  >
                    My Tickets
                  </Link>
                )}

                <div className="border-t border-gray-700 pt-2 mt-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="border-t border-gray-700 pt-2 mt-2 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-amber-50 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-2 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
