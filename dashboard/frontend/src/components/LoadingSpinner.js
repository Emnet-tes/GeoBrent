import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading dashboard data...' }) => {
    return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-message">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
