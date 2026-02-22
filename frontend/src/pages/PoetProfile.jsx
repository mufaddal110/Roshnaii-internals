import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { User, Calendar as CalendarIcon, MapPin } from 'lucide-react';

const PoetProfile = () => {
    const { slug } = useParams();
    const [poet, setPoet] = useState(null);
    const [poetry, setPoetry] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoetAndPoetry = async () => {
            setLoading(true);
            try {
                const poetData = await api.get(`/poets/${slug}`);
                if (poetData) {
                    setPoet(poetData);
                    const poetryData = await api.get(`/poetry?poetId=${poetData._id || poetData.id}`);
                    setPoetry(poetryData || []);
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPoetAndPoetry();
    }, [slug]);

    if (loading) return <div className="loading">LOADING PROFILE...</div>;
    if (!poet) return <div className="container error">Poet not found.</div>;

    return (
        <div className="poet-profile">
            <section className="profile-hero">
                <div className="hero-bg">
                    {poet.imageUrl && <img src={poet.imageUrl} alt="" />}
                </div>
                <div className="container">
                    <div className="hero-content">
                        <div className="profile-avatar-main">
                            {poet.imageUrl ? (
                                <img src={poet.imageUrl} alt={poet.nameRoman} />
                            ) : (
                                <div className="avatar-placeholder">
                                    <User size={80} />
                                </div>
                            )}
                        </div>
                        <div className="profile-info-main">
                            {poet.takhallus && <span className="profile-takhallus">{poet.takhallus}</span>}
                            <h1 className="profile-name-roman">{poet.nameRoman}</h1>
                            <h2 className="profile-name-urdu urdu-text">{poet.nameUrdu}</h2>
                        </div>
                    </div>
                </div>
            </section>

            <section className="profile-stats-bar">
                <div className="container">
                    <div className="stats-container">
                        <div className="profile-stat-item">
                            <span className="stat-value">{poetry.length}</span>
                            <span className="stat-label">Works</span>
                        </div>
                        <div className="profile-stat-item">
                            <span className="stat-value">{new Date(poet.createdAt).getFullYear()}</span>
                            <span className="stat-label">Joined</span>
                        </div>
                        {poet.dateOfBirth && (
                            <div className="profile-stat-item">
                                <span className="stat-value">{new Date(poet.dateOfBirth).getFullYear()}</span>
                                <span className="stat-label">Born</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="container profile-body">
                {(poet.bio || poet.city || poet.country || poet.dateOfBirth) && (
                    <section className="profile-bio-section">
                        <h3 className="profile-section-title">The Poet</h3>
                        {poet.bio && <p className="profile-bio-text">{poet.bio}</p>}
                        <div className="profile-details" style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            {poet.dateOfBirth && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CalendarIcon size={18} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Born: {new Date(poet.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                            )}
                            {poet.city && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {poet.city}{poet.country ? `, ${poet.country}` : ''}
                                    </span>
                                </div>
                            )}
                            {poet.country && !poet.city && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={18} color="var(--accent-primary)" />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{poet.country}</span>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                <section className="profile-works-section">
                    <h3 className="profile-section-title">Collected Works</h3>
                    <div className="works-grid">
                        {poetry.length > 0 ? (
                            poetry.map((poem) => (
                                <Link key={poem.id} to={`/poetry/${poem.id}`} className="work-card glass-card">
                                    <span className="sinf-tag">{poem.sinf?.name}</span>
                                    <h3 className="urdu-text">{poem.title_urdu}</h3>
                                    <p className="poem-title-roman">{poem.title_roman}</p>
                                    <div className="view-profile-btn">READ POEM</div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-content glass-card" style={{ gridColumn: '1/-1' }}>
                                <p>No published works yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default PoetProfile;
