import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle, Database, Bell } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState<any>(null);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const statsRes = await axios.get(`${apiUrl}/api/admin/stats`);
        setStats(statsRes.data);
        
        const farmersRes = await axios.get(`${apiUrl}/api/admin/farmers`);
        setFarmers(farmersRes.data);
      } catch (error) {
        console.error('Error fetching admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const triggerBroadcast = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/admin/alerts/broadcast`);
      alert('Broadcast triggered successfully!');
    } catch (e) {
      alert('Broadcast failed');
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
          <button 
            onClick={triggerBroadcast}
            className="flex items-center gap-2 bg-primary-green hover:bg-secondary-green text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <Bell className="w-4 h-4" /> Trigger Alerts Broadcast
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Users /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Farmers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.active_farmers}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-xl text-green-600"><Database /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Mandis Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_mandis_covered}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><AlertCircle /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Alerts (30d)</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.alerts_sent_last_30d}</p>
            </div>
          </div>
        </div>

        {/* Farmer List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Registered Farmers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name & Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mandi & Crop</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consent</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {farmers.map((f: any) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{f.name}</div>
                      <div className="text-xs text-gray-500">+91 {f.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{f.mandi_name}</div>
                      <div className="text-xs text-gray-500">{f.preferred_commodity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {f.consent_sms && <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700">SMS</span>}
                        {f.consent_whatsapp && <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700">WhatsApp</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {f.is_active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
