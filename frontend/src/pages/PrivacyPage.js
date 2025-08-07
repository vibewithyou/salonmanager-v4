import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="text-gradient-gold">Datenschutz</span>erklärung
          </h1>
          <p className="text-gray-400">
            Gültig ab: 1. Januar 2024
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Verantwortlicher</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Verantwortlicher für die Datenverarbeitung ist:
              </p>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p>[Firmenname]</p>
                <p>[Straße und Hausnummer]</p>
                <p>[PLZ und Ort]</p>
                <p>Deutschland</p>
                <p>E-Mail: datenschutz@barbermanager.de</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <div className="text-gray-300 space-y-4">
              <h3 className="text-xl font-semibold text-white">2.1 Registrierung</h3>
              <p>
                Bei der Registrierung auf unserer Plattform erheben wir folgende Daten:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vor- und Nachname</li>
                <li>E-Mail-Adresse</li>
                <li>Telefonnummer (optional)</li>
                <li>Passwort (verschlüsselt gespeichert)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-white mt-6">2.2 Terminbuchungen</h3>
              <p>
                Bei der Buchung von Terminen verarbeiten wir zusätzlich:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Termindetails (Datum, Uhrzeit, Service)</li>
                <li>Zahlungsinformationen</li>
                <li>Kommunikation mit Barbershops</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Zweck der Datenverarbeitung</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Wir verarbeiten Ihre personenbezogenen Daten für folgende Zwecke:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bereitstellung und Verbesserung unserer Dienstleistungen</li>
                <li>Terminvermittlung zwischen Kunden und Barbershops</li>
                <li>Zahlungsabwicklung</li>
                <li>Kommunikation mit Nutzern</li>
                <li>Kundenservice und Support</li>
                <li>Rechtliche Verpflichtungen</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Rechtsgrundlage</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Die Verarbeitung erfolgt auf Basis folgender Rechtsgrundlagen:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung</li>
                <li><strong className="text-white">Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen</li>
                <li><strong className="text-white">Art. 6 Abs. 1 lit. c DSGVO:</strong> Rechtliche Verpflichtungen</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Datenweitergabe</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Eine Weitergabe Ihrer Daten erfolgt nur in folgenden Fällen:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>An Partnerbarbershops zur Terminabwicklung</li>
                <li>An Zahlungsdienstleister für die Zahlungsabwicklung</li>
                <li>An IT-Dienstleister unter Datenschutz-Vereinbarungen</li>
                <li>Zur Erfüllung gesetzlicher Verpflichtungen</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Speicherdauer</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Wir speichern Ihre Daten nur so lange, wie es für die Zwecke erforderlich ist:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Kontodaten: Bis zur Löschung des Accounts</li>
                <li>Terminhistorie: 3 Jahre nach dem letzten Termin</li>
                <li>Zahlungsdaten: Gemäß steuerrechtlichen Aufbewahrungsfristen</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Ihre Rechte</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-white">Auskunftsrecht (Art. 15 DSGVO):</strong> Information über verarbeitete Daten</li>
                <li><strong className="text-white">Berichtigungsrecht (Art. 16 DSGVO):</strong> Korrektur falscher Daten</li>
                <li><strong className="text-white">Löschungsrecht (Art. 17 DSGVO):</strong> Löschung unter bestimmten Voraussetzungen</li>
                <li><strong className="text-white">Einschränkungsrecht (Art. 18 DSGVO):</strong> Einschränkung der Verarbeitung</li>
                <li><strong className="text-white">Datenübertragbarkeit (Art. 20 DSGVO):</strong> Übertragung Ihrer Daten</li>
                <li><strong className="text-white">Widerspruchsrecht (Art. 21 DSGVO):</strong> Widerspruch gegen Verarbeitung</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Cookies und Tracking</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Unsere Website verwendet Cookies für:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Technische Funktionalität der Website</li>
                <li>Benutzeranmeldung und Sitzungsverwaltung</li>
                <li>Analyse der Website-Nutzung (Google Analytics)</li>
                <li>Verbesserung der Nutzererfahrung</li>
              </ul>
              <p>
                Sie können Cookies in Ihren Browsereinstellungen deaktivieren.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Datensicherheit</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten 
                vor unbefugtem Zugriff, Verlust oder Missbrauch zu schützen:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL-Verschlüsselung für alle Datenübertragungen</li>
                <li>Regelmäßige Sicherheitsupdates</li>
                <li>Zugriffskontrolle und Berechtigungskonzepte</li>
                <li>Regelmäßige Backups</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Kontakt und Beschwerden</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Bei Fragen zum Datenschutz kontaktieren Sie uns unter:
              </p>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p>E-Mail: datenschutz@barbermanager.de</p>
                <p>Telefon: +49 (0) 30 12345678</p>
              </div>
              <p>
                Sie haben das Recht, sich bei der zuständigen Datenschutzbehörde zu beschweren.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-6 mt-8">
            <p className="text-gray-400 text-sm">
              Letzte Aktualisierung: 1. Januar 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;