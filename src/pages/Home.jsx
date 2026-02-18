import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import PoetryCard from '../components/PoetryCard';

const Home = () => {
    const [sinfs, setSinfs] = useState([]);
    const [poets, setPoets] = useState([]);
    const [poetry, setPoetry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSinf, setSelectedSinf] = useState(null);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [genresData, poetsData, poetryData] = await Promise.all([
                api.get('/genres'),
                api.get('/poets?limit=6'),
                api.get('/poetry?limit=12'),
            ]);
            setSinfs(genresData || []);
            setPoets(poetsData || []);
            setPoetry(poetryData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchByGenre = async (genreId) => {
        setSelectedSinf(genreId);
        try {
            const data = genreId
                ? await api.get(`/poetry?genreId=${genreId}`)
                : await api.get('/poetry?limit=12');
            setPoetry(data || []);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    if (loading) return <div className="loading">LOADING...</div>;

    return (
        <div className="home-page">
            <section className="sinf-section container">
                <h2 className="section-title">SINFS</h2>
                <div className="sinf-grid">
                    {sinfs.map((sinf) => (
                        <Link key={sinf.id} to={`/sinf/${sinf.slug}`} className="sinf-card glass-card">
                            <span className="sinf-name">{sinf.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="poets-section container">
                <div className="section-header">
                    <h2 className="section-title">POETS</h2>
                    <Link to="/poets" className="view-all-link">VIEW ALL</Link>
                </div>
                <div className="poets-grid">
                    {poets.map((poet) => (
                        <Link key={poet._id || poet.id} to={`/poet/${poet.slug || poet._id}`} className="poet-card glass-card">
                            <div className="poet-avatar">
                                {poet.imageUrl ? (
                                    <img src={poet.imageUrl} alt={poet.nameRoman} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <span>{(poet.nameRoman || 'P')[0]}</span>
                                    </div>
                                )}
                            </div>
                            <h3>{poet.nameRoman}</h3>
                            {poet.nameUrdu && <p className="urdu-text">{poet.nameUrdu}</p>}
                            {poet.takhallus && <span className="takhallus-tag">{poet.takhallus}</span>}
                            <div className="view-profile-btn">VIEW PROFILE</div>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="poetry-section container">
                <h2 className="section-title">POETRY</h2>
                <div className="filter-tags">
                    <button
                        className={`filter-tag ${!selectedSinf ? 'active' : ''}`}
                        onClick={() => fetchByGenre(null)}
                    >ALL</button>
                    {sinfs.map((s) => (
                        <button
                            key={s.id}
                            className={`filter-tag ${selectedSinf === s.id ? 'active' : ''}`}
                            onClick={() => fetchByGenre(s.id)}
                        >{s.name}</button>
                    ))}
                </div>
                <div className="poetry-grid">
                    {poetry.length > 0 ? (
                        poetry.map((poem) => (
                            <PoetryCard key={poem.id} poetry={poem} />
                        ))
                    ) : (
                        <div className="no-results glass-card">
                            <p>No poetry found.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
