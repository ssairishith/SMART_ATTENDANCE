import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'New Student', path: '/register-student' },
        { name: 'Reports', path: '/reports' },
        { name: 'STUDENT LIST', path: '/group-attendance' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('teacherName');
        localStorage.removeItem('teacherId');
        navigate('/');
    };

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            transition: 'all var(--transition-theme)'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 2rem',
                height: '68px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.875rem'
                    }}>
                        SA
                    </div>
                    <span style={{
                        fontWeight: '600',
                        fontSize: '1.125rem',
                        color: 'var(--text-primary)',
                        transition: 'color var(--transition-theme)'
                    }}>
                        Smart Attendance
                    </span>
                </div>

                {/* Navigation Links */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            style={({ isActive }) => ({
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.938rem',
                                fontWeight: isActive ? '600' : '500',
                                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--bg-tertiary)' : 'transparent',
                                transition: 'all var(--transition-fast)'
                            })}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                {/* Right Side */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    {/* User Info */}
                    <div style={{
                        textAlign: 'right',
                        paddingRight: '1rem',
                        borderRight: '1px solid var(--border-color)'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            transition: 'color var(--transition-theme)'
                        }}>
                            Welcome
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            transition: 'color var(--transition-theme)'
                        }}>
                            {localStorage.getItem('teacherName') || 'Professor'}
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                        }}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-danger)';
                            e.currentTarget.style.color = 'var(--color-danger)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
