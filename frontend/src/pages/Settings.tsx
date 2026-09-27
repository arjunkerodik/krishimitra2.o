import React, { useState } from 'react';

// In a real app, you would fetch this from the backend using the JWT token
const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cost_price: 2100,
    consent_sms: true,
    consent_whatsapp: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocking an API call to PUT /api/farmer/profile
    setTimeout(() => {
      setLoading(false);
      alert('Settings updated successfully!');
    }, 1000);
  };

  const handleOptOut = () => {
    // Immediate explicit opt-out as requested by compliance
    setFormData({ ...formData, consent_sms: false, consent_whatsapp: false });
    alert('You have successfully opted out of all alerts.');
    // API Call to POST /api/farmer/opt-out would happen here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-xl w-full space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Account Settings</h2>
          <p className="mt-2 text-sm text-gray-600">Update your preferences and manage your alerts.</p>
        </div>
        
        <form className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 space-y-6" onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cost Price (₹ per Quintal)</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-xl py-3 px-4 focus:ring-primary-green focus:border-primary-green"
              value={formData.cost_price}
              onChange={(e) => setFormData({...formData, cost_price: parseInt(e.target.value)})}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="sms"
                    type="checkbox"
                    className="focus:ring-primary-green h-4 w-4 text-primary-green border-gray-300 rounded"
                    checked={formData.consent_sms}
                    onChange={(e) => setFormData({...formData, consent_sms: e.target.checked})}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="sms" className="font-medium text-gray-700">Receive SMS Alerts</label>
                  <p className="text-gray-500">Get text messages when your commodity hits the target price.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="whatsapp"
                    type="checkbox"
                    className="focus:ring-primary-green h-4 w-4 text-primary-green border-gray-300 rounded"
                    checked={formData.consent_whatsapp}
                    onChange={(e) => setFormData({...formData, consent_whatsapp: e.target.checked})}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="whatsapp" className="font-medium text-gray-700">Receive WhatsApp Alerts</label>
                  <p className="text-gray-500">Get rich notifications directly to your WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-green hover:bg-secondary-green text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              onClick={handleOptOut}
              className="flex-1 bg-white hover:bg-red-50 text-red-600 font-bold py-3 px-4 rounded-xl border border-red-200 transition-colors"
            >
              Opt-out of all alerts
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
