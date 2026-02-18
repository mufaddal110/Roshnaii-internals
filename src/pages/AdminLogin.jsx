import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.auth.login({ email, password });
            if (!res.user?.isAdmin) {
                api.auth.logout();
                setError('Access denied. You are not an administrator.');
            } else {
                navigate('/admin');
            }
        } catch (err) {
            setError(err.message || 'Login failed.');
        }
        setLoading(false);
    };

    return (
        <div className="admin-login container">
            <div className="form-container">
                <header className="page-header">
                    <h1 className="page-title">ADMIN</h1>
                    <p className="page-subtitle">Sign in to manage ROSHNAII.</p>
                </header>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>EMAIL</label>
                        <input
                            type="email"
                            placeholder="admin@roshnaii.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>PASSWORD</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
