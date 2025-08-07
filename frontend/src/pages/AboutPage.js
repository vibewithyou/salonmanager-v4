import React from 'react';
import { Link } from 'react-router-dom';
import { ScissorsIcon, UserGroupIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/outline';

const AboutPage = () => {
  const team = [
    {
      name: "Max Mustermann",
      role: "CEO & Gründer",
      image: "/api/placeholder/150/150",
      description: "15 Jahre Erfahrung in der Beauty-Branche"
    },
    {
      name: "Anna Schmidt",
      role: "CTO",
      image: "/api/placeholder/150/150", 
      description: "Tech-Expertin mit Fokus auf User Experience"
    },
    {
      name: "Tom Weber",
      role: "Head of Design",
      image: "/api/placeholder/150/150",
      description: "Kreativdirektor mit Leidenschaft für Barbershops"
    }
  ];

  const stats = [
    { icon: UserGroupIcon, number: "10.000+", label: "Zufriedene Kunden" },
    { icon: ScissorsIcon, number: "500+", label: "Partner Barbershops" },
    { icon: StarIcon, number: "4.9/5", label: "Durchschnittsbewertung" },
    { icon: TrophyIcon, number: "50+", label: "Städte abgedeckt" },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              Über <span className="text-gradient-gold">BarberManager</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Wir revolutionieren die Art, wie Barbershops und Kunden miteinander interagieren - 
              durch modernste Technologie und leidenschaftlichen Service.
            </p>
            <Link to="/register" className="btn-primary px-8 py-4 rounded-lg font-bold text-lg">
              JETZT KOSTENLOS STARTEN
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Unsere <span className="text-gradient-gold">Mission</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Wir glauben, dass jeder Mann das Recht auf erstklassige Barbier-Services hat. 
                Deshalb haben wir BarberManager entwickelt - eine Plattform, die Barbershops 
                und Kunden auf eine völlig neue Art verbindet.
              </p>
              <p className="text-gray-300 text-lg mb-8">
                Von der einfachen Online-Buchung bis hin zu personalisierten Empfehlungen - 
                wir machen das Barbershop-Erlebnis digital und trotzdem persönlich.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">2019</div>
                  <div className="text-gray-400">Gegründet</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">25+</div>
                  <div className="text-gray-400">Team Mitglieder</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/api/placeholder/600/400"
                alt="BarberManager Team"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Zahlen, die für sich <span className="text-gradient-gold">sprechen</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Seit unserer Gründung haben wir Tausende von Barbershops und Kunden zusammengebracht
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-black" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-yellow-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Unser <span className="text-gradient-gold">Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Leidenschaftliche Experten, die täglich daran arbeiten, BarberManager zu verbessern
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="card text-center p-8 hover-lift">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-yellow-500"
                />
                <h3 className="text-xl font-bold text-white mb-2">
                  {member.name}
                </h3>
                <div className="text-yellow-500 font-semibold mb-4">
                  {member.role}
                </div>
                <p className="text-gray-400">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Unsere <span className="text-gradient-gold">Werte</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ScissorsIcon className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Handwerkskunst</h3>
              <p className="text-gray-400">
                Wir respektieren und fördern die traditionelle Barbier-Kunst durch moderne Technologie.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserGroupIcon className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Gemeinschaft</h3>
              <p className="text-gray-400">
                Wir verbinden Barbershops und Kunden zu einer starken, wachsenden Community.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <StarIcon className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Exzellenz</h3>
              <p className="text-gray-400">
                Wir streben in allem was wir tun nach höchster Qualität und Kundenzufriedenheit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Bereit, Teil unserer Story zu werden?
          </h2>
          <p className="text-xl text-gray-800 mb-8">
            Schließe dich tausenden zufriedenen Kunden und Barbershops an.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-black text-yellow-500 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition-all duration-200"
            >
              ALS KUNDE REGISTRIEREN
            </Link>
            <Link
              to="/for-salons"
              className="bg-transparent border-2 border-black text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-black hover:text-yellow-500 transition-all duration-200"
            >
              BARBERSHOP ANMELDEN
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;