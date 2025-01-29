from flask_cors import CORS
from flask import Flask, request, jsonify, send_file
from alpha_vantage.timeseries import TimeSeries
import yfinance as yf

import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend before importing pyplot
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from sklearn.preprocessing import MinMaxScaler
import numpy as np
import pandas as pd
import datetime as dt
import base64
from io import BytesIO
import os
import plotly.graph_objs as go
import pandas_datareader as pdr
from dotenv import load_dotenv

# Initialize Flask App
app = Flask(__name__, static_folder='static')
CORS(app)  # Allow all origins for testing

# Load the pre-trained model
model = load_model('my_model.keras')  # Replace with your model path

def fetch_from_alpha_vantage(stock, start, end):
    # Initialize Alpha Vantage API (replace 'YOUR_API_KEY' with your actual key)
    ts = TimeSeries(key="ALPHA_VANTAGE_API_KEY", output_format='pandas')
    data, _ = ts.get_daily(symbol=stock, outputsize='full')  # You can adjust outputsize (compact/full)
    data = data.loc[start:end]
    return data

# Ensure static folder exists
STATIC_DIR = 'static'
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR)

# Recommendation Route
@app.route('/api/stock', methods=['POST'])
def get_stock_data():
    data = request.json
    stock = data.get('stock', 'POWERGRID.NS')
    param_a = float(data.get('param_a', 5))
    param_b = float(data.get('param_b', 10))

    start = dt.datetime(2000, 1, 1)
    end = dt.datetime.now()
    df = yf.download(stock, start=start, end=end)

    if df.empty:
        return jsonify({'error': 'Stock data not found'}), 404

    # Preprocessing for prediction
    data = df[['Close']]
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)

    last_60_days = scaled_data[-60:]
    
    x_test = np.array([last_60_days])
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1))

    # Prediction
    prediction = model.predict(x_test)
    predicted_price = scaler.inverse_transform(prediction)[0][0]
    current_price = data.iloc[-1, 0]
    percent_change = ((predicted_price - data.iloc[-1, 0]) / data.iloc[-1, 0]) * 100

    # Recommendation logic
    recommendation = (
        "SELL" if percent_change < -param_a
        else "BUY" if percent_change > param_b
        else "HOLD"
    )

    return jsonify({
        'recommendation': recommendation,
        'predicted_price': float(predicted_price),  # Ensure JSON serialization works
        'percent_change': float(percent_change),
        'current_price': float(current_price), 
    })

# Plots Route: Generate multiple plots
@app.route('/api/plots', methods=['GET'])
def generate_all_plots():
    stock = request.args.get('stock', 'POWERGRID.NS')
    start = dt.datetime(2000, 1, 1)
    end = dt.datetime.now()
    df = yf.download(stock, start=start, end=end)

    if df.empty:
        return jsonify({'error': 'Stock data not found'}), 404

    plot_types = ['original_vs_prediction']
    plot_b64_data = []

    for plot_type in plot_types:
        fig = plt.figure(figsize=(10, 5))

        if plot_type == 'original_vs_prediction':
            # Original vs Predicted Plot
            prediction = df['Close'].iloc[-1]  # Placeholder for one prediction
            df['Predicted'] = None
            df.loc[df.index[-1], 'Predicted'] = prediction
            plt.plot(df['Close'], label='Original Trend', alpha=0.75, color='blue')
            plt.scatter(df.index[-1], prediction, label='Predicted Price', color='red', zorder=5)
            plt.title('Original vs Predicted Trend')

        plt.legend()

        # Save the plot to a BytesIO object
        img = BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)
        plot_b64 = base64.b64encode(img.getvalue()).decode('utf-8')
        plot_b64_data.append(f"data:image/png;base64,{plot_b64}")
        plt.close(fig)

    return jsonify({'plots': plot_b64_data})

# Live Stock Data Route
# Live Stock Data Route
@app.route('/api/candlestick', methods=['GET'])
def get_candlestick():
    stock = request.args.get('stock', 'POWERGRID.NS')  # Default to POWERGRID.NS
    duration = request.args.get('duration', '1y')  # Default to 1 year if not specified

    # Define time delta based on the duration parameter
    if duration == '1w':
        start = dt.datetime.now() - dt.timedelta(weeks=1)  # Last 1 week of data
    elif duration == '1m':
        start = dt.datetime.now() - dt.timedelta(weeks=4)  # Last 1 month of data (approximately 4 weeks)
    elif duration == '3y':
        start = dt.datetime.now() - dt.timedelta(days=365*3)  # Last 3 years of data
    elif duration == '5y':
        start = dt.datetime.now() - dt.timedelta(days=365*5)  # Last 5 years of data
    else:  # Default to 1 year
        start = dt.datetime.now() - dt.timedelta(days=365)  # Last 1 year of data
    
    end = dt.datetime.now()

    try:
        # Fetch stock data using yfinance
        df = yf.download(stock, start=start, end=end)

        # Check if the DataFrame is empty (no data available)
        if df.empty:
            return jsonify({'error': 'No data found for the specified stock.'}), 404

        # Ensure 'date' is properly formatted (convert the date index to a column)
        df['date'] = df.index.strftime('%Y-%m-%d')

        # Flatten the nested lists for open, high, low, and close
        candlestick_data = {
            'date': df['date'].tolist(),
            'open': [item[0] for item in df['Open'].values.tolist()],
            'high': [item[0] for item in df['High'].values.tolist()],
            'low': [item[0] for item in df['Low'].values.tolist()],
            'close': [item[0] for item in df['Close'].values.tolist()],
        }

        # Return structured JSON
        return jsonify(candlestick_data)
    
    except Exception as e:
        # Log the error with traceback for debugging
        import traceback
        error_message = traceback.format_exc()
        print(f"Error fetching data: {error_message}")  # Log the error message
        return jsonify({'error': 'An error occurred while fetching stock data.'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
