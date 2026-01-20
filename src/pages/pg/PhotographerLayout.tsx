import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, CreditCard, Settings, DollarSign, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Header } from '../../components/Header';
import { UploadOverlay } from './UploadOverlay';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Footer } from '../../components/Footer';
import './PhotographerLayout.css';

export const PhotographerLayout: React.FC = () => {
    // We don't need useAuth for user chip anymore as Header handles it.

    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="pg-layout-shell">
            {/* 1. Global Header (Shared) */}
            <Header />

            {/* 2. Workspace Content (Split View) */}
            <div className="pg-workspace-container">
                {/* Left Sidebar */}
                <aside className={`pg-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                    <div className="pg-sidebar-header">
                        {!isCollapsed && <span className="pg-sidebar-label">Workspace</span>}
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
                            <span>Sold photos</span>
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
                    </nav>


                    <div className="pg-sidebar-footer">
                        <Footer minimal={true} sidebar={true} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="pg-main">
                    <div className="pg-content-area">
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </div>
                </main>
            </div>

            <UploadOverlay />
        </div>
    );
};
