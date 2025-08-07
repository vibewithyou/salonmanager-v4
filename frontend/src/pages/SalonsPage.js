import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  AdjustmentsHorizontalIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ClockIcon,
  HeartIcon,
  CalendarIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import * as salonService from '../services/salonService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../App';

const SalonsPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    service: searchParams.get('service') || '',
    minRating: parseFloat(searchParams.get('minRating')) || 0,
    priceRange: searchParams.get('priceRange') || '',
    availability: searchParams.get('availability') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    sortOrder: searchParams.get('sortOrder') || 'desc',
  });

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const sortOptions = [
    { value: 'rating', label: 'Bewertung' },
    { value: 'name', label: 'Name' },
    { value: 'city', label: 'Stadt' },
    { value: 'created_at', label: 'Neu hinzugefügt' },
    { value: 'price', label: 'Preis' },
  ];

  const serviceCategories = [
    'Haarschnitt',
    'Bart Styling',
    'Klassischer Schnitt',
    'Fade Cut',
    'Rasur',
    'Bartpflege',
    'Haarstyling',
    'Shampoo & Pflege',
    'Massage',
  ];

  const priceRanges = [
    { value: '€', label: '€ - Günstig (bis 25€)' },
    { value: '€€', label: '€€ - Mittel (25-50€)' },
    { value: '€€€', label: '€€€ - Premium (50€+)' },
  ];

  const availabilityOptions = [
    { value: 'today', label: 'Heute verfügbar' },
    { value: 'tomorrow', label: 'Morgen verfügbar' },
    { value: 'this_week', label: 'Diese Woche verfügbar' },
    { value: 'weekend', label: 'Wochenende verfügbar' },
  ];

  useEffect(() => {
    loadSalons();
  }, [filters, pagination.page]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (pagination.page > 1) params.set('page', pagination.page);
    setSearchParams(params);
  }, [filters, pagination.page, setSearchParams]);

  const loadSalons = async () => {
    setLoading(true);
    try {
      const queryParams = {
        ...filters,
        skip: (pagination.page - 1) * pagination.limit,
        limit: pagination.limit,
      };

      const response = await salonService.getSalons(queryParams);
      setSalons(response || []);
      
      const totalEstimate = Math.max(response?.length || 0, pagination.limit);
      setPagination(prev => ({
        ...prev,
        total: totalEstimate,
        totalPages: Math.ceil(totalEstimate / prev.limit),
      }));
    } catch (error) {
      console.error('Error loading salons:', error);
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadSalons();
  };

  const toggleFavorite = (salonId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(salonId)) {
        newFavorites.delete(salonId);
      } else {
        newFavorites.add(salonId);
      }
      return newFavorites;
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      city: '',
      service: '',
      minRating: 0,
      priceRange: '',
      availability: '',
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== '' && value !== 0 && value !== 'rating' && value !== 'desc'
    ).length;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-600'
        }`}
      />
    ));
  };

  const SalonCard = ({ salon, isListView = false }) => (
    <div className={`card group cursor-pointer ${isListView ? 'flex' : ''}`}>
      <div className={`relative ${isListView ? 'w-64 flex-shrink-0' : ''}`}>
        <img
          src={salon.images?.[0] || '/api/placeholder/400/250'}
          alt={salon.name}
          className={`${isListView ? 'w-full h-40' : 'w-full h-48'} object-cover rounded-t-2xl ${isListView ? 'rounded-r-none rounded-l-2xl' : ''}`}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-t-2xl ${isListView ? 'rounded-r-none rounded-l-2xl' : ''}" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
          {salon.rating?.toFixed(1) || '5.0'}
        </div>

        {/* Favorite Button */}
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(salon.id);
            }}
            className="absolute top-4 left-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
          >
            {favorites.has(salon.id) ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}

        {/* Availability Badge */}
        <div className="absolute bottom-4 left-4 bg-green-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
          <ClockIcon className="w-3 h-3 mr-1" />
          Heute offen
        </div>
      </div>
      
      <div className={`${isListView ? 'flex-1' : ''} p-6`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors duration-200">
            {salon.name}
          </h3>
          <div className="text-yellow-500 font-bold">
            {salon.price_range || '€€'}
          </div>
        </div>
        
        <p className="text-gray-400 mb-4 line-clamp-2">
          {salon.description || 'Professioneller Barbershop mit erstklassigem Service und moderner Atmosphäre'}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-400 text-sm">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {salon.city}
          </div>
          <div className="flex items-center space-x-1">
            {renderStars(salon.rating || 5)}
            <span className="text-sm text-gray-400 ml-2">
              ({salon.reviews_count || 0})
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {(salon.services || ['Haarschnitt', 'Bart Styling']).slice(0, 3).map((service, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-800 text-yellow-500 text-xs rounded-full border border-gray-700"
            >
              {service.name || service}
            </span>
          ))}
          {(salon.services || []).length > 3 && (
            <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
              +{(salon.services || []).length - 3} weitere
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Link
            to={`/salon/${salon.slug}`}
            className="flex-1 btn-outline text-center py-3 rounded-lg font-semibold"
            onClick={(e) => e.stopPropagation()}
          >
            DETAILS
          </Link>
          <Link
            to={`/booking/${salon.id}`}
            className="flex-1 btn-primary text-center py-3 rounded-lg font-bold"
            onClick={(e) => e.stopPropagation()}
          >
            TERMIN BUCHEN
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Premium <span className="text-gradient-gold">Barbershops</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Finde den perfekten Barbershop für dein nächstes Styling
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl w-full lg:w-auto">
              <div className="relative flex-1">
                <ScissorsIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                <input
                  type="text"
                  placeholder="Barbershop oder Service suchen..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                <input
                  type="text"
                  placeholder="Stadt..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-32 lg:w-40 pl-12 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <button type="submit" className="btn-primary px-8 py-4 rounded-lg font-bold">
                SUCHEN
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filter Toggle & Active Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center gap-2"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Filter
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Active Filters Display */}
              {filters.service && (
                <span className="bg-yellow-500 bg-opacity-20 text-yellow-500 px-3 py-1 rounded-full text-sm flex items-center">
                  {filters.service}
                  <button
                    onClick={() => handleFilterChange('service', '')}
                    className="ml-2 hover:text-yellow-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="bg-yellow-500 bg-opacity-20 text-yellow-500 px-3 py-1 rounded-full text-sm flex items-center">
                  Min. {filters.minRating} Sterne
                  <button
                    onClick={() => handleFilterChange('minRating', 0)}
                    className="ml-2 hover:text-yellow-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.priceRange && (
                <span className="bg-yellow-500 bg-opacity-20 text-yellow-500 px-3 py-1 rounded-full text-sm flex items-center">
                  {filters.priceRange}
                  <button
                    onClick={() => handleFilterChange('priceRange', '')}
                    className="ml-2 hover:text-yellow-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.availability && (
                <span className="bg-yellow-500 bg-opacity-20 text-yellow-500 px-3 py-1 rounded-full text-sm flex items-center">
                  {availabilityOptions.find(opt => opt.value === filters.availability)?.label}
                  <button
                    onClick={() => handleFilterChange('availability', '')}
                    className="ml-2 hover:text-yellow-400"
                  >
                    ×
                  </button>
                </span>
              )}

              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Alle Filter zurücksetzen
                </button>
              )}
            </div>

            {/* View Controls & Sort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Sortieren:
                </span>
                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  {sortOptions.map(option => (
                    <React.Fragment key={option.value}>
                      <option value={`${option.value}_desc`}>
                        {option.label} (hoch zu niedrig)
                      </option>
                      <option value={`${option.value}_asc`}>
                        {option.label} (niedrig zu hoch)
                      </option>
                    </React.Fragment>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 p-8 bg-gray-900 rounded-2xl border border-gray-700 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Service</label>
                  <select
                    value={filters.service}
                    onChange={(e) => handleFilterChange('service', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Alle Services</option>
                    {serviceCategories.map(service => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Mindestbewertung ({filters.minRating} Sterne)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>0 ★</span>
                    <span>5 ★</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Preisbereich</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Alle Preise</option>
                    {priceRanges.map(range => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Verfügbarkeit</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Alle Zeiten</option>
                    {availabilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={resetFilters}
                  className="btn-outline px-8 py-3"
                >
                  Alle Filter zurücksetzen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Keine Barbershops gefunden
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Versuche es mit anderen Suchbegriffen oder passe deine Filter an, um mehr Ergebnisse zu finden.
            </p>
            <button onClick={resetFilters} className="btn-primary px-8 py-3 rounded-lg font-bold">
              FILTER ZURÜCKSETZEN
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-400 text-lg">
                <span className="text-white font-semibold">{salons.length}</span> Barbershop{salons.length !== 1 ? 's' : ''} gefunden
              </p>
            </div>

            {/* Salons Grid/List */}
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8' 
                : 'space-y-8'
              }
            `}>
              {salons.map((salon) => (
                <Link
                  key={salon.id}
                  to={`/salon/${salon.slug}`}
                  className="block"
                >
                  <SalonCard salon={salon} isListView={viewMode === 'list'} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-16">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-outline px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Zurück
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`
                          px-4 py-2 rounded-lg font-medium transition-colors
                          ${pagination.page === pageNum 
                            ? 'bg-yellow-500 text-black' 
                            : 'btn-outline'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn-outline px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalonsPage;