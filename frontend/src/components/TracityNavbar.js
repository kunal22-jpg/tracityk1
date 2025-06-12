import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const TracityNavbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/explorer', label: 'Data Explorer', icon: '🔍' },
  ];

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`transition-colors duration-500 backdrop-blur-md border-b sticky top-0 z-50 ${
        isDarkMode 
          ? 'bg-slate-900/80 border-purple-500/30' 
          : 'bg-white/80 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚡</span>
            </div>
            <span className={`text-2xl font-bold ${
              isDarkMode 
                ? 'gradient-text' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'
            }`}>
              TRACITY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50'
                        : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-300'
                      : isDarkMode
                        ? 'text-slate-300 hover:text-white hover:bg-purple-600/10 hover:border hover:border-purple-500/30'
                        : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50 hover:border hover:border-purple-200'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-xl focus:outline-none border border-transparent transition-colors duration-200 ${
                isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-purple-600/20 hover:border-purple-500/30'
                  : 'text-gray-500 hover:text-purple-700 hover:bg-purple-50 hover:border-purple-200'
              }`}
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden"
        >
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-md ${
            isDarkMode 
              ? 'bg-slate-800/80' 
              : 'bg-white/80'
          }`}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50'
                      : 'bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-300'
                    : isDarkMode
                      ? 'text-slate-300 hover:text-white hover:bg-purple-600/10'
                      : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-2">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200">
                Get Started
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default TracityNavbar;