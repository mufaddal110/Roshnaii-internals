import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Onboarding = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name_roman: '',
        name_urdu: '',
        takhallus: '',
        bio: '',
        date_of_birth: '',
        city: '',
        country: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const checkUser = async () => {
            const userData = await api.auth.getUser();
            if (!userData) {
                navigate('/login');
                return;
            }
            setUser(userData);

            // Check if profile already exists
            try {
                const poets = await api.get('/poets');
                const existing = poets.find(p => p.userId === userData.id);
                if (existing) navigate('/');
            } catch { }
        };
        checkUser();
    }, [navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = '';

            if (imageFile) {
                const uploadRes = await api.upload(imageFile);
                imageUrl = uploadRes.url;
            }

            await api.post('/poets', {
                nameRoman: formData.name_roman,
                nameUrdu: formData.name_urdu,
                takhallus: formData.takhallus,
                bio: formData.bio,
                imageUrl,
                dateOfBirth: formData.date_of_birth || null,
                city: formData.city || null,
                country: formData.country || null,
            });

            alert('Profile created! You can now submit your poetry.');
            navigate('/');
        } catch (error) {
            alert('Error creating profile: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = () => {
        const fields = [
            formData.name_roman, formData.name_urdu, formData.takhallus,
            formData.bio, formData.date_of_birth, formData.city, formData.country, imageFile
        ];
        const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
        return Math.round((filledFields / fields.length) * 100);
    };

    const completionPercentage = calculateCompletion();

    return (
        <div className="onboarding-page container">
            <header className="page-header">
                <h1 className="page-title">WELCOME</h1>
                <p className="page-subtitle">Set up your poet profile to start contributing.</p>
                <div className="completion-indicator" style={{ marginTop: '1.5rem' }}>
                    <div className="completion-bar-container" style={{
                        width: '100%', maxWidth: '400px', margin: '0 auto',
                        background: 'rgba(255,255,255,0.05)', borderRadius: '10px',
                        padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem'
                    }}>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${completionPercentage}%`, height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-primary), #d4af37)',
                                transition: 'width 0.3s ease', borderRadius: '4px'
                            }}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-primary)', minWidth: '45px', textAlign: 'right' }}>
                            {completionPercentage}%
                        </span>
                    </div>
                </div>
            </header>

            <form className="glass-card form-container" onSubmit={handleSubmit}>
                <div className="profile-image-upload">
                    <div className="image-preview">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" />
                        ) : (
                            <div className="placeholder-circle">
                                <span>UPLOAD IMAGE</span>
                            </div>
                        )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} id="image-input" style={{ display: 'none' }} />
                    <label htmlFor="image-input" className="btn btn-secondary">CHOOSE PHOTO</label>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>FULL NAME (ROMAN)</label>
                        <input required type="text" placeholder="e.g. Mirza Ghalib"
                            value={formData.name_roman}
                            onChange={(e) => setFormData({ ...formData, name_roman: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>FULL NAME (URDU)</label>
                        <input required className="urdu-text" type="text" placeholder="مرزا غالب"
                            value={formData.name_urdu}
                            onChange={(e) => setFormData({ ...formData, name_urdu: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label>TAKHALLLUS (PEN NAME)</label>
                    <input className="urdu-text" type="text" placeholder="غالب"
                        value={formData.takhallus}
                        onChange={(e) => setFormData({ ...formData, takhallus: e.target.value })} />
                </div>

                <div className="form-group">
                    <label>BIO / INTRODUCTION</label>
                    <textarea rows="4" placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}></textarea>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>DATE OF BIRTH</label>
                        <input type="date" value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            max={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                        <label>CITY</label>
                        <input type="text" placeholder="e.g. Karachi, Lahore"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label>COUNTRY</label>
                    <input type="text" placeholder="e.g. Pakistan"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'SAVING...' : 'COMPLETE PROFILE'}
                </button>
            </form>
        </div>
    );
};

export default Onboarding;
