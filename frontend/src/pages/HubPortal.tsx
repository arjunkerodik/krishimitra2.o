import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Search, Phone } from 'lucide-react';

const HubPortal = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    preferred_mandi_id: 1, // Defaulting for the specific hub
    preferred_commodity: '',
    cost_price: '',
    consent_sms: true,
    consent_whatsapp: true
  });
  const [loading, setLoading] = useState(false);

  const handleAssistedRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // In a real app, an admin token would bypass OTP and auto-verify
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/farmer/register`, formData);
      alert('Farmer successfully registered to this Hub!');
      setFormData({
        name: '', phone_number: '', preferred_mandi_id: 1, preferred_commodity: '', cost_price: '', consent_sms: true, consent_whatsapp: true
      });
    } catch (error) {
      alert('Failed to register farmer. They may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-primary-green rounded-3xl p-8 mb-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">APMC Hub Operator Portal</h1>
          <p className="text-green-100">Welcome to the KrishiMitra local kiosk. Assist farmers with onboarding here.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-xl text-primary-green"><UserPlus className="w-6 h-6" /></div>
            <h2 className="text-2xl font-bold text-gray-900">Assisted Farmer Registration</h2>
          </div>
          
          <form className="space-y-6" onSubmit={handleAssistedRegistration}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Farmer Full Name</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-primary-green focus:border-primary-green" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number (Will receive Alerts)</label>
                <div className="mt-1 flex rounded-xl shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500">+91</span>
                  <input required type="tel" pattern="[0-9]{10}" className="flex-1 block w-full rounded-none rounded-r-xl border border-gray-300 py-3 px-4 focus:ring-primary-green focus:border-primary-green" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Crop</label>
                <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-primary-green focus:border-primary-green" placeholder="e.g. Tomato" value={formData.preferred_commodity} onChange={e => setFormData({...formData, preferred_commodity: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost Price (₹)</label>
                <input required type="number" className="mt-1 block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-primary-green focus:border-primary-green" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-3">Verbal Consent Given For:</p>
              <div className="flex gap-6">
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.consent_sms} onChange={e => setFormData({...formData, consent_sms: e.target.checked})} className="focus:ring-primary-green h-4 w-4 text-primary-green border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">SMS Alerts</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.consent_whatsapp} onChange={e => setFormData({...formData, consent_whatsapp: e.target.checked})} className="focus:ring-primary-green h-4 w-4 text-primary-green border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">WhatsApp Alerts</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-primary-green hover:bg-secondary-green text-white font-bold py-4 px-4 rounded-xl transition-colors shadow-md">
              {loading ? 'Registering...' : 'Register Farmer & Activate Alerts'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HubPortal;
