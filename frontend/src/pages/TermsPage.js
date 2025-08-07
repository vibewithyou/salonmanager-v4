import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <DocumentTextIcon className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Allgemeine <span className="text-gradient-gold">Geschäftsbedingungen</span>
          </h1>
          <p className="text-gray-400">
            Gültig ab: 1. Januar 2024
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Geltungsbereich</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der 
                BarberManager-Plattform, einer Online-Buchungsplattform für Barbershops und 
                Beauty-Services.
              </p>
              <p>
                BarberManager wird betrieben von [Firmenname], [Adresse], Deutschland.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Leistungsbeschreibung</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                BarberManager vermittelt über eine Online-Plattform Termine zwischen Kunden 
                und registrierten Barbershops. Die Plattform ermöglicht:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Online-Terminbuchungen bei Partnerbarbershops</li>
                <li>Verwaltung von Kundenprofilen und Terminen</li>
                <li>Bewertungs- und Kommunikationssystem</li>
                <li>Online-Zahlungsabwicklung</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Registrierung und Nutzerkonto</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Für die Nutzung bestimmter Funktionen ist eine kostenlose Registrierung 
                erforderlich. Bei der Registrierung sind vollständige und wahrheitsgemäße 
                Angaben zu machen.
              </p>
              <p>
                Der Nutzer ist verpflichtet, seine Zugangsdaten geheim zu halten und bei 
                Verdacht auf Missbrauch unverzüglich zu ändern.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Terminbuchungen</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Durch die Buchung eines Termins kommt ein Vertrag zwischen dem Kunden und 
                dem jeweiligen Barbershop zustande. BarberManager fungiert als Vermittler.
              </p>
              <p>
                <strong className="text-white">Stornierungen:</strong> Termine können bis 24 Stunden 
                vor dem gebuchten Zeitpunkt kostenfrei storniert werden. Bei späteren 
                Stornierungen können Kosten entstehen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Zahlungen</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Die Zahlung der Dienstleistungen erfolgt wahlweise vor Ort im Barbershop 
                oder online über die verfügbaren Zahlungsmethoden (Kreditkarte, SEPA, etc.).
              </p>
              <p>
                Bei Online-Zahlungen wird eine sichere Verbindung über unsere 
                Zahlungsdienstleister verwendet.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Haftung</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                BarberManager haftet nicht für die Qualität der Dienstleistungen der 
                Partnerbarbershops. Beschwerden sind direkt mit dem jeweiligen Barbershop 
                zu klären.
              </p>
              <p>
                Die Haftung von BarberManager beschränkt sich auf Vorsatz und grobe 
                Fahrlässigkeit, soweit gesetzlich zulässig.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Datenschutz</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer 
                Datenschutzerklärung und den geltenden Datenschutzbestimmungen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Änderungen der AGB</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                BarberManager behält sich vor, diese AGB jederzeit zu ändern. 
                Nutzer werden über Änderungen rechtzeitig informiert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Schlussbestimmungen</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Es gilt deutsches Recht. Gerichtsstand ist Berlin, Deutschland.
              </p>
              <p>
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein, berührt dies 
                die Wirksamkeit der übrigen Bestimmungen nicht.
              </p>
            </div>
          </section>

          <div className="border-t border-gray-700 pt-6 mt-8">
            <p className="text-gray-400 text-sm">
              Letzte Aktualisierung: 1. Januar 2024
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Bei Fragen zu diesen AGB können Sie uns unter info@barbermanager.de kontaktieren.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;