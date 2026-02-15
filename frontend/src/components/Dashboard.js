import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
// import { useTheme } from '../context/ThemeContext'; // Removed unused import

const Dashboard = () => {
  const navigate = useNavigate();

  // Instant Session State
  const [showInstantModal, setShowInstantModal] = useState(false);

  const [instantData, setInstantData] = useState({ subject: '', section: '' });

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekStartDate, setWeekStartDate] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setWeekStartDate(monday);
  }, []);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStartDate);
    day.setDate(weekStartDate.getDate() + i);
    weekDays.push(day);
  }

  const handlePrevWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(newDate);
  };

  const handleDateClick = (date) => setCurrentDate(date);

  const getDayName = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });
  const getDayNum = (date) => date.getDate();
  const getMonthName = (date) => date.toLocaleDateString('en-US', { month: 'long' });
  const isSelected = (d1, d2) => d1.toDateString() === d2.toDateString();
  const isToday = (date) => date.toDateString() === new Date().toDateString();

  // Dashboard Data State
  const [profile, setProfile] = useState(null);
  const [allTimetables, setAllTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      const facultyId = localStorage.getItem('facultyId');
      if (!facultyId) {
        setError('Faculty ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await import('../services/api').then(m => m.getTeacherDashboardData(facultyId));
        setProfile(response.data.profile);
        setAllTimetables(response.data.timetable?.timetables || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchAttendanceStats = async () => {
      const facultyId = localStorage.getItem('facultyId');
      if (!facultyId) return;

      // Format date as YYYY-MM-DD
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      try {
        const api = await import('../services/api');
        const response = await api.getDailyAttendanceSummary({
          facultyId,
          date: dateStr
        });
        setAttendanceStats(response.data || {});
      } catch (err) {
        console.error("Error fetching attendance stats:", err);
      }
    };

    fetchAttendanceStats();
  }, [currentDate]);

  const getClassesForDate = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayData = allTimetables.find(t => t.day === dayName);

    if (!dayData) return [];

    return dayData.slots.map(slot => ({
      name: slot.subjectName,
      type: `${slot.type} ${slot.room}`,
      time: slot.time,
      section: slot.section,
      attendanceTaken: slot.attendanceTaken
    }));
  };

  const classes = getClassesForDate(currentDate);

  const handleClassClick = (className, section, time) => {
    navigate('/live-attendance', {
      state: {
        className: `${className} (${section})`,
        section: section,
        subjectName: className,
        time: time
      }
    });
  };

  // Stats
  const stats = [
    { label: 'Total Subjects', value: profile?.subjects?.length || '0', color: 'var(--color-primary)' },
    { label: 'Department', value: profile?.department || '---', color: 'var(--color-accent)' },
    { label: 'Academic Year', value: profile?.academicYear || '---', color: 'var(--color-success)' },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', transition: 'background var(--transition-theme)' }}>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem'
            }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome back, {localStorage.getItem('teacherName') || 'Professor'}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              borderLeft: `4px solid ${stat.color}`
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem'
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar & Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)'
          }}>
            Schedule
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.25rem'
            }}>
              <button
                onClick={handlePrevWeek}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '1rem'
                }}
              >
                ←
              </button>
              <span style={{
                fontWeight: '500',
                color: 'var(--text-primary)',
                minWidth: '140px',
                textAlign: 'center'
              }}>
                {getMonthName(weekStartDate)} {weekStartDate.getFullYear()}
              </span>
              <button
                onClick={handleNextWeek}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '1rem'
                }}
              >
                →
              </button>
            </div>

            <button
              onClick={() => setShowInstantModal(true)}
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
            >
              + Start Session
            </button>
          </div>
        </div>

        {/* Week Calendar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {weekDays.map((day, idx) => {
            const selected = isSelected(day, currentDate);
            const today = isToday(day);
            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                style={{
                  background: selected ? 'var(--color-primary)' : 'var(--bg-card)',
                  border: `1px solid ${selected ? 'var(--color-primary)' : today ? 'var(--color-accent)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 0.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: selected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '0.25rem'
                }}>
                  {getDayName(day)}
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: selected ? 'white' : 'var(--text-primary)'
                }}>
                  {getDayNum(day)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Classes List */}
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '1rem'
        }}>
          Classes for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </h2>

        {loading && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            Loading timetable...
          </div>
        )}

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            color: '#b91c1c'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && classes.length === 0 && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            No classes scheduled for this day.
          </div>
        )}

        {!loading && !error && classes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {classes.map((cls, idx) => (
              <button
                key={idx}
                onClick={() => handleClassClick(cls.name, cls.section, cls.time)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{
                    fontSize: '1.063rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: '0.25rem'
                  }}>
                    {cls.name}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <span>{cls.type}</span>
                      <span>{cls.time}</span>
                      <span>Section: {cls.section}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student-list/${encodeURIComponent(cls.name)}?section=${encodeURIComponent(cls.section)}`);
                      }}
                      style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        textDecoration: 'underline'
                      }}
                    >
                      View Student Analytics
                    </button>
                  </div>
                </div>
                <div style={{
                  color: 'var(--color-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Start →
                </div>
                {cls.attendanceTaken && (
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    height: '10px',
                    width: '10px',
                    borderRadius: '50%',
                    background: 'var(--color-success)',
                    border: '2px solid var(--bg-card)',
                    boxShadow: '0 0 0 1px var(--color-success)',
                  }} title="Attendance Completed" />
                )}
              </button>
            ))}
          </div>
        )}
      </main >

      {/* Instant Session Modal */}
      {
        showInstantModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%',
              maxWidth: '420px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem'
              }}>
                Start Instant Session
              </h3>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (instantData.subject && instantData.section) {
                  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  handleClassClick(instantData.subject, instantData.section, currentTime);
                }
              }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    Subject Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures"
                    value={instantData.subject}
                    onChange={(e) => setInstantData({ ...instantData, subject: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
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
                    placeholder="e.g. AIML-B"
                    value={instantData.section}
                    onChange={(e) => setInstantData({ ...instantData, section: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowInstantModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.938rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'var(--color-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.938rem',
                      fontWeight: '500',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Start
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Dashboard;