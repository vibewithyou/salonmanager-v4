import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import {
  UsersIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [salons, setSalons] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);

  const tabs = [
    { id: 'overview', name: 'Übersicht', icon: ChartBarIcon },
    { id: 'users', name: 'Benutzer', icon: UsersIcon },
    { id: 'salons', name: 'Salons', icon: BuildingStorefrontIcon },
    { id: 'appointments', name: 'Termine', icon: CalendarDaysIcon },
    { id: 'payments', name: 'Zahlungen', icon: CreditCardIcon },
    { id: 'system', name: 'System', icon: CogIcon },
    { id: 'security', name: 'Sicherheit', icon: ShieldCheckIcon },
    { id: 'logs', name: 'Logs', icon: DocumentTextIcon },
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load admin statistics
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Mock data for demonstration
      setStats({
        total_users: 15847,
        total_salons: 342,
        total_appointments: 28456,
        total_revenue: 145670.50,
        new_users_today: 23,
        appointments_today: 156,
        revenue_today: 3240.80,
        active_salons: 298,
        pending_approvals: 8,
        system_health: 98.7
      });

      setUsers([
        { id: 1, name: 'Max Mustermann', email: 'max@example.com', role: 'customer', status: 'active', created_at: '2024-01-15', last_login: '2024-01-20' },
        { id: 2, name: 'Anna Schmidt', email: 'anna@salon.de', role: 'salon_owner', status: 'active', created_at: '2024-01-10', last_login: '2024-01-20' },
        { id: 3, name: 'Tom Weber', email: 'tom@barbershop.de', role: 'stylist', status: 'pending', created_at: '2024-01-18', last_login: null },
      ]);

      setSalons([
        { id: 1, name: 'Elite Cuts', owner: 'Anna Schmidt', city: 'Berlin', status: 'active', appointments: 156, revenue: 4560.00, rating: 4.8 },
        { id: 2, name: 'Barber Kings', owner: 'Michael König', city: 'München', status: 'active', appointments: 134, revenue: 3890.00, rating: 4.7 },
        { id: 3, name: 'Style Studio', owner: 'Lisa Weber', city: 'Hamburg', status: 'pending', appointments: 0, revenue: 0, rating: 0 },
      ]);

      setAppointments([
        { id: 1, customer: 'Max Mustermann', salon: 'Elite Cuts', service: 'Haarschnitt', date: '2024-01-20', time: '14:00', status: 'completed', amount: 25.00 },
        { id: 2, customer: 'Julia Meyer', salon: 'Barber Kings', service: 'Bart Styling', date: '2024-01-20', time: '15:30', status: 'confirmed', amount: 30.00 },
        { id: 3, customer: 'Peter Schmidt', salon: 'Elite Cuts', service: 'Färbung', date: '2024-01-21', time: '10:00', status: 'pending', amount: 45.00 },
      ]);

      setSystemLogs([
        { id: 1, type: 'info', message: 'Backup erfolgreich erstellt', timestamp: '2024-01-20 10:30:00', module: 'Backup' },
        { id: 2, type: 'warning', message: 'Hohe CPU-Auslastung erkannt', timestamp: '2024-01-20 09:15:00', module: 'System' },
        { id: 3, type: 'error', message: 'Fehlgeschlagene Zahlungsverarbeitung', timestamp: '2024-01-20 08:45:00', module: 'Payment' },
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Fehler beim Laden der Admin-Daten');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status } : user
        ));
        toast.success('Benutzerstatus aktualisiert');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    }
  };

  const approveSalon = async (salonId) => {
    try {
      const response = await fetch(`/api/admin/salons/${salonId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSalons(prev => prev.map(salon => 
          salon.id === salonId ? { ...salon, status: 'active' } : salon
        ));
        toast.success('Salon erfolgreich genehmigt');
      }
    } catch (error) {
      console.error('Error approving salon:', error);
      toast.error('Fehler beim Genehmigen des Salons');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Zugriff verweigert</h2>
          <p className="text-gray-400">Sie haben keine Admin-Berechtigung.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-orange-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin <span className="text-gradient-orange">Dashboard</span>
              </h1>
              <p className="text-orange-200">
                Willkommen zurück, {user.first_name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                stats.system_health >= 95 ? 'bg-green-500 bg-opacity-20 text-green-400' :
                stats.system_health >= 80 ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                'bg-red-500 bg-opacity-20 text-red-400'
              }`}>
                System Health: {stats.system_health}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Gesamt Benutzer</p>
                    <p className="text-3xl font-bold text-white">{stats.total_users?.toLocaleString()}</p>
                    <p className="text-sm text-green-400">+{stats.new_users_today} heute</p>
                  </div>
                  <UsersIcon className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Aktive Salons</p>
                    <p className="text-3xl font-bold text-white">{stats.active_salons}</p>
                    <p className="text-sm text-gray-400">{stats.total_salons} gesamt</p>
                  </div>
                  <BuildingStorefrontIcon className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Termine</p>
                    <p className="text-3xl font-bold text-white">{stats.total_appointments?.toLocaleString()}</p>
                    <p className="text-sm text-green-400">{stats.appointments_today} heute</p>
                  </div>
                  <CalendarDaysIcon className="w-12 h-12 text-orange-500" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Umsatz</p>
                    <p className="text-3xl font-bold text-white">€{stats.total_revenue?.toLocaleString()}</p>
                    <p className="text-sm text-green-400">€{stats.revenue_today} heute</p>
                  </div>
                  <CreditCardIcon className="w-12 h-12 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Wartende Genehmigungen</h3>
                <div className="space-y-3">
                  {salons.filter(salon => salon.status === 'pending').map((salon) => (
                    <div key={salon.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{salon.name}</p>
                        <p className="text-gray-400 text-sm">{salon.owner} - {salon.city}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveSalon(salon.id)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                          <XCircleIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Neueste Logs</h3>
                <div className="space-y-3">
                  {systemLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.type === 'error' ? 'bg-red-500' :
                        log.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">{log.message}</p>
                        <p className="text-gray-400 text-xs">{log.timestamp} - {log.module}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Benutzerverwaltung</h2>
              <button className="btn-primary px-4 py-2">
                Neuer Benutzer
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">E-Mail</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rolle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Registriert</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-white">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-400 rounded-full">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                            user.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                            'bg-red-500 bg-opacity-20 text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.created_at}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300">
                              <EyeIcon className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-300">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            {user.status === 'pending' && (
                              <button
                                onClick={() => updateUserStatus(user.id, 'active')}
                                className="text-green-400 hover:text-green-300"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add more tab content here */}
      </div>
    </div>
  );
};

// Add orange gradient CSS
const style = document.createElement('style');
style.textContent = `
  .text-gradient-orange {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

export default AdminDashboard;