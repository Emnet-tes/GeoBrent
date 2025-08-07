import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                console.log(`Making API request to: ${config.url}`);
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error) => {
                console.error('API Error:', error);
                throw error;
            }
        );
    }

    // Health check
    async healthCheck() {
        return this.api.get('/health');
    }

    // Get oil price data
    async getOilPrices(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        return this.api.get('/oil-prices', { params });
    }

    // Get events data
    async getEvents(eventType = null, impactLevel = null) {
        const params = {};
        if (eventType) params.type = eventType;
        if (impactLevel) params.impact = impactLevel;

        return this.api.get('/events', { params });
    }

    // Get change points
    async getChangePoints() {
        return this.api.get('/change-points');
    }

    // Get price analysis for specific event
    async getPriceAnalysis(eventId) {
        return this.api.get(`/price-analysis/${eventId}`);
    }

    // Get dashboard summary
    async getDashboardSummary() {
        return this.api.get('/dashboard-summary');
    }

    // Get correlation analysis
    async getCorrelationAnalysis() {
        return this.api.get('/correlation-analysis');
    }
}

export const apiService = new ApiService();
