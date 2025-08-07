import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  ChartBarIcon,
  ScissorsIcon,
  CurrencyEuroIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import * as salonService from '../services/salonService';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [featuredSalons, setFeaturedSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedSalons();
  }, []);

  const loadFeaturedSalons = async () => {
    try {
      const salons = await salonService.getSalons({ limit: 6, minRating: 4.0 });
      setFeaturedSalons(salons || []);
    } catch (error) {
      console.error('Error loading featured salons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (searchCity.trim()) params.append('city', searchCity);
    
    navigate(`/salons?${params.toString()}`);
  };

  const features = [
    {
      icon: ScissorsIcon,
      title: 'Premium Barber Services',
      description: 'Professionelle Haarschnitte von erfahrenen Barbieren und Stylisten.',
    },
    {
      icon: MapPinIcon,
      title: 'Standorte in deiner Nähe',
      description: 'Finde erstklassige Barbershops und Salons in deiner Umgebung.',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Online Terminbuchung',
      description: 'Buche deinen Termin rund um die Uhr - schnell und unkompliziert.',
    },
    {
      icon: StarIcon,
      title: 'Bewertete Qualität',
      description: 'Nur die besten Barbiere mit hervorragenden Kundenbewertungen.',
    },
    {
      icon: CreditCardIcon,
      title: 'Sichere Bezahlung',
      description: 'Bezahle sicher online oder vor Ort - wie es dir passt.',
    },
    {
      icon: SparklesIcon,
      title: 'Premium Erfahrung',
      description: 'Genieße eine erstklassige Atmosphäre und professionelle Beratung.',
    },
  ];

  const salonFeatures = [
    {
      icon: UserGroupIcon,
      title: 'Kundenverwaltung',
      description: 'Professionelle Verwaltung deiner Stammkunden.',
    },
    {
      icon: ChartBarIcon,
      title: 'Geschäftsanalysen',
      description: 'Detaillierte Einblicke in dein Barbershop-Business.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sichere Plattform',
      description: 'Datenschutz und Sicherheit auf höchstem Niveau.',
    },
  ];

  const stats = [
    { number: '10.000+', label: 'Zufriedene Kunden' },
    { number: '500+', label: 'Partner Barbershops' },
    { number: '100.000+', label: 'Termine gebucht' },
    { number: '4.9/5', label: 'Kundenbewertung' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="hero-section hero-pattern relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Premium
              <span className="text-gradient-gold block"> Barber Experience</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Entdecke die besten Barbershops deiner Stadt. Buche deinen Termin online 
              und erlebe erstklassige Barbier-Kunst.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-16">
              <div className="flex flex-col md:flex-row gap-4 p-3 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-2xl border border-gray-700">
                <div className="flex-1 relative">
                  <ScissorsIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                  <input
                    type="text"
                    placeholder="Barbershop, Service oder Barber..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-400 border-0 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-500" />
                  <input
                    type="text"
                    placeholder="Stadt oder PLZ..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder-gray-400 border-0 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary px-8 py-4 rounded-xl font-bold whitespace-nowrap"
                >
                  TERMIN FINDEN
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/register"
                  className="btn-primary px-10 py-4 rounded-xl font-bold text-lg"
                >
                  KOSTENLOS REGISTRIEREN
                </Link>
                <Link
                  to="/salons"
                  className="btn-outline px-10 py-4 rounded-xl font-bold text-lg"
                >
                  BARBERSHOPS ENTDECKEN
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-8 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-12 w-6 h-6 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl lg:text-5xl font-bold text-yellow-500 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Salons */}
      <section className="section-dark py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Premium <span className="text-gradient-gold">Barbershops</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Entdecke die besten Barbershops mit den erfahrensten Barbieren
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {featuredSalons.map((salon) => (
                <Link
                  key={salon.id}
                  to={`/salon/${salon.slug}`}
                  className="salon-card group"
                >
                  <div className="relative">
                    <img
                      src={salon.images?.[0] || '/api/placeholder/400/250'}
                      alt={salon.name}
                      className="salon-card-image"
                    />
                    <div className="salon-card-overlay group-hover:opacity-70" />
                    <div className="salon-card-badge">
                      <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                      {salon.rating?.toFixed(1) || '5.0'}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {salon.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {salon.name}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {salon.description || 'Professionelle Barbier-Services in erstklassiger Atmosphäre'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-400">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        {salon.city}
                      </div>
                      <div className="text-yellow-500 font-semibold">
                        {salon.price_range}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/salons"
              className="btn-primary px-10 py-4 rounded-xl font-bold text-lg"
            >
              ALLE BARBERSHOPS ANSEHEN
            </Link>
          </div>
        </div>
      </section>

      {/* Features for Customers */}
      <section className="section-elevated py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Warum <span className="text-gradient-gold">BarberManager</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Die moderne Plattform für Premium Barbier-Erlebnisse
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="card text-center p-10 hover-lift group">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Salons Section */}
      <section className="section-gold py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
              Für Barbershop-Besitzer
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
              Digitalisiere dein Barbershop-Business und steigere deinen Erfolg
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            {salonFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-black bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <feature.icon className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-800">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="bg-black text-yellow-500 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all duration-200 inline-block"
            >
              BARBERSHOP REGISTRIEREN
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-dark py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Bereit für dein <span className="text-gradient-gold">Premium-Erlebnis</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Registriere dich kostenlos und entdecke die besten Barbershops deiner Stadt.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/register"
              className="btn-primary px-10 py-4 rounded-xl font-bold text-lg"
            >
              KOSTENLOS REGISTRIEREN
            </Link>
            <Link
              to="/salons"
              className="btn-outline px-10 py-4 rounded-xl font-bold text-lg"
            >
              BARBERSHOPS ENTDECKEN
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;