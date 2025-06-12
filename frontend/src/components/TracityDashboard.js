import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spline3DModel from './Spline3DModel';
import ChatPopup from './ChatPopup';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const TracityDashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const { isDarkMode } = useTheme();

  const handleModelClick = () => {
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900' 
        : 'bg-gradient-to-br from-sky-50 via-blue-50/50 to-sky-100'
    }`}>
      {/* Header with TRACITY name and theme toggle */}
      <motion.div
        className="flex justify-between items-center p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* TRACITY Logo/Name - Top Left */}
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-3 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
              : 'bg-gradient-to-br from-purple-500 to-blue-500'
          }`}>
            <span className="text-xl">⚡</span>
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold ${
            isDarkMode 
              ? 'gradient-text' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'
          }`}>
            TRACITY
          </h1>
        </motion.div>

        {/* Theme Toggle - Top Right */}
        <ThemeToggle />
      </motion.div>

      {/* Centered 3D Model */}
      <motion.div
        className="flex items-center justify-center min-h-[80vh]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          delay: 0.3,
          type: "spring",
          stiffness: 100
        }}
      >
        <Spline3DModel onClick={handleModelClick} />
      </motion.div>

      {/* Subtle floating text below the model */}
      <motion.div
        className="text-center pb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        <motion.p 
          className={`text-lg md:text-xl ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          Your AI Data Companion
        </motion.p>
      </motion.div>

      {/* Chat Popup */}
      <AnimatePresence>
        {showChat && (
          <ChatPopup onClose={handleCloseChat} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TracityDashboard;