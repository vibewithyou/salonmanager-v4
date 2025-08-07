import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  StarIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import * as appointmentService from '../services/appointmentService';
import * as salonService from '../services/salonService';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const { user, isAdmin, isSalonOwner, isStylist } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load appointments
      const appointmentsData = await appointmentService.getAppointments();
      setAppointments(appointmentsData || []);

      // Load analytics (placeholder data)
      setAnalytics({
        totalAppointments: 45,
        completedAppointments: 38,
        pendingAppointments: 7,
        totalRevenue: 2450.00,
        averageRating: 4.8,
        appointmentsByMonth: [
          { month: 'Jan', appointments: 25, revenue: 1250 },
          { month: 'Feb', appointments: 32, revenue: 1600 },
          { month: 'Mar', appointments: 45, revenue: 2250 },
          { month: 'Apr', appointments: 38, revenue: 1900 },
          { month: 'Mai', appointments: 52, revenue: 2600 },
          { month: 'Jun', appointments: 45, revenue: 2450 },
        ],
        appointmentsByStatus: [
          { name: 'Abgeschlossen', value: 38, color: '#10b981' },
          { name: 'Ausstehend', value: 7, color: '#f59e0b' },
          { name: 'Storniert', value: 3, color: '#ef4444' },
        ],
        topServices: [
          { name: 'Haarschnitt', bookings: 28, revenue: 1400 },
          { name: 'Färbung', bookings: 15, revenue: 1200 },
          { name: 'Styling', bookings: 12, revenue: 480 },
          { name: 'Bartpflege', bookings: 8, revenue: 320 },
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardTitle = () => {
    if (isAdmin) return 'Admin Dashboard';
    if (isSalonOwner) return 'Salon Dashboard';
    if (isStylist) return 'Stylist Dashboard';
    return 'Mein Dashboard';
  };

  const getWelcomeMessage = () => {
    if (isAdmin) return 'Systemübersicht und Verwaltung';
    if (isSalonOwner) return 'Verwalten Sie Ihr Salon-Business';
    if (isStylist) return 'Ihre Termine und Kunden im Überblick';
    return 'Ihre Termine und Favoriten';
  };

  const getRelevantStats = () => {
    if (!analytics) return [];
    
    const baseStats = [
      {
        title: 'Termine gesamt',
        value: analytics.totalAppointments,
        icon: CalendarDaysIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900',
      },
      {
        title: 'Abgeschlossen',
        value: analytics.completedAppointments,
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900',
      }
    ];

    if (isSalonOwner || isAdmin) {
      baseStats.push(
        {
          title: 'Umsatz',
          value: `€${analytics.totalRevenue.toFixed(2)}`,
          icon: CurrencyEuroIcon,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100 dark:bg-primary-900',
        },
        {
          title: 'Bewertung',
          value: analytics.averageRating.toFixed(1),
          icon: StarIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
        }
      );
    }

    return baseStats;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            {getDashboardTitle()}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-2">
            Willkommen zurück, {user?.first_name}! {getWelcomeMessage()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getRelevantStats().map((stat, index) => (
            <div key={index} className="dashboard-widget">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          {(isSalonOwner || isAdmin) && analytics && (
            <div className="dashboard-widget">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Umsatz & Termine (6 Monate)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.appointmentsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="appointments" fill="#d946ef" name="Termine" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Umsatz €" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Appointment Status */}
          {analytics && (
            <div className="dashboard-widget">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Termine nach Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.appointmentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Appointments */}
          <div className="dashboard-widget">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Aktuelle Termine
            </h3>
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-500' :
                      appointment.status === 'pending' ? 'bg-yellow-500' :
                      appointment.status === 'completed' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {new Date(appointment.appointment_date).toLocaleDateString('de-DE')}
                      </p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {new Date(appointment.appointment_date).toLocaleTimeString('de-DE', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-secondary-900 dark:text-white">
                      €{appointment.total_price}
                    </p>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 capitalize">
                      {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
              
              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                    Keine Termine
                  </h4>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {user?.role === 'customer' 
                      ? 'Buchen Sie Ihren ersten Termin!'
                      : 'Noch keine Termine vorhanden.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Services (for salon owners) */}
          {(isSalonOwner || isAdmin) && analytics && (
            <div className="dashboard-widget">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Beliebte Services
              </h3>
              <div className="space-y-4">
                {analytics.topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-secondary-900 dark:text-white">
                        {service.name}
                      </h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {service.bookings} Buchungen
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary-600">
                        €{service.revenue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions for Customers */}
          {user?.role === 'customer' && (
            <div className="dashboard-widget">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Schnellaktionen
              </h3>
              <div className="space-y-3">
                <button className="w-full btn-primary text-left p-4 rounded-lg">
                  <CalendarDaysIcon className="w-6 h-6 inline mr-3" />
                  Neuen Termin buchen
                </button>
                <button className="w-full btn-outline text-left p-4 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 inline mr-3" />
                  Lieblingssalons ansehen
                </button>
                <button className="w-full btn-outline text-left p-4 rounded-lg">
                  <StarIcon className="w-6 h-6 inline mr-3" />
                  Bewertung schreiben
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Features */}
        {isAdmin && (
          <div className="mt-8">
            <div className="dashboard-widget">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                System Administration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-300">
                    Benutzer verwalten
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Benutzerkonten und Rollen verwalten
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-300">
                    Salons verwalten
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Salon-Genehmigungen und Einstellungen
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-300">
                    System Reports
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                    Systemauslastung und Berichte
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;