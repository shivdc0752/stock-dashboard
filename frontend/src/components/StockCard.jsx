import React from 'react';

const StockCard = ({ stock, fetchStock }) => (
  <div className="bg-white p-4 rounded shadow-md cursor-pointer hover:bg-gray-200" onClick={() => fetchStock(stock.symbol)}>
    <h3 className="text-xl font-bold">{stock.symbol}</h3>
    <p>Current Price: ${stock.currentPrice || 'Loading...'}</p>
    <p className={`font-semibold ${stock.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
      Change: {stock.percentChange || 'Loading...'}%
    </p>
  </div>
);

export default StockCard;
