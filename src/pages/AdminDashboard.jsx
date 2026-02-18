import React, { useEffect, useState } from 'react';
import api from '../api';

const AdminDashboard = () => {
    const [poetry, setPoetry] = useState([]);
    const [poets, setPoets] = useState([]);
    const [tab, setTab] = useState('poetry');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [poetryData, poetsData] = await Promise.all([
                api.get('/admin/poetry'),
                api.get('/admin/poets'),
            ]);
            setPoetry(poetryData || []);
            setPoets(poetsData || []);
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (table, id) => {
        try {
            const res = await api.patch(`/admin/${table}/${id}/publish`);
            if (table === 'poetry') {
                setPoetry(prev => prev.map(p => p.id === id ? { ...p, is_published: res.is_published } : p));
            } else {
                setPoets(prev => prev.map(p => p.id === id ? { ...p, is_published: res.is_published } : p));
            }
        } catch (err) {
            alert('Error: ' + (err.message || 'Could not update'));
        }
    };

    const deleteItem = async (table, id) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        try {
            await api.delete(`/admin/${table}/${id}`);
            if (table === 'poetry') {
                setPoetry(prev => prev.filter(p => p.id !== id));
            } else {
                setPoets(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            alert('Error: ' + (err.message || 'Could not delete'));
        }
    };

    if (loading) return <div className="loading">LOADING ADMIN...</div>;

    return (
        <div className="admin-dashboard container">
            <header className="page-header">
                <h1 className="page-title">MANAGE CONTENT</h1>
            </header>

            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${tab === 'poetry' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('poetry')}
                >POETRY ({poetry.length})</button>
                <button
                    className={`btn ${tab === 'poets' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setTab('poets')}
                >POETS ({poets.length})</button>
            </div>

            {tab === 'poetry' && (
                <div className="admin-list">
                    {poetry.map((item) => (
                        <div key={item.id} className="admin-item glass-card" style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '1rem 1.5rem', marginBottom: '0.75rem'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                                    {item.title_roman || item.title_urdu || 'Untitled'}
                                </h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {item.poet?.name_roman} · {item.sinf?.name}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={`btn btn-sm ${item.is_published ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => togglePublish('poetry', item.id)}
                                >{item.is_published ? 'UNPUBLISH' : 'PUBLISH'}</button>
                                <button
                                    className="btn btn-sm"
                                    style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                                    onClick={() => deleteItem('poetry', item.id)}
                                >DELETE</button>
                            </div>
                        </div>
                    ))}
                    {poetry.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No poetry submissions.</p>}
                </div>
            )}

            {tab === 'poets' && (
                <div className="admin-list">
                    {poets.map((item) => (
                        <div key={item.id} className="admin-item glass-card" style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '1rem 1.5rem', marginBottom: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {item.image_url && <img src={item.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                                <div>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name_roman}</h3>
                                    {item.takhallus && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.takhallus}</p>}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    className={`btn btn-sm ${item.is_published ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => togglePublish('poets', item.id)}
                                >{item.is_published ? 'UNPUBLISH' : 'PUBLISH'}</button>
                                <button
                                    className="btn btn-sm"
                                    style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                                    onClick={() => deleteItem('poets', item.id)}
                                >DELETE</button>
                            </div>
                        </div>
                    ))}
                    {poets.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No poet profiles.</p>}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
