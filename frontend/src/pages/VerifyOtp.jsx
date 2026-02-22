import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import AuthCard from '../components/AuthCard';
import OtpInput from '../components/OtpInput';

const VerifyOtp = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error('Please enter the complete 6-digit OTP.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            await api.auth.verifyOtp({ email, code: otp });
            toast.success('Email verified successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError(null);
        setMessage(null);

        try {
            await api.auth.resendOtp({ email });
            toast.success('A new OTP has been sent to your email!');
        } catch (err) {
            toast.error(err.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const styles = {
        label: {
            display: 'block', fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.1em', color: 'var(--text-secondary)',
            marginBottom: '0.75rem', textAlign: 'center',
        },
        emailHighlight: { color: 'var(--accent-primary)', fontWeight: 600 },
        button: {
            width: '100%', padding: '0.85rem', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#050505', fontSize: '0.9rem', fontWeight: 700,
            letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.3s ease', marginTop: '1.5rem',
        },
        resendContainer: { textAlign: 'center', marginTop: '1.5rem' },
        resendBtn: {
            background: 'none', border: 'none', color: 'var(--accent-primary)',
            fontSize: '0.85rem', cursor: 'pointer', letterSpacing: '0.05em',
            transition: 'opacity 0.3s', fontFamily: 'inherit',
        },
        error: {
            color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem', padding: '0.75rem',
            borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center',
        },
        success: {
            color: '#22c55e', fontSize: '0.85rem', marginTop: '1rem', padding: '0.75rem',
            borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)', textAlign: 'center',
        },
        icon: { display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' },
        iconInner: {
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(197, 160, 40, 0.1)', border: '1px solid rgba(197, 160, 40, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
        },
    };

    return (
        <AuthCard title="VERIFY OTP" subtitle="Enter the verification code sent to your email">
            <div style={styles.icon}>
                <div style={styles.iconInner}>✉️</div>
            </div>
            <p style={{ ...styles.label, marginBottom: '1.5rem' }}>
                We sent a code to <span style={styles.emailHighlight}>{email}</span>
            </p>
            <form onSubmit={handleVerify}>
                <OtpInput value={otp} onChange={setOtp} length={6} />
                {error && <p style={styles.error}>{error}</p>}
                {message && <p style={styles.success}>{message}</p>}
                <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'VERIFYING...' : 'VERIFY'}
                </button>
            </form>
            <div style={styles.resendContainer}>
                <button onClick={handleResend} disabled={resending}
                    style={{ ...styles.resendBtn, opacity: resending ? 0.5 : 1 }}>
                    {resending ? 'Sending...' : "Didn't receive the code? Resend OTP"}
                </button>
            </div>
        </AuthCard>
    );
};

export default VerifyOtp;
