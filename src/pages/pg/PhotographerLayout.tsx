import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, CreditCard, Settings, DollarSign, FileText, ChevronLeft, ChevronRight, Palette, Users } from 'lucide-react';
import { Header } from '../../components/Header';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { Footer } from '../../components/Footer';
import { useWorkspace } from '../../context/WorkspaceContext';
import './PhotographerLayout.css';

export const PhotographerLayout: React.FC = () => {
    const { basePath, isAdmin } = useWorkspace();
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
                        <div className="pg-nav-section">
                            {!isCollapsed && <div className="pg-nav-label">Main</div>}

                            {/* Events */}
                            <NavLink to={`${basePath}/events`} className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Events" : ""}>
                                <LayoutGrid size={20} />
                                <span>Events</span>
                            </NavLink>

                            {/* Photographers (Admin Only) */}
                            {isAdmin && (
                                <NavLink to={`${basePath}/photographers`} className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Photographers" : ""}>
                                    <Users size={20} />
                                    <span>Photographers</span>
                                </NavLink>
                            )}
                        </div>

                        <div className="pg-nav-section">
                            {!isCollapsed && <div className="pg-nav-label">Business</div>}
                            <NavLink to={`${basePath}/sold`} className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Sales" : ""}>
                                <DollarSign size={20} />
                                <span>Sales</span>
                            </NavLink>
                            <NavLink to={`${basePath}/receipts`} className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Receipts" : ""}>
                                <FileText size={20} />
                                <span>Receipts</span>
                            </NavLink>
                        </div>

                        <div className="pg-nav-divider" />

                        <div className="pg-nav-section">
                            {!isCollapsed && <div className="pg-nav-label">Account</div>}
                            <NavLink to={`${basePath}/billing`} className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Billing details" : ""}>
                                <CreditCard size={20} />
                                <span>Billing details</span>
                            </NavLink>
                            <NavLink to={`${basePath}/settings`} className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Settings" : ""}>
                                <Settings size={20} />
                                <span>Settings</span>
                            </NavLink>
                            <NavLink to={`${basePath}/tokens`} className={({ isActive }) => `pg-nav-item ${isActive ? 'active' : ''}`} title={isCollapsed ? "Tokens" : ""}>
                                <Palette size={20} />
                                <span>Tokens</span>
                            </NavLink>
                        </div>

                        {/* Safe space at bottom of list */}
                        <div className="pg-nav-spacer" />
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
