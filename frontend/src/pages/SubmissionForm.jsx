import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Send, Info, Type, Music, X } from 'lucide-react';

const SubmissionForm = () => {
    const navigate = useNavigate();
    const [sinfs, setSinfs] = useState([]);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        sinf_id: '',
        title_urdu: '',
        title_roman: '',
        content_urdu: '',
        content_roman: '',
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('urdu');
    const [audioFile, setAudioFile] = useState(null);
    const [audioPreview, setAudioPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            const userData = await api.auth.getUser();
            setUser(userData);

            if (userData) {
                try {
                    const poets = await api.get('/poets');
                    const myProfile = poets.find(p => p.userId === userData.id);
                    if (myProfile) {
                        setProfile(myProfile);
                    } else {
                        navigate('/onboarding');
                    }
                } catch {
                    navigate('/onboarding');
                }
            }

            try {
                const sinfsData = await api.get('/genres');
                if (sinfsData) setSinfs(sinfsData);
            } catch { }
        };
        fetchData();
    }, [navigate]);

    const handleAudioChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/webm'];
            if (!validTypes.includes(file.type)) {
                alert('Please upload a valid audio file (MP3, WAV, OGG, M4A, or WebM)');
                return;
            }
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('Audio file size must be less than 10MB');
                return;
            }
            setAudioFile(file);
            setAudioPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveAudio = () => {
        setAudioFile(null);
        setAudioPreview(null);
        const fileInput = document.getElementById('audio-input');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadProgress(0);

        try {
            if (!profile) throw new Error("Profile not found. Please complete onboarding.");

            let audioUrl = '';

            if (audioFile) {
                setUploadProgress(25);
                const uploadRes = await api.upload(audioFile);
                audioUrl = uploadRes.url;
                setUploadProgress(75);
            }

            setUploadProgress(90);

            await api.post('/poetry', {
                poetId: profile._id || profile.id,
                genreId: formData.sinf_id,
                titleUrdu: formData.title_urdu,
                titleRoman: formData.title_roman,
                contentUrdu: formData.content_urdu,
                contentRoman: formData.content_roman,
                audioUrl: audioUrl || null,
            });

            setUploadProgress(100);
            alert('Submission successful! It will be reviewed by an admin.');
            navigate('/');
        } catch (error) {
            alert('Error submitting: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    if (!profile) return <div className="loading">LOADING PROFILE...</div>;

    return (
        <div className="submission-form container">
            <header className="page-header">
                <h1 className="page-title">SUBMIT WORK</h1>
                <p className="page-subtitle">Welcome back, {profile.nameRoman}. Share your latest creation.</p>
            </header>

            <form className="glass-card form-container" onSubmit={handleSubmit}>
                <div className="sinf-selection">
                    <label>SELECT SINF</label>
                    <div className="sinf-tags-compact">
                        {sinfs.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className={`sinf-tag-btn ${formData.sinf_id === s.id ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, sinf_id: s.id })}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="script-tabs-container" style={{
                    marginTop: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem',
                    borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem'
                }}>
                    <button type="button" onClick={() => setActiveTab('urdu')}
                        className={`script-tab-btn ${activeTab === 'urdu' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'urdu' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'urdu' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'urdu' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'urdu' ? '700' : '500', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '-0.5rem' }}>
                        <Type size={18} /> URDU SCRIPT
                    </button>
                    <button type="button" onClick={() => setActiveTab('roman')}
                        className={`script-tab-btn ${activeTab === 'roman' ? 'active' : ''}`}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'roman' ? 'rgba(212, 175, 55, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'roman' ? '2px solid var(--accent-primary)' : '2px solid transparent', color: activeTab === 'roman' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'roman' ? '700' : '500', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '-0.5rem' }}>
                        <Type size={18} /> ROMAN SCRIPT
                    </button>
                </div>

                <div className="form-tab-content" style={{ minHeight: '400px' }}>
                    {activeTab === 'urdu' ? (
                        <div className="urdu-form-section">
                            <div className="form-group">
                                <label>MATLA (URDU TITLE)</label>
                                <input required className="urdu-text" type="text" placeholder="مطلع کا پہلا مصرع لکھیں"
                                    value={formData.title_urdu}
                                    onChange={(e) => setFormData({ ...formData, title_urdu: e.target.value })}
                                    style={{ width: '100%' }} />
                            </div>
                            <div className="form-group">
                                <label>CONTENT (URDU)</label>
                                <textarea required className="urdu-text" rows="16" placeholder="اپنا کلام یہاں لکھیں..."
                                    value={formData.content_urdu}
                                    onChange={(e) => setFormData({ ...formData, content_urdu: e.target.value })}
                                    style={{ width: '100%', whiteSpace: 'pre-line' }}></textarea>
                            </div>
                        </div>
                    ) : (
                        <div className="roman-form-section">
                            <div className="form-group">
                                <label>MATLA (ROMAN TITLE)</label>
                                <input type="text" placeholder="Matle Ka Pehla Misra Likhain"
                                    value={formData.title_roman}
                                    onChange={(e) => setFormData({ ...formData, title_roman: e.target.value })}
                                    style={{ width: '100%' }} />
                            </div>
                            <div className="form-group">
                                <label>CONTENT (ROMAN)</label>
                                <textarea rows="16" placeholder="Write your poetry in Roman script here..."
                                    value={formData.content_roman}
                                    onChange={(e) => setFormData({ ...formData, content_roman: e.target.value })}
                                    style={{ width: '100%', whiteSpace: 'pre-line' }}></textarea>
                            </div>
                        </div>
                    )}
                </div>

                <div className="audio-upload-section" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '600', letterSpacing: '1px' }}>
                        AUDIO RECITATION (OPTIONAL)
                    </label>
                    <div className="audio-upload-container glass-card" style={{ padding: '1.5rem', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                        {audioPreview ? (
                            <div className="audio-preview" style={{ marginBottom: '1rem' }}>
                                <audio controls src={audioPreview} style={{ width: '100%', marginBottom: '1rem' }} />
                                <button type="button" onClick={handleRemoveAudio} className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto', padding: '0.5rem 1rem' }}>
                                    <X size={16} /> REMOVE AUDIO
                                </button>
                            </div>
                        ) : (
                            <div>
                                <Music size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem', opacity: 0.7 }} />
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    Upload your recitation (MP3, WAV, OGG, M4A, or WebM - Max 10MB)
                                </p>
                                <input type="file" accept="audio/*" onChange={handleAudioChange} id="audio-input" style={{ display: 'none' }} />
                                <label htmlFor="audio-input" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                                    <Music size={18} style={{ marginRight: '0.5rem' }} /> CHOOSE AUDIO FILE
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-info glass-card" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Info size={20} color="var(--accent-primary)" />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Providing both Urdu and Roman versions ensures your work is accessible to a wider audience. You can also add an audio recitation to enhance the experience.
                    </p>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), #d4af37)', transition: 'width 0.3s ease' }}></div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
                            Uploading... {uploadProgress}%
                        </p>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.5rem' }} disabled={loading || !formData.sinf_id}>
                    {loading ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
                </button>
            </form>
        </div>
    );
};

export default SubmissionForm;
