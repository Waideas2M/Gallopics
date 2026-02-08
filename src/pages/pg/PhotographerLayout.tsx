import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, CreditCard, Settings, DollarSign, FileText, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { Header } from '../../components/Header';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Footer } from '../../components/Footer';
import './PhotographerLayout.css';

export const PhotographerLayout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="pg-layout-shell">
            <Header />

            <div className="pg-workspace-container">
                <aside className={`pg-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                    <div className="pg-sidebar-header">
                        {!isCollapsed && <span className="pg-sidebar-label">My Studio</span>}
                        <button
                            className="pg-collapse-btn"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>

                    <nav className="pg-nav">
                        <NavLink to="/pg/events" className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Events" : ""}>
                            <LayoutGrid size={20} />
                            <span>Events</span>
                        </NavLink>
                        <NavLink to="/pg/sold" className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Sold photos" : ""}>
                            <DollarSign size={20} />
                            <span>Sales</span>
                        </NavLink>
                        <NavLink to="/pg/receipts" className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Receipts" : ""}>
                            <FileText size={20} />
                            <span>Receipts</span>
                        </NavLink>
                        <div className="pg-nav-divider" />
                        <NavLink to="/pg/billing" className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Billing details" : ""}>
                            <CreditCard size={20} />
                            <span>Billing details</span>
                        </NavLink>
                        <NavLink to="/pg/settings" className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Settings" : ""}>
                            <Settings size={20} />
                            <span>Settings</span>
                        </NavLink>
                        <NavLink to="/pg/tokens" className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Tokens" : ""}>
                            <Palette size={20} />
                            <span>Tokens</span>
                        </NavLink>
                    </nav>

                    <div className="pg-sidebar-footer">
                        <Footer minimal={true} sidebar={true} />
                    </div>
                </aside>

                <main className="pg-main">
                    <div className="pg-content-area">
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    );
};
