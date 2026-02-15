import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Trigger page load animations
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        {
            icon: '🚫',
            title: 'No Proxy Attendance',
            description: 'AI-powered face recognition ensures only the actual student can mark attendance, eliminating proxy marking completely.'
        },
        {
            icon: '⚡',
            title: 'Instant Recognition',
            description: 'Real-time face detection and recognition in under 2 seconds, enabling seamless attendance in large classrooms.'
        },
        {
            icon: '📊',
            title: 'Automated Reports',
            description: 'Generate comprehensive attendance reports instantly. Export to Excel, track patterns, and identify at-risk students.'
        },
        {
            icon: '🎯',
            title: '99.2% Accuracy',
            description: 'State-of-the-art deep learning models trained on diverse datasets ensure highly accurate recognition.'
        },
        {
            icon: '👥',
            title: 'Group Recognition',
            description: 'Capture entire class photos and recognize multiple students simultaneously, saving valuable lecture time.'
        },
        {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'All biometric data is encrypted and stored securely. Fully compliant with data protection regulations.'
        }
    ];

    const comparisonData = [
        {
            traditional: 'Manual roll call takes 5-10 minutes',
            smart: 'Complete in under 30 seconds'
        },
        {
            traditional: 'Susceptible to proxy attendance',
            smart: 'Impossible to fake with face verification'
        },
        {
            traditional: 'Paper-based records prone to errors',
            smart: 'Digital records with zero data entry errors'
        },
        {
            traditional: 'Manual report generation is tedious',
            smart: 'One-click automated Excel reports'
        },
        {
            traditional: 'No real-time tracking capability',
            smart: 'Live attendance monitoring dashboard'
        }
    ];

    const highlights = [
        {
            icon: '🎓',
            title: 'Built for Academia',
            description: 'Designed specifically for educational institutions, understanding the unique challenges of classroom attendance.'
        },
        {
            icon: '⏱️',
            title: 'Time Efficient',
            description: 'Recover up to 40 hours of lecture time per semester by eliminating manual attendance processes.'
        },
        {
            icon: '📈',
            title: 'Insightful Analytics',
            description: 'Track attendance trends, identify patterns, and take proactive measures for student success.'
        }
    ];

    return (
        <div className={`landing-page ${isLoaded ? 'loaded' : ''}`}>
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <div className="logo-icon">SA</div>
                        <span className="logo-text">Smart Attendance</span>
                    </div>

                    <div className="nav-links">
                        <button className="nav-link" onClick={() => scrollToSection('about')}>
                            About
                        </button>
                        <button className="nav-link" onClick={() => scrollToSection('features')}>
                            Features
                        </button>
                        <button className="nav-link" onClick={() => scrollToSection('comparison')}>
                            Compare
                        </button>
                        <button
                            className="nav-link nav-link-cta"
                            onClick={() => scrollToSection('login')}
                        >
                            Get Started
                        </button>
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-icon">✨</span>
                        AI-Powered Attendance Platform
                    </div>

                    <h1 className="hero-title">
                        <span className="text-gradient">Smart Attendance</span>
                        <br />System
                    </h1>

                    <p className="hero-tagline">
                        AI-Powered Face Recognition Attendance for Modern Educational Institutions
                    </p>

                    <p className="hero-description">
                        Transform your institution's attendance management with cutting-edge facial recognition
                        technology. Eliminate proxy attendance, save valuable lecture time, and gain powerful
                        insights into student engagement — all with a single, elegant solution designed for
                        faculty convenience.
                    </p>

                    <div className="hero-cta">
                        <button className="btn-primary btn-lg" onClick={() => scrollToSection('login')}>
                            Get Started
                            <span>→</span>
                        </button>
                        <button className="btn-secondary btn-lg" onClick={() => scrollToSection('about')}>
                            Learn More
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-value">99.2%</span>
                            <span className="stat-label">Recognition Accuracy</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">&lt;2s</span>
                            <span className="stat-label">Processing Time</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">100%</span>
                            <span className="stat-label">Proxy Prevention</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="visual-card">
                        <div className="visual-header">
                            <div className="visual-dot"></div>
                            <div className="visual-dot"></div>
                            <div className="visual-dot"></div>
                        </div>
                        <div className="visual-content">
                            <div className="visual-row">
                                <div className="visual-avatar"></div>
                                <div className="visual-info">
                                    <div className="visual-name"></div>
                                    <div className="visual-id"></div>
                                </div>
                                <span className="visual-status present">Present</span>
                            </div>
                            <div className="visual-row">
                                <div className="visual-avatar"></div>
                                <div className="visual-info">
                                    <div className="visual-name"></div>
                                    <div className="visual-id"></div>
                                </div>
                                <span className="visual-status present">Present</span>
                            </div>
                            <div className="visual-row">
                                <div className="visual-avatar"></div>
                                <div className="visual-info">
                                    <div className="visual-name"></div>
                                    <div className="visual-id"></div>
                                </div>
                                <span className="visual-status pending">Scanning...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-label">About The Platform</span>
                        <h2 className="section-title">Revolutionizing Classroom Attendance</h2>
                        <p className="section-subtitle">
                            Moving beyond outdated attendance methods to create a seamless experience for
                            faculty and students alike.
                        </p>
                    </div>

                    <div className="about-content">
                        <div className="about-text">
                            <h3>The Traditional Attendance Problem</h3>
                            <p>
                                Traditional attendance systems waste precious lecture time with manual roll calls,
                                are susceptible to proxy marking, and require tedious manual data entry. Paper-based
                                records are error-prone, hard to analyze, and impossible to query in real-time.
                                Faculty spend hours consolidating attendance data instead of focusing on teaching.
                            </p>

                            <h3>Our AI-Powered Solution</h3>
                            <p>
                                Smart Attendance System leverages advanced face recognition technology to transform
                                attendance management. Simply walk into class, let the system recognize students
                                through the camera, and focus on what matters most — teaching. Our platform handles
                                the rest: recording, reporting, and analysis, all automated and accurate.
                            </p>
                        </div>

                        <div className="about-highlights">
                            {highlights.map((item, index) => (
                                <div
                                    key={index}
                                    className="highlight-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="highlight-icon">{item.icon}</div>
                                    <div className="highlight-content">
                                        <h4>{item.title}</h4>
                                        <p>{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-label">Platform Advantages</span>
                        <h2 className="section-title">Why Smart Attendance System?</h2>
                        <p className="section-subtitle">
                            Designed with faculty convenience in mind, our platform offers everything you need
                            for modern attendance management.
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section id="comparison" className="comparison-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-label">Platform Comparison</span>
                        <h2 className="section-title">Traditional vs Smart Attendance</h2>
                        <p className="section-subtitle">
                            See the difference our AI-powered solution makes in everyday classroom management.
                        </p>
                    </div>

                    <div className="comparison-table">
                        <div className="comparison-header">
                            <div className="comparison-col traditional">
                                <span className="comparison-icon">❌</span>
                                Traditional Attendance
                            </div>
                            <div className="comparison-col smart">
                                <span className="comparison-icon">✅</span>
                                Smart Attendance System
                            </div>
                        </div>

                        {comparisonData.map((row, index) => (
                            <div key={index} className="comparison-row">
                                <div className="comparison-cell traditional">{row.traditional}</div>
                                <div className="comparison-cell smart">{row.smart}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Login Section */}
            <section id="login" className="login-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-label">Get Started</span>
                        <h2 className="section-title">Choose Your Role</h2>
                        <p className="section-subtitle">
                            Select your role to access the Smart Attendance System portal.
                        </p>
                    </div>

                    <div className="role-cards">
                        {/* Faculty Card */}
                        <div
                            className="role-card"
                            onClick={() => navigate('/teacher-options')}
                        >
                            <div className="role-icon faculty-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3 className="role-title">Faculty</h3>
                            <p className="role-description">
                                Access your dashboard, take attendance using face recognition, manage student
                                records, and generate comprehensive reports.
                            </p>
                            <span className="role-cta">
                                Continue as Faculty
                                <span>→</span>
                            </span>
                        </div>

                        {/* HOD Card */}
                        <div
                            className="role-card hod-card"
                            onClick={() => navigate('/hod-options')}
                        >
                            <div className="role-icon hod-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M3 21h18" />
                                    <path d="M5 21V7l7-4 7 4v14" />
                                    <path d="M9 21v-4h6v4" />
                                    <path d="M9 9h1" />
                                    <path d="M9 12h1" />
                                    <path d="M14 9h1" />
                                    <path d="M14 12h1" />
                                </svg>
                            </div>
                            <h3 className="role-title">HOD</h3>
                            <p className="role-description">
                                View department-wise attendance, monitor present and absent students across
                                all branches and sections in real-time.
                            </p>
                            <span className="role-cta">
                                Continue as HOD
                                <span>→</span>
                            </span>
                        </div>

                        {/* Student Card */}
                        <div
                            className="role-card"
                            onClick={() => navigate('/register-student-public')}
                        >
                            <div className="role-icon student-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                            </div>
                            <h3 className="role-title">Student</h3>
                            <p className="role-description">
                                Register your face for automatic attendance recognition. Once registered,
                                your attendance will be marked seamlessly in every class.
                            </p>
                            <span className="role-cta">
                                Register as Student
                                <span>→</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="logo-icon">SA</div>
                        <span>Smart Attendance System</span>
                    </div>
                    <p className="footer-text">
                        AI-Powered Face Recognition Attendance for Modern Educational Institutions
                    </p>
                    <p className="footer-copyright">
                        © {new Date().getFullYear()} Smart Attendance System. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
