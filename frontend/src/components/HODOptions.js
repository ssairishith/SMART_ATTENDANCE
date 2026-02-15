import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const HODOptions = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const cardStyle = {
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        border: '1px solid var(--border-color)',
        transition: 'all 0.3s ease',
        flex: 1,
        maxWidth: '320px'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            transition: 'background var(--transition-theme)'
        }}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    transition: 'all var(--transition-fast)',
                    zIndex: 1000
                }}
                aria-label="Toggle theme"
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Back Button */}
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    left: '1.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all var(--transition-fast)'
                }}
            >
                ← Back to Home
            </button>

            {/* Main Content */}
            <div style={{
                maxWidth: '800px',
                width: '100%'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '2rem'
                    }}>
                        🏛️
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                        transition: 'color var(--transition-theme)'
                    }}>
                        HOD Portal
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        transition: 'color var(--transition-theme)'
                    }}>
                        Head of Department - Department-wise Attendance Monitoring
                    </p>
                </div>

                {/* Option Cards */}
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    {/* Sign In Card */}
                    <div
                        style={cardStyle}
                        onClick={() => navigate('/hod-login')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            e.currentTarget.style.borderColor = '#7c3aed';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: 'var(--radius-lg)',
                            background: theme === 'light' ? '#f3e8ff' : 'rgba(124, 58, 237, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            transition: 'background var(--transition-theme)'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        </div>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '0.75rem',
                            transition: 'color var(--transition-theme)'
                        }}>
                            Sign In
                        </h2>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            transition: 'color var(--transition-theme)'
                        }}>
                            Access your HOD dashboard to monitor department-wise attendance
                        </p>
                    </div>

                    {/* Register Card */}
                    <div
                        style={cardStyle}
                        onClick={() => navigate('/hod-register')}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            e.currentTarget.style.borderColor = '#7c3aed';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: 'var(--radius-lg)',
                            background: theme === 'light' ? '#f3e8ff' : 'rgba(124, 58, 237, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            transition: 'background var(--transition-theme)'
                        }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                            </svg>
                        </div>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            marginBottom: '0.75rem',
                            transition: 'color var(--transition-theme)'
                        }}>
                            Register
                        </h2>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            transition: 'color var(--transition-theme)'
                        }}>
                            Create a new HOD account to get started with department monitoring
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODOptions;
