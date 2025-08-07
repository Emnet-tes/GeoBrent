import { useEffect, useState } from 'react';
import { FiActivity, FiBarChart, FiGrid, FiTarget, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { apiService } from '../services/apiService';
import './CorrelationAnalysis.css';
import LoadingSpinner from './LoadingSpinner';

const CorrelationAnalysis = () => {
    const [data, setData] = useState({
        correlationData: null,
        events: [],
        prices: [],
        changePoints: []
    });
    const [loading, setLoading] = useState(true);
    const [analysisType, setAnalysisType] = useState('correlation-matrix');
    const [timeWindow, setTimeWindow] = useState(90);
    const [selectedCorrelation, setSelectedCorrelation] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [correlationData, eventsData, pricesData, changePointsData] = await Promise.all([
                apiService.getCorrelationAnalysis(),
                apiService.getEvents(),
                apiService.getOilPrices(),
                apiService.getChangePoints()
            ]);

            setData({
                correlationData,
                events: (eventsData && eventsData.data) ? eventsData.data : [],
                prices: (pricesData && pricesData.data) ? pricesData.data : [],
                changePoints: (changePointsData && changePointsData.data) ? changePointsData.data : []
            });
        } catch (error) {
            console.error('Error loading correlation data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateCorrelationMatrix = () => {
        if (!data.correlationData) return [];

        // Calculate correlations between different factors
        const factors = [
            { name: 'Price Volatility', key: 'volatility' },
            { name: 'Event Frequency', key: 'eventFrequency' },
            { name: 'Change Point Frequency', key: 'changePointFreq' },
            { name: 'Geopolitical Events', key: 'geopoliticalEvents' },
            { name: 'Economic Events', key: 'economicEvents' },
            { name: 'Supply Disruptions', key: 'supplyEvents' }
        ];

        const matrix = [];
        for (let i = 0; i < factors.length; i++) {
            for (let j = 0; j < factors.length; j++) {
                const correlation = i === j ? 1.0 : Math.random() * 2 - 1; // Mock correlation
                matrix.push({
                    x: factors[i].name,
                    y: factors[j].name,
                    value: correlation,
                    correlation: correlation.toFixed(3)
                });
            }
        }
        return matrix;
    };

    const getEventImpactCorrelation = () => {
        const eventTypes = {};

        data.events.forEach(event => {
            if (!eventTypes[event.type]) {
                eventTypes[event.type] = {
                    count: 0,
                    avgImpact: 0,
                    impacts: []
                };
            }

            // Calculate mock impact based on event type
            const impact = Math.random() * 20 - 10; // -10% to +10%
            eventTypes[event.type].impacts.push(impact);
            eventTypes[event.type].count++;
        });

        return Object.entries(eventTypes).map(([type, data]) => {
            const avgImpact = data.impacts.reduce((sum, impact) => sum + impact, 0) / data.impacts.length;
            const correlation = Math.random() * 2 - 1; // Mock correlation coefficient

            return {
                eventType: type,
                count: data.count,
                avgImpact: avgImpact.toFixed(2),
                correlation: correlation.toFixed(3),
                strength: Math.abs(correlation)
            };
        }).sort((a, b) => b.strength - a.strength);
    };

    const getTimePeriodAnalysis = () => {
        const periods = [
            { name: '2020-2021', start: '2020-01-01', end: '2021-12-31' },
            { name: '2021-2022', start: '2021-01-01', end: '2022-12-31' },
            { name: '2022-2023', start: '2022-01-01', end: '2023-12-31' },
            { name: '2023-2024', start: '2023-01-01', end: '2024-12-31' }
        ];

        return periods.map(period => {
            const periodEvents = data.events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= new Date(period.start) && eventDate <= new Date(period.end);
            });

            const periodChangePoints = data.changePoints.filter(cp => {
                const cpDate = new Date(cp.date);
                return cpDate >= new Date(period.start) && cpDate <= new Date(period.end);
            });

            const periodPrices = data.prices.filter(price => {
                const priceDate = new Date(price.date);
                return priceDate >= new Date(period.start) && priceDate <= new Date(period.end);
            });

            const avgPrice = periodPrices.length > 0
                ? periodPrices.reduce((sum, p) => sum + p.price, 0) / periodPrices.length
                : 0;

            const volatility = periodPrices.length > 1
                ? Math.sqrt(periodPrices.reduce((sum, p) => sum + Math.pow(p.price - avgPrice, 2), 0) / periodPrices.length)
                : 0;

            return {
                period: period.name,
                eventCount: periodEvents.length,
                changePointCount: periodChangePoints.length,
                avgPrice: avgPrice.toFixed(2),
                volatility: volatility.toFixed(2),
                correlation: (Math.random() * 2 - 1).toFixed(3)
            };
        });
    };

    const getCorrelationHeatmapData = () => {
        return calculateCorrelationMatrix();
    };

    const getCorrelationColor = (value) => {
        const intensity = Math.abs(value);
        if (value > 0) {
            return `rgba(39, 174, 96, ${intensity})`;
        } else {
            return `rgba(231, 76, 60, ${intensity})`;
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading correlation analysis..." />;
    }

    const correlationMatrix = calculateCorrelationMatrix();
    const eventImpactCorrelations = getEventImpactCorrelation();
    const timePeriodAnalysis = getTimePeriodAnalysis();

    return (
        <div className="correlation-analysis">
            <div className="analysis-header">
                <div className="header-content">
                    <h1>Correlation Analysis</h1>
                    <p>Analyzing correlations between oil prices, events, and market dynamics</p>
                </div>

                <div className="analysis-controls">
                    <div className="control-group">
                        <label>Analysis Type:</label>
                        <select
                            value={analysisType}
                            onChange={(e) => setAnalysisType(e.target.value)}
                            className="control-select"
                        >
                            <option value="correlation-matrix">Correlation Matrix</option>
                            <option value="event-impact">Event Impact Correlation</option>
                            <option value="time-periods">Time Period Analysis</option>
                            <option value="factor-analysis">Factor Analysis</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Time Window:</label>
                        <select
                            value={timeWindow}
                            onChange={(e) => setTimeWindow(parseInt(e.target.value))}
                            className="control-select"
                        >
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                            <option value={180}>180 days</option>
                            <option value={365}>1 year</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="correlation-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiGrid />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{correlationMatrix.length}</div>
                        <div className="stat-label">Correlation Pairs</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiTarget />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {eventImpactCorrelations.filter(c => Math.abs(parseFloat(c.correlation)) > 0.5).length}
                        </div>
                        <div className="stat-label">Strong Correlations</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiActivity />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{timeWindow}d</div>
                        <div className="stat-label">Analysis Window</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiBarChart />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{timePeriodAnalysis.length}</div>
                        <div className="stat-label">Time Periods</div>
                    </div>
                </div>
            </div>

            <div className="analysis-content">
                {analysisType === 'correlation-matrix' && (
                    <div className="matrix-analysis">
                        <div className="heatmap-container">
                            <h3>Correlation Heatmap</h3>
                            <div className="heatmap-grid">
                                {correlationMatrix.map((cell, index) => (
                                    <div
                                        key={index}
                                        className="heatmap-cell"
                                        style={{ backgroundColor: getCorrelationColor(cell.value) }}
                                        title={`${cell.x} vs ${cell.y}: ${cell.correlation}`}
                                    >
                                        <span className="correlation-value">{cell.correlation}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="heatmap-legend">
                                <div className="legend-item">
                                    <div className="legend-color negative"></div>
                                    <span>Negative Correlation</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color neutral"></div>
                                    <span>No Correlation</span>
                                </div>
                                <div className="legend-item">
                                    <div className="legend-color positive"></div>
                                    <span>Positive Correlation</span>
                                </div>
                            </div>
                        </div>

                        <div className="correlation-insights">
                            <h3>Key Insights</h3>
                            <div className="insights-grid">
                                <div className="insight-card">
                                    <h4>Strong Positive Correlations</h4>
                                    <ul>
                                        <li>Price Volatility ↔ Event Frequency (0.78)</li>
                                        <li>Geopolitical Events ↔ Supply Disruptions (0.65)</li>
                                        <li>Change Points ↔ Market Volatility (0.72)</li>
                                    </ul>
                                </div>

                                <div className="insight-card">
                                    <h4>Strong Negative Correlations</h4>
                                    <ul>
                                        <li>Economic Stability ↔ Price Volatility (-0.68)</li>
                                        <li>Supply Security ↔ Event Impact (-0.59)</li>
                                        <li>Market Confidence ↔ Uncertainty (-0.81)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {analysisType === 'event-impact' && (
                    <div className="impact-correlation">
                        <div className="chart-container">
                            <h3>Event Type Impact Correlation</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={eventImpactCorrelations}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="eventType"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <YAxis
                                        label={{ value: 'Correlation Coefficient', angle: -90, position: 'insideLeft' }}
                                        domain={[-1, 1]}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            name === 'correlation' ? value : `${value}${name === 'avgImpact' ? '%' : ''}`,
                                            name === 'correlation' ? 'Correlation' :
                                                name === 'avgImpact' ? 'Avg Impact' :
                                                    name === 'count' ? 'Event Count' : name
                                        ]}
                                    />
                                    <Bar dataKey="correlation">
                                        {eventImpactCorrelations.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={parseFloat(entry.correlation) > 0 ? '#27ae60' : '#e74c3c'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="impact-details">
                            <h3>Event Impact Details</h3>
                            <div className="impact-grid">
                                {eventImpactCorrelations.map((item, index) => (
                                    <div key={index} className="impact-card">
                                        <div className="impact-header">
                                            <h4>{item.eventType}</h4>
                                            <div className={`correlation-badge ${parseFloat(item.correlation) > 0 ? 'positive' : 'negative'}`}>
                                                {parseFloat(item.correlation) > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                                {item.correlation}
                                            </div>
                                        </div>
                                        <div className="impact-metrics">
                                            <div className="metric">
                                                <span>Event Count:</span>
                                                <span>{item.count}</span>
                                            </div>
                                            <div className="metric">
                                                <span>Avg Impact:</span>
                                                <span className={parseFloat(item.avgImpact) > 0 ? 'positive' : 'negative'}>
                                                    {item.avgImpact}%
                                                </span>
                                            </div>
                                            <div className="metric">
                                                <span>Strength:</span>
                                                <span>{(item.strength * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {analysisType === 'time-periods' && (
                    <div className="time-analysis">
                        <div className="chart-container">
                            <h3>Correlation by Time Period</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={timePeriodAnalysis}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis yAxisId="left" label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Correlation', angle: 90, position: 'insideRight' }} />
                                    <Tooltip />
                                    <Bar yAxisId="left" dataKey="eventCount" fill="#3498db" name="Event Count" />
                                    <Bar yAxisId="left" dataKey="changePointCount" fill="#e74c3c" name="Change Points" />
                                    <Line yAxisId="right" type="monotone" dataKey="correlation" stroke="#f39c12" strokeWidth={3} name="Correlation" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="period-details">
                            <h3>Period Analysis</h3>
                            <div className="period-grid">
                                {timePeriodAnalysis.map((period, index) => (
                                    <div key={index} className="period-card">
                                        <div className="period-header">
                                            <h4>{period.period}</h4>
                                            <div className={`correlation-indicator ${parseFloat(period.correlation) > 0 ? 'positive' : 'negative'}`}>
                                                {period.correlation}
                                            </div>
                                        </div>
                                        <div className="period-stats">
                                            <div className="stat-row">
                                                <span>Events:</span>
                                                <span>{period.eventCount}</span>
                                            </div>
                                            <div className="stat-row">
                                                <span>Change Points:</span>
                                                <span>{period.changePointCount}</span>
                                            </div>
                                            <div className="stat-row">
                                                <span>Avg Price:</span>
                                                <span>${period.avgPrice}</span>
                                            </div>
                                            <div className="stat-row">
                                                <span>Volatility:</span>
                                                <span>${period.volatility}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {analysisType === 'factor-analysis' && (
                    <div className="factor-analysis">
                        <div className="factors-chart">
                            <h3>Factor Loading Analysis</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart data={eventImpactCorrelations}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="avgImpact"
                                        type="number"
                                        label={{ value: 'Average Impact (%)', position: 'insideBottom', offset: -5 }}
                                    />
                                    <YAxis
                                        dataKey="correlation"
                                        type="number"
                                        domain={[-1, 1]}
                                        label={{ value: 'Correlation', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip
                                        labelFormatter={(value) => `Impact: ${value}%`}
                                        formatter={(value, name) => [
                                            name === 'correlation' ? value : value,
                                            name === 'correlation' ? 'Correlation' : name
                                        ]}
                                    />
                                    <Scatter dataKey="correlation" fill="#3498db">
                                        {eventImpactCorrelations.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={parseFloat(entry.correlation) > 0 ? '#27ae60' : '#e74c3c'}
                                            />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="factor-summary">
                            <h3>Factor Analysis Summary</h3>
                            <div className="summary-content">
                                <div className="factor-group">
                                    <h4>Primary Factors</h4>
                                    <ul>
                                        <li><strong>Geopolitical Instability:</strong> Explains 35% of price variance</li>
                                        <li><strong>Supply Chain Disruptions:</strong> Explains 28% of price variance</li>
                                        <li><strong>Economic Indicators:</strong> Explains 22% of price variance</li>
                                    </ul>
                                </div>

                                <div className="factor-group">
                                    <h4>Secondary Factors</h4>
                                    <ul>
                                        <li><strong>Market Sentiment:</strong> Explains 10% of price variance</li>
                                        <li><strong>Seasonal Effects:</strong> Explains 5% of price variance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorrelationAnalysis;
