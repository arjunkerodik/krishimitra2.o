import React, { useState } from 'react';
import { ShoppingBag, Search, Clock, ShieldCheck, Plus } from 'lucide-react';

const products = [
  { id: 1, name: 'Urea Fertilizer 50kg', category: 'Fertilizer', price: 266, image: '🌱', delivery: '10 mins' },
  { id: 2, name: 'DAP Fertilizer 50kg', category: 'Fertilizer', price: 1350, image: '🌿', delivery: '10 mins' },
  { id: 3, name: 'Roundup Herbicide 1L', category: 'Pesticide', price: 450, image: '🧪', delivery: '15 mins' },
  { id: 4, name: 'Hybrid Tomato Seeds 10g', category: 'Seeds', price: 320, image: '🍅', delivery: '10 mins' },
  { id: 5, name: 'Neem Oil Organic 1L', category: 'Organic', price: 280, image: '🌿', delivery: '15 mins' },
  { id: 6, name: 'NPK 19:19:19 1kg', category: 'Fertilizer', price: 140, image: '✨', delivery: '10 mins' },
];

const Pharmacy = () => {
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-primary-green pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <span className="text-4xl">🏪</span> KrishiMitra Pharmacy
          </h1>
          <button className="relative bg-white text-primary-green p-3 rounded-full hover:bg-green-50 transition-colors shadow-lg">
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-yellow text-gray-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 rounded-2xl border-0 shadow-lg text-lg focus:ring-2 focus:ring-accent-yellow"
              placeholder="Search fertilizers, seeds, pesticides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg"><Clock className="text-primary-green w-6 h-6"/></div>
            <div><p className="font-bold text-gray-900">10-Min Delivery</p><p className="text-xs text-gray-500">Direct to your farm/hub</p></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><ShieldCheck className="text-blue-600 w-6 h-6"/></div>
            <div><p className="font-bold text-gray-900">100% Genuine</p><p className="text-xs text-gray-500">Certified Agri-Inputs</p></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg"><span className="text-yellow-600 font-bold text-xl">₹</span></div>
            <div><p className="font-bold text-gray-900">Mandi Rates</p><p className="text-xs text-gray-500">Subsidized pricing</p></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Order Items</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
              <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" /> {product.delivery}
              </div>
              <div className="h-40 bg-gray-50 flex items-center justify-center text-6xl">
                {product.image}
              </div>
              <div className="p-5">
                <p className="text-xs font-bold text-primary-green mb-1 uppercase tracking-wider">{product.category}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight h-10">{product.name}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-extrabold text-gray-900">₹{product.price}</span>
                  <button 
                    onClick={() => setCartCount(prev => prev + 1)}
                    className="bg-primary-green text-white p-2 rounded-xl hover:bg-secondary-green transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pharmacy;
