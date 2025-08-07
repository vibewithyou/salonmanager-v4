import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
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
      href: 'https://facebook.com/salonmanager',
      icon: FacebookIcon,
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/salonmanager',
      icon: InstagramIcon,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/salonmanager',
      icon: TwitterIcon,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/salonmanager',
      icon: LinkedInIcon,
    },
  ];

  return (
    <footer className="bg-secondary-900 text-secondary-300">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-white font-bold text-xl">SalonManager</span>
            </Link>
            
            <p className="text-secondary-400 mb-6 max-w-md">
              Die moderne Lösung für Salons und Kunden. Vereinfache Terminbuchungen, 
              verwalte dein Business und biete deinen Kunden die beste Erfahrung.
            </p>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-secondary-500" />
                <span className="text-sm">Musterstraße 123, 12345 Berlin</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-secondary-500" />
                <span className="text-sm">+49 (0) 30 12345678</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-secondary-500" />
                <span className="text-sm">info@salonmanager.de</span>
              </div>
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h3 className="text-white font-semibold mb-4">Unternehmen</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-12 pt-8 border-t border-secondary-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h3 className="text-white font-semibold text-lg mb-2">
                Newsletter abonnieren
              </h3>
              <p className="text-secondary-400 max-w-md">
                Bleibe auf dem Laufenden über neue Features, Tipps und 
                exklusive Angebote für Salons.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <form className="flex space-x-3">
                <input
                  type="email"
                  placeholder="Deine E-Mail-Adresse"
                  className="px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
                >
                  Abonnieren
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-secondary-800 border-t border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Copyright */}
            <div className="flex items-center space-x-1 mb-4 md:mb-0">
              <span className="text-sm text-secondary-400">
                © {currentYear} SalonManager. Alle Rechte vorbehalten.
              </span>
              <span className="text-sm text-secondary-400">
                Made with
              </span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span className="text-sm text-secondary-400">
                in Deutschland
              </span>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-400">Folge uns:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div className="mt-4 pt-4 border-t border-secondary-700">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-400">Sprache:</span>
              <select className="bg-secondary-700 border border-secondary-600 rounded px-2 py-1 text-sm text-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
                <option value="tr">Türkçe</option>
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;