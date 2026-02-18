import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Search, User } from 'lucide-react';
import PoetryCard from '../components/PoetryCard';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [poetry, setPoetry] = useState([]);
    const [poets, setPoets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [likedPoetry, setLikedPoetry] = useState(new Set());
    const [followedPoets, setFollowedPoets] = useState(new Set());
    const [playingAudio, setPlayingAudio] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const audioRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            const userData = await api.auth.getUser();
            setUser(userData);
            await fetchData();
        };
        init();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [poetryRes, poetsRes] = await Promise.all([
                api.get('/poetry?limit=20'),
                api.get('/poets?limit=10'),
            ]);
            setPoetry(poetryRes || []);
            setPoets(poetsRes || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = (poetryId) => {
        setLikedPoetry((prev) => {
            const next = new Set(prev);
            if (next.has(poetryId)) next.delete(poetryId);
            else next.add(poetryId);
            return next;
        });
    };

    const handleFollow = (poetId) => {
        setFollowedPoets((prev) => {
            const next = new Set(prev);
            if (next.has(poetId)) next.delete(poetId);
            else next.add(poetId);
            return next;
        });
    };

    const handleToggleAudio = (poetryId) => {
        if (playingAudio === poetryId) {
            audioRef.current?.pause();
            setPlayingAudio(null);
        } else {
            const item = poetry.find((p) => p.id === poetryId);
            if (item?.audio_url) {
                if (audioRef.current) {
                    audioRef.current.src = item.audio_url;
                    audioRef.current.play();
                }
                setPlayingAudio(poetryId);
            }
        }
    };

    const filteredPoetry = searchQuery
        ? poetry.filter((p) =>
            (p.title_roman || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.title_urdu || '').includes(searchQuery) ||
            (p.poets?.name_roman || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
        : poetry;

    const styles = {
        page: { maxWidth: '900px', margin: '0 auto', padding: '2rem', minHeight: '100vh' },
        header: { marginBottom: '2rem' },
        greeting: { fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.1em', marginBottom: '0.5rem' },
        subGreeting: { color: 'var(--text-secondary)', fontSize: '0.9rem' },
        searchContainer: { position: 'relative', marginBottom: '2rem' },
        searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' },
        searchInput: {
            width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', borderRadius: '12px',
            border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
            color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s', fontFamily: 'inherit',
        },
        poetsSection: { marginBottom: '2rem' },
        sectionTitle: { fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-tertiary)', marginBottom: '1rem' },
        poetsScroll: { display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' },
        poetItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', minWidth: '80px' },
        poetCircle: {
            width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--border-color)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-tertiary)', transition: 'border-color 0.3s',
        },
        poetImg: { width: '100%', height: '100%', objectFit: 'cover' },
        poetName: { fontSize: '0.7rem', letterSpacing: '0.05em', color: 'var(--text-secondary)', textAlign: 'center' },
        divider: { border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0 2rem' },
        emptyState: { textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' },
    };

    if (loading) return <div className="loading">LOADING...</div>;

    return (
        <div style={styles.page}>
            <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} />
            <div style={styles.header}>
                <h1 style={styles.greeting}>
                    {user?.fullName ? `Welcome, ${user.fullName}` : 'YOUR FEED'}
                </h1>
                <p style={styles.subGreeting}>Explore the latest poetry from the community.</p>
            </div>

            <div style={styles.searchContainer}>
                <Search size={18} style={styles.searchIcon} />
                <input type="text" placeholder="Search poetry or poets..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 40, 0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                />
            </div>

            {poets.length > 0 && (
                <div style={styles.poetsSection}>
                    <h2 style={styles.sectionTitle}>POETS</h2>
                    <div style={styles.poetsScroll}>
                        {poets.map((poet) => (
                            <Link key={poet._id || poet.id} to={`/poet/${poet.slug || poet._id}`} style={styles.poetItem}>
                                <div style={styles.poetCircle}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                                    {poet.imageUrl ? (
                                        <img src={poet.imageUrl} alt={poet.nameRoman} style={styles.poetImg} />
                                    ) : (
                                        <User size={24} color="var(--text-tertiary)" />
                                    )}
                                </div>
                                <span style={styles.poetName}>{poet.nameRoman}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <hr style={styles.divider} />
            <h2 style={styles.sectionTitle}>LATEST POETRY</h2>

            {filteredPoetry.length > 0 ? (
                filteredPoetry.map((item) => (
                    <PoetryCard key={item.id} poetry={item}
                        onLike={handleLike} onFollow={handleFollow}
                        isLiked={likedPoetry.has(item.id)}
                        isFollowing={followedPoets.has(item.poet_id)}
                        audioPlaying={playingAudio === item.id}
                        onToggleAudio={handleToggleAudio} />
                ))
            ) : (
                <div style={styles.emptyState}><p>No poetry found.</p></div>
            )}
        </div>
    );
};

export default Dashboard;
