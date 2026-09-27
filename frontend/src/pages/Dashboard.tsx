import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Farmer Dashboard</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <span className="text-3xl">🌾</span>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Welcome to KrishiMitra AI!</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your account is verified and active. We are now tracking your preferred commodity at your local mandi.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">Today's Modal Price</p>
              <p className="text-3xl font-bold text-gray-900">₹ --</p>
              <p className="text-sm text-gray-400 mt-2">Waiting for next sync...</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 font-medium mb-1">Your Cost Price</p>
              <p className="text-3xl font-bold text-gray-900">₹ --</p>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border border-green-100">
              <p className="text-sm text-green-700 font-medium mb-1">Est. Profit Margin</p>
              <p className="text-3xl font-bold text-primary-green">-- %</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
