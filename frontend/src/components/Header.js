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
    { name: 'Startseite', path: '/' },
    { name: 'Salons', path: '/salons' },
  ];

  const userNavigation = [
    { name: 'Dashboard', path: '/dashboard', icon: CogIcon },
    { name: 'Termine', path: '/appointments', icon: CalendarIcon },
    { name: 'Profil', path: '/profile', icon: UserIcon },
  ];

  return (
    <header className="header dark:header-dark sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-white font-bold text-xl">SalonManager</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''} text-white`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Salons suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
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
              className="p-2 text-white text-opacity-70 hover:text-opacity-100 transition-colors duration-200"
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
                  className="flex items-center space-x-2 p-2 text-white text-opacity-90 hover:text-opacity-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.first_name || user?.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 animate-scale-in">
                    <div className="py-1">
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="flex items-center px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      ))}
                      <hr className="my-1 border-secondary-200 dark:border-secondary-600" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition-colors duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Abmelden
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="nav-link text-white"
                >
                  Anmelden
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200"
                >
                  Registrieren
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-white text-opacity-90 hover:text-opacity-100"
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
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg mb-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative mb-3">
                <input
                  type="text"
                  placeholder="Salons suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-2 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-opacity-70"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </form>

              {/* Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-link block text-white ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* User Navigation */}
              {isAuthenticated ? (
                <>
                  <hr className="my-3 border-white border-opacity-20" />
                  {userNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="nav-link flex items-center text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="nav-link w-full flex items-center text-red-300 hover:text-red-200"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-3 border-white border-opacity-20" />
                  <Link
                    to="/login"
                    className="nav-link block text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Anmelden
                  </Link>
                  <Link
                    to="/register"
                    className="nav-link block text-white"
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