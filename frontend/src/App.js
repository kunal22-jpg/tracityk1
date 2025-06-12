import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import TracityDashboard from './components/TracityDashboard';
import DataExplorer from './components/DataExplorer';
import TracityNavbar from './components/TracityNavbar';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <BrowserRouter>
          <div className="min-h-screen transition-colors duration-500">
            <TracityNavbar />
            <Routes>
              <Route path="/" element={<TracityDashboard />} />
              <Route path="/explorer" element={<DataExplorer />} />
              {/* Add a fallback route to handle any other paths */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
