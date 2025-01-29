import React from 'react';
import Plot from 'react-plotly.js';

const CandlestickChart = ({ data, stock }) => (
  <div className="mt-6">
    <Plot
      data={[
        {
          type: 'candlestick',
          x: data.date,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          increasing: { line: { color: 'green' } },
          decreasing: { line: { color: 'red' } },
        },
      ]}
      layout={{
        title: `Candlestick Chart for ${stock}`,
        xaxis: { title: 'Date', rangeslider: { visible: false } },
        yaxis: { title: 'Price ($)' },
      }}
      style={{ width: '100%', height: '500px' }}
    />
  </div>
);

export default CandlestickChart;
