import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getStudentAttendanceReport } from '../services/api';

const GroupAttendance = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], subjects: [], subjectTypes: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    rollNo: '',
    startDate: '',
    endDate: ''
  });

  const fetchReport = async (appliedFilters = filters) => {
    const facultyId = localStorage.getItem('facultyId');
    if (!facultyId) {
      setError('Faculty ID missing. Please login again.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getStudentAttendanceReport(facultyId, appliedFilters);
      setData(response.data);
      setError('');
    } catch (err) {
      console.error("Report fetch error:", err);
      setError('Failed to load attendance report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', transition: 'background var(--transition-theme)' }}>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
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
              Student Attendance List
            </h1>
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

        {/* Search Filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end',
          marginBottom: '2rem',
          background: 'var(--bg-card)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Roll Number</label>
            <input
              type="text"
              placeholder="Search roll no..."
              value={filters.rollNo}
              onChange={(e) => setFilters({ ...filters, rollNo: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => fetchReport()}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--color-primary-light)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--color-primary)'}
            >
              Search
            </button>
            <button
              onClick={() => {
                const reset = { rollNo: '', startDate: '', endDate: '' };
                setFilters(reset);
                fetchReport(reset);
              }}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'background 0.2s'
              }}
            >
              Reset
            </button>
          </div>
        </div>


        {
          error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )
        }

        {
          loading ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)'
            }}>
              Loading report...
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden' // For rounded corners on table
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem',
                  minWidth: '800px'
                }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', position: 'sticky', left: 0, background: 'var(--bg-hover)', zIndex: 10 }}>Roll No</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)', position: 'sticky', left: '100px', background: 'var(--bg-hover)', zIndex: 10 }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Total (%)</th>
                      {data.subjects.map((subj, idx) => (
                        <th key={idx} style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {subj} <br />
                          <span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)' }}>
                            {data.subjectTypes[subj]}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.length > 0 ? (
                      data.students.map((student, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.1s' }}>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: '500', position: 'sticky', left: 0, background: 'var(--bg-card)' }}>{student.rollNo}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-primary)', position: 'sticky', left: '100px', background: 'var(--bg-card)' }}>
                            {student.name}
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.section}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              background: 'var(--color-success-light)',
                              color: 'var(--color-success)',
                              fontWeight: '600'
                            }}>
                              {student.totalScore}%
                            </span>
                          </td>
                          {data.subjects.map((subj, sIdx) => {
                            const percentage = student.subjects[subj];
                            return (
                              <td key={sIdx} style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                {percentage !== undefined ? (
                                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                    {percentage}%
                                  </span>
                                ) : (
                                  <span style={{ opacity: 0.3 }}>-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3 + data.subjects.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No students found for your sections.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
      </main >
    </div >
  );
};

export default GroupAttendance;