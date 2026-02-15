import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import { getClassAnalytics } from '../services/analytics';

const StudentList = () => {
  const { className } = useParams();
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section') || '';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getClassAnalytics(className, section);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load class data');
    } finally {
      setLoading(false);
    }
  }, [className, section]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredStudents = analytics?.students?.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', transition: 'background var(--transition-theme)' }}>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {decodeURIComponent(className)}
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {section ? `Section: ${section}` : 'All Sections'} • Student Attendance
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
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading analytics...
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            {error}
          </div>
        )}

        {!loading && !error && analytics && (
          <>

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Student Table */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Roll No</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Attendance %</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Classes Attended</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{student.rollNo}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{student.name}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          background: student.overallPercentage >= 75 ? 'rgba(16, 185, 129, 0.15)' : student.overallPercentage > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(107, 114, 128, 0.1)',
                          color: student.overallPercentage >= 75 ? '#10b981' : student.overallPercentage > 0 ? '#ef4444' : '#6b7280'
                        }}>
                          {student.overallPercentage}%
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                        {student.attended} / {student.totalClasses}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentList;
