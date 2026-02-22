import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { User } from 'lucide-react';

const PoetsPage = () => {
    const [poets, setPoets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPoets = async () => {
            try {
                const data = await api.get('/poets');
                setPoets(data || []);
            } catch (err) {
                console.error('Error fetching poets:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPoets();
    }, []);

    if (loading) return <div className="loading">LOADING POETS...</div>;

    return (
        <div className="poets-page container">
            <header className="page-header">
                <h1 className="page-title">ALL POETS</h1>
                <p className="page-subtitle">Discover the voices of Urdu poetry</p>
            </header>

            <div className="poets-grid">
                {poets.length > 0 ? poets.map((poet) => (
                    <Link key={poet._id || poet.id} to={`/poet/${poet.slug || poet._id}`} className="poet-card glass-card">
                        <div className="poet-avatar">
                            {poet.imageUrl ? (
                                <img src={poet.imageUrl} alt={poet.nameRoman} />
                            ) : (
                                <div className="avatar-placeholder">
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        <h3>{poet.nameRoman}</h3>
                        {poet.nameUrdu && <p className="urdu-text">{poet.nameUrdu}</p>}
                        {poet.takhallus && <span className="takhallus-tag">{poet.takhallus}</span>}
                        <div className="view-profile-btn">VIEW PROFILE</div>
                    </Link>
                )) : (
                    <div className="no-results glass-card">
                        <p>No poets found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PoetsPage;
