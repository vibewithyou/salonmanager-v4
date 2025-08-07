import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    agreeToTerms: false,
    agreeToNewsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'customer', label: 'Kunde', description: 'Ich möchte Termine buchen' },
    { value: 'salon_owner', label: 'Salon-Inhaber', description: 'Ich betreibe einen Salon' },
    { value: 'stylist', label: 'Stylist', description: 'Ich arbeite in einem Salon' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Vorname ist erforderlich';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nachname ist erforderlich';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }

    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Passwort muss mindestens 8 Zeichen lang sein';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Du musst den AGB zustimmen';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password,
        role: formData.role,
      };

      await register(userData);
      navigate('/login', { 
        state: { message: 'Registrierung erfolgreich! Bitte melden Sie sich an.' }
      });
    } catch (error) {
      if (error.detail) {
        toast.error(error.detail);
      } else {
        toast.error('Registrierung fehlgeschlagen');
      }
      
      if (error.detail && error.detail.includes('already exists')) {
        setErrors({ email: 'Diese E-Mail-Adresse ist bereits registriert' });
      } else {
        setErrors({ general: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, label: '' };
    
    let score = 0;
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    
    score = checks.filter(Boolean).length;
    
    const levels = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Sehr schwach', color: 'bg-red-500' },
      { strength: 2, label: 'Schwach', color: 'bg-orange-500' },
      { strength: 3, label: 'Mittel', color: 'bg-yellow-500' },
      { strength: 4, label: 'Stark', color: 'bg-green-500' },
      { strength: 5, label: 'Sehr stark', color: 'bg-green-600' },
    ];
    
    return levels[score];
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="card-body">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold text-secondary-900 dark:text-white">
                  SalonManager
                </span>
              </Link>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
                Neues Konto erstellen
              </h2>
              <p className="mt-2 text-secondary-600 dark:text-secondary-400">
                Oder{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  bei vorhandenem Konto anmelden
                </Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="error-container">
                  <p className="error-message">{errors.general}</p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="form-label">Ich bin ein:</label>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`
                        relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${formData.role === role.value 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20' 
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-300 dark:hover:border-secondary-600'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div
                            className={`
                              w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center
                              ${formData.role === role.value 
                                ? 'border-primary-500 bg-primary-500' 
                                : 'border-secondary-300'
                              }
                            `}
                          >
                            {formData.role === role.value && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="font-medium text-secondary-900 dark:text-white">
                            {role.label}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400 ml-7">
                          {role.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="form-label">
                    Vorname *
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`form-input ${errors.first_name ? 'border-red-300' : ''}`}
                    placeholder="Max"
                  />
                  {errors.first_name && (
                    <p className="form-error">{errors.first_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="form-label">
                    Nachname *
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`form-input ${errors.last_name ? 'border-red-300' : ''}`}
                    placeholder="Mustermann"
                  />
                  {errors.last_name && (
                    <p className="form-error">{errors.last_name}</p>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div>
                <label htmlFor="email" className="form-label">
                  E-Mail-Adresse *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="max@example.com"
                />
                {errors.email && (
                  <p className="form-error">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="form-label">
                  Telefonnummer (optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+49 123 456789"
                />
              </div>

              {/* Password Fields */}
              <div>
                <label htmlFor="password" className="form-label">
                  Passwort *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input pr-10 ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="Mindestens 8 Zeichen"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`
                            h-1 flex-1 rounded-full
                            ${level <= strength.strength 
                              ? strength.color 
                              : 'bg-secondary-200 dark:bg-secondary-700'
                            }
                          `}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400">
                      Passwortstärke: {strength.label}
                    </p>
                  </div>
                )}
                
                {errors.password && (
                  <p className="form-error">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Passwort bestätigen *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    placeholder="Passwort wiederholen"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-400 hover:text-secondary-600"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`
                      h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded mt-0.5
                      ${errors.agreeToTerms ? 'border-red-300' : ''}
                    `}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-secondary-900 dark:text-secondary-300">
                    Ich stimme den{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                      Allgemeinen Geschäftsbedingungen
                    </Link>{' '}
                    und der{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                      Datenschutzerklärung
                    </Link>{' '}
                    zu *
                  </label>
                </div>
                {errors.agreeToTerms && (
                  <p className="form-error">{errors.agreeToTerms}</p>
                )}

                <div className="flex items-start">
                  <input
                    id="agreeToNewsletter"
                    name="agreeToNewsletter"
                    type="checkbox"
                    checked={formData.agreeToNewsletter}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded mt-0.5"
                  />
                  <label htmlFor="agreeToNewsletter" className="ml-2 block text-sm text-secondary-900 dark:text-secondary-300">
                    Ich möchte den Newsletter mit Tipps, News und Angeboten erhalten (optional)
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading-spinner mr-2"></div>
                      Registrierung läuft...
                    </div>
                  ) : (
                    'Konto erstellen'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-secondary-600 dark:text-secondary-400">
          <p>
            Mit der Registrierung stimmst du unseren{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              AGB
            </Link>{' '}
            und der{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              Datenschutzerklärung
            </Link>{' '}
            zu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;