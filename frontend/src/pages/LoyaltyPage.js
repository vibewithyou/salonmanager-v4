import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import {
  GiftIcon,
  SparklesIcon,
  CalendarIcon,
  CreditCardIcon,
  TrophyIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const LoyaltyPage = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    visits: 0,
    spent: 0,
    level: 'Bronze',
    nextLevel: 'Silver',
    pointsToNextLevel: 100,
    availableRewards: [],
    history: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const levels = [
    { name: 'Bronze', pointsRequired: 0, color: 'text-orange-600', benefits: ['5% Bonus-Punkte', 'Geburtstags-Rabatt'] },
    { name: 'Silver', pointsRequired: 200, color: 'text-gray-400', benefits: ['10% Bonus-Punkte', 'Prioritäts-Buchung', 'Kostenlose Getränke'] },
    { name: 'Gold', pointsRequired: 500, color: 'text-yellow-500', benefits: ['15% Bonus-Punkte', 'VIP-Bereich', 'Kostenlose Upgrades'] },
    { name: 'Platinum', pointsRequired: 1000, color: 'text-blue-400', benefits: ['20% Bonus-Punkte', 'Persönlicher Berater', 'Exklusive Events'] },
    { name: 'Diamond', pointsRequired: 2000, color: 'text-purple-400', benefits: ['25% Bonus-Punkte', 'Premium-Services', 'Jahres-Geschenk'] },
  ];

  const rewards = [
    { id: 1, name: '5€ Rabatt', description: 'Für deinen nächsten Termin', points: 50, type: 'discount', icon: CreditCardIcon },
    { id: 2, name: 'Kostenloses Shampoo', description: 'Premium-Haarpflege', points: 80, type: 'service', icon: SparklesIcon },
    { id: 3, name: '10€ Rabatt', description: 'Für Termine ab 30€', points: 100, type: 'discount', icon: CreditCardIcon },
    { id: 4, name: 'Gratis Bart-Styling', description: 'Professionelle Bartpflege', points: 120, type: 'service', icon: SparklesIcon },
    { id: 5, name: '20€ Rabatt', description: 'Für Premium-Services', points: 200, type: 'discount', icon: CreditCardIcon },
    { id: 6, name: 'VIP-Behandlung', description: 'Exklusiver Service', points: 300, type: 'experience', icon: TrophyIcon },
    { id: 7, name: 'Freund einladen', description: 'Beide erhalten 50 Punkte', points: 0, type: 'referral', icon: GiftIcon },
    { id: 8, name: '50€ Wertgutschein', description: 'Für alle Services', points: 500, type: 'voucher', icon: GiftIcon },
  ];

  const achievements = [
    { id: 1, name: 'Erste Schritte', description: 'Ersten Termin gebucht', icon: CheckCircleIcon, unlocked: true },
    { id: 2, name: 'Stammkunde', description: '5 Termine gebucht', icon: CalendarIcon, unlocked: true },
    { id: 3, name: 'Treuer Kunde', description: '10 Termine gebucht', icon: StarIcon, unlocked: false, progress: 7 },
    { id: 4, name: 'VIP', description: '25 Termine gebucht', icon: TrophyIcon, unlocked: false, progress: 7 },
    { id: 5, name: 'Punktesammler', description: '500 Punkte gesammelt', icon: SparklesIcon, unlocked: false, progress: 350 },
    { id: 6, name: 'Empfehlungsgeber', description: '3 Freunde eingeladen', icon: GiftIcon, unlocked: false, progress: 1 },
  ];

  useEffect(() => {
    loadLoyaltyData();
  }, []);

  const loadLoyaltyData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLoyaltyData({
        points: 175,
        visits: 7,
        spent: 350,
        level: 'Bronze',
        nextLevel: 'Silver',
        pointsToNextLevel: 25,
        availableRewards: rewards,
        history: [
          { id: 1, type: 'earned', points: 25, description: 'Termin bei Mustermann Barbershop', date: '2024-01-15' },
          { id: 2, type: 'redeemed', points: -50, description: '5€ Rabatt eingelöst', date: '2024-01-10' },
          { id: 3, type: 'earned', points: 30, description: 'Termin bei Elite Cuts', date: '2024-01-05' },
          { id: 4, type: 'bonus', points: 20, description: 'Bewertung geschrieben', date: '2024-01-01' },
          { id: 5, type: 'earned', points: 25, description: 'Termin bei Gentleman\'s Choice', date: '2023-12-28' },
        ],
        achievements: achievements
      });
    } catch (error) {
      console.error('Error loading loyalty data:', error);
      toast.error('Fehler beim Laden der Treuekarten-Daten');
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (reward) => {
    if (loyaltyData.points < reward.points) {
      toast.error('Nicht genügend Punkte verfügbar');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoyaltyData(prev => ({
        ...prev,
        points: prev.points - reward.points,
        history: [
          {
            id: Date.now(),
            type: 'redeemed',
            points: -reward.points,
            description: `${reward.name} eingelöst`,
            date: new Date().toISOString().split('T')[0]
          },
          ...prev.history
        ]
      }));
      
      toast.success(`${reward.name} erfolgreich eingelöst!`);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Fehler beim Einlösen der Belohnung');
    }
  };

  const getCurrentLevel = () => {
    return levels.find(level => loyaltyData.points >= level.pointsRequired) || levels[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const currentIndex = levels.findIndex(level => level.name === currentLevel.name);
    return levels[currentIndex + 1] || null;
  };

  const getProgressPercentage = () => {
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;
    
    const currentLevel = getCurrentLevel();
    const progress = loyaltyData.points - currentLevel.pointsRequired;
    const total = nextLevel.pointsRequired - currentLevel.pointsRequired;
    
    return Math.min((progress / total) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrophyIcon className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Deine <span className="text-gradient-gold">Treuekarte</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Sammle Punkte und sichere dir exklusive Belohnungen
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-6 h-6 text-black" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{loyaltyData.points}</div>
            <div className="text-gray-400">Punkte</div>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{loyaltyData.visits}</div>
            <div className="text-gray-400">Besuche</div>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{loyaltyData.spent}€</div>
            <div className="text-gray-400">Ausgegeben</div>
          </div>

          <div className="card p-6 text-center">
            <div className={`w-12 h-12 ${currentLevel.color.replace('text-', 'bg-')} bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <TrophyIcon className={`w-6 h-6 ${currentLevel.color}`} />
            </div>
            <div className={`text-3xl font-bold mb-1 ${currentLevel.color}`}>{currentLevel.name}</div>
            <div className="text-gray-400">Status</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Status <span className="text-gradient-gold">Fortschritt</span>
          </h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold ${currentLevel.color}`}>{currentLevel.name}</span>
              {nextLevel && <span className={`font-semibold ${nextLevel.color}`}>{nextLevel.name}</span>}
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            
            {nextLevel ? (
              <p className="text-gray-400 text-center">
                Noch <span className="text-yellow-500 font-semibold">{nextLevel.pointsRequired - loyaltyData.points} Punkte</span> bis zum {nextLevel.name} Status
              </p>
            ) : (
              <p className="text-yellow-500 text-center font-semibold">
                Du hast den höchsten Status erreicht! 🎉
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Aktuelle Vorteile</h3>
              <ul className="space-y-2">
                {currentLevel.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            {nextLevel && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Nächste Vorteile</h3>
                <ul className="space-y-2">
                  {nextLevel.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-gray-400">
                      <ClockIcon className="w-5 h-5 text-yellow-500 mr-3" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-yellow-500 text-yellow-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Belohnungen
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-yellow-500 text-yellow-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Verlauf
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'achievements'
                    ? 'border-yellow-500 text-yellow-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                Erfolge
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loyaltyData.availableRewards.map((reward) => (
                <div key={reward.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-full flex items-center justify-center">
                        <reward.icon className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{reward.name}</h3>
                        <p className="text-gray-400 text-sm">{reward.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <SparklesIcon className="w-4 h-4 text-yellow-500" />
                      <span className="text-yellow-500 font-semibold">{reward.points} Punkte</span>
                    </div>
                    
                    <button
                      onClick={() => redeemReward(reward)}
                      disabled={loyaltyData.points < reward.points}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        loyaltyData.points >= reward.points
                          ? 'btn-primary'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {loyaltyData.points >= reward.points ? 'Einlösen' : 'Nicht verfügbar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Punkte <span className="text-gradient-gold">Verlauf</span>
            </h2>
            
            <div className="space-y-4">
              {loyaltyData.history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.type === 'earned' ? 'bg-green-500 bg-opacity-20' :
                      item.type === 'redeemed' ? 'bg-red-500 bg-opacity-20' :
                      'bg-blue-500 bg-opacity-20'
                    }`}>
                      {item.type === 'earned' ? (
                        <SparklesIcon className="w-5 h-5 text-green-400" />
                      ) : item.type === 'redeemed' ? (
                        <GiftIcon className="w-5 h-5 text-red-400" />
                      ) : (
                        <TrophyIcon className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    
                    <div>
                      <p className="text-white font-medium">{item.description}</p>
                      <p className="text-gray-400 text-sm">{new Date(item.date).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                  
                  <div className={`text-lg font-bold ${
                    item.points > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.points > 0 ? '+' : ''}{item.points} Punkte
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loyaltyData.achievements.map((achievement) => (
                <div key={achievement.id} className={`card p-6 ${
                  achievement.unlocked ? 'border-yellow-500 border-opacity-50' : ''
                }`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.unlocked 
                        ? 'bg-yellow-500 bg-opacity-20' 
                        : 'bg-gray-700'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.unlocked ? 'text-yellow-500' : 'text-gray-500'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{achievement.description}</p>
                    </div>
                    
                    {achievement.unlocked && (
                      <CheckCircleIcon className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  
                  {!achievement.unlocked && achievement.progress && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Fortschritt</span>
                        <span className="text-gray-400">{achievement.progress} / {achievement.target || 10}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ 
                            width: `${(achievement.progress / (achievement.target || 10)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyPage;