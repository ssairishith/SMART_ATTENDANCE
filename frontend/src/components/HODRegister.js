import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerHOD } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const DEPARTMENTS = [
    'AI & AIML',
    'CSE',
    'CS',
    'ECE',
    'EEE',
    'Mechanical',
    'BBA'
];

const HODRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        hodId: '',
        department: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await registerHOD(formData);
            setSuccess('Registration successful! You can now sign in.');
            setTimeout(() => navigate('/hod-login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
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

            {/* Registration Card */}
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '520px',
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
                        HOD Registration
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        transition: 'color var(--transition-theme)'
                    }}>
                        Create your HOD account
                    </p>
                </div>

                {/* Alerts */}
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

                {success && (
                    <div style={{
                        background: theme === 'light' ? '#f0fdf4' : 'rgba(4, 120, 87, 0.15)',
                        border: `1px solid ${theme === 'light' ? '#bbf7d0' : 'rgba(4, 120, 87, 0.3)'}`,
                        color: theme === 'light' ? '#047857' : '#6ee7b7',
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }}>
                        {success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                transition: 'color var(--transition-theme)'
                            }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Dr. John Smith"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                transition: 'color var(--transition-theme)'
                            }}>
                                HOD ID
                            </label>
                            <input
                                type="text"
                                name="hodId"
                                value={formData.hodId}
                                onChange={handleChange}
                                required
                                placeholder="e.g. HOD2024001"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>
                    </div>

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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                transition: 'color var(--transition-theme)'
                            }}>
                                Department
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                style={{
                                    ...inputStyle,
                                    cursor: 'pointer'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            >
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div>
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
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Create password"
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
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
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)'
                }}>
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/hod-login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#7c3aed',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Sign In
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

export default HODRegister;
