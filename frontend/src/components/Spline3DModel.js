import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Spline3DModel = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover Text */}
      <motion.div
        className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-lg text-sm text-white border border-purple-500/30 whitespace-nowrap z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          y: isHovered ? 0 : 10 
        }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-purple-300">Click me to chat</span>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800/90"></div>
      </motion.div>

      {/* Spline 3D Model Container */}
      <motion.div
        className="relative w-96 h-96 md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full overflow-hidden border-4 border-purple-500/20 shadow-2xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
          delay: 0.5
        }}
      >
        {/* Outer Glow Effect */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 blur-xl animate-pulse"></div>
        
        {/* Spline iframe */}
        <iframe 
          src='https://my.spline.design/pleasegiveme1000likes-GzAEMsuGt9652wqGJDAUyPb1/' 
          frameBorder='0' 
          width='100%' 
          height='100%'
          className="relative z-10 rounded-full"
          style={{ pointerEvents: 'auto' }}
          title="3D Interactive Model"
        />
        
        {/* Click overlay for better click detection */}
        <div 
          className="absolute inset-0 z-20 rounded-full cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Spline3DModel;