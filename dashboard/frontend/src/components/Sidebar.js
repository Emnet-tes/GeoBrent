import {
    FaCalendarAlt,
    FaChartLine,
    FaCrosshairs,
    FaProjectDiagram,
    FaTachometerAlt
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
    const navItems = [
        { path: '/', icon: FaTachometerAlt, label: 'Dashboard', exact: true },
        { path: '/price-chart', icon: FaChartLine, label: 'Price Chart' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events Analysis' },
        { path: '/change-points', icon: FaCrosshairs, label: 'Change Points' },
        { path: '/correlation', icon: FaProjectDiagram, label: 'Correlation' },
    ];

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <nav className="nav">
                {navItems.map(({ path, icon: Icon, label, exact }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={exact}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <Icon className="nav-icon" />
                        <span className="nav-label">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
