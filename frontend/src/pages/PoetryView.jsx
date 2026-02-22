import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Share2, Bookmark, Maximize2, Type, Palette, Volume2 } from 'lucide-react';

const PoetryView = () => {
    const { id } = useParams();
    const [poem, setPoem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [script, setScript] = useState('urdu');
    const [theme, setTheme] = useState('dark');
    const [focusMode, setFocusMode] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchPoem = async () => {
            setLoading(true);
            const userData = await api.auth.getUser();
            setUser(userData);

            try {
                const data = await api.get(`/poetry/${id}`);
                if (data) {
                    setPoem(data);
                    if (userData) {
                        try {
                            const saved = await api.get('/saved');
                            setIsSaved(saved.some(s => s.poetry_id === id));
                        } catch { }
                    }
                }
            } catch (err) {
                console.error('Error:', err);
            }
            setLoading(false);
        };
        fetchPoem();
    }, [id]);

    const handleShare = async () => {
        const shareData = {
            title: `Roshnaii - ${poem.title_roman || poem.title_urdu}`,
            text: `Read this beautiful ${poem.sinf?.name} by ${poem.poet?.name_roman} on Roshnaii.`,
            url: window.location.href,
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleSave = async () => {
        if (!user) { alert('Please login to save poetry.'); return; }
        try {
            if (isSaved) {
                await api.delete(`/saved/${id}`);
                setIsSaved(false);
            } else {
                await api.post('/saved', { poetryId: id });
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error saving poetry:', error);
        }
    };

    useEffect(() => {
        const classes = [`theme-${theme}`];
        if (focusMode) classes.push('focus-mode');
        classes.forEach(c => document.body.classList.add(c));
        return () => { classes.forEach(c => document.body.classList.remove(c)); };
    }, [theme, focusMode]);

    if (loading) return <div className="loading">LOADING POETRY...</div>;
    if (!poem) return <div className="container error">Poetry not found.</div>;

    return (
        <div className={`poetry-view container ${focusMode ? 'focus-mode' : ''}`}>
            {focusMode && (
                <button className="exit-focus-btn" onClick={() => setFocusMode(false)}>EXIT FOCUS MODE</button>
            )}

            <div className="view-header">
                <Link to={-1} className="back-link"><ArrowLeft size={20} /> BACK</Link>
            </div>

            {poem.content_roman && (
                <div className="script-tabs-container" style={{ marginTop: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                    <button type="button" onClick={() => setScript('urdu')}
                        className={`script-tab-btn ${script === 'urdu' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '1rem', background: script === 'urdu' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', border: 'none', borderBottom: script === 'urdu' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: script === 'urdu' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: script === 'urdu' ? '700' : '500', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '-0.5rem' }}>
                        <Type size={18} /> URDU SCRIPT
                    </button>
                    <button type="button" onClick={() => setScript('roman')}
                        className={`script-tab-btn ${script === 'roman' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '1rem', background: script === 'roman' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', border: 'none', borderBottom: script === 'roman' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: script === 'roman' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: script === 'roman' ? '700' : '500', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '-0.5rem' }}>
                        <Type size={18} /> ROMAN SCRIPT
                    </button>
                </div>
            )}

            <div className="reading-toolbar glass-card">
                <div className="toolbar-group">
                    <Palette size={16} />
                    <div className={`theme-dot dot-dark ${theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')}></div>
                    <div className={`theme-dot dot-light ${theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')}></div>
                    <div className={`theme-dot dot-sepia ${theme === 'sepia' ? 'active' : ''}`} onClick={() => setTheme('sepia')}></div>
                </div>
                <div className="toolbar-group">
                    <button className={`toolbar-btn ${focusMode ? 'active' : ''}`} onClick={() => setFocusMode(!focusMode)}>
                        <Maximize2 size={16} /> FOCUS
                    </button>
                </div>
            </div>

            <article className="poem-article glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div className="pattern-bg"></div>
                <header className="poem-header" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="invocation urdu-text" style={{ fontSize: '1.2rem', color: 'var(--accent-primary)', marginBottom: '2rem', opacity: 0.8 }}>
                        بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                    </div>
                    <span className="sinf-tag">{poem.sinf?.name}</span>
                    {script === 'roman' ? (
                        <h1 className="poem-title-roman">{poem.title_roman || 'Untitled'}</h1>
                    ) : (
                        <h2 className="poem-title-urdu urdu-text">{poem.title_urdu}</h2>
                    )}
                    <Link to={`/poet/${poem.poet?.slug || poem.poet?.id}`} className="poet-link">
                        By {poem.poet?.name_roman}
                    </Link>
                </header>

                {poem.audio_url && (
                    <div style={{ marginBottom: '3rem', padding: '2rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Volume2 size={24} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '1px', marginBottom: '0.25rem', color: 'var(--accent-primary)' }}>AUDIO RECITATION</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Listen to the poet's recitation</p>
                            </div>
                        </div>
                        <audio controls src={poem.audio_url} style={{ width: '100%', height: '50px', borderRadius: '8px' }} preload="metadata">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}

                <div className="poem-content">
                    {script === 'urdu' ? (
                        <div className="urdu-content urdu-text" style={{ whiteSpace: 'pre-line' }}>{poem.content_urdu}</div>
                    ) : (
                        <div className="roman-content" style={{ whiteSpace: 'pre-line' }}>{poem.content_roman}</div>
                    )}
                </div>

                <footer className="poem-footer">
                    <div className="poem-actions">
                        <button className="icon-btn" onClick={handleShare}><Share2 size={20} /> SHARE</button>
                        <button className={`icon-btn ${isSaved ? 'active' : ''}`} onClick={handleSave} style={{ color: isSaved ? 'var(--accent-primary)' : 'inherit' }}>
                            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                            {isSaved ? 'SAVED' : 'SAVE'}
                        </button>
                    </div>
                    <div className="poem-meta">
                        <span>Published on {new Date(poem.created_at).toLocaleDateString()}</span>
                    </div>
                </footer>
            </article>
        </div>
    );
};

export default PoetryView;
