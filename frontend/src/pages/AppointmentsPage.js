import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import * as appointmentService from '../services/appointmentService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AppointmentsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);

  const filters = [
    { value: 'all', label: 'Alle', count: 0 },
    { value: 'pending', label: 'Ausstehend', count: 0 },
    { value: 'confirmed', label: 'Bestätigt', count: 0 },
    { value: 'completed', label: 'Abgeschlossen', count: 0 },
    { value: 'cancelled', label: 'Storniert', count: 0 },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadAppointments();
    }
  }, [isAuthenticated]);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data || []);
      
      // Update filter counts
      const counts = {
        all: data?.length || 0,
        pending: data?.filter(a => a.status === 'pending').length || 0,
        confirmed: data?.filter(a => a.status === 'confirmed').length || 0,
        completed: data?.filter(a => a.status === 'completed').length || 0,
        cancelled: data?.filter(a => a.status === 'cancelled').length || 0,
      };
      
      filters.forEach(f => {
        f.count = counts[f.value] || 0;
      });
      
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Termine konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = searchQuery === '' || 
      appointment.salon_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      await loadAppointments();
      toast.success('Status erfolgreich geändert');
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Status konnte nicht geändert werden');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Sind Sie sicher, dass Sie diesen Termin stornieren möchten?')) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(appointmentId, 'Vom Kunden storniert');
      await loadAppointments();
      toast.success('Termin erfolgreich storniert');
      setShowActionMenu(null);
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error('Termin konnte nicht storniert werden');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-secondary-100 text-secondary-800 dark:bg-secondary-700 dark:text-secondary-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Bestätigt';
      case 'pending':
        return 'Ausstehend';
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Storniert';
      default:
        return status;
    }
  };

  const canModifyAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.appointment_date);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60);
    
    return hoursUntilAppointment > 24 && ['pending', 'confirmed'].includes(appointment.status);
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="appointment-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
              {appointment.service_name || 'Service'}
            </h3>
            <div className="relative">
              <button
                onClick={() => setShowActionMenu(showActionMenu === appointment.id ? null : appointment.id)}
                className="p-2 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
              
              {showActionMenu === appointment.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {user?.role === 'stylist' && appointment.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        className="w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 dark:hover:bg-opacity-20"
                      >
                        Bestätigen
                      </button>
                    )}
                    
                    {user?.role === 'stylist' && appointment.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="w-full text-left px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:bg-opacity-20"
                      >
                        Als abgeschlossen markieren
                      </button>
                    )}
                    
                    {canModifyAppointment(appointment) && (
                      <>
                        <button
                          onClick={() => {/* TODO: Implement reschedule */}}
                          className="w-full text-left px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                        >
                          Termin verschieben
                        </button>
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20"
                        >
                          Stornieren
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => {/* TODO: Open chat */}}
                      className="w-full text-left px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-2" />
                      Chat öffnen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-secondary-600 dark:text-secondary-400 mb-3">
            {appointment.salon_name || 'Salon Name'}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-secondary-500 dark:text-secondary-400 mb-3">
            <div className="flex items-center">
              <CalendarDaysIcon className="w-4 h-4 mr-1" />
              {new Date(appointment.appointment_date).toLocaleDateString('de-DE', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {new Date(appointment.appointment_date).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            
            {appointment.stylist_name && (
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                {appointment.stylist_name}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
            €{appointment.total_price}
          </div>
          <span className={`appointment-status ${appointment.status}`}>
            {getStatusText(appointment.status)}
          </span>
        </div>
      </div>
      
      {appointment.notes && (
        <div className="mt-3 p-3 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
          <p className="text-sm text-secondary-700 dark:text-secondary-300">
            <strong>Notizen:</strong> {appointment.notes}
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
        <div className="flex space-x-3">
          {appointment.status === 'completed' && user?.role === 'customer' && (
            <button
              onClick={() => {/* TODO: Open review modal */}}
              className="btn-outline px-4 py-2 text-sm"
            >
              <StarIcon className="w-4 h-4 mr-2 inline" />
              Bewerten
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => {/* TODO: Open chat */}}
            className="btn-outline px-4 py-2 text-sm"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2 inline" />
            Chat
          </button>
          
          {canModifyAppointment(appointment) && (
            <button
              onClick={() => {/* TODO: Reschedule */}}
              className="btn-outline px-4 py-2 text-sm"
            >
              Verschieben
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
            Anmeldung erforderlich
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            Bitte melden Sie sich an, um Ihre Termine zu sehen.
          </p>
          <Link to="/login" className="btn-primary">
            Anmelden
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Meine Termine
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-2">
              Verwalten Sie Ihre Termine und bleiben Sie organisiert
            </p>
          </div>
          
          {user?.role === 'customer' && (
            <Link to="/salons" className="btn-primary mt-4 lg:mt-0">
              <PlusIcon className="w-5 h-5 mr-2" />
              Neuen Termin buchen
            </Link>
          )}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${filter === filterOption.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                  }
                `}
              >
                {filterOption.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === filterOption.value 
                    ? 'bg-white bg-opacity-30' 
                    : 'bg-secondary-100 dark:bg-secondary-700'
                }`}>
                  {filterOption.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Salon oder Service suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CalendarDaysIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-secondary-900 dark:text-white mb-2">
              {filter === 'all' ? 'Keine Termine gefunden' : `Keine ${filters.find(f => f.value === filter)?.label.toLowerCase()} Termine`}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-6">
              {user?.role === 'customer' 
                ? 'Buchen Sie Ihren ersten Termin bei einem unserer Partner-Salons.'
                : 'Hier werden Ihre Termine angezeigt, sobald sie verfügbar sind.'
              }
            </p>
            
            {user?.role === 'customer' && (
              <Link to="/salons" className="btn-primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                Termin buchen
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;