import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedInIcon,
} from './SocialIcons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'Über uns', href: '/about' },
      { name: 'Karriere', href: '/careers' },
      { name: 'Presse', href: '/press' },
      { name: 'Blog', href: '/blog' },
    ],
    services: [
      { name: 'Salonsuche', href: '/salons' },
      { name: 'Terminbuchung', href: '/booking' },
      { name: 'Für Salons', href: '/for-salons' },
      { name: 'API', href: '/api' },
    ],
    support: [
      { name: 'Hilfe-Center', href: '/help' },
      { name: 'Kontakt', href: '/contact' },
      { name: 'Status', href: '/status' },
      { name: 'Feedback', href: '/feedback' },
    ],
    legal: [
      { name: 'Datenschutz', href: '/privacy' },
      { name: 'AGB', href: '/terms' },
      { name: 'Impressum', href: '/legal' },
      { name: 'Cookies', href: '/cookies' },
    ],
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/barbermanager',
      icon: FacebookIcon,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/barbermanager',
      icon: InstagramIcon,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/barbermanager',
      icon: TwitterIcon,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/barbermanager',
      icon: LinkedInIcon,
    },
  ];

  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <ScissorsIcon className="w-6 h-6 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl tracking-tight">BarberManager</span>
                <span className="text-yellow-500 text-xs font-medium uppercase tracking-widest">Premium</span>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-8 max-w-md text-lg">
              Die moderne Lösung für Premium Barbershops und anspruchsvolle Kunden. 
              Vereinfache Terminbuchungen und biete erstklassigen Service.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-300">Musterstraße 123, 12345 Berlin</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-300">+49 (0) 30 12345678</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-300">info@barbermanager.de</span>
              </div>
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Unternehmen</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Rechtliches</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-16 pt-12 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0">
              <h3 className="text-white font-bold text-2xl mb-3">
                Newsletter <span className="text-gradient-gold">abonnieren</span>
              </h3>
              <p className="text-gray-400 max-w-md text-lg">
                Bleibe auf dem Laufenden über neue Features, Barbershop-Tipps und 
                exklusive Angebote für Premium-Services.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <form className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Deine E-Mail-Adresse"
                  className="px-6 py-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent w-80"
                />
                <button
                  type="submit"
                  className="btn-primary px-8 py-4 rounded-lg font-bold"
                >
                  ABONNIEREN
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Copyright */}
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <span className="text-gray-400">
                © {currentYear} BarberManager. Alle Rechte vorbehalten.
              </span>
              <span className="text-gray-400">
                Made with
              </span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span className="text-gray-400">
                in Deutschland
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 font-medium">Folge uns:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 transform hover:scale-110"
                  aria-label={social.name}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 font-medium">Sprache:</span>
              <select className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option value="de">🇩🇪 Deutsch</option>
                <option value="en">🇺🇸 English</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="it">🇮🇹 Italiano</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="ar">🇸🇦 العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;