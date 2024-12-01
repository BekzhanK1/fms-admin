// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import React Router components
import LoginPage from './LoginPage';  // Import the LoginPage component
import Dashboard from './Dashboard';  // Import your Dashboard component
import Categories from './Categories';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />  {/* Render LoginPage on the root path */}
          <Route path="/dashboard" element={<Dashboard />} />  {/* Render Dashboard on '/dashboard' path */}
          <Route path="/categories" element={<Categories />} />  {/* Render Dashboard on '/dashboard' path */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
