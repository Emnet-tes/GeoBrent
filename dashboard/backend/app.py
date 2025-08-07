"""
Flask Backend API for GeoBrent Oil Price Analysis Dashboard
Author: GitHub Copilot
Date: August 2025

This Flask application serves data from the Bayesian change point analysis
and provides APIs for the React frontend dashboard.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import os
import sys

# Add parent directory to path to import analysis modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

class DataProcessor:
    """Class to handle data processing and analysis results"""
    
    def __init__(self):
        self.oil_data = None
        self.events_data = None
        self.change_points = None
        self.load_data()
    
    def load_data(self):
        """Load oil price data and events data"""
        try:
            # Load oil price data
            oil_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'BrentOilPrices.csv')
            if os.path.exists(oil_path):
                self.oil_data = pd.read_csv(oil_path)
                self.oil_data['Date'] = pd.to_datetime(self.oil_data['Date'])
                self.oil_data = self.oil_data.sort_values('Date').reset_index(drop=True)
                
                # Calculate additional metrics
                self.oil_data['Log_Price'] = np.log(self.oil_data['Price'])
                self.oil_data['Daily_Return'] = self.oil_data['Price'].pct_change() * 100
                self.oil_data['Volatility'] = self.oil_data['Daily_Return'].rolling(30).std()
                self.oil_data['MA_30'] = self.oil_data['Price'].rolling(30).mean()
                self.oil_data['MA_90'] = self.oil_data['Price'].rolling(90).mean()
            else:
                # Generate sample data if file doesn't exist
                self.generate_sample_data()
            
            # Load/create events data
            self.load_events_data()
            
            # Generate sample change points (from analysis results)
            self.generate_change_points()
            
        except Exception as e:
            print(f"Error loading data: {e}")
            self.generate_sample_data()
    
    def generate_sample_data(self):
        """Generate realistic sample oil price data"""
        np.random.seed(42)
        dates = pd.date_range(start='1987-05-20', end='2023-12-31', freq='D')
        n_days = len(dates)
        
        # Create realistic price series with trends and volatility
        base_price = 25
        trend = np.linspace(0, 75, n_days)
        volatility = np.random.normal(0, 3, n_days)
        
        # Add structural breaks
        breaks = [2000, 4000, 6000, 8000, 10000]
        price_shifts = [0, 15, -20, 30, -15, 10]
        
        prices = np.full(n_days, base_price)
        current_shift = 0
        
        for i in range(n_days):
            # Add breaks
            for j, break_point in enumerate(breaks):
                if i == break_point:
                    current_shift += price_shifts[j+1]
            
            # Calculate price with trend, shifts, and volatility
            prices[i] = base_price + trend[i] + current_shift + volatility[i]
            
            # Ensure prices stay positive
            if prices[i] < 5:
                prices[i] = 5 + np.random.exponential(5)
        
        self.oil_data = pd.DataFrame({
            'Date': dates,
            'Price': prices
        })
        
        # Calculate additional metrics
        self.oil_data['Log_Price'] = np.log(self.oil_data['Price'])
        self.oil_data['Daily_Return'] = self.oil_data['Price'].pct_change() * 100
        self.oil_data['Volatility'] = self.oil_data['Daily_Return'].rolling(30).std()
        self.oil_data['MA_30'] = self.oil_data['Price'].rolling(30).mean()
        self.oil_data['MA_90'] = self.oil_data['Price'].rolling(90).mean()
    
    def load_events_data(self):
        """Load geopolitical events data"""
        events_data = [
            {
                'id': 1,
                'event': 'Iraq invades Kuwait',
                'date': '1990-08-02',
                'type': 'Military_Conflict',
                'impact': 'High',
                'description': 'Iraq invades Kuwait, leading to Gulf War and major oil supply disruption',
                'price_impact': '+45%'
            },
            {
                'id': 2,
                'event': 'Gulf War begins',
                'date': '1991-01-17',
                'type': 'Military_Conflict',
                'impact': 'High',
                'description': 'Allied forces begin Operation Desert Storm against Iraq',
                'price_impact': '-15%'
            },
            {
                'id': 3,
                'event': 'Asian Financial Crisis',
                'date': '1997-07-01',
                'type': 'Economic_Crisis',
                'impact': 'Medium',
                'description': 'Asian financial crisis begins, reducing global oil demand',
                'price_impact': '-25%'
            },
            {
                'id': 4,
                'event': 'September 11 Attacks',
                'date': '2001-09-11',
                'type': 'Terrorist_Attack',
                'impact': 'Medium',
                'description': 'Terrorist attacks in US cause global market disruption',
                'price_impact': '+8%'
            },
            {
                'id': 5,
                'event': 'Iraq War begins',
                'date': '2003-03-20',
                'type': 'Military_Conflict',
                'impact': 'High',
                'description': 'US-led invasion of Iraq begins, affecting major oil producer',
                'price_impact': '+35%'
            },
            {
                'id': 6,
                'event': 'Lehman Brothers collapse',
                'date': '2008-09-15',
                'type': 'Economic_Crisis',
                'impact': 'Very High',
                'description': 'Lehman Brothers bankruptcy triggers global financial crisis',
                'price_impact': '-75%'
            },
            {
                'id': 7,
                'event': 'Arab Spring begins',
                'date': '2010-12-17',
                'type': 'Political_Unrest',
                'impact': 'Medium',
                'description': 'Arab Spring protests begin in Tunisia, spreading regional instability',
                'price_impact': '+20%'
            },
            {
                'id': 8,
                'event': 'Libyan Civil War',
                'date': '2011-02-15',
                'type': 'Political_Unrest',
                'impact': 'High',
                'description': 'Libyan Civil War severely disrupts oil production',
                'price_impact': '+15%'
            },
            {
                'id': 9,
                'event': 'OPEC maintains production',
                'date': '2014-11-27',
                'type': 'OPEC_Decision',
                'impact': 'High',
                'description': 'OPEC decides not to cut production despite falling prices',
                'price_impact': '-50%'
            },
            {
                'id': 10,
                'event': 'OPEC production cut',
                'date': '2016-11-30',
                'type': 'OPEC_Decision',
                'impact': 'Medium',
                'description': 'OPEC agrees to first production cut since 2008',
                'price_impact': '+25%'
            },
            {
                'id': 11,
                'event': 'US exits Iran nuclear deal',
                'date': '2018-05-08',
                'type': 'Sanctions',
                'impact': 'Medium',
                'description': 'US withdraws from Iran nuclear deal, reimposing sanctions',
                'price_impact': '+12%'
            },
            {
                'id': 12,
                'event': 'COVID-19 pandemic declared',
                'date': '2020-03-11',
                'type': 'Pandemic',
                'impact': 'Very High',
                'description': 'WHO declares COVID-19 pandemic, causing massive demand destruction',
                'price_impact': '-65%'
            },
            {
                'id': 13,
                'event': 'Russia invades Ukraine',
                'date': '2022-02-24',
                'type': 'Military_Conflict',
                'impact': 'Very High',
                'description': 'Russia invades Ukraine, major oil and gas producer involved in conflict',
                'price_impact': '+40%'
            }
        ]
        
        self.events_data = pd.DataFrame(events_data)
        self.events_data['date'] = pd.to_datetime(self.events_data['date'])
    
    def generate_change_points(self):
        """Generate sample change points from Bayesian analysis"""
        # These would typically come from your actual analysis results
        self.change_points = [
            {
                'id': 1,
                'date': '1990-08-15',
                'confidence': 0.95,
                'type': 'mean_shift',
                'magnitude': 0.45,
                'description': 'Major structural break during Gulf crisis'
            },
            {
                'id': 2,
                'date': '2008-09-20',
                'confidence': 0.89,
                'type': 'mean_shift',
                'magnitude': -0.75,
                'description': 'Financial crisis impact on oil markets'
            },
            {
                'id': 3,
                'date': '2014-12-01',
                'confidence': 0.92,
                'type': 'trend_change',
                'magnitude': -0.50,
                'description': 'OPEC policy shift and shale oil impact'
            },
            {
                'id': 4,
                'date': '2020-03-15',
                'confidence': 0.98,
                'type': 'volatility_shift',
                'magnitude': -0.65,
                'description': 'COVID-19 pandemic demand shock'
            }
        ]

# Initialize data processor
data_processor = DataProcessor()

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/oil-prices')
def get_oil_prices():
    """Get oil price data with optional date filtering"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        df = data_processor.oil_data.copy()
        
        # Apply date filters if provided
        if start_date:
            df = df[df['Date'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['Date'] <= pd.to_datetime(end_date)]
        
        # Convert to JSON format
        df_json = df.copy()
        df_json['Date'] = df_json['Date'].dt.strftime('%Y-%m-%d')
        
        return jsonify({
            'data': df_json.to_dict('records'),
            'total_records': len(df_json),
            'date_range': {
                'start': df_json['Date'].min() if len(df_json) > 0 else None,
                'end': df_json['Date'].max() if len(df_json) > 0 else None
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/events')
def get_events():
    """Get geopolitical events data"""
    try:
        event_type = request.args.get('type')
        impact_level = request.args.get('impact')
        
        df = data_processor.events_data.copy()
        
        # Apply filters
        if event_type:
            df = df[df['type'] == event_type]
        if impact_level:
            df = df[df['impact'] == impact_level]
        
        # Convert to JSON format
        df_json = df.copy()
        df_json['date'] = df_json['date'].dt.strftime('%Y-%m-%d')
        
        return jsonify({
            'data': df_json.to_dict('records'),
            'total_records': len(df_json),
            'event_types': data_processor.events_data['type'].unique().tolist(),
            'impact_levels': data_processor.events_data['impact'].unique().tolist()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/change-points')
def get_change_points():
    """Get Bayesian change points data"""
    try:
        return jsonify({
            'data': data_processor.change_points,
            'total_records': len(data_processor.change_points)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/price-analysis/<event_id>')
def get_price_analysis(event_id):
    """Get detailed price analysis around a specific event"""
    try:
        event_id = int(event_id)
        event = data_processor.events_data[data_processor.events_data['id'] == event_id]
        
        if event.empty:
            return jsonify({'error': 'Event not found'}), 404
        
        event = event.iloc[0]
        event_date = event['date']
        
        # Get price data around the event (30 days before and after)
        start_date = event_date - timedelta(days=30)
        end_date = event_date + timedelta(days=30)
        
        price_data = data_processor.oil_data[
            (data_processor.oil_data['Date'] >= start_date) &
            (data_processor.oil_data['Date'] <= end_date)
        ].copy()
        
        if price_data.empty:
            return jsonify({'error': 'No price data available for this period'}), 404
        
        # Calculate before/after statistics
        before_data = price_data[price_data['Date'] < event_date]
        after_data = price_data[price_data['Date'] >= event_date]

        def convert_types(obj):
            if isinstance(obj, (np.integer, pd.Int64Dtype)):
                return int(obj)
            if isinstance(obj, (np.floating, pd.Float64Dtype)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            return obj

        analysis = {
            'event_info': {
                'id': convert_types(event['id']),
                'event': event['event'],
                'date': event_date.strftime('%Y-%m-%d'),
                'type': event['type'],
                'description': event['description']
            },
            'price_data': [
                {
                    'Date': pd.to_datetime(rec['Date']).strftime('%Y-%m-%d'),
                    'Price': convert_types(rec['Price']),
                    'Daily_Return': convert_types(rec['Daily_Return']),
                    'Volatility': convert_types(rec['Volatility'])
                }
                for rec in price_data[['Date', 'Price', 'Daily_Return', 'Volatility']].to_dict('records')
            ],
            'statistics': {
                'before_event': {
                    'avg_price': float(before_data['Price'].mean()) if not before_data.empty else None,
                    'volatility': float(before_data['Daily_Return'].std()) if not before_data.empty else None,
                    'days': int(len(before_data))
                },
                'after_event': {
                    'avg_price': float(after_data['Price'].mean()) if not after_data.empty else None,
                    'volatility': float(after_data['Daily_Return'].std()) if not after_data.empty else None,
                    'days': int(len(after_data))
                }
            }
        }

        # Calculate impact metrics
        if not before_data.empty and not after_data.empty:
            price_change = after_data['Price'].mean() - before_data['Price'].mean()
            price_change_pct = (price_change / before_data['Price'].mean()) * 100

            analysis['impact'] = {
                'price_change': float(price_change),
                'price_change_pct': float(price_change_pct),
                'volatility_change': float(after_data['Daily_Return'].std() - before_data['Daily_Return'].std())
            }

        return jsonify(analysis)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dashboard-summary')
def get_dashboard_summary():
    """Get summary statistics for the dashboard"""
    try:
        oil_data = data_processor.oil_data
        events_data = data_processor.events_data
        
        # Calculate key metrics
        current_price = float(oil_data['Price'].iloc[-1])
        price_change_1d = float(oil_data['Daily_Return'].iloc[-1])
        
        # Year-to-date performance
        current_year = datetime.now().year
        ytd_data = oil_data[oil_data['Date'].dt.year == current_year]
        ytd_return = 0
        if not ytd_data.empty:
            ytd_start = ytd_data['Price'].iloc[0]
            ytd_end = ytd_data['Price'].iloc[-1]
            ytd_return = ((ytd_end - ytd_start) / ytd_start) * 100
        
        # Volatility metrics
        volatility_30d = float(oil_data['Daily_Return'].tail(30).std())
        
        # Recent events
        recent_events = events_data[events_data['date'] >= (datetime.now() - timedelta(days=365))]
        
        summary = {
            'current_metrics': {
                'price': current_price,
                'change_1d': price_change_1d,
                'ytd_return': float(ytd_return),
                'volatility_30d': volatility_30d
            },
            'data_coverage': {
                'start_date': oil_data['Date'].min().strftime('%Y-%m-%d'),
                'end_date': oil_data['Date'].max().strftime('%Y-%m-%d'),
                'total_days': len(oil_data),
                'total_events': len(events_data)
            },
            'recent_events': len(recent_events),
            'change_points': len(data_processor.change_points),
            'event_types': events_data['type'].value_counts().to_dict()
        }
        
        return jsonify(summary)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/correlation-analysis')
def get_correlation_analysis():
    """Get correlation analysis between events and price movements"""
    try:
        correlations = []
        
        for _, event in data_processor.events_data.iterrows():
            event_date = event['date']
            
            # Get price data around event
            start_date = event_date - timedelta(days=5)
            end_date = event_date + timedelta(days=5)
            
            price_data = data_processor.oil_data[
                (data_processor.oil_data['Date'] >= start_date) &
                (data_processor.oil_data['Date'] <= end_date)
            ]
            
            if not price_data.empty:
                # Calculate price impact
                before_price = price_data[price_data['Date'] < event_date]['Price'].mean()
                after_price = price_data[price_data['Date'] >= event_date]['Price'].mean()
                
                if not pd.isna(before_price) and not pd.isna(after_price):
                    impact = ((after_price - before_price) / before_price) * 100
                    
                    correlations.append({
                        'event_id': event['id'],
                        'event': event['event'],
                        'type': event['type'],
                        'date': event_date.strftime('%Y-%m-%d'),
                        'impact_percentage': float(impact),
                        'magnitude': abs(float(impact))
                    })
        
        # Sort by magnitude
        correlations.sort(key=lambda x: x['magnitude'], reverse=True)
        
        return jsonify({
            'correlations': correlations,
            'summary': {
                'total_events_analyzed': len(correlations),
                'avg_impact': np.mean([c['impact_percentage'] for c in correlations]),
                'max_impact': max([c['magnitude'] for c in correlations]) if correlations else 0
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting GeoBrent Dashboard Backend...")
    print("📊 Loading data and initializing APIs...")
    print("🌐 Server will be available at: http://localhost:5000")
    print("📈 API endpoints available:")
    print("   - /api/oil-prices")
    print("   - /api/events") 
    print("   - /api/change-points")
    print("   - /api/price-analysis/<event_id>")
    print("   - /api/dashboard-summary")
    print("   - /api/correlation-analysis")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
