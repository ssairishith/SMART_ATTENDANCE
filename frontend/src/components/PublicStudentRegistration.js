import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const PublicStudentRegistration = () => {
    const [formData, setFormData] = useState({
        rollNo: '',
        name: '',
        email: '',
        department: '',
        section: '',
        photo: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo') {
            setFormData({ ...formData, photo: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('rollNo', formData.rollNo);
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('department', formData.department);
        data.append('section', formData.section);
        data.append('photo', formData.photo);

        try {
            await registerStudent(data);
            setSuccess('Registration successful! You can now be recognized in class.');
            setError('');
            setFormData({ rollNo: '', name: '', email: '', department: '', section: '', photo: null });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            setSuccess('');
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
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    zIndex: 100
                }}
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all var(--transition-fast)',
                    zIndex: 100
                }}
            >
                ← Home
            </button>

            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-2xl)',
                padding: '3rem',
                width: '100%',
                maxWidth: '720px',
                boxShadow: 'var(--shadow-xl)',
                transition: 'all var(--transition-theme)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-light))',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: 'white',
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>

                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem',
                        transition: 'color var(--transition-theme)'
                    }}>
                        Student Registration
                    </h1>

                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        transition: 'color var(--transition-theme)'
                    }}>
                        Register for face recognition attendance
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'var(--text-primary)',
                                    transition: 'color var(--transition-theme)'
                                }}>
                                    Roll Number
                                </label>
                                <input
                                    type="text"
                                    name="rollNo"
                                    value={formData.rollNo}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. 2024-CS-101"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
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
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your full name"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
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
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="your.email@example.com"
                                    style={inputStyle}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. CSE"
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
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
                                        Section
                                    </label>
                                    <input
                                        type="text"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. A"
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Photo Upload */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: 'var(--text-primary)',
                                transition: 'color var(--transition-theme)'
                            }}>
                                Your Photo
                            </label>
                            <div
                                onClick={() => document.getElementById('photo-input').click()}
                                style={{
                                    border: '2px dashed var(--border-color)',
                                    borderRadius: 'var(--radius-xl)',
                                    height: '100%',
                                    minHeight: '220px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: 'var(--bg-secondary)',
                                    transition: 'all var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                            >
                                <input
                                    id="photo-input"
                                    type="file"
                                    name="photo"
                                    accept="image/*"
                                    onChange={handleChange}
                                    required
                                    style={{ display: 'none' }}
                                />
                                {formData.photo ? (
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: 'var(--color-success)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem',
                                            color: 'white',
                                            fontSize: '1.5rem'
                                        }}>
                                            ✓
                                        </div>
                                        <span style={{
                                            fontWeight: '500',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {formData.photo.name}
                                        </span>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 1rem',
                                            fontSize: '1.5rem'
                                        }}>
                                            📷
                                        </div>
                                        <span style={{ fontWeight: '500' }}>Click to Upload Photo</span>
                                        <div style={{ fontSize: '0.813rem', marginTop: '0.25rem' }}>
                                            Required for face recognition
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            marginTop: '2rem',
                            padding: '1rem',
                            background: 'var(--color-accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PublicStudentRegistration;
