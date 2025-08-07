import { useEffect, useState } from 'react';
import {
    FaArrowDown,
    FaArrowUp,
    FaCalendarAlt,
    FaChartLine,
    FaCrosshairs,
    FaExclamationTriangle
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = ({ dashboardData }) => {
    const [timeOfDay, setTimeOfDay] = useState('');

    useEffect(() => {
        const updateTimeOfDay = () => {
            const hour = new Date().getHours();
            if (hour < 12) setTimeOfDay('Good morning');
            else if (hour < 18) setTimeOfDay('Good afternoon');
            else setTimeOfDay('Good evening');
        };

        updateTimeOfDay();
        const interval = setInterval(updateTimeOfDay, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!dashboardData) {
        return (
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    const {
        current_metrics = {},
        data_coverage = {},
        recent_events = 0,
        change_points = 0,
        event_types = {}
    } = dashboardData;

    const formatPrice = (price) => {
        return `$${price?.toFixed(2) || '0.00'}`;
    };

    const formatPercentage = (value) => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value?.toFixed(2) || '0.00'}%`;
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>{timeOfDay}! 👋</h1>
                    <p>Here's your Brent oil price analysis overview</p>
                </div>
                <div className="last-updated">
                    Last updated: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="metrics-grid">
                <div className="metric-card price-card">
                    <div className="metric-header">
                        <h3>Current Price</h3>
                        <FaChartLine className="metric-icon" />
                    </div>
                    <div className="metric-value">
                        {formatPrice(current_metrics.price)}
                    </div>
                    <div className={`metric-change ${current_metrics.change_1d >= 0 ? 'positive' : 'negative'}`}>
                        {current_metrics.change_1d >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                        {formatPercentage(current_metrics.change_1d)} (1D)
                    </div>
                </div>

                <div className="metric-card ytd-card">
                    <div className="metric-header">
                        <h3>YTD Performance</h3>
                        <FaCalendarAlt className="metric-icon" />
                    </div>
                    <div className="metric-value">
                        {formatPercentage(current_metrics.ytd_return)}
                    </div>
                    <div className="metric-subtitle">
                        Year-to-date return
                    </div>
                </div>

                <div className="metric-card volatility-card">
                    <div className="metric-header">
                        <h3>30D Volatility</h3>
                        <FaExclamationTriangle className="metric-icon" />
                    </div>
                    <div className="metric-value">
                        {current_metrics.volatility_30d?.toFixed(2) || '0.00'}%
                    </div>
                    <div className="metric-subtitle">
                        Standard deviation
                    </div>
                </div>

                <div className="metric-card events-card">
                    <div className="metric-header">
                        <h3>Change Points</h3>
                        <FaCrosshairs className="metric-icon" />
                    </div>
                    <div className="metric-value">
                        {change_points}
                    </div>
                    <div className="metric-subtitle">
                        Detected by Bayesian analysis
                    </div>
                </div>
            </div>

            {/* Data Overview */}
            <div className="row">
                <div className="col-8">
                    <div className="card">
                        <div className="card-header">
                            <h3>Data Coverage</h3>
                        </div>
                        <div className="card-body">
                            <div className="data-stats">
                                <div className="stat-item">
                                    <label>Date Range:</label>
                                    <span>{data_coverage.start_date} to {data_coverage.end_date}</span>
                                </div>
                                <div className="stat-item">
                                    <label>Total Observations:</label>
                                    <span>{data_coverage.total_days?.toLocaleString() || '0'} days</span>
                                </div>
                                <div className="stat-item">
                                    <label>Total Events:</label>
                                    <span>{data_coverage.total_events || 0} geopolitical events</span>
                                </div>
                                <div className="stat-item">
                                    <label>Recent Events:</label>
                                    <span>{recent_events} in the last year</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-4">
                    <div className="card">
                        <div className="card-header">
                            <h3>Event Types</h3>
                        </div>
                        <div className="card-body">
                            <div className="event-types">
                                {Object.entries(event_types).map(([type, count]) => (
                                    <div key={type} className="event-type-item">
                                        <span className={`event-badge event-${type.toLowerCase().replace('_', '-')}`}>
                                            {type.replace('_', ' ')}
                                        </span>
                                        <span className="event-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h3>Quick Actions</h3>
                </div>
                <div className="card-body">
                    <div className="quick-actions">
                        <button className="action-button primary">
                            <FaChartLine />
                            View Price Chart
                        </button>
                        <button className="action-button secondary">
                            <FaCalendarAlt />
                            Analyze Events
                        </button>
                        <button className="action-button secondary">
                            <FaCrosshairs />
                            Explore Change Points
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
