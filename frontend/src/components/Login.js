import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginTeacher } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
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
      const response = await loginTeacher(formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('teacherName', response.data.teacher.name);
      localStorage.setItem('teacherId', response.data.teacher.facultyId || '');
      localStorage.setItem('facultyId', response.data.teacher.facultyId || '');
      navigate('/dashboard');
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
        maxWidth: '440px',
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
            Welcome Back
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            transition: 'color var(--transition-theme)'
          }}>
            Sign in to your faculty account
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
          <div style={{ marginBottom: '1.25rem' }}>
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
                style={{ ...inputStyle, paddingRight: '3rem' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '1rem',
                  padding: '0.25rem'
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          transition: 'color var(--transition-theme)'
        }}>
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register-teacher')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-accent)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;