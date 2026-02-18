import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { Sun, Moon } from 'lucide-react';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const location = useLocation();

    useEffect(() => {
        document.body.className = theme === 'light' ? 'light-theme' : '';
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const loadUser = async () => {
            const userData = await api.auth.getUser();
            setUser(userData);
            if (userData) {
                try {
                    const poets = await api.get('/poets');
                    const myProfile = poets.find(p => p.userId === userData.id);
                    if (myProfile) setProfile(myProfile);
                } catch {
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }
        };
        loadUser();
    }, [location.pathname]);

    const handleLogout = () => {
        api.auth.logout();
        setUser(null);
        setProfile(null);
        navigate('/');
    };

    const isAdminPath = location.pathname.startsWith('/admin');

    return (
        <div className={`app-wrapper ${isAdminPath ? 'admin-mode' : ''}`}>
            <nav className="navbar">
                <div className="container nav-container">
                    {isAdminPath ? (
                        <div className="admin-nav-brand">
                            <img src="/logo.png" alt="ROSHNAII" className="logo-img" />
                            <span className="admin-badge">ADMIN PANEL</span>
                        </div>
                    ) : (
                        <Link to="/" className="logo">
                            <img src="/logo.png" alt="ROSHNAII" className="logo-img" />
                        </Link>
                    )}

                    {!isAdminPath && (
                        <div className="nav-links">
                            <Link to="/">HOME</Link>
                            <Link to="/poets">POETS</Link>
                            <Link to="/submit">SUBMIT</Link>
                        </div>
                    )}

                    <div className="nav-actions">
                        <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        {isAdminPath ? (
                            <div className="auth-links">
                                <Link to="/" className="btn btn-secondary btn-sm">GO TO WEBSITE</Link>
                                <button onClick={handleLogout} className="btn-text">LOGOUT</button>
                            </div>
                        ) : user ? (
                            <div className="auth-links">
                                {profile ? (
                                    <Link to={`/poet/${profile.slug || profile.id}`} className="user-profile-nav">
                                        {profile.imageUrl ? (
                                            <img src={profile.imageUrl} alt={profile.nameRoman} className="nav-avatar" />
                                        ) : (
                                            <span className="nav-name">{profile.takhallus || profile.nameRoman}</span>
                                        )}
                                    </Link>
                                ) : (
                                    <Link to="/onboarding" className="btn-text">COMPLETE PROFILE</Link>
                                )}
                                <button onClick={handleLogout} className="btn-text">LOGOUT</button>
                            </div>
                        ) : (
                            <div className="auth-links">
                                <Link to="/login" className="btn-text">LOGIN</Link>
                                <Link to="/login?mode=signup" className="btn btn-primary btn-sm">SIGN UP</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="content">
                {children}
            </main>

            <footer className="footer">
                <div className="container footer-container">
                    <div className="footer-logo">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <img src="/logo.png" alt="ROSHNAII" className="logo-img footer-logo-img" />
                            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                            <span style={{ fontSize: '0.6rem', letterSpacing: '2px', color: 'var(--accent-sacrifice)', fontWeight: '900' }}>RISAI ADAB</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-tertiary)', marginBottom: '1.5rem', maxWidth: '300px', lineHeight: '1.6' }}>
                            "Salam ya Hussain (A.S) - The light that never fades, the sacrifice that defines humanity."
                        </p>
                        <p>© 2024 ROSHNAII. ALL RIGHTS RESERVED.</p>
                    </div>
                    {!isAdminPath && (
                        <div className="footer-links">
                            <Link to="/">HOME</Link>
                            <Link to="/poets">POETS</Link>
                        </div>
                    )}
                </div>
            </footer >
        </div >
    );
};


export default Layout;
