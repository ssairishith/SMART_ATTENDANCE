import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const menuItems = [
        { name: 'Home', path: '/dashboard', icon: '🏠' },
        { name: 'New Data', path: '/register-student', icon: '📝' },
        { name: 'Manage Data', path: '/reports', icon: '📊' },
        { name: 'Group Recog', path: '/group-attendance', icon: '👥' }
    ];

    return (
        <div style={{
            width: '260px',
            background: 'var(--bg-sidebar)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1rem',
            height: '100%',
            flexShrink: 0,
            boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
            zIndex: 10
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '3rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '2rem'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 10px rgba(124, 58, 237, 0.5))' }}>⚡</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>SMART ATTEND</div>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            textDecoration: 'none',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            padding: '1rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            background: isActive ? 'linear-gradient(90deg, var(--primary-color), var(--primary-hover))' : 'transparent',
                            transition: 'all 0.3s ease',
                            fontWeight: isActive ? 600 : 400,
                            boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                            transform: isActive ? 'translateX(5px)' : 'translateX(0)'
                        })}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                        <span>{item.name}</span>
                        {item.name === 'Home' && <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>›</span>}
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Logged in as</div>
                <div style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{localStorage.getItem('teacherName') || 'Teacher'}</div>
            </div>
        </div>
    );
};

export default Sidebar;
