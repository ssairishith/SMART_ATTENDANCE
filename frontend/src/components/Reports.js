import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { downloadReport, listExcelFiles, getManualLogs, deleteReport } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const Reports = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [filename, setFilename] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('reports');

  // Manual Override Logs
  const [manualLogs, setManualLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await listExcelFiles();
      setFiles(response.data.files || []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load file list');
      setLoading(false);
    }
  };

  const loadManualLogs = async () => {
    setLogsLoading(true);
    try {
      const facultyId = localStorage.getItem('facultyId');
      const response = await getManualLogs({ facultyId });
      setManualLogs(response.data.logs || []);
    } catch (err) {
      console.error('Failed to load manual logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'manual-logs' && manualLogs.length === 0) {
      loadManualLogs();
    }
  };

  const handleDownload = async (fileName) => {
    try {
      const response = await downloadReport(fileName);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setError('');
    } catch (err) {
      setError('Download failed. File may not exist.');
    }
  };

  const handleManualDownload = async () => {
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }
    await handleDownload(filename.trim());
  };

  const handleDelete = async (fileName) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        await deleteReport(fileName);
        setFiles(prev => prev.filter(f => f.filename !== fileName));
      } catch (err) {
        console.error("Delete failed:", err);
        setError('Failed to delete file');
      }
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', transition: 'background var(--transition-theme)' }}>
      <Navbar />

      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
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
              Attendance Reports
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Download and manage attendance records
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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => handleTabChange('reports')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'reports' ? 'var(--primary-color)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'reports' ? 'white' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            📄 Reports
          </button>
          <button
            onClick={() => handleTabChange('manual-logs')}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === 'manual-logs' ? '#f59e0b' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: activeTab === 'manual-logs' ? 'white' : 'var(--text-secondary)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ⚠️ Manual Override Logs
          </button>
        </div>

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
          }}>
            {/* Files List */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: 0
                }}>
                  Available Reports
                </h2>
                <button
                  onClick={loadFiles}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Refresh
                </button>
              </div>

              <div style={{ padding: '1rem 1.5rem' }}>
                {loading && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}>
                    Loading reports...
                  </div>
                )}

                {!loading && files.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-muted)'
                  }}>
                    No reports found.
                  </div>
                )}

                {!loading && files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            marginBottom: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {file.filename}
                            {file.metadata?.hasManualOverrides && (
                              <span style={{
                                background: '#fef3c7',
                                color: '#92400e',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.625rem',
                                fontWeight: '600'
                              }}>
                                ⚠️ MANUAL
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: '0.813rem',
                            color: 'var(--text-muted)'
                          }}>
                            {file.metadata ? `${file.metadata.course} | ${new Date(file.upload_date).toLocaleDateString()}` : 'Unknown Date'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(file.filename)}
                          style={{
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(file.filename)}
                          style={{
                            background: 'var(--error-color, #ef4444)',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            marginLeft: '0.5rem'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Manual Download */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              height: 'fit-content'
            }}>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                Manual Download
              </h2>

              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)'
                }}>
                  Filename
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="report_CSE-A.xlsx"
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

              <button
                onClick={handleManualDownload}
                style={{
                  width: '100%',
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
                Find & Download
              </button>
            </div>
          </div>
        )}

        {/* Manual Override Logs Tab */}
        {activeTab === 'manual-logs' && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              background: theme === 'light' ? '#fffbeb' : 'rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ Manual Override Audit Log
                  </h2>
                  <p style={{
                    fontSize: '0.813rem',
                    color: 'var(--text-muted)',
                    margin: '0.25rem 0 0'
                  }}>
                    All manual attendance overrides are logged here for audit and transparency
                  </p>
                </div>
                <button
                  onClick={loadManualLogs}
                  disabled={logsLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {logsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div style={{ overflowX: 'auto' }}>
              {logsLoading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-muted)'
                }}>
                  Loading audit logs...
                </div>
              ) : manualLogs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✓</div>
                  No manual overrides found. All attendance is AI-detected.
                </div>
              ) : (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-hover)' }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Student</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Roll No</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Class</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Subject</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {log.date}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {log.studentName}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {log.rollNo}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {log.className}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>
                          {log.subject}
                        </td>
                        <td style={{
                          padding: '0.75rem 1rem',
                          color: 'var(--text-muted)',
                          maxWidth: '300px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={log.reason}>
                          {log.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer Note */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-hover)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic'
            }}>
              💡 These logs are immutable and cannot be edited. They serve as an audit trail for academic compliance (NAAC, internal audits).
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;