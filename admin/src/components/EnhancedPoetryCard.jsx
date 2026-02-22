import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Bookmark, Star } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const EnhancedPoetryCard = ({ poetry, onUpdate }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [likesCount, setLikesCount] = useState(poetry.likes_count || 0);
    const [averageRating, setAverageRating] = useState(poetry.average_rating || 0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        checkAuthAndStatus();
    }, [poetry.id]);

    const checkAuthAndStatus = async () => {
        try {
            const user = await api.auth.getUser();
            if (user) {
                setIsAuthenticated(true);
                const [likeStatus, savedList, ratingStatus] = await Promise.all([
                    api.get(`/likes/check/${poetry.id}`).catch(() => ({ isLiked: false })),
                    api.get('/saved').catch(() => []),
                    api.get(`/ratings/check/${poetry.id}`).catch(() => ({ rating: null }))
                ]);
                
                setIsLiked(likeStatus.isLiked);
                setIsSaved(Array.isArray(savedList) && savedList.some(s => s.poetry_id === poetry.id));
                setUserRating(ratingStatus.rating || 0);
            }
        } catch (err) {
            setIsAuthenticated(false);
        }
    };

    const handleLike = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to like poetry');
            return;
        }
        if (loading) return;

        setLoading(true);
        try {
            if (isLiked) {
                await api.delete(`/likes/${poetry.id}`);
                setIsLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
                toast.success('Unliked');
            } else {
                await api.post('/likes', { poetryId: poetry.id });
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
                toast.success('Liked!');
            }
            onUpdate?.();
        } catch (err) {
            toast.error(err.message || 'Failed to like');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to save poetry');
            return;
        }
        if (loading) return;

        setLoading(true);
        try {
            if (isSaved) {
                await api.delete(`/saved/${poetry.id}`);
                setIsSaved(false);
                toast.success('Removed from favorites');
            } else {
                await api.post('/saved', { poetryId: poetry.id });
                setIsSaved(true);
                toast.success('Added to favorites!');
            }
            onUpdate?.();
        } catch (err) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const handleRate = async (rating, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to rate poetry');
            return;
        }
        if (loading) return;

        setLoading(true);
        try {
            await api.post('/ratings', { poetryId: poetry.id, rating });
            setUserRating(rating);
            toast.success(`Rated ${rating} stars!`);
            
            const updated = await api.get(`/poetry/${poetry.id}`);
            setAverageRating(updated.average_rating);
            onUpdate?.();
        } catch (err) {
            toast.error(err.message || 'Failed to rate');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        card: {
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1.25rem',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'block',
            color: 'inherit',
            cursor: 'pointer',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
        },
        poetInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--accent-primary)',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            fontWeight: 600,
        },
        genreTag: {
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: 'var(--text-tertiary)',
            background: 'var(--bg-tertiary)',
            padding: '0.25rem 0.75rem',
            borderRadius: '6px',
        },
        titleUrdu: {
            fontFamily: "'Noto Nastaliq Urdu', serif",
            direction: 'rtl',
            lineHeight: 2.2,
            fontSize: '1.3rem',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
            fontWeight: 600,
        },
        titleRoman: {
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem',
            letterSpacing: '0.05em',
        },
        excerpt: {
            fontFamily: "'Noto Nastaliq Urdu', serif",
            direction: 'rtl',
            lineHeight: 2.4,
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '1.25rem',
            borderLeft: '2px solid var(--accent-primary)',
            paddingLeft: '1rem',
        },
        actions: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1rem',
        },
        actionBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
        },
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginLeft: 'auto',
        },
        starBtn: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: 'var(--text-tertiary)',
            transition: 'all 0.2s ease',
        },
        avgRating: {
            fontSize: '0.75rem',
            color: 'var(--accent-primary)',
            marginLeft: '0.5rem',
            fontWeight: 600,
        },
    };

    return (
        <Link 
            to={`/poetry/${poetry.id}`} 
            style={styles.card}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(197, 160, 40, 0.2)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={styles.header}>
                {poetry.poet && (
                    <div style={styles.poetInfo}>
                        <span>BY {poetry.poet.name_roman?.toUpperCase()}</span>
                    </div>
                )}
                {poetry.sinf && (
                    <span style={styles.genreTag}>{poetry.sinf.name}</span>
                )}
            </div>

            {poetry.title_urdu && (
                <div style={styles.titleUrdu}>{poetry.title_urdu}</div>
            )}
            {poetry.title_roman && (
                <div style={styles.titleRoman}>{poetry.title_roman}</div>
            )}

            {poetry.content_urdu && (
                <div style={styles.excerpt}>
                    {poetry.content_urdu.split('\n').slice(0, 2).join('\n')}
                </div>
            )}

            <div style={styles.actions}>
                <button 
                    style={{
                        ...styles.actionBtn,
                        color: isLiked ? '#ef4444' : 'var(--text-secondary)',
                        borderColor: isLiked ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)',
                        background: isLiked ? 'rgba(239, 68, 68, 0.08)' : 'none',
                    }}
                    onClick={handleLike}
                    disabled={loading}
                >
                    <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likesCount}</span>
                </button>

                <button 
                    style={{
                        ...styles.actionBtn,
                        color: isSaved ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        borderColor: isSaved ? 'rgba(197, 160, 40, 0.3)' : 'var(--border-color)',
                        background: isSaved ? 'rgba(197, 160, 40, 0.08)' : 'none',
                    }}
                    onClick={handleSave}
                    disabled={loading}
                >
                    <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                </button>

                <div style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            style={{
                                ...styles.starBtn,
                                color: userRating >= star ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                            }}
                            onClick={(e) => handleRate(star, e)}
                            disabled={loading}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Star 
                                size={16} 
                                fill={userRating >= star ? 'currentColor' : 'none'}
                            />
                        </button>
                    ))}
                    {averageRating > 0 && (
                        <span style={styles.avgRating}>{averageRating.toFixed(1)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default EnhancedPoetryCard;
