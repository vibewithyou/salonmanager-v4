import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useTheme } from '../App';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalendarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/salons?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Barbershops', path: '/salons' },
  ];

  const userNavigation = [
    { name: 'Dashboard', path: '/dashboard', icon: CogIcon },
    { name: 'Termine', path: '/appointments', icon: CalendarIcon },
    { name: 'Profil', path: '/profile', icon: UserIcon },
  ];

  return (
    <header className="header sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <ScissorsIcon className="w-7 h-7 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-tight">BarberManager</span>
                <span className="text-yellow-500 text-xs font-medium uppercase tracking-widest">Premium</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''} text-white font-medium`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Barbershop suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 bg-opacity-60 border border-gray-700 rounded-xl px-5 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 text-gray-300 hover:text-yellow-500 transition-colors duration-200 rounded-lg hover:bg-gray-800 hover:bg-opacity-50"
              aria-label="Theme wechseln"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 text-white hover:text-yellow-500 transition-colors duration-200 rounded-lg hover:bg-gray-800 hover:bg-opacity-50"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-black font-bold text-sm">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">
                      {user?.first_name || 'User'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user?.role?.replace('_', ' ') || 'Customer'}
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 animate-scale-in backdrop-blur-sm">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-white font-medium">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:text-yellow-500 hover:bg-gray-800 transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </Link>
                      ))}
                      <hr className="my-2 border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20 transition-all duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Abmelden
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="nav-link text-white font-medium px-4 py-2 hover:text-yellow-500"
                >
                  Anmelden
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-6 py-2 rounded-lg font-bold text-sm"
                >
                  REGISTRIEREN
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-white hover:text-yellow-500 transition-colors duration-200 rounded-lg hover:bg-gray-800 hover:bg-opacity-50"
              aria-label="Menü öffnen"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-gray-900 bg-opacity-95 backdrop-blur-sm rounded-xl border border-gray-700 mb-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Barbershop suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </form>

              {/* Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link block text-white py-3 px-4 rounded-lg ${isActive(item.path) ? 'active bg-yellow-500 bg-opacity-10 text-yellow-500' : 'hover:bg-gray-800'} transition-all duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* User Navigation */}
              {isAuthenticated ? (
                <>
                  <hr className="my-4 border-gray-700" />
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-sm">
                        {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="nav-link flex items-center text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="nav-link w-full flex items-center text-red-400 hover:text-red-300 py-3 px-4 rounded-lg hover:bg-red-900 hover:bg-opacity-20 transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-4 border-gray-700" />
                  <Link
                    to="/login"
                    className="nav-link block text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Anmelden
                  </Link>
                  <Link
                    to="/register"
                    className="nav-link block text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;