import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages  
import HomePage from './pages/HomePage';
import SalonsPage from './pages/SalonsPage';
import SalonDetailPage from './pages/SalonDetailPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';

// Services
import * as authService from './services/authService';

// Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Check for existing token and validate user
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      localStorage.setItem('token', response.access_token);
      toast.success('Erfolgreich angemeldet!');
      return response;
    } catch (error) {
      toast.error('Anmeldung fehlgeschlagen');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      toast.success('Registrierung erfolgreich! Bitte melden Sie sich an.');
      return response;
    } catch (error) {
      toast.error('Registrierung fehlgeschlagen');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    toast.success('Erfolgreich abgemeldet');
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const authContextValue = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSalonOwner: user?.role === 'salon_owner',
    isStylist: user?.role === 'stylist',
  };

  const themeContextValue = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <ThemeContext.Provider value={themeContextValue}>
        <Router>
          <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-200">
            <Header />
            
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/salons" element={<SalonsPage />} />
                <Route path="/salon/:slug" element={<SalonDetailPage />} />
                <Route path="/booking/:salonId" element={<BookingPage />} />
                
                {/* Auth Routes */}
                <Route 
                  path="/login" 
                  element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} 
                />
                <Route 
                  path="/register" 
                  element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={user ? <DashboardPage /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/profile" 
                  element={user ? <ProfilePage /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/appointments" 
                  element={user ? <AppointmentsPage /> : <Navigate to="/login" />} 
                />
                
                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            
            <Footer />
            
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: theme === 'dark' ? '#1e293b' : '#ffffff',
                  color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;