import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 
import { ShieldCheck } from 'lucide-react'; 
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen'; // Import the new component

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This simulates checking the user's token or session
    const checkAuth = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 1500); // 1.5 seconds delay
    };
    checkAuth();
  }, []);

  // Show the loading screen first
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <header className="navbar">
          <Link to="/" className="logo">
            <ShieldCheck size={32} color="#2563eb" />
            <span>HelpDesk</span>
          </Link>

          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </div>

          <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
            <Link to="/" className="nav-item" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/login" className="nav-item" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/signup" className="nav-item" onClick={() => setMenuOpen(false)}>Signup</Link>
            <Link to="/student/dashboard" className="nav-item" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          </nav>
        </header>

        {/* Content Area */}
        <main style={{ padding: '40px 5%' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute allowedRole="student" />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;