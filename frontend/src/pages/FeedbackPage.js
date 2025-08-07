import React, { useState } from 'react';
import { StarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    rating: 0,
    category: 'general',
    title: '',
    message: '',
    email: '',
    anonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const categories = [
    { value: 'general', label: 'Allgemeines Feedback' },
    { value: 'booking', label: 'Buchungsprozess' },
    { value: 'salon', label: 'Barbershop-Erfahrung' },
    { value: 'app', label: 'App-Funktionen' },
    { value: 'support', label: 'Kundenservice' },
    { value: 'suggestion', label: 'Verbesserungsvorschlag' },
    { value: 'bug', label: 'Fehler melden' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast.error('Bitte geben Sie eine Bewertung ab');
      return;
    }
    
    setLoading(true);
    
    try {
      // Hier würde der API-Call stehen
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Vielen Dank für Ihr Feedback! Wir schätzen Ihre Meinung sehr.');
      setFormData({
        rating: 0,
        category: 'general',
        title: '',
        message: '',
        email: '',
        anonymous: false
      });
    } catch (error) {
      toast.error('Fehler beim Senden des Feedbacks. Bitte versuchen Sie es erneut.');
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
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Ihr <span className="text-gradient-gold">Feedback</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ihre Meinung ist uns wichtig! Helfen Sie uns, BarberManager zu verbessern.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Feedback Form */}
        <div className="card p-8 mb-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Section */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Wie bewerten Sie Ihre Erfahrung mit BarberManager?
              </h2>
              <div className="flex justify-center items-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    {star <= (hoveredStar || formData.rating) ? (
                      <StarSolidIcon className="w-12 h-12 text-yellow-500" />
                    ) : (
                      <StarIcon className="w-12 h-12 text-gray-600 hover:text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-gray-400">
                  Sie haben {formData.rating} von 5 Sternen vergeben
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Kategorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Betreff (optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Kurze Zusammenfassung Ihres Feedbacks"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ihr Feedback *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                placeholder="Teilen Sie uns Ihre Gedanken, Vorschläge oder Erfahrungen mit..."
              />
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail-Adresse (optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="ihre@email.de"
              />
              <p className="text-sm text-gray-400 mt-2">
                Nur erforderlich, wenn Sie eine Rückmeldung wünschen
              </p>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                className="mr-3 text-yellow-500 bg-transparent border-gray-600 rounded focus:ring-yellow-500"
              />
              <label htmlFor="anonymous" className="text-gray-300">
                Feedback anonym senden
              </label>
            </div>

            {/* Submit Button */}
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
                'FEEDBACK SENDEN'
              )}
            </button>
          </form>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Warum ist Ihr Feedback wichtig?
            </h3>
            <ul className="text-gray-400 space-y-3">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Hilft uns, BarberManager kontinuierlich zu verbessern
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Ermöglicht bessere Features und Funktionen
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Verbessert das Erlebnis für alle Nutzer
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Was passiert mit Ihrem Feedback?
            </h3>
            <ul className="text-gray-400 space-y-3">
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Wird direkt an unser Entwicklungsteam weitergeleitet
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Fließt in unsere Produktplanung ein
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                Wird vertraulich und sicher behandelt
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;