import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getHODDashboardData, getBranchAttendance, getSectionStudents, getManualLogsHOD, getHODAttendanceHistory } from '../../services/api';
import './HODDashboard.css';

const AttendanceHistoryChart = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getHODAttendanceHistory();
                setHistory(res.data.history || []);
            } catch (err) {
                console.error("Failed to load history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div>Loading chart...</div>;
    if (!history.length) return <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>No history data available yet.</div>;

    // Simple SVG Line Chart
    const height = 150;
    const width = 800;
    const padding = 20;

    // Find min/max for scaling
    // const maxVal = 100; // Percentage always max 100
    // const minVal = 0;

    const getX = (index) => padding + (index * ((width - 2 * padding) / (history.length - 1 || 1)));
    const getY = (val) => height - padding - ((val / 100) * (height - 2 * padding));

    const points = history.map((d, i) => `${getX(i)},${getY(d.percentage)}`).join(" ");

    return (
        <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {/* Background Lines */}
                {[0, 25, 50, 75, 100].map(v => (
                    <line key={v} x1={padding} y1={getY(v)} x2={width - padding} y2={getY(v)} stroke="var(--border-color)" strokeWidth="1" opacity="0.5" />
                ))}

                {/* The Line */}
                <polyline fill="none" stroke="var(--color-primary)" strokeWidth="3" points={points} />

                {/* Points */}
                {history.map((d, i) => (
                    <g key={i} className="chart-point">
                        <circle cx={getX(i)} cy={getY(d.percentage)} r="4" fill="var(--bg-card)" stroke="var(--color-primary)" strokeWidth="2" />
                        <title>{d.date}: {d.percentage}% ({d.present}/{d.total})</title>
                    </g>
                ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                <span>{history[0]?.date}</span>
                <span>{history[history.length - 1]?.date}</span>
            </div>
        </div>
    );
};


const HODDashboard = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [branchData, setBranchData] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [sectionStudents, setSectionStudents] = useState(null);
    const [activeTab, setActiveTab] = useState('present');
    const [mainTab, setMainTab] = useState('attendance');

    // Manual Override Logs
    const [manualLogs, setManualLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const hodName = localStorage.getItem('hodName') || 'HOD';

    const fetchSectionStudents = useCallback(async (branchId, section) => {
        try {
            const response = await getSectionStudents(branchId, section);
            setSectionStudents(response.data);
        } catch (err) {
            console.error('Error fetching section students:', err);
        }
    }, []);

    const fetchBranchAttendance = useCallback(async (branchId) => {
        try {
            const response = await getBranchAttendance(branchId);
            let data = response.data;

            setBranchData(data);

            if (data.sectionStats && data.sectionStats.length > 0) {
                const firstSection = data.sectionStats[0].section;
                setSelectedSection(firstSection);
                fetchSectionStudents(branchId, firstSection);
            }
        } catch (err) {
            console.error('Error fetching branch attendance:', err);
        }
    }, [fetchSectionStudents]);

    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await getHODDashboardData();
            let data = response.data || {};

            // FILTER: Only show department branch
            const hodDepartment = localStorage.getItem('hodDepartment');
            if (hodDepartment && data.branchStats) {
                const filteredBranches = data.branchStats.filter(b =>
                    b.name && (
                        b.name.toLowerCase().includes(hodDepartment.toLowerCase()) ||
                        hodDepartment.toLowerCase().includes(b.name.toLowerCase())
                    )
                );
                data.branchStats = filteredBranches;
            }

            setDashboardData(data);

            if (data.branchStats && data.branchStats.length > 0) {
                const firstBranch = data.branchStats[0];
                setSelectedBranch(firstBranch);
                fetchBranchAttendance(firstBranch.id);
            } else {
                // Clear selection if no branches match
                setSelectedBranch(null);
                setBranchData(null);
                setSelectedSection(null);
                setSectionStudents(null);
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchBranchAttendance]);

    // Fetch dashboard data on mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleBranchSelect = (branch) => {
        setSelectedBranch(branch);
        setSelectedSection(null);
        setSectionStudents(null);
        fetchBranchAttendance(branch.id);
    };

    const handleSectionSelect = (section) => {
        setSelectedSection(section);
        if (selectedBranch) {
            fetchSectionStudents(selectedBranch.id, section);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('hodName');
        localStorage.removeItem('hodId');
        localStorage.removeItem('hodDepartment');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const loadManualLogs = async () => {
        setLogsLoading(true);
        try {
            const department = localStorage.getItem('hodDepartment');
            const response = await getManualLogsHOD({ department });
            setManualLogs(response.data.logs || []);
        } catch (err) {
            console.error('Failed to load manual logs:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleMainTabChange = (tab) => {
        setMainTab(tab);
        if (tab === 'manual-logs' && manualLogs.length === 0) {
            loadManualLogs();
        }
    };

    if (loading) {
        return (
            <div className="hod-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="hod-dashboard">
            {/* Navigation */}
            <nav className="hod-nav">
                <div className="nav-brand">
                    <div className="brand-icon">🏛️</div>
                    <span>HOD Dashboard</span>
                </div>

                <div className="nav-links">
                    <button
                        className={`nav-link ${mainTab === 'attendance' ? 'active' : ''}`}
                        onClick={() => handleMainTabChange('attendance')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`nav-link ${mainTab === 'manual-logs' ? 'active manual-logs-tab' : ''}`}
                        onClick={() => handleMainTabChange('manual-logs')}
                    >
                        ⚠️ Override Logs
                    </button>
                </div>

                <div className="nav-right">
                    <div className="user-info">
                        <span className="user-label">Welcome</span>
                        <span className="user-name">{hodName}</span>
                    </div>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="hod-main">
                {/* Stats Overview */}
                <section className="stats-section">
                    <h2 className="section-title">Attendance Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboardData?.totalStudents || 0}</span>
                                <span className="stat-label">Total Students</span>
                            </div>
                        </div>
                        <div className="stat-card present">
                            <div className="stat-icon">✅</div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboardData?.presentCount || 0}</span>
                                <span className="stat-label">Present Today</span>
                            </div>
                        </div>
                        <div className="stat-card absent">
                            <div className="stat-icon">❌</div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboardData?.absentCount || 0}</span>
                                <span className="stat-label">Absent Today</span>
                            </div>
                        </div>
                        <div className="stat-card percentage">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <span className="stat-value">{dashboardData?.attendancePercentage || 0}%</span>
                                <span className="stat-label">Attendance Rate</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* History Chart */}
                <section className="chart-section" style={{ marginBottom: '2rem' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Past 30 Days Trend</h2>
                        <AttendanceHistoryChart />
                    </div>
                </section>

                {/* Branch Selection */}
                <section className="branch-section">
                    <h2 className="section-title">Branch-wise Attendance</h2>
                    <div className="branch-tabs">
                        {dashboardData?.branchStats?.map((branch) => (
                            <button
                                key={branch.id}
                                className={`branch-tab ${selectedBranch?.id === branch.id ? 'active' : ''}`}
                                onClick={() => handleBranchSelect(branch)}
                            >
                                <span className="branch-name">{branch.name}</span>
                                <span className="branch-percent">{branch.percentage}%</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Section Breakdown */}
                {branchData && (
                    <section className="section-breakdown">
                        <h3 className="subsection-title">{selectedBranch?.name} - Section Breakdown</h3>
                        <div className="section-cards">
                            {branchData.sectionStats?.map((stat) => (
                                <div
                                    key={stat.section}
                                    className={`section-card ${selectedSection === stat.section ? 'active' : ''}`}
                                    onClick={() => handleSectionSelect(stat.section)}
                                >
                                    <div className="section-header">
                                        <span className="section-name">Section {stat.section}</span>
                                        <span className="section-percent">{stat.percentage}%</span>
                                    </div>
                                    <div className="section-stats">
                                        <div className="section-stat present">
                                            <span className="count">{stat.present}</span>
                                            <span className="label">Present</span>
                                        </div>
                                        <div className="section-stat absent">
                                            <span className="count">{stat.absent}</span>
                                            <span className="label">Absent</span>
                                        </div>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${stat.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Student List */}
                {sectionStudents && (
                    <section className="students-section">
                        <div className="students-header">
                            <h3 className="subsection-title">
                                {selectedBranch?.name} - Section {selectedSection} Students
                            </h3>
                            <div className="tab-buttons">
                                <button
                                    className={`tab-btn ${activeTab === 'present' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('present')}
                                >
                                    Present ({sectionStudents.totalPresent})
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'absent' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('absent')}
                                >
                                    Absent ({sectionStudents.totalAbsent})
                                </button>
                            </div>
                        </div>

                        <div className="students-table-container">
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Roll Number</th>
                                        <th>Student Name</th>
                                        <th>Section</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'present'
                                        ? sectionStudents.presentStudents
                                        : sectionStudents.absentStudents
                                    )?.map((student, idx) => (
                                        <tr key={student.id || idx}>
                                            <td>{idx + 1}</td>
                                            <td>{student.rollNo}</td>
                                            <td>{student.name}</td>
                                            <td>{student.section}</td>
                                            <td>
                                                <span className={`status-badge ${student.status}`}>
                                                    {student.status === 'present' ? '✓ Present' : '✗ Absent'}
                                                </span>
                                            </td>
                                            <td>{student.date}</td>
                                        </tr>
                                    ))}
                                    {(activeTab === 'present'
                                        ? sectionStudents.presentStudents
                                        : sectionStudents.absentStudents
                                    )?.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="empty-message">
                                                    No {activeTab} students found
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Manual Override Audit Logs */}
                {mainTab === 'manual-logs' && (
                    <section className="manual-logs-section">
                        <div className="manual-logs-header">
                            <div>
                                <h2 className="section-title">⚠️ Manual Override Audit Log</h2>
                                <p className="section-subtitle">Department-wide view of all manual attendance overrides</p>
                            </div>
                            <button
                                className="refresh-btn"
                                onClick={loadManualLogs}
                                disabled={logsLoading}
                            >
                                {logsLoading ? 'Loading...' : '🔄 Refresh'}
                            </button>
                        </div>

                        {logsLoading ? (
                            <div className="logs-loading">Loading audit logs...</div>
                        ) : manualLogs.length === 0 ? (
                            <div className="logs-empty">
                                <div className="empty-icon">✓</div>
                                <p>No manual overrides found. All attendance is AI-detected.</p>
                            </div>
                        ) : (
                            <>
                                <div className="logs-summary">
                                    <div className="summary-stat">
                                        <span className="summary-value">{manualLogs.length}</span>
                                        <span className="summary-label">Total Overrides</span>
                                    </div>
                                </div>

                                <div className="students-table-container">
                                    <table className="students-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Faculty</th>
                                                <th>Student</th>
                                                <th>Roll No</th>
                                                <th>Class</th>
                                                <th>Subject</th>
                                                <th>Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {manualLogs.map((log, idx) => (
                                                <tr key={idx}>
                                                    <td>{log.date}</td>
                                                    <td>{log.facultyName}</td>
                                                    <td>{log.studentName}</td>
                                                    <td className="mono">{log.rollNo}</td>
                                                    <td>{log.className}</td>
                                                    <td>{log.subject}</td>
                                                    <td className="reason-cell" title={log.reason}>
                                                        {log.reason}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="logs-footer">
                                    💡 These logs are immutable and cannot be edited. They serve as an audit trail for academic compliance (NAAC, internal audits).
                                </div>
                            </>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default HODDashboard;
