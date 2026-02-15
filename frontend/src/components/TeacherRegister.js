import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerTeacher } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    facultyId: '',
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

    // Send as JSON, not FormData
    const data = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      facultyId: formData.facultyId,
      department: formData.department
    };

    try {
      await registerTeacher(data);
      setSuccess('Registration successful! You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
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
        onClick={() => navigate('/teacher-options')}
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
        ← Back
      </button>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-2xl)',
        padding: '3rem',
        width: '100%',
        maxWidth: '520px',
        boxShadow: 'var(--shadow-xl)',
        transition: 'all var(--transition-theme)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            SA
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
            transition: 'color var(--transition-theme)'
          }}>
            Create Account
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            transition: 'color var(--transition-theme)'
          }}>
            Register as a faculty member
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
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="Computer Science"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
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
              placeholder="faculty@university.edu"
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

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
                Faculty ID
              </label>
              <input
                type="text"
                name="facultyId"
                value={formData.facultyId}
                onChange={handleChange}
                required
                placeholder="e.g. FAC2024001"
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
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a secure password"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'var(--color-primary)',
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          transition: 'color var(--transition-theme)'
        }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default TeacherRegister;