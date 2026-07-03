import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import ChangePasswordModal from './ChangePasswordModal';

const navItems = [
    {
        section: 'Main',
        items: [
            { path: '/dashboard', label: 'Dashboard', roles: ['administrator', 'teacher', 'parent'] },
        ]
    },
    {
        section: 'Academic',
        items: [
            { path: '/students', label: 'Students', roles: ['administrator', 'teacher'] },
            { path: '/attendance', label: 'Attendance', roles: ['administrator', 'teacher', 'parent'] },
            { path: '/grades', label: 'Grades & Reports', roles: ['administrator', 'teacher', 'parent'] },
        ]
    },
    {
        section: 'Management',
        items: [
            { path: '/teachers', label: 'Teachers', roles: ['administrator'] },
            { path: '/announcements', label: 'Announcements', roles: ['administrator', 'teacher', 'parent'] },
            { path: '/holidays', label: 'Holidays', roles: ['administrator'] },
            { path: '/users', label: 'User Accounts', roles: ['administrator'] },
        ]
    },
];

function Layout({ children, pageTitle }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const visibleSections = navItems.map(section => ({
        ...section,
        items: section.items.filter(item => item.roles.includes(user?.role)),
    })).filter(section => section.items.length > 0);

    const roleLabel = (role) => {
        if (role === 'administrator') return 'Administrator';
        if (role === 'teacher') return 'Teacher';
        if (role === 'parent') return 'Parent';
        return role;
    };

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'inherit', overflow: 'hidden' }}>

            {/* Sidebar */}
            <div style={{
                width: '220px',
                background: '#111827',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflowY: 'auto',
            }}>
                {/* Logo */}
                <div style={{
                    padding: '20px 16px 16px',
                    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px', height: '34px', background: '#059669',
                            borderRadius: '8px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#f9fafb' }}>School MS</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Management System</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {visibleSections.map(section => (
                        <div key={section.section}>
                            <div style={{
                                fontSize: '10px', color: '#4b5563', fontWeight: '500',
                                letterSpacing: '0.08em', padding: '8px 8px 4px',
                                textTransform: 'uppercase',
                            }}>
                                {section.section}
                            </div>
                            {section.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '8px 10px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        textDecoration: 'none',
                                        color: isActive ? 'white' : '#9ca3af',
                                        background: isActive ? '#059669' : 'transparent',
                                        fontWeight: isActive ? '500' : '400',
                                        transition: 'all 0.15s',
                                    })}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Right side: topbar + content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Top bar — matches sidebar color */}
                <div style={{
                    height: '56px',
                    background: '#111827',
                    borderBottom: '0.5px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    flexShrink: 0,
                }}>
          <span style={{ fontSize: '15px', fontWeight: '500', color: '#f9fafb' }}>
            {pageTitle}
          </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: '500', color: '#f9fafb' }}>
                                {user?.full_name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                {roleLabel(user?.role)}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowChangePassword(true)}
                            style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                background: 'transparent',
                                border: '0.5px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                                e.target.style.color = 'white';
                                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.color = '#9ca3af';
                                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                        >
                            Change Password
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            style={{
                                fontSize: '12px',
                                color: '#fca5a5',
                                background: 'transparent',
                                border: '0.5px solid #7f1d1d',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                                e.target.style.background = '#7f1d1d';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={e => {
                                e.target.style.background = 'transparent';
                                e.target.style.color = '#fca5a5';
                            }}
                        >
                            Log out
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#e2e8f0' }}>
                    {children}
                </div>
            </div>

            {showLogoutConfirm && (
                <ConfirmModal
                    title="Log out"
                    message="Are you sure you want to log out?"
                    confirmLabel="Log out"
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutConfirm(false)}
                />
            )}
            {showChangePassword && (
                <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
            )}
        </div>
    );
}

export default Layout;