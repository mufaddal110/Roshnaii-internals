import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import PoetryCard from '../components/PoetryCard';

const SinfPage = () => {
    const { slug } = useParams();
    const [poetry, setPoetry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sinf, setSinf] = useState(null);

    useEffect(() => {
        const fetchSinfAndPoetry = async () => {
            setLoading(true);
            try {
                const sinfData = await api.get(`/genres/${slug}`);
                if (sinfData) {
                    setSinf(sinfData);
                    const poetryData = await api.get(`/poetry?genreId=${sinfData.id}`);
                    setPoetry(poetryData || []);
                }
            } catch (err) {
                console.error('Error:', err);
            }
            setLoading(false);
        };
        fetchSinfAndPoetry();
    }, [slug]);

    if (loading) return <div className="container loading">Loading...</div>;
    if (!sinf) return <div className="container error">Sinf not found.</div>;

    return (
        <div className="sinf-page container">
            <header className="page-header">
                <h1 className="page-title">{sinf.name.toUpperCase()}</h1>
                <p className="page-subtitle">Explore the collection of {sinf.name}</p>
            </header>

            <div className="poetry-grid">
                {poetry.length > 0 ? (
                    poetry.map((poem) => (
                        <PoetryCard key={poem.id} poem={poem} />
                    ))
                ) : (
                    <div className="no-results glass-card">
                        <p>No poetry found in this sinf yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SinfPage;
