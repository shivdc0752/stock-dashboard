import React from 'react';

const StockRecommendation = ({ recommendation, percentChange, predictedPrice, currentPrice }) => (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Stock Recommendation</h2>
      <div className="space-y-4">
        <p className="text-lg">Recommendation: <strong className={`text-xl font-semibold ${recommendation === 'SELL' ? 'text-red-500' : recommendation === 'BUY' ? 'text-green-500' : 'text-yellow-500'}`}>{recommendation}</strong></p>
        <p className="text-lg">Predicted Change: <strong className={`${percentChange < 0 ? 'text-red-500' : 'text-green-500'}`}>{percentChange}%</strong></p>
        <p className="text-lg">Predicted Price: <strong className="text-xl">${predictedPrice}</strong></p>
        <p className="text-lg">Current Price: <strong className="text-xl">${currentPrice}</strong></p>
      </div>
    </div>
  );
  

export default StockRecommendation;
