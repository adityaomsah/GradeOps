import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import GradingArena from './components/GradingArena';
import LoginPage from './pages/LoginPage';
import UploadView from './components/UploadView';

function DashboardLayout({ selectedStudent, setStudent }) {
  return (
    <div className="flex min-h-screen selection:bg-indigo-500 selection:text-white" style={{ background: '#0a0a0f' }}>
      <Sidebar setStudent={setStudent} />
      <GradingArena studentName={selectedStudent} />
    </div>
  );
}

function App() {
  const [selectedStudent, setStudent] = useState("None");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/upload" element={isAuthenticated ? <UploadView /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardLayout selectedStudent={selectedStudent} setStudent={setStudent} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
