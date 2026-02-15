import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleSelection = (userType) => {
    if (userType === 'teacher') {
      navigate('/teacher-options');
    } else if (userType === 'student') {
      navigate('/register-student-public');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-lg)',
        maxWidth: '720px',
        width: '100%',
        padding: '3rem',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{
          width: '64px',
          height: '64px',
          background: 'var(--primary-color)',
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
          fontSize: '2rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}>
          Smart Attendance System
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.063rem',
          marginBottom: '2.5rem',
          maxWidth: '480px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Automated face recognition attendance for educational institutions. Please select your role to continue.
        </p>

        {/* Role Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem'
        }}>
          {/* Faculty Card */}
          <button
            onClick={() => handleSelection('teacher')}
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary-color)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--bg-hover)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              👨‍🏫
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Faculty
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              Login to manage classes and attendance records
            </p>
          </button>

          {/* Student Card */}
          <button
            onClick={() => handleSelection('student')}
            style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--secondary-color)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--bg-hover)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              👨‍🎓
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem'
            }}>
              Student
            </h3>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              Register for the face recognition system
            </p>
          </button>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.813rem',
          color: 'var(--text-muted)'
        }}>
          Powered by AI-based Face Recognition Technology
        </p>
      </div>
    </div>
  );
};

export default Home;