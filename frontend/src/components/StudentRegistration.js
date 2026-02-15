import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStudent } from '../services/api';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';

const StudentRegistration = () => {
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
  const { theme } = useTheme();

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
      setSuccess('Student registered successfully!');
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
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    transition: 'all var(--transition-fast)'
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', transition: 'background var(--transition-theme)' }}>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              Register New Student
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Add a student to the face recognition system
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem'
        }}>
          {/* Alerts */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
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
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#047857',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem'
            }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
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
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter student's full name"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="student@example.com"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
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
                      color: 'var(--text-primary)'
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
                      onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)'
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
                      onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
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
                  color: 'var(--text-primary)'
                }}>
                  Student Photo
                </label>
                <div
                  onClick={() => document.getElementById('photo-input').click()}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    height: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-hover)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
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
                        width: '56px',
                        height: '56px',
                        background: 'var(--success-color)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem',
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
                        width: '56px',
                        height: '56px',
                        background: 'var(--bg-muted)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.75rem',
                        fontSize: '1.5rem'
                      }}>
                        📷
                      </div>
                      <span style={{ fontWeight: '500' }}>Click to Upload Photo</span>
                      <div style={{
                        fontSize: '0.813rem',
                        marginTop: '0.25rem'
                      }}>
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
                padding: '0.875rem',
                background: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary-color)'}
            >
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default StudentRegistration;