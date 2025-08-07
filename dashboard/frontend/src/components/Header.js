import { FaBars, FaChartLine, FaOilWell } from 'react-icons/fa6';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
    return (
        <header className="header">
            <div className="header-left">
                <button className="sidebar-toggle" onClick={onToggleSidebar}>
                    <FaBars />
                </button>
                <div className="logo">
                    <FaOilWell className="logo-icon" />
                    <h1 className="logo-text">GeoBrent Dashboard</h1>
                </div>
            </div>
            <div className="header-right">
                <div className="header-info">
                    <FaChartLine className="header-icon" />
                    <span>Brent Oil Price Analysis</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
