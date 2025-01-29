import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StockCard from './components/StockCard';
import StockForm from './components/StockForm';
import StockRecommendation from './components/StockRecommendation';
import CandlestickChart from './components/CandlestickChart';
import './App.css';

const App = () => {
  const [stock, setStock] = useState('POWERGRID.NS');
  const [paramA, setParamA] = useState(5);
  const [paramB, setParamB] = useState(10);
  const [recommendation, setRecommendation] = useState(null);
  const [percentChange, setPercentChange] = useState(null);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candlestickData, setCandlestickData] = useState(null);

  

  const [duration, setDuration] = useState('1y'); // Default to 1 year

  const fetchRecommendationAndPlots = async (selectedStock = stock, dataSource = 'yahoo', selectedDuration = duration) => {
    setLoading(true);
    setError(null);
    setPlots([]);
    setCandlestickData(null);

    try {
        const recommendationResponse = await axios.post('http://localhost:5000/api/stock', {
            stock: selectedStock,
            param_a: paramA,
            param_b: paramB,
            data_source: dataSource
        });

        const { recommendation, percent_change, predicted_price, current_price } = recommendationResponse.data;
        setRecommendation(recommendation);
        setPercentChange(percent_change.toFixed(2));
        setPredictedPrice(predicted_price.toFixed(2));
        setCurrentPrice(current_price.toFixed(2));

        // Fetch plots
        const plotsResponse = await axios.get(`http://localhost:5000/api/plots?stock=${selectedStock}&data_source=${dataSource}`);
        setPlots(plotsResponse.data.plots);

        // ✅ Fetch candlestick data with duration
        const candlestickResponse = await axios.get(`http://localhost:5000/api/candlestick?stock=${selectedStock}&duration=${selectedDuration}&data_source=${dataSource}`);
        setCandlestickData(candlestickResponse.data);
    } catch (err) {
        setError('Failed to fetch stock data. Please try again.');
    } finally {
        setLoading(false);
    }
};



  useEffect(() => {
    // Fetch data for the first time for the default stock (1 year duration)
    fetchRecommendationAndPlots();
  }, [duration]); // Re-fetch when the duration changes
  

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Stock Trend Prediction</h1>

      <div className='flex flex-row space-x-4 max-h-[20%]'>
        <div className='flex-1 max-w-[60%]'>
          <StockForm 
            stock={stock} 
            setStock={setStock} 
            paramA={paramA} 
            setParamA={setParamA} 
            paramB={paramB} 
            setParamB={setParamB} 
            fetchStock={fetchRecommendationAndPlots} 
            loading={loading} 
          />
        </div>
        
        <div className='flex-1 max-w-[40%]'>
          {recommendation && (
            <StockRecommendation 
              recommendation={recommendation} 
              percentChange={percentChange} 
              predictedPrice={predictedPrice} 
              currentPrice={currentPrice} 
            />
          )}
        </div>
      </div>

      {/* Only render CandlestickChart if candlestickData is available */}
      {candlestickData && (
        <div className="mb-6">
          
          
          {/* Time duration buttons */}
          <div className="text-center flex flex-row  mt-4">
            <button
              className={`px-4 py-2 mx-2 ${duration === '1w' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setDuration('1w')}
            >
              1 Week
            </button>
            <button
              className={`px-4 py-2 mx-2 ${duration === '1m' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setDuration('1m')}
            >
              1 Month
            </button>
            <button
              className={`px-4 py-2 mx-2 ${duration === '1y' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setDuration('1y')}
            >
              1 Year
            </button>
            <button
              className={`px-4 py-2 mx-2 ${duration === '3y' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setDuration('3y')}
            >
              3 Years
            </button>
            <button
              className={`px-4 py-2 mx-2 ${duration === '5y' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setDuration('5y')}
            >
              5 Years
            </button>
          </div>
          <CandlestickChart data={candlestickData} stock={stock} />
        </div>
      )}
      
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
    </div>
  );
};

export default App;
