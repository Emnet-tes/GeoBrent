# Interactive Oil Price Dashboard

A comprehensive interactive dashboard for analyzing Brent oil prices, geopolitical events, and Bayesian change point detection results.

## Features

### 📊 Dashboard Overview

- Real-time oil price metrics
- Key performance indicators
- Summary statistics
- Quick insights panel

### 📈 Price Chart Analysis

- Interactive price visualization with Recharts
- Date range filtering
- Multiple metrics display (price, volatility)
- Event markers and change point overlays
- Export functionality to CSV
- Responsive design with zoom capabilities

### 🌍 Events Analysis

- Geopolitical event impact assessment
- Event type correlation analysis
- Timeline visualization
- Impact distribution analysis
- Volatility correlation studies

### 🎯 Change Points Detection

- Bayesian change point analysis results
- Confidence level filtering
- Statistical significance assessment
- Period comparison analysis
- Interactive change point exploration

### 🔗 Correlation Analysis

- Multi-factor correlation matrix
- Event impact correlation studies
- Time period analysis
- Factor loading analysis
- Heatmap visualizations

## Technology Stack

### Backend (Flask)

- **Flask 2.3.3**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **pandas**: Data manipulation
- **numpy**: Numerical computations

### Frontend (React)

- **React 18.2.0**: UI framework
- **React Router**: Navigation
- **Recharts 2.8.0**: Data visualization
- **React Icons**: Icon library
- **Axios**: HTTP client

## Project Structure

```
dashboard/
├── backend/
│   ├── app.py              # Flask API server
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Dashboard.js
│   │   │   ├── PriceChart.js
│   │   │   ├── EventsAnalysis.js
│   │   │   ├── ChangePointsView.js
│   │   │   ├── CorrelationAnalysis.js
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   └── LoadingSpinner.js
│   │   ├── services/       # API services
│   │   │   └── apiService.js
│   │   ├── styles/         # CSS files
│   │   └── App.js          # Main app component
│   ├── public/
│   └── package.json        # Node.js dependencies
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Git

### Backend Setup

1. Navigate to the backend directory:

```bash
cd dashboard/backend
```

2. Create a virtual environment:

```bash
python -m venv venv
```

3. Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Start the Flask server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd dashboard/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The dashboard will be available at `http://localhost:3000`

## API Endpoints

The Flask backend provides the following REST API endpoints:

- `GET /api/oil-prices` - Historical oil price data
- `GET /api/events` - Geopolitical events data
- `GET /api/change-points` - Bayesian change point detection results
- `GET /api/price-analysis` - Statistical price analysis
- `GET /api/dashboard-summary` - Dashboard summary metrics
- `GET /api/correlation-analysis` - Correlation analysis data

## Usage Guide

### Dashboard Navigation

- **Dashboard**: Overview with key metrics and insights
- **Price Chart**: Interactive price visualization with filtering
- **Events**: Geopolitical event impact analysis
- **Change Points**: Bayesian change point detection results
- **Correlation**: Multi-factor correlation analysis

### Interactive Features

- **Date Range Selection**: Filter data by custom date ranges
- **Metric Toggles**: Show/hide different data series
- **Event Markers**: Toggle visibility of events and change points
- **Export Options**: Download charts and data as CSV
- **Responsive Design**: Optimized for desktop and mobile

### Analysis Capabilities

- **Impact Assessment**: Quantify event impacts on oil prices
- **Volatility Analysis**: Study price volatility patterns
- **Change Point Detection**: Identify structural breaks in price series
- **Correlation Studies**: Understand relationships between factors
- **Statistical Significance**: Assess confidence levels of findings

## Development Notes

### Component Architecture

- Modular React components with isolated functionality
- Shared API service for consistent data fetching
- CSS modules for component-specific styling
- Responsive design patterns

### Data Flow

- Flask backend serves as API layer
- React frontend consumes REST endpoints
- Real-time updates through periodic API calls
- Error handling and loading states

### Customization

- Easy to extend with new analysis components
- Configurable time windows and filtering options
- Customizable chart types and visualizations
- Extensible API endpoints for new data sources

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the GeoBrent oil price analysis suite.
