import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { login, clearError } from '../store/slices/authSlice';
import api from '../api';

const Auth = () => {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [favoriteShair, setFavoriteShair] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState(null);
    const [message, setMessage] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, error: reduxError, loading: reduxLoading } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Clear Redux error when switching mode
        dispatch(clearError());
        setLocalError(null);
    }, [isLogin, dispatch]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLocalError(null);
        setMessage(null);

        if (!isLogin && password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        try {
            if (isLogin) {
                const result = await dispatch(login({ email, password })).unwrap();
                toast.success('Login successful!');
                // Navigation is handled by useEffect on isAuthenticated
            } else {
                setLocalLoading(true);
                await api.auth.signup({
                    email,
                    password,
                    fullName,
                    username,
                    favoriteShair,
                });
                toast.success('Account created! Please verify your email.');
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
            }
        } catch (err) {
            if (err.data?.needsVerification) {
                toast.error('Please verify your email first.');
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
                return;
            }
            // Show error toast
            toast.error(err.message || (isLogin ? 'Login failed. Please try again.' : 'Signup failed. Please try again.'));
        } finally {
            setLocalLoading(false);
        }
    };

    const loading = localLoading || reduxLoading;
    const displayError = localError || reduxError;

    const styles = {
        page: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '2rem',
        },
        card: {
            width: '100%',
            maxWidth: '420px',
            padding: '2.5rem',
            borderRadius: '16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '0.2em',
            color: 'var(--accent-primary)',
            textAlign: 'center',
            marginBottom: '0.5rem',
        },
        subtitle: {
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: '2rem',
        },
        label: {
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem',
        },
        input: {
            width: '100%',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
            marginBottom: '1rem',
            fontFamily: 'inherit',
        },
        button: {
            width: '100%',
            padding: '0.85rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#050505',
            fontSize: '0.9rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '0.5rem',
        },
        switchText: {
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
        },
        switchLink: {
            color: 'var(--accent-primary)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            fontWeight: 600,
            letterSpacing: '0.05em',
            fontSize: '0.85rem',
            fontFamily: 'inherit',
        },
        error: {
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center',
        },
        success: {
            color: '#22c55e',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            textAlign: 'center',
        },
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>{isLogin ? 'LOGIN' : 'SIGN UP'}</h1>
                <p style={styles.subtitle}>
                    {isLogin ? 'Welcome back to Roshnaii' : 'Join the community of poetry lovers'}
                </p>

                {displayError && <p style={styles.error}>{displayError}</p>}
                {message && <p style={styles.success}>{message}</p>}

                <form onSubmit={handleAuth}>
                    {!isLogin && (
                        <>
                            <div>
                                <label style={styles.label}>FULL NAME</label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-color)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>USERNAME</label>
                                <input
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-color)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <label style={styles.label}>FAVORITE SHAIR</label>
                                <input
                                    type="text"
                                    placeholder="Your favorite poet"
                                    value={favoriteShair}
                                    onChange={(e) => setFavoriteShair(e.target.value)}
                                    style={styles.input}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-color)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={styles.label}>EMAIL</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-color)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--accent-primary)';
                                e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border-color)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label style={styles.label}>CONFIRM PASSWORD</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={styles.input}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--accent-primary)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-color)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? (isLogin ? 'LOGGING IN...' : 'CREATING ACCOUNT...') : (isLogin ? 'LOGIN' : 'CREATE ACCOUNT')}
                    </button>
                </form>

                <p style={styles.switchText}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setLocalError(null);
                            setMessage(null);
                            dispatch(clearError());
                        }}
                        style={styles.switchLink}
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;
