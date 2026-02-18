import React from 'react';

const AuthCard = ({ title, subtitle, children }) => {
    const styles = {
        page: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--bg-primary)',
        },
        card: {
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2.5rem',
            maxWidth: '440px',
            width: '100%',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        title: {
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'var(--accent-primary)',
            marginBottom: '0.5rem',
        },
        subtitle: {
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            marginBottom: '2rem',
        },
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {title && <h1 style={styles.title}>{title}</h1>}
                {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
                {children}
            </div>
        </div>
    );
};

export default AuthCard;
