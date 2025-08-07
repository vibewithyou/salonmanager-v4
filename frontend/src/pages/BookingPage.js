import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import * as salonService from '../services/salonService';
import * as appointmentService from '../services/appointmentService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const BookingPage = () => {
  const { salonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingData, setBookingData] = useState({
    service: null,
    stylist: null,
    date: null,
    time: null,
    notes: '',
    customerInfo: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  });

  const steps = [
    { id: 1, title: 'Service wählen', description: 'Wählen Sie Ihren gewünschten Service' },
    { id: 2, title: 'Stylist & Zeit', description: 'Stylist und Termin auswählen' },
    { id: 3, title: 'Ihre Daten', description: 'Kontaktdaten bestätigen' },
    { id: 4, title: 'Bezahlung', description: 'Termin bezahlen und bestätigen' },
  ];

  useEffect(() => {
    loadInitialData();
  }, [salonId]);

  const loadInitialData = async () => {
    try {
      // Load salon data
      const salonData = await salonService.getSalonById(salonId);
      setSalon(salonData);

      // Load services
      const servicesData = await salonService.getSalonServices(salonId);
      setServices(servicesData || []);

      // Load stylists (placeholder)
      setStylists([
        {
          id: '1',
          name: 'Maria Schmidt',
          avatar: '/api/placeholder/60/60',
          specialties: ['Schnitt', 'Farbe'],
          rating: 4.9,
        },
        {
          id: '2',
          name: 'Thomas Weber', 
          avatar: '/api/placeholder/60/60',
          specialties: ['Herrenschnitt', 'Bart'],
          rating: 4.8,
        }
      ]);

    } catch (error) {
      console.error('Error loading booking data:', error);
      toast.error('Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async (selectedDate) => {
    if (!bookingData.service) return;
    
    try {
      const slots = await appointmentService.getAvailableSlots(
        salonId,
        bookingData.service.id,
        selectedDate,
        bookingData.stylist?.id
      );
      setAvailableSlots(slots.available_slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  };

  const selectService = (service) => {
    setBookingData(prev => ({ ...prev, service }));
    setCurrentStep(2);
  };

  const selectStylist = (stylist) => {
    setBookingData(prev => ({ ...prev, stylist }));
    if (bookingData.date) {
      loadAvailableSlots(bookingData.date);
    }
  };

  const selectDate = (date) => {
    setBookingData(prev => ({ ...prev, date, time: null }));
    loadAvailableSlots(date);
  };

  const selectTime = (time) => {
    setBookingData(prev => ({ ...prev, time }));
  };

  const goToNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return bookingData.service !== null;
      case 2:
        return bookingData.stylist !== null && bookingData.date !== null && bookingData.time !== null;
      case 3:
        return bookingData.customerInfo.firstName && 
               bookingData.customerInfo.lastName && 
               bookingData.customerInfo.email;
      case 4:
        return false; // Payment step
      default:
        return false;
    }
  };

  // Generate next 14 days for date selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Morgen';
    } else {
      return date.toLocaleDateString('de-DE', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/salon/${salon?.slug}`)}
            className="flex items-center text-secondary-600 hover:text-secondary-800 mb-4"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Zurück zu {salon?.name}
          </button>
          
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">
            Termin buchen
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            {salon?.name} - {salon?.address}, {salon?.city}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-medium
                      ${currentStep >= step.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                      }
                    `}
                  >
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-primary-600' : 'text-secondary-600 dark:text-secondary-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-secondary-200 dark:bg-secondary-700 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
                Wählen Sie Ihren Service
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => selectService(service)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${bookingData.service?.id === service.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-secondary-900 dark:text-white">
                        {service.name}
                      </h3>
                      <span className="text-lg font-bold text-primary-600">
                        €{service.price}
                      </span>
                    </div>
                    
                    <p className="text-secondary-600 dark:text-secondary-300 text-sm mb-3">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center text-secondary-500 text-sm">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {service.duration_minutes} Min
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Stylist & Time Selection */}
          {currentStep === 2 && (
            <div className="p-6 space-y-8">
              {/* Stylist Selection */}
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                  Stylist wählen (optional)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div
                    onClick={() => selectStylist(null)}
                    className={`
                      p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${bookingData.stylist === null
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300'
                      }
                    `}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-2">
                        <UserIcon className="w-6 h-6 text-secondary-500" />
                      </div>
                      <h3 className="font-medium text-secondary-900 dark:text-white">
                        Keine Präferenz
                      </h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        Bester verfügbarer Stylist
                      </p>
                    </div>
                  </div>
                  
                  {stylists.map((stylist) => (
                    <div
                      key={stylist.id}
                      onClick={() => selectStylist(stylist)}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${bookingData.stylist?.id === stylist.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={stylist.avatar}
                          alt={stylist.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-secondary-900 dark:text-white">
                            {stylist.name}
                          </h3>
                          <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                            <span className="text-yellow-500 mr-1">★</span>
                            {stylist.rating}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {stylist.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 text-xs rounded"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                  Datum wählen
                </h3>
                
                <div className="grid grid-cols-7 gap-2">
                  {generateDates().map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => selectDate(formatDate(date))}
                      className={`
                        p-3 text-center rounded-lg transition-all
                        ${bookingData.date === formatDate(date)
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-50 dark:bg-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-600'
                        }
                      `}
                    >
                      <div className="text-xs font-medium">
                        {formatDisplayDate(date)}
                      </div>
                      <div className="text-lg font-bold">
                        {date.getDate()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {bookingData.date && (
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                    Uhrzeit wählen
                  </h3>
                  
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                      {availableSlots.map((slot) => {
                        const timeOnly = new Date(slot).toLocaleTimeString('de-DE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        
                        return (
                          <button
                            key={slot}
                            onClick={() => selectTime(slot)}
                            className={`
                              p-2 text-sm font-medium rounded-lg transition-all
                              ${bookingData.time === slot
                                ? 'bg-primary-600 text-white'
                                : 'bg-secondary-50 dark:bg-secondary-700 hover:bg-secondary-100 dark:hover:bg-secondary-600'
                              }
                            `}
                          >
                            {timeOnly}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {bookingData.date ? 'Keine verfügbaren Termine für dieses Datum.' : 'Wählen Sie ein Datum aus.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Customer Information */}
          {currentStep === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
                Ihre Kontaktdaten
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="form-label">Vorname *</label>
                  <input
                    type="text"
                    value={bookingData.customerInfo.firstName}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, firstName: e.target.value }
                    }))}
                    className="form-input"
                    placeholder="Ihr Vorname"
                  />
                </div>
                
                <div>
                  <label className="form-label">Nachname *</label>
                  <input
                    type="text"
                    value={bookingData.customerInfo.lastName}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, lastName: e.target.value }
                    }))}
                    className="form-input"
                    placeholder="Ihr Nachname"
                  />
                </div>
                
                <div>
                  <label className="form-label">E-Mail-Adresse *</label>
                  <input
                    type="email"
                    value={bookingData.customerInfo.email}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, email: e.target.value }
                    }))}
                    className="form-input"
                    placeholder="ihre@email.com"
                  />
                </div>
                
                <div>
                  <label className="form-label">Telefonnummer</label>
                  <input
                    type="tel"
                    value={bookingData.customerInfo.phone}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      customerInfo: { ...prev.customerInfo, phone: e.target.value }
                    }))}
                    className="form-input"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="form-label">Besondere Wünsche (optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="form-textarea"
                  placeholder="Teilen Sie uns Ihre besonderen Wünsche mit..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
                Zahlung & Bestätigung
              </h2>
              
              {/* Booking Summary */}
              <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">
                  Terminübersicht
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Service:</span>
                    <span className="font-medium text-secondary-900 dark:text-white">
                      {bookingData.service?.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Stylist:</span>
                    <span className="font-medium text-secondary-900 dark:text-white">
                      {bookingData.stylist?.name || 'Bester verfügbarer Stylist'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Datum & Zeit:</span>
                    <span className="font-medium text-secondary-900 dark:text-white">
                      {bookingData.date && bookingData.time && 
                        new Date(bookingData.time).toLocaleString('de-DE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-secondary-600 dark:text-secondary-400">Dauer:</span>
                    <span className="font-medium text-secondary-900 dark:text-white">
                      {bookingData.service?.duration_minutes} Minuten
                    </span>
                  </div>
                  
                  <div className="border-t border-secondary-200 dark:border-secondary-600 pt-3 mt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-secondary-900 dark:text-white">Gesamt:</span>
                      <span className="font-bold text-primary-600">
                        €{bookingData.service?.price}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Form */}
              <Elements stripe={stripePromise}>
                <PaymentForm bookingData={bookingData} salon={salon} />
              </Elements>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-secondary-50 dark:bg-secondary-700 border-t border-secondary-200 dark:border-secondary-600">
            <div className="flex justify-between">
              <button
                onClick={goToPrevStep}
                disabled={currentStep === 1}
                className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Zurück
              </button>
              
              {currentStep < 4 && (
                <button
                  onClick={goToNextStep}
                  disabled={!canProceedToNext()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter
                  <ChevronRightIcon className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ bookingData, salon }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    
    try {
      // Create appointment first
      const appointmentData = {
        salon_id: salon.id,
        service_id: bookingData.service.id,
        stylist_id: bookingData.stylist?.id,
        appointment_date: bookingData.time,
        notes: bookingData.notes,
        customer_email: bookingData.customerInfo.email,
        customer_name: `${bookingData.customerInfo.firstName} ${bookingData.customerInfo.lastName}`,
        customer_phone: bookingData.customerInfo.phone,
      };
      
      const appointment = await appointmentService.createAppointment(appointmentData);
      
      // Create payment intent
      const { client_secret } = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointment.id }),
      }).then(res => res.json());
      
      // Confirm payment
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${bookingData.customerInfo.firstName} ${bookingData.customerInfo.lastName}`,
            email: bookingData.customerInfo.email,
          },
        }
      });
      
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Termin erfolgreich gebucht!');
        navigate('/appointments');
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="form-label">Zahlungsinformationen</label>
        <div className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <LoadingSpinner size="sm" color="white" />
            <span className="ml-2">Zahlung wird verarbeitet...</span>
          </div>
        ) : (
          <>
            <CreditCardIcon className="w-6 h-6 mr-2 inline" />
            Jetzt €{bookingData.service?.price} bezahlen
          </>
        )}
      </button>
      
      <p className="text-xs text-secondary-500 dark:text-secondary-400 text-center mt-4">
        Ihre Zahlung wird sicher über Stripe verarbeitet. 
        Nach der Bestätigung erhalten Sie eine E-Mail mit allen Details.
      </p>
    </form>
  );
};

export default BookingPage;