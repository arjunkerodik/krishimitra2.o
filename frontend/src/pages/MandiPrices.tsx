import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, TrendingUp, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MandiPrices = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    state: '',
    commodity: ''
  });

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.state) queryParams.append('state', filters.state);
      if (filters.commodity) queryParams.append('commodity', filters.commodity);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.get(`${apiUrl}/api/prices?${queryParams.toString()}`);
      setPrices(data);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [filters]);

  // Mock data for the chart since we're viewing public global data
  const mockTrendData = [
    { name: 'Mon', price: 2100 },
    { name: 'Tue', price: 2150 },
    { name: 'Wed', price: 2140 },
    { name: 'Thu', price: 2200 },
    { name: 'Fri', price: 2350 },
    { name: 'Sat', price: 2300 },
    { name: 'Sun', price: 2400 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div className="bg-primary-green pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight">
            Live Mandi Prices
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-green-100 mx-auto">
            Real-time APMC agricultural prices sourced directly from Agmarknet. Stay informed and maximize your profits.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700 font-medium whitespace-nowrap">
            <Filter className="w-5 h-5 text-primary-green" />
            Filter By:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto flex-1">
             <input
                type="text"
                placeholder="State (e.g. Karnataka)"
                className="w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-primary-green focus:border-primary-green sm:text-sm"
                value={filters.state}
                onChange={(e) => setFilters({...filters, state: e.target.value})}
              />
              <input
                type="text"
                placeholder="Commodity (e.g. Onion)"
                className="w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:ring-primary-green focus:border-primary-green sm:text-sm"
                value={filters.commodity}
                onChange={(e) => setFilters({...filters, commodity: e.target.value})}
              />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Table Area */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary-green" />
                Latest Arrivals
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mandi & State</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Commodity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Arrival Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Modal Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading prices...</td></tr>
                  ) : prices.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No data found. Try adjusting filters or check back later.</td></tr>
                  ) : (
                    prices.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{p.mandi_name}</div>
                          <div className="text-xs text-gray-500">{p.district}, {p.state}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{p.commodity}</div>
                          <div className="text-xs text-gray-500">{p.variety || 'Standard'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(p.arrival_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                          ₹{p.modal_price}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-yellow" />
                7-Day National Trend
              </h3>
              <p className="text-sm text-gray-500 mb-6">Aggregated index of top 5 commodities across major markets.</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    />
                    <Line type="monotone" dataKey="price" stroke="#2D5016" strokeWidth={3} dot={{r: 4, fill: '#2D5016', strokeWidth: 0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-green to-[#1b300d] rounded-2xl shadow-lg border border-transparent p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Want alerts directly to your phone?</h3>
              <p className="text-green-100 text-sm mb-6">Join KrishiMitra AI to set your cost price and receive WhatsApp alerts when the market is profitable.</p>
              <a href="/register" className="block w-full text-center bg-accent-yellow hover:bg-yellow-400 text-gray-900 font-bold py-3 px-4 rounded-xl transition-colors">
                Sign Up Now
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MandiPrices;
