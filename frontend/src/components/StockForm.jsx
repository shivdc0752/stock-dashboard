import React, { useState } from 'react';

const StockForm = ({ stock, setStock, paramA, setParamA, paramB, setParamB, fetchStock, loading }) => {
  const [dataSource, setDataSource] = useState('yahoo');  // Add state for data source

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchStock(stock, dataSource);  // Pass the dataSource to fetchStock function
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full">
      <h2 className="text-xl font-bold mb-4">Stock Prediction</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock Symbol</label>
          <input
            type="text"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="paramA" className="block text-sm font-medium text-gray-700">Param A</label>
          <input
            type="number"
            id="paramA"
            value={paramA}
            onChange={(e) => setParamA(Number(e.target.value))}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="paramB" className="block text-sm font-medium text-gray-700">Param B</label>
          <input
            type="number"
            id="paramB"
            value={paramB}
            onChange={(e) => setParamB(Number(e.target.value))}
            className="mt-1 block w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="dataSource" className="block text-sm font-medium text-gray-700">Data Source</label>
          <select
            id="dataSource"
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            <option value="yahoo">Yahoo Finance</option>
            <option value="alpha_vantage">Alpha Vantage</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Prediction'}
        </button>
      </form>
    </div>
  );
};

export default StockForm;
