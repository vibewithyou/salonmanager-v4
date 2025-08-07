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
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import * as salonService from '../services/salonService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../App';

const SalonsPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    service: searchParams.get('service') || '',
    minRating: parseFloat(searchParams.get('minRating')) || 0,
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
  ];

  const serviceCategories = [
    'Haarschnitt',
    'Färbung',
    'Styling',
    'Bartpflege',
    'Maniküre',
    'Pediküre',
    'Massage',
    'Kosmetik',
  ];

  useEffect(() => {
    loadSalons();
  }, [filters, pagination.page]);

  useEffect(() => {
    // Update URL with current filters
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
      
      // Calculate pagination (this would normally come from the API)
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
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const SalonCard = ({ salon, isListView = false }) => (
    <div className={`salon-card ${isListView ? 'flex' : ''}`}>
      <div className={`relative ${isListView ? 'w-48 flex-shrink-0' : ''}`}>
        <img
          src={salon.images?.[0] || '/api/placeholder/300/200'}
          alt={salon.name}
          className={`${isListView ? 'w-full h-32' : 'salon-card-image'} object-cover`}
        />
        <div className="salon-card-overlay" />
        <div className="salon-card-badge">
          <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
          {salon.rating?.toFixed(1) || '0.0'}
        </div>
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(salon.id);
            }}
            className="absolute top-4 left-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
          >
            {favorites.has(salon.id) ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-secondary-600" />
            )}
          </button>
        )}
      </div>
      
      <div className={`${isListView ? 'flex-1' : ''} p-6`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
            {salon.name}
          </h3>
          <div className="flex items-center text-sm text-secondary-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            Heute offen
          </div>
        </div>
        
        <p className="text-secondary-600 dark:text-secondary-300 mb-3 line-clamp-2">
          {salon.description || 'Professionelle Haar- und Beauty-Services'}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-secondary-500 text-sm">
            <MapPinIcon className="w-4 h-4 mr-1" />
            {salon.address}, {salon.city}
          </div>
          <div className="flex items-center space-x-1">
            <StarIcon className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">
              {salon.rating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-sm text-secondary-500">
              ({salon.reviews_count || 0})
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {(salon.services || []).slice(0, 3).map((service, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full"
            >
              {service.name || service}
            </span>
          ))}
          {(salon.services || []).length > 3 && (
            <span className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 text-xs rounded-full">
              +{(salon.services || []).length - 3} weitere
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          <Link
            to={`/salon/${salon.slug}`}
            className="flex-1 btn-outline text-center py-2 rounded-lg"
          >
            Details
          </Link>
          <Link
            to={`/booking/${salon.id}`}
            className="flex-1 btn-primary text-center py-2 rounded-lg"
          >
            Termin buchen
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Header */}
      <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
                Salons entdecken
              </h1>
              <p className="text-secondary-600 dark:text-secondary-400 mt-2">
                Finde den perfekten Salon für deine Bedürfnisse
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl w-full lg:w-auto">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Salon oder Service suchen..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Stadt..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="form-input pl-10 w-32 lg:w-40"
                />
              </div>
              <button type="submit" className="btn-primary px-6">
                Suchen
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Filter Toggle & Active Filters */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline flex items-center gap-2"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                Filter
              </button>

              {/* Active Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {filters.service && (
                  <span className="badge badge-info">
                    Service: {filters.service}
                    <button
                      onClick={() => handleFilterChange('service', '')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="badge badge-warning">
                    Min. {filters.minRating} Sterne
                    <button
                      onClick={() => handleFilterChange('minRating', 0)}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>

              {(filters.service || filters.minRating > 0) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-secondary-600 hover:text-secondary-800"
                >
                  Alle Filter zurücksetzen
                </button>
              )}
            </div>

            {/* View Controls & Sort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-600 dark:text-secondary-400">
                  Sortieren:
                </span>
                <select
                  value={`${filters.sortBy}_${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="form-select text-sm"
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

              <div className="flex items-center bg-secondary-100 dark:bg-secondary-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-secondary-600 shadow-sm' : ''}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-secondary-600 shadow-sm' : ''}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-secondary-50 dark:bg-secondary-700 rounded-lg animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Service</label>
                  <select
                    value={filters.service}
                    onChange={(e) => handleFilterChange('service', e.target.value)}
                    className="form-select"
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
                  <label className="form-label">
                    Mindestbewertung ({filters.minRating} Sterne)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-secondary-500 mt-1">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="btn-outline w-full"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-12 h-12 text-secondary-400" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
              Keine Salons gefunden
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              Versuche es mit anderen Suchbegriffen oder passe deine Filter an.
            </p>
            <button onClick={resetFilters} className="btn-primary">
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-secondary-600 dark:text-secondary-400">
                {salons.length} Salon{salons.length !== 1 ? 's' : ''} gefunden
              </p>
            </div>

            {/* Salons Grid/List */}
            <div className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-6'
              }
            `}>
              {salons.map((salon) => (
                <Link
                  key={salon.id}
                  to={`/salon/${salon.slug}`}
                  className="block hover:shadow-lg transition-shadow duration-200"
                >
                  <SalonCard salon={salon} isListView={viewMode === 'list'} />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          px-3 py-2 rounded-lg font-medium transition-colors
                          ${pagination.page === pageNum 
                            ? 'bg-primary-600 text-white' 
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
                    className="btn-outline px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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