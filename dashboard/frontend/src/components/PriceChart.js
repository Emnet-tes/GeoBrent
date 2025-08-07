import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaDownload, FaExpand } from 'react-icons/fa';
import Select from 'react-select';
import {
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { apiService } from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';
import './PriceChart.css';

const PriceChart = () => {
    const [priceData, setPriceData] = useState([]);
    const [events, setEvents] = useState([]);
    const [changePoints, setChangePoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
        endDate: new Date()
    });
    const [selectedMetrics, setSelectedMetrics] = useState([
        { value: 'Price', label: 'Price ($)', color: '#2ecc71' },
        { value: 'MA_30', label: '30-day MA', color: '#3498db' }
    ]);
    const [showEvents, setShowEvents] = useState(true);
    const [showChangePoints, setShowChangePoints] = useState(true);
    const [chartHeight, setChartHeight] = useState(400);

    const metricOptions = [
        { value: 'Price', label: 'Price ($)', color: '#2ecc71' },
        { value: 'MA_30', label: '30-day Moving Average', color: '#3498db' },
        { value: 'MA_90', label: '90-day Moving Average', color: '#9b59b6' },
        { value: 'Volatility', label: '30-day Volatility', color: '#e74c3c' }
    ];

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        try {
            setLoading(true);

            const startDate = dateRange.startDate.toISOString().split('T')[0];
            const endDate = dateRange.endDate.toISOString().split('T')[0];

            const [priceResponse, eventsResponse, changePointsResponse] = await Promise.all([
                apiService.getOilPrices(startDate, endDate),
                apiService.getEvents(),
                apiService.getChangePoints()
            ]);

            // Process price data
            const processedData = priceResponse.data.map(item => ({
                ...item,
                Date: new Date(item.Date).getTime(), // Convert to timestamp for Recharts
                DateFormatted: item.Date // Keep original format for tooltips
            }));

            setPriceData(processedData);
            setEvents(eventsResponse.data);
            setChangePoints(changePointsResponse.data);
        } catch (error) {
            console.error('Error loading chart data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatXAxisDate = (tickItem) => {
        return new Date(tickItem).toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit'
        });
    };

    const formatTooltipDate = (value) => {
        return new Date(value).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-date">{formatTooltipDate(label)}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {entry.value?.toFixed(2)}
                            {entry.dataKey === 'Price' ? ' USD' :
                                entry.dataKey.includes('Volatility') ? '%' : ''}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const getEventMarkers = () => {
        return events
            .filter(event => {
                const eventDate = new Date(event.date).getTime();
                return eventDate >= dateRange.startDate.getTime() &&
                    eventDate <= dateRange.endDate.getTime();
            })
            .map(event => ({
                x: new Date(event.date).getTime(),
                label: event.event,
                type: event.type,
                impact: event.impact
            }));
    };

    const getChangePointMarkers = () => {
        return changePoints
            .filter(cp => {
                const cpDate = new Date(cp.date).getTime();
                return cpDate >= dateRange.startDate.getTime() &&
                    cpDate <= dateRange.endDate.getTime();
            })
            .map(cp => ({
                x: new Date(cp.date).getTime(),
                label: cp.description,
                confidence: cp.confidence
            }));
    };

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        if (start && end) {
            setDateRange({ startDate: start, endDate: end });
        }
    };

    const toggleFullscreen = () => {
        setChartHeight(chartHeight === 400 ? 600 : 400);
    };

    const exportData = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Date,Price,MA_30,MA_90,Volatility\n" +
            priceData.map(row =>
                `${row.DateFormatted},${row.Price},${row.MA_30 || ''},${row.MA_90 || ''},${row.Volatility || ''}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "brent_oil_prices.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <LoadingSpinner message="Loading price chart data..." />;
    }

    return (
        <div className="price-chart-container">
            <div className="chart-header">
                <div className="chart-title">
                    <h2>Brent Oil Price Analysis</h2>
                    <p>Interactive price chart with events and change points</p>
                </div>
                <div className="chart-controls">
                    <button
                        className="btn btn-outline"
                        onClick={toggleFullscreen}
                        title="Toggle fullscreen"
                    >
                        <FaExpand />
                    </button>
                    <button
                        className="btn btn-outline"
                        onClick={exportData}
                        title="Export data"
                    >
                        <FaDownload />
                    </button>
                </div>
            </div>

            <div className="filters-row">
                <div className="filter-group">
                    <label className="filter-label">
                        <FaCalendarAlt />
                        Date Range
                    </label>
                    <DatePicker
                        selectsRange={true}
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onChange={handleDateRangeChange}
                        className="date-picker"
                        dateFormat="MMM d, yyyy"
                        maxDate={new Date()}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-label">Metrics to Display</label>
                    <Select
                        isMulti
                        value={selectedMetrics}
                        onChange={setSelectedMetrics}
                        options={metricOptions}
                        className="metrics-select"
                        placeholder="Select metrics..."
                    />
                </div>

                <div className="filter-group toggle-group">
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={showEvents}
                            onChange={(e) => setShowEvents(e.target.checked)}
                        />
                        Show Events
                    </label>
                    <label className="toggle-label">
                        <input
                            type="checkbox"
                            checked={showChangePoints}
                            onChange={(e) => setShowChangePoints(e.target.checked)}
                        />
                        Show Change Points
                    </label>
                </div>
            </div>

            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <LineChart data={priceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="Date"
                            type="number"
                            scale="time"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={formatXAxisDate}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis yAxisId="price" orientation="left" />
                        <YAxis yAxisId="volatility" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Price lines */}
                        {selectedMetrics.map(metric => {
                            if (metric.value === 'Volatility') {
                                return (
                                    <Line
                                        key={metric.value}
                                        yAxisId="volatility"
                                        type="monotone"
                                        dataKey={metric.value}
                                        stroke={metric.color}
                                        strokeWidth={2}
                                        dot={false}
                                        name={metric.label}
                                    />
                                );
                            } else {
                                return (
                                    <Line
                                        key={metric.value}
                                        yAxisId="price"
                                        type="monotone"
                                        dataKey={metric.value}
                                        stroke={metric.color}
                                        strokeWidth={metric.value === 'Price' ? 3 : 2}
                                        dot={false}
                                        name={metric.label}
                                    />
                                );
                            }
                        })}

                        {/* Event markers */}
                        {showEvents && getEventMarkers().map((event, index) => (
                            <ReferenceLine
                                key={`event-${index}`}
                                x={event.x}
                                stroke={event.impact === 'Very High' ? '#e74c3c' :
                                    event.impact === 'High' ? '#f39c12' : '#3498db'}
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                yAxisId="price"
                                label={{
                                    value: event.label,
                                    position: 'top',
                                    style: { fontSize: '10px', fill: '#666' }
                                }}
                            />
                        ))}

                        {/* Change point markers */}
                        {showChangePoints && getChangePointMarkers().map((cp, index) => (
                            <ReferenceLine
                                key={`cp-${index}`}
                                x={cp.x}
                                stroke="#9b59b6"
                                strokeDasharray="2 2"
                                strokeWidth={3}
                                yAxisId="price"
                                label={{
                                    value: `CP (${(cp.confidence * 100).toFixed(0)}%)`,
                                    position: 'bottom',
                                    style: { fontSize: '9px', fill: '#9b59b6' }
                                }}
                            />
                        ))}

                        {/* Brush for zooming */}
                        <Brush dataKey="Date" height={30} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-legend">
                <div className="legend-section">
                    <h4>Event Types</h4>
                    <div className="legend-items">
                        <span className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
                            Very High Impact
                        </span>
                        <span className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#f39c12' }}></div>
                            High Impact
                        </span>
                        <span className="legend-item">
                            <div className="legend-color" style={{ backgroundColor: '#3498db' }}></div>
                            Medium/Low Impact
                        </span>
                    </div>
                </div>
                <div className="legend-section">
                    <h4>Change Points</h4>
                    <div className="legend-items">
                        <span className="legend-item">
                            <div className="legend-line" style={{ borderColor: '#9b59b6', borderStyle: 'dashed' }}></div>
                            Bayesian Change Points
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceChart;
