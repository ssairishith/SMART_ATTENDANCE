import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TeacherOptions = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
        ← Back
      </button>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-2xl)',
        padding: '3rem',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
        transition: 'all var(--transition-theme)'
      }}>
        {/* Logo */}
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
          Faculty Portal
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          marginBottom: '2.5rem',
          fontSize: '1rem',
          transition: 'color var(--transition-theme)'
        }}>
          Access the Smart Attendance System
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Sign In
            <span>→</span>
          </button>

          <button
            onClick={() => navigate('/register-teacher')}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Register New Account
          </button>
        </div>

        <p style={{
          marginTop: '2rem',
          fontSize: '0.813rem',
          color: 'var(--text-light)',
          transition: 'color var(--transition-theme)'
        }}>
          For authorized faculty members only
        </p>
      </div>
    </div>
  );
};

export default TeacherOptions;