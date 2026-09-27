import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    preferred_mandi_id: null,
    preferred_commodity: '',
    cost_price: '',
    language_preference: 'English',
    consent_sms: false,
    consent_whatsapp: false
  });

  // OTP State
  const [otp, setOtp] = useState('');
  
  // Search State
  const [mandiSearch, setMandiSearch] = useState('');
  const [mandis, setMandis] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchMandis = async (query: string) => {
    setMandiSearch(query);
    if (query.length < 2) {
      setMandis([]);
      return;
    }
    setSearching(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.get(`${apiUrl}/api/mandis/search?q=${query}`);
      setMandis(data);
    } catch (error) {
      console.error('Error fetching mandis', error);
    } finally {
      setSearching(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/farmer/register`, formData);
      setStep(2); // Move to OTP step
    } catch (error) {
      console.error('Registration failed', error);
      alert('Registration failed. Phone might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${apiUrl}/api/farmer/verify-otp`, {
        phone_number: formData.phone_number,
        otp_code: otp
      });
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (error) {
      console.error('OTP Verification failed', error);
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join KrishiMitra AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Get real-time Mandi price alerts for your crops
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-primary-green focus:border-primary-green sm:text-sm transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (10 digits)</label>
                <div className="mt-1 flex rounded-xl shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    required
                    className="flex-1 block w-full rounded-none rounded-r-xl border border-gray-300 py-3 px-4 focus:ring-primary-green focus:border-primary-green sm:text-sm transition-colors"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Your Local Mandi</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-primary-green focus:border-primary-green sm:text-sm"
                    placeholder="Search district or mandi name..."
                    value={mandiSearch}
                    onChange={(e) => searchMandis(e.target.value)}
                  />
                  {searching && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Loader2 className="h-5 w-5 text-primary-green animate-spin" />
                  </div>}
                </div>
                {mandis.length > 0 && !formData.preferred_mandi_id && (
                  <ul className="mt-1 max-h-48 overflow-auto border border-gray-200 rounded-xl bg-white shadow-lg absolute z-10 w-full sm:w-auto min-w-[300px]">
                    {mandis.map((m: any) => (
                      <li
                        key={m.id}
                        className="cursor-pointer select-none relative py-3 pl-4 pr-9 hover:bg-green-50 transition-colors"
                        onClick={() => {
                          setFormData({...formData, preferred_mandi_id: m.id});
                          setMandiSearch(m.name + ', ' + m.district);
                          setMandis([]);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{m.name}</span>
                          <span className="text-sm text-gray-500">{m.district}, {m.state}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="commodity" className="block text-sm font-medium text-gray-700">Crop / Commodity</label>
                  <input
                    id="commodity"
                    type="text"
                    required
                    placeholder="e.g. Onion"
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-primary-green focus:border-primary-green sm:text-sm"
                    value={formData.preferred_commodity}
                    onChange={(e) => setFormData({...formData, preferred_commodity: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700">Cost Price (₹)</label>
                  <input
                    id="cost_price"
                    type="number"
                    required
                    placeholder="Per Quintal"
                    className="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-primary-green focus:border-primary-green sm:text-sm"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Alerts Consent</label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
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
                      <label htmlFor="sms" className="font-medium text-gray-700">Get SMS Alerts</label>
                      <p className="text-gray-500">Receive price alerts on regular SMS.</p>
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
                      <label htmlFor="whatsapp" className="font-medium text-gray-700">Get WhatsApp Alerts</label>
                      <p className="text-gray-500">Receive rich notifications via WhatsApp.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !formData.preferred_mandi_id}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-[#234012] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Get OTP'}
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <span className="text-xl">📱</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Verify your number</h3>
                <p className="mt-2 text-sm text-gray-500">
                  We've sent a 6-digit OTP to +91 {formData.phone_number}
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="sr-only">OTP</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  required
                  className="block w-full border border-gray-300 rounded-xl shadow-sm py-4 px-4 text-center text-2xl tracking-widest focus:ring-primary-green focus:border-primary-green transition-colors"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-[#234012] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify & Continue'}
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-primary-green hover:text-secondary-green"
                >
                  Wrong number? Go back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
