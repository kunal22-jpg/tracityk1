import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-16 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out
        ${isDarkMode 
          ? 'bg-slate-700 border border-slate-600' 
          : 'bg-yellow-200 border border-yellow-300'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Toggle Circle */}
      <motion.div
        className={`
          w-6 h-6 rounded-full shadow-md transform transition-all duration-300 ease-in-out flex items-center justify-center
          ${isDarkMode 
            ? 'bg-slate-200 translate-x-8' 
            : 'bg-white translate-x-0'
          }
        `}
        layout
      >
        {/* Icon */}
        <span className="text-sm">
          {isDarkMode ? '🌙' : '☀️'}
        </span>
      </motion.div>
      
      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <span className={`text-xs transition-opacity ${!isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
          ☀️
        </span>
        <span className={`text-xs transition-opacity ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
          🌙
        </span>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;