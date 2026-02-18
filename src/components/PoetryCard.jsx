import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, UserPlus, UserCheck, Play, Pause } from 'lucide-react';

const PoetryCard = ({ poetry, onLike, onFollow, isLiked, isFollowing, audioPlaying, onToggleAudio }) => {
    // If used in simple mode (legacy), fall back to old behavior
    if (!onLike && !onFollow && poetry?.id) {
        const poem = poetry;
        return (
            <Link to={`/poetry/${poem.id}`} className="poetry-card glass-card">
                <span className="sinf-tag">{poem.sinf?.name || 'POETRY'}</span>
                <h3 className="urdu-text">{poem.title_urdu || (poem.content_urdu && poem.content_urdu.substring(0, 30) + '...')}</h3>
                {poem.title_roman && <p className="poem-title-roman">{poem.title_roman}</p>}
                <p className="poet-name">By {poem.poet?.name_roman || poem.poets?.name_roman || 'Unknown Poet'}</p>
                <div className="view-profile-btn">READ POEM</div>
            </Link>
        );
    }

    const styles = {
        card: {
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.5rem',
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
            textDecoration: 'none',
            display: 'block',
            color: 'inherit',
        },
        title: {
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
        },
        titleUrdu: {
            fontFamily: "'Noto Nastaliq Urdu', serif",
            direction: 'rtl',
            lineHeight: 2.2,
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
        },
        poetName: {
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            color: 'var(--accent-primary)',
            marginBottom: '0.75rem',
        },
        preview: {
            fontFamily: "'Noto Nastaliq Urdu', serif",
            direction: 'rtl',
            lineHeight: 2.4,
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: '1rem',
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
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
        },
        likeBtn: (liked) => ({
            color: liked ? '#ef4444' : 'var(--text-secondary)',
            borderColor: liked ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)',
            background: liked ? 'rgba(239, 68, 68, 0.08)' : 'none',
        }),
        followBtn: (following) => ({
            color: following ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderColor: following ? 'rgba(197, 160, 40, 0.3)' : 'var(--border-color)',
            background: following ? 'rgba(197, 160, 40, 0.08)' : 'none',
        }),
        audioBtn: {
            color: 'var(--text-secondary)',
            marginLeft: 'auto',
        },
    };

    const poetName = poetry.poets?.name_roman || 'Unknown Poet';
    const previewLines = (poetry.content_urdu || '').split('\n').slice(0, 2).join('\n');

    return (
        <div
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
            <Link to={`/poetry/${poetry.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {poetry.title_urdu && <div style={styles.titleUrdu}>{poetry.title_urdu}</div>}
                {poetry.title_roman && <div style={styles.title}>{poetry.title_roman}</div>}
                <div style={styles.poetName}>BY {poetName.toUpperCase()}</div>
                {previewLines && <div style={styles.preview}>{previewLines}</div>}
            </Link>

            <div style={styles.actions}>
                <button
                    style={{ ...styles.actionBtn, ...styles.likeBtn(isLiked) }}
                    onClick={() => onLike?.(poetry.id)}
                >
                    <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
                    {isLiked ? 'LOVED' : 'LOVE'}
                </button>

                <button
                    style={{ ...styles.actionBtn, ...styles.followBtn(isFollowing) }}
                    onClick={() => onFollow?.(poetry.poet_id)}
                >
                    {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                    {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </button>

                {poetry.audio_url && (
                    <button
                        style={{ ...styles.actionBtn, ...styles.audioBtn }}
                        onClick={() => onToggleAudio?.(poetry.id)}
                    >
                        {audioPlaying ? <Pause size={16} /> : <Play size={16} />}
                        {audioPlaying ? 'PAUSE' : 'LISTEN'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PoetryCard;
