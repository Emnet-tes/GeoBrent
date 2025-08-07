import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import './EventsAnalysis.css';
import LoadingSpinner from './LoadingSpinner';

const EventsAnalysis = () => {
    const [data, setData] = useState({
        events: [],
        prices: [],
    });
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [analysisType, setAnalysisType] = useState('impact');
    const [timeWindow, setTimeWindow] = useState(30);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchAnalysis(selectedEvent.id);
        } else {
            setAnalysis(null);
        }
    }, [selectedEvent, timeWindow]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [eventsData, pricesData] = await Promise.all([
                apiService.getEvents(),
                apiService.getOilPrices()
            ]);
            setData({
                events: eventsData.data,
                prices: pricesData
            });
        } catch (error) {
            console.error('Error loading events data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalysis = async (eventId) => {
        try {
            setLoading(true);
            const analysisData = await apiService.getPriceAnalysis(eventId);
            setAnalysis(analysisData);
        } catch (error) {
            console.error('Error loading price analysis:', error);
            setAnalysis(null);
        } finally {
            setLoading(false);
        }
    };




    const formatTooltipContent = (value, name, props) => {
        if (name === 'impact') {
            return [`${value}%`, 'Price Impact'];
        }
        if (name === 'volatility') {
            return [`${value}%`, 'Volatility'];
        }
        return [value, name];
    };

    const formatTooltipLabel = (label, payload) => {
        if (payload && payload.length > 0) {
            const data = payload[0].payload;
            return (
                <div>
                    <p className="tooltip-date">{new Date(label).toLocaleDateString()}</p>
                    <p><strong>{data.type}</strong></p>
                    <p>{data.description}</p>
                </div>
            );
        }
        return new Date(label).toLocaleDateString();
    };

    if (loading) {
        return <LoadingSpinner message="Loading events analysis..." />;
    }

    // For event selection dropdown
    const eventOptions = data.events.map(event => ({
        value: event.id,
        label: `${new Date(event.date).toLocaleDateString()} - ${event.type}`
    }));

    return (
        <div className="events-analysis">
            <div className="analysis-header">
                <div className="header-content">
                    <h1>Events Impact Analysis</h1>
                    <p>Analyzing the impact of geopolitical events on Brent oil prices</p>
                </div>

                <div className="analysis-controls">
                    <div className="control-group">
                        <label>Analysis Type:</label>
                        <select
                            value={analysisType}
                            onChange={(e) => setAnalysisType(e.target.value)}
                            className="control-select"
                        >
                            <option value="impact">Price Impact</option>
                            <option value="volatility">Volatility</option>
                            <option value="timeline">Timeline View</option>
                            <option value="types">Event Types</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Time Window (days):</label>
                        <select
                            value={timeWindow}
                            onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                            className="control-select"
                        >
                            <option value={7}>7 days</option>
                            <option value={14}>14 days</option>
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Select Event:</label>
                        <select
                            value={selectedEvent ? selectedEvent.id : ''}
                            onChange={e => {
                                const eventId = e.target.value;
                                const eventObj = data.events.find(ev => String(ev.id) === String(eventId));
                                setSelectedEvent(eventObj || null);
                            }}
                            className="control-select"
                        >
                            <option value="">-- Select Event --</option>
                            {eventOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="analysis-content">
                {selectedEvent ? (
                    analysis && analysis.impact !== undefined ? (
                        <div className="impact-analysis">
                            <h3>Impact Analysis for Selected Event</h3>
                            <div className="event-details">
                                <strong>{selectedEvent.type}</strong> - {selectedEvent.description}<br />
                                <span>Date: {new Date(selectedEvent.date).toLocaleDateString()}</span>
                            </div>
                            <div className="event-metrics">
                                <span>Price Change: {analysis.impact && analysis.impact.price_change ? analysis.impact.price_change.toFixed(2) : 'N/A'}</span>
                                <span>Price Change (%): {analysis.impact && analysis.impact.price_change_pct ? analysis.impact.price_change_pct.toFixed(2) + '%' : 'N/A'}</span>
                                <span>Volatility Change: {analysis.impact && analysis.impact.volatility_change ? analysis.impact.volatility_change.toFixed(2) : 'N/A'}</span>
                                {/* If you want to show before/after stats, you can add them here using analysis.statistics.before_event and after_event */}
                            </div>
                        </div>
                    ) : (
                        <div className="no-event-selected">
                            <p>No analysis data available for this event.</p>
                        </div>
                    )
                ) : (
                    <div className="no-event-selected">
                        <p>Please select an event to view its impact analysis.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsAnalysis;
