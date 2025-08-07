import { useEffect, useState } from 'react';
import { FiBarChart, FiCalendar, FiSettings, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { apiService } from '../services/apiService';
import './ChangePointsView.css';
import LoadingSpinner from './LoadingSpinner';

const ChangePointsView = () => {
    const [data, setData] = useState({
        changePoints: [],
        prices: [],
        analysis: null
    });
    const [loading, setLoading] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [viewMode, setViewMode] = useState('overview');
    const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
    const [analysisWindow, setAnalysisWindow] = useState(90);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [changePointsData, pricesData] = await Promise.all([
                apiService.getChangePoints(),
                apiService.getOilPrices()
            ]);

            setData({
                changePoints: (changePointsData && changePointsData.data) ? changePointsData.data : [],
                prices: (pricesData && pricesData.data) ? pricesData.data : [],
                analysis: null
            });
        } catch (error) {
            console.error('Error loading change points data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch price analysis for selected change point
    useEffect(() => {
        const fetchAnalysis = async () => {
            if (selectedPoint !== null && filteredChangePoints[selectedPoint]) {
                setLoading(true);
                try {
                    const cp = filteredChangePoints[selectedPoint];
                    // Use change point date as eventId (or create a mapping if needed)
                    // If you have a backend endpoint for change point analysis, use its id or date
                    // Here, we assume you want to fetch price analysis for the date of the change point
                    // If not, you can remove this and use your own logic
                    // Example: await apiService.getPriceAnalysis(cp.id)
                    // For now, just set analysis to null
                    setData(prev => ({ ...prev, analysis: null }));
                } catch (error) {
                    setData(prev => ({ ...prev, analysis: null }));
                } finally {
                    setLoading(false);
                }
            } else {
                setData(prev => ({ ...prev, analysis: null }));
            }
        };
        fetchAnalysis();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPoint, analysisWindow]);

    const getFilteredChangePoints = () => {
        return data.changePoints.filter(cp => cp.confidence >= confidenceThreshold);
    };

    const getChangePointAnalysis = (changePoint) => {
        const cpDate = new Date(changePoint.date);
        const beforeData = data.prices.filter(p => {
            const pDate = new Date(p.date);
            const daysDiff = (cpDate - pDate) / (1000 * 60 * 60 * 24);
            return daysDiff >= 0 && daysDiff <= analysisWindow;
        });

        const afterData = data.prices.filter(p => {
            const pDate = new Date(p.date);
            const daysDiff = (pDate - cpDate) / (1000 * 60 * 60 * 24);
            return daysDiff >= 0 && daysDiff <= analysisWindow;
        });

        if (beforeData.length < 10 || afterData.length < 10) return null;

        const avgBefore = beforeData.reduce((sum, p) => sum + p.price, 0) / beforeData.length;
        const avgAfter = afterData.reduce((sum, p) => sum + p.price, 0) / afterData.length;

        const volatilityBefore = Math.sqrt(
            beforeData.reduce((sum, p) => sum + Math.pow(p.price - avgBefore, 2), 0) / beforeData.length
        );

        const volatilityAfter = Math.sqrt(
            afterData.reduce((sum, p) => sum + Math.pow(p.price - avgAfter, 2), 0) / afterData.length
        );

        const priceChange = ((avgAfter - avgBefore) / avgBefore) * 100;
        const volatilityChange = ((volatilityAfter - volatilityBefore) / volatilityBefore) * 100;

        return {
            avgBefore: avgBefore.toFixed(2),
            avgAfter: avgAfter.toFixed(2),
            priceChange: priceChange.toFixed(2),
            volatilityBefore: volatilityBefore.toFixed(2),
            volatilityAfter: volatilityAfter.toFixed(2),
            volatilityChange: volatilityChange.toFixed(2),
            significance: changePoint.confidence > 0.9 ? 'High' : changePoint.confidence > 0.8 ? 'Medium' : 'Low'
        };
    };

    const getPriceDataWithChangePoints = () => {
        const filteredChangePoints = getFilteredChangePoints();
        return data.prices.map(price => {
            const changePoint = filteredChangePoints.find(cp =>
                Math.abs(new Date(cp.date) - new Date(price.date)) < 24 * 60 * 60 * 1000
            );

            return {
                ...price,
                isChangePoint: !!changePoint,
                changePointConfidence: changePoint ? changePoint.confidence : null,
                changePointType: changePoint ? changePoint.type : null
            };
        });
    };

    const getConfidenceDistribution = () => {
        const bins = [
            { range: '0.5-0.6', count: 0, color: '#e74c3c' },
            { range: '0.6-0.7', count: 0, color: '#f39c12' },
            { range: '0.7-0.8', count: 0, color: '#f1c40f' },
            { range: '0.8-0.9', count: 0, color: '#3498db' },
            { range: '0.9-1.0', count: 0, color: '#27ae60' }
        ];

        data.changePoints.forEach(cp => {
            if (cp.confidence >= 0.5 && cp.confidence < 0.6) bins[0].count++;
            else if (cp.confidence >= 0.6 && cp.confidence < 0.7) bins[1].count++;
            else if (cp.confidence >= 0.7 && cp.confidence < 0.8) bins[2].count++;
            else if (cp.confidence >= 0.8 && cp.confidence < 0.9) bins[3].count++;
            else if (cp.confidence >= 0.9) bins[4].count++;
        });

        return bins;
    };

    const getChangePointStats = () => {
        const filteredPoints = getFilteredChangePoints();
        const avgConfidence = filteredPoints.reduce((sum, cp) => sum + cp.confidence, 0) / filteredPoints.length;

        const typeDistribution = {};
        filteredPoints.forEach(cp => {
            typeDistribution[cp.type] = (typeDistribution[cp.type] || 0) + 1;
        });

        return {
            total: filteredPoints.length,
            avgConfidence: avgConfidence.toFixed(3),
            highConfidence: filteredPoints.filter(cp => cp.confidence > 0.9).length,
            typeDistribution
        };
    };

    if (loading) {
        return <LoadingSpinner message="Loading change points analysis..." />;
    }

    const priceDataWithCP = getPriceDataWithChangePoints();
    const confidenceDistribution = getConfidenceDistribution();
    const changePointStats = getChangePointStats();
    const filteredChangePoints = getFilteredChangePoints();

    return (
        <div className="change-points-view">
            <div className="view-header">
                <div className="header-content">
                    <h1>Bayesian Change Point Analysis</h1>
                    <p>Identifying structural breaks in Brent oil price time series using Bayesian inference</p>
                </div>

                <div className="view-controls">
                    <div className="control-group">
                        <label>View Mode:</label>
                        <select
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            className="control-select"
                        >
                            <option value="overview">Overview</option>
                            <option value="detailed">Detailed Analysis</option>
                            <option value="confidence">Confidence Analysis</option>
                            <option value="comparison">Period Comparison</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Min Confidence:</label>
                        <select
                            value={confidenceThreshold}
                            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                            className="control-select"
                        >
                            <option value={0.5}>50%</option>
                            <option value={0.6}>60%</option>
                            <option value={0.7}>70%</option>
                            <option value={0.8}>80%</option>
                            <option value={0.9}>90%</option>
                        </select>
                    </div>

                    <div className="control-group">
                        <label>Analysis Window:</label>
                        <select
                            value={analysisWindow}
                            onChange={(e) => setAnalysisWindow(parseInt(e.target.value))}
                            className="control-select"
                        >
                            <option value={30}>30 days</option>
                            <option value={60}>60 days</option>
                            <option value={90}>90 days</option>
                            <option value={180}>180 days</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FiTarget />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{changePointStats.total}</div>
                        <div className="stat-label">Change Points Detected</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{changePointStats.avgConfidence}</div>
                        <div className="stat-label">Average Confidence</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiBarChart />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{changePointStats.highConfidence}</div>
                        <div className="stat-label">High Confidence (&gt;90%)</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FiSettings />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{analysisWindow}d</div>
                        <div className="stat-label">Analysis Window</div>
                    </div>
                </div>
            </div>

            <div className="view-content">
                {viewMode === 'overview' && (
                    <div className="overview-mode">
                        <div className="chart-container">
                            <h3>Price Series with Change Points</h3>
                            <ResponsiveContainer width="100%" height={500}>
                                <LineChart data={priceDataWithCP}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                    />
                                    <YAxis
                                        domain={['dataMin - 5', 'dataMax + 5']}
                                        label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        formatter={(value, name) => {
                                            if (name === 'price') return [`$${value.toFixed(2)}`, 'Oil Price'];
                                            return [value, name];
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#3498db"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    {filteredChangePoints.map((cp, index) => (
                                        <ReferenceLine
                                            key={index}
                                            x={cp.date}
                                            stroke={cp.confidence > 0.9 ? '#e74c3c' : cp.confidence > 0.8 ? '#f39c12' : '#95a5a6'}
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            label={{
                                                value: `${(cp.confidence * 100).toFixed(0)}%`,
                                                position: 'top',
                                                style: { fontSize: '12px', fontWeight: 'bold' }
                                            }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {viewMode === 'detailed' && (
                    <div className="detailed-mode">
                        <div className="change-points-list">
                            <h3>Change Points Details</h3>
                            <div className="points-grid">
                                {filteredChangePoints.map((cp, index) => {
                                    const analysis = getChangePointAnalysis(cp);
                                    return (
                                        <div
                                            key={index}
                                            className={`point-card ${selectedPoint === index ? 'selected' : ''}`}
                                            onClick={() => setSelectedPoint(selectedPoint === index ? null : index)}
                                        >
                                            <div className="point-header">
                                                <div className="point-date">
                                                    <FiCalendar />
                                                    {new Date(cp.date).toLocaleDateString()}
                                                </div>
                                                <div className={`confidence-badge ${cp.confidence > 0.9 ? 'high' : cp.confidence > 0.8 ? 'medium' : 'low'}`}>
                                                    {(cp.confidence * 100).toFixed(1)}%
                                                </div>
                                            </div>

                                            <div className="point-type">
                                                <span className="type-label">{cp.type}</span>
                                            </div>

                                            {analysis && (
                                                <div className="point-analysis">
                                                    <div className="analysis-row">
                                                        <span>Price Change:</span>
                                                        <span className={parseFloat(analysis.priceChange) > 0 ? 'positive' : 'negative'}>
                                                            {analysis.priceChange}%
                                                        </span>
                                                    </div>
                                                    <div className="analysis-row">
                                                        <span>Volatility Change:</span>
                                                        <span>{analysis.volatilityChange}%</span>
                                                    </div>
                                                    <div className="analysis-row">
                                                        <span>Significance:</span>
                                                        <span className={`significance ${analysis.significance.toLowerCase()}`}>
                                                            {analysis.significance}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedPoint === index && analysis && (
                                                <div className="point-details">
                                                    <div className="details-grid">
                                                        <div className="detail-item">
                                                            <label>Before Average:</label>
                                                            <span>${analysis.avgBefore}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <label>After Average:</label>
                                                            <span>${analysis.avgAfter}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <label>Before Volatility:</label>
                                                            <span>${analysis.volatilityBefore}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <label>After Volatility:</label>
                                                            <span>${analysis.volatilityAfter}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'confidence' && (
                    <div className="confidence-mode">
                        <div className="chart-container">
                            <h3>Confidence Distribution</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={confidenceDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="range" />
                                    <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3498db" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="confidence-scatter">
                            <h3>Change Points by Confidence</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <ScatterChart data={filteredChangePoints}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        type="category"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                                    />
                                    <YAxis
                                        dataKey="confidence"
                                        domain={[0.5, 1]}
                                        label={{ value: 'Confidence', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        formatter={(value, name) => [
                                            name === 'confidence' ? `${(value * 100).toFixed(1)}%` : value,
                                            name === 'confidence' ? 'Confidence' : name
                                        ]}
                                    />
                                    <Scatter
                                        dataKey="confidence"
                                        fill="#3498db"
                                    />
                                    <ReferenceLine y={0.9} stroke="#e74c3c" strokeDasharray="5 5" />
                                    <ReferenceLine y={0.8} stroke="#f39c12" strokeDasharray="5 5" />
                                    <ReferenceLine y={0.7} stroke="#f1c40f" strokeDasharray="5 5" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {viewMode === 'comparison' && selectedPoint !== null && (
                    <div className="comparison-mode">
                        <div className="period-comparison">
                            <h3>Period Comparison for Change Point {selectedPoint + 1}</h3>
                            {(() => {
                                const cp = filteredChangePoints[selectedPoint];
                                const analysis = getChangePointAnalysis(cp);

                                if (!analysis) return <p>Insufficient data for analysis</p>;

                                return (
                                    <div className="comparison-content">
                                        <div className="comparison-stats">
                                            <div className="period-stat">
                                                <h4>Before Change Point</h4>
                                                <div className="stat-details">
                                                    <p>Average Price: <strong>${analysis.avgBefore}</strong></p>
                                                    <p>Volatility: <strong>${analysis.volatilityBefore}</strong></p>
                                                </div>
                                            </div>

                                            <div className="period-stat">
                                                <h4>After Change Point</h4>
                                                <div className="stat-details">
                                                    <p>Average Price: <strong>${analysis.avgAfter}</strong></p>
                                                    <p>Volatility: <strong>${analysis.volatilityAfter}</strong></p>
                                                </div>
                                            </div>

                                            <div className="period-stat">
                                                <h4>Changes</h4>
                                                <div className="stat-details">
                                                    <p>Price Change: <strong className={parseFloat(analysis.priceChange) > 0 ? 'positive' : 'negative'}>
                                                        {analysis.priceChange}%
                                                    </strong></p>
                                                    <p>Volatility Change: <strong>{analysis.volatilityChange}%</strong></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePointsView;
