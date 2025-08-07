import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './styles/App.css';

// Components
import ChangePointsView from './components/ChangePointsView';
import CorrelationAnalysis from './components/CorrelationAnalysis';
import Dashboard from './components/Dashboard';
import EventsAnalysis from './components/EventsAnalysis';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import PriceChart from './components/PriceChart';
import Sidebar from './components/Sidebar';

// Services
import { apiService } from './services/apiService';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const summary = await apiService.getDashboardSummary();
            setDashboardData(summary);
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Router>
            <div className="app">
                <Header onToggleSidebar={toggleSidebar} />
                <div className="app-body">
                    <Sidebar isOpen={sidebarOpen} />
                    <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                        <Routes>
                            <Route
                                path="/"
                                element={<Dashboard dashboardData={dashboardData} />}
                            />
                            <Route
                                path="/price-chart"
                                element={<PriceChart />}
                            />
                            <Route
                                path="/events"
                                element={<EventsAnalysis />}
                            />
                            <Route
                                path="/change-points"
                                element={<ChangePointsView />}
                            />
                            <Route
                                path="/correlation"
                                element={<CorrelationAnalysis />}
                            />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;
