import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import page components
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import RequestAccess from './pages/RequestAccess'
import PendingRequests from './pages/PendingRequests'
import CreateSoftware from './pages/CreateSoftware'
import Navbar from './components/Navbar'

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const ProtectedRoute = ({ children, roles = [] }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        {children}
      </>
    );
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />
          
          <Route path="/signup" element={
            user ? <Navigate to="/dashboard" /> : <Signup />
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/request-access" element={
            <ProtectedRoute roles={['Employee']}>
              <RequestAccess user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/pending-requests" element={
            <ProtectedRoute roles={['Manager', 'Admin']}>
              <PendingRequests user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/create-software" element={
            <ProtectedRoute roles={['Admin']}>
              <CreateSoftware user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
