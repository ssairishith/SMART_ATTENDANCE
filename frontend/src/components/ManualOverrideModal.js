import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ManualOverrideModal - Modal for exceptional manual attendance override
 * 
 * Features:
 * - List absent students with checkboxes
 * - Mandatory reason field (min 20 chars)
 * - Confirmation checkbox
 * - Audit-compliant design
 */
const ManualOverrideModal = ({
    absentStudents,
    onClose,
    onSubmit,
    classInfo,
    isSubmitting
}) => {
    const { theme } = useTheme();
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [reason, setReason] = useState('');
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState('');

    const MIN_REASON_LENGTH = 20;

    const handleStudentToggle = (student) => {
        setSelectedStudents(prev => {
            const exists = prev.find(s => s.rollNo === student.rollNo);
            if (exists) {
                return prev.filter(s => s.rollNo !== student.rollNo);
            }
            return [...prev, student];
        });
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === absentStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents([...absentStudents]);
        }
    };

    const handleSubmit = () => {
        setError('');

        if (selectedStudents.length === 0) {
            setError('Please select at least one student');
            return;
        }

        if (reason.trim().length < MIN_REASON_LENGTH) {
            setError(`Reason must be at least ${MIN_REASON_LENGTH} characters`);
            return;
        }

        if (!confirmed) {
            setError('Please confirm that this is a genuine technical issue');
            return;
        }

        onSubmit({
            students: selectedStudents,
            reason: reason.trim()
        });
    };

    const modalOverlay = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
    };

    const modalContent = {
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border-color)'
    };

    const headerStyle = {
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    };

    const warningBanner = {
        margin: '1rem',
        padding: '1rem',
        background: theme === 'light' ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)',
        border: `1px solid ${theme === 'light' ? '#fcd34d' : 'rgba(245, 158, 11, 0.3)'}`,
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        color: theme === 'light' ? '#92400e' : '#fcd34d'
    };

    const studentListStyle = {
        margin: '1rem',
        maxHeight: '200px',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)'
    };

    const textareaStyle = {
        width: '100%',
        minHeight: '100px',
        padding: '0.75rem',
        fontSize: '0.875rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        resize: 'vertical',
        fontFamily: 'inherit'
    };

    return (
        <div style={modalOverlay} onClick={onClose}>
            <div style={modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={headerStyle}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                        }}>
                            Manual Attendance Override
                        </h2>
                        <p style={{
                            margin: 0,
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            Exceptional Case Only
                        </p>
                    </div>
                </div>

                {/* Warning Banner */}
                <div style={warningBanner}>
                    <strong>⚠ This feature is ONLY for genuine technical issues:</strong>
                    <ul style={{ margin: '0.5rem 0 0 1.25rem', paddingLeft: 0 }}>
                        <li>Camera malfunction or failure</li>
                        <li>Face detection failure despite student presence</li>
                        <li>Temporary lighting or technical issues</li>
                    </ul>
                    <p style={{ margin: '0.75rem 0 0', fontWeight: '500' }}>
                        All overrides are permanently logged and auditable.
                    </p>
                </div>

                {/* Class Info */}
                <div style={{
                    margin: '1rem',
                    padding: '0.75rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)'
                }}>
                    <strong>Class:</strong> {classInfo?.className || 'N/A'} |
                    <strong> Subject:</strong> {classInfo?.subject || 'N/A'} |
                    <strong> Date:</strong> {classInfo?.date || new Date().toLocaleDateString()}
                </div>

                {/* Student Selection */}
                <div style={{ margin: '1rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                    }}>
                        <label style={{
                            fontWeight: '500',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                        }}>
                            Select students to mark as Present:
                        </label>
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-accent)',
                                fontSize: '0.813rem',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                        >
                            {selectedStudents.length === absentStudents.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div style={studentListStyle}>
                        {absentStudents.length === 0 ? (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: 'var(--text-muted)'
                            }}>
                                No absent students to override
                            </div>
                        ) : (
                            absentStudents.map((student, idx) => (
                                <label
                                    key={student.rollNo || idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0.75rem 1rem',
                                        borderBottom: idx < absentStudents.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.some(s => s.rollNo === student.rollNo)}
                                        onChange={() => handleStudentToggle(student)}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            marginRight: '0.75rem',
                                            accentColor: '#f59e0b'
                                        }}
                                    />
                                    <span style={{
                                        fontWeight: '500',
                                        color: 'var(--text-primary)',
                                        marginRight: '0.5rem'
                                    }}>
                                        {student.rollNo}
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        - {student.name}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.5rem'
                    }}>
                        {selectedStudents.length} of {absentStudents.length} student(s) selected
                    </div>
                </div>

                {/* Reason Input */}
                <div style={{ margin: '1rem' }}>
                    <label style={{
                        display: 'block',
                        fontWeight: '500',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        marginBottom: '0.5rem'
                    }}>
                        Reason for Override: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Describe the technical issue that prevented face detection (e.g., Camera failed to detect students due to poor lighting conditions in the classroom)"
                        style={textareaStyle}
                    />
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem'
                    }}>
                        <span style={{
                            color: reason.length >= MIN_REASON_LENGTH ? '#10b981' : '#ef4444'
                        }}>
                            Minimum {MIN_REASON_LENGTH} characters required
                        </span>
                        <span style={{
                            color: reason.length >= MIN_REASON_LENGTH ? '#10b981' : 'var(--text-muted)'
                        }}>
                            {reason.length}/{MIN_REASON_LENGTH}
                        </span>
                    </div>
                </div>

                {/* Confirmation Checkbox */}
                <div style={{ margin: '1rem' }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            style={{
                                width: '18px',
                                height: '18px',
                                marginTop: '2px',
                                accentColor: '#f59e0b'
                            }}
                        />
                        <span style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.5'
                        }}>
                            I confirm this override is for a <strong>genuine technical issue</strong> and
                            not to bypass the face recognition attendance system. I understand that this
                            action is permanently logged and auditable.
                        </span>
                    </label>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        margin: '0 1rem',
                        padding: '0.75rem 1rem',
                        background: theme === 'light' ? '#fef2f2' : 'rgba(185, 28, 28, 0.15)',
                        border: `1px solid ${theme === 'light' ? '#fecaca' : 'rgba(185, 28, 28, 0.3)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: theme === 'light' ? '#b91c1c' : '#fca5a5',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedStudents.length === 0}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: isSubmitting ? '#9ca3af' : '#f59e0b',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <>
                                <span>⚠️</span>
                                <span>Submit Override ({selectedStudents.length})</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualOverrideModal;
