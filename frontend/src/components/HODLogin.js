import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginHOD } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const HODLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await loginHOD(formData);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('hodName', response.data.hod.name);
            localStorage.setItem('hodId', response.data.hod.hodId || '');
            localStorage.setItem('hodDepartment', response.data.hod.department || '');
            localStorage.setItem('userRole', 'hod');
            navigate('/hod-dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        fontSize: '1rem',
        color: 'var(--text-primary)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        outline: 'none',
        transition: 'all var(--transition-fast)'
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

            {/* Login Card */}
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '440px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                transition: 'all var(--transition-theme)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '1.75rem'
                    }}>
                        🏛️
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                        transition: 'color var(--transition-theme)'
                    }}>
                        HOD Sign In
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        transition: 'color var(--transition-theme)'
                    }}>
                        Access your department dashboard
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div style={{
                        background: theme === 'light' ? '#fef2f2' : 'rgba(185, 28, 28, 0.15)',
                        border: `1px solid ${theme === 'light' ? '#fecaca' : 'rgba(185, 28, 28, 0.3)'}`,
                        color: theme === 'light' ? '#b91c1c' : '#fca5a5',
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            transition: 'color var(--transition-theme)'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="hod@university.edu"
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            transition: 'color var(--transition-theme)'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    fontSize: '1rem'
                                }}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'white',
                            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)'
                }}>
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/hod-register')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#7c3aed',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Register
                    </button>
                </div>

                {/* Back Link */}
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/hod-options')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back to HOD Options
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HODLogin;
