import React, { useState } from 'react';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'support'
  });
  const [loading, setLoading] = useState(false);

  const contactTypes = [
    { value: 'support', label: 'Support & Hilfe' },
    { value: 'business', label: 'Geschäftliche Anfrage' },
    { value: 'partnership', label: 'Partnerschaft' },
    { value: 'press', label: 'Presse & Medien' },
    { value: 'other', label: 'Sonstiges' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Hier würde normalerweise der API-Call stehen
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Nachricht erfolgreich gesendet! Wir melden uns bald bei Ihnen.');
      setFormData({ name: '', email: '', subject: '', message: '', type: 'support' });
    } catch (error) {
      toast.error('Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Telefon',
      details: '+49 (0) 30 12345678',
      subtitle: 'Mo-Fr 9:00-18:00 Uhr'
    },
    {
      icon: EnvelopeIcon,
      title: 'E-Mail',
      details: 'support@barbermanager.de',
      subtitle: 'Antwort innerhalb von 24h'
    },
    {
      icon: MapPinIcon,
      title: 'Adresse',
      details: 'Musterstraße 123, 12345 Berlin',
      subtitle: 'Deutschland'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      details: 'Sofortiger Support',
      subtitle: 'Mo-Fr 9:00-18:00 Uhr'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="text-gradient-gold">Kontakt</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Haben Sie Fragen oder benötigen Unterstützung? Wir sind für Sie da!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-bold text-white mb-8">
              Wir sind für Sie <span className="text-gradient-gold">da</span>
            </h2>
            
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="card p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-yellow-500 font-medium">
                        {info.details}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {info.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business Hours */}
            <div className="card p-6 mt-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Öffnungszeiten
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Montag - Freitag:</span>
                      <span className="text-white">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Samstag:</span>
                      <span className="text-white">10:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sonntag:</span>
                      <span className="text-gray-500">Geschlossen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h2 className="text-3xl font-bold text-white mb-8">
                Schreiben Sie uns eine <span className="text-gradient-gold">Nachricht</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ihr Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Max Mustermann"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="max@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Anliegen
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {contactTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Betreff *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Ihr Anliegen in wenigen Worten"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nachricht *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    placeholder="Beschreiben Sie Ihr Anliegen detailliert..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 text-lg font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner w-6 h-6 mr-3"></div>
                      Wird gesendet...
                    </div>
                  ) : (
                    'NACHRICHT SENDEN'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              Häufig gestellte <span className="text-gradient-gold">Fragen</span>
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Wie kann ich einen Termin buchen?
              </h3>
              <p className="text-gray-400">
                Wählen Sie einfach einen Barbershop aus, wählen Sie Ihren gewünschten Service 
                und buchen Sie online Ihren Termin. Es ist schnell und einfach!
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Kann ich meinen Termin stornieren?
              </h3>
              <p className="text-gray-400">
                Ja, Sie können Ihren Termin bis zu 24 Stunden vor dem geplanten Zeitpunkt 
                kostenlos stornieren.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Wie werde ich Barbershop-Partner?
              </h3>
              <p className="text-gray-400">
                Kontaktieren Sie uns über das Formular oder direkt per E-Mail. 
                Wir besprechen gerne die Möglichkeiten einer Partnerschaft.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;