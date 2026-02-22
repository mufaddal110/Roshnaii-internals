import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import api from '../api';

const Poetry = () => {
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedPoem, setSelectedPoem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPoems();
    }, [page, statusFilter, searchTerm]);

    const fetchPoems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 20,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            });
            
            const response = await api.get(`/poetry?${params}`);
            setPoems(response.poems || response);
            setTotalPages(response.totalPages || 1);
        } catch (err) {
            toast.error('Failed to fetch poetry');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (poemId) => {
        try {
            await api.patch(`/admin/poetry/${poemId}/approve`);
            toast.success('Poetry approved');
            fetchPoems();
        } catch (err) {
            toast.error(err.message || 'Failed to approve poetry');
        }
    };

    const handleReject = async (poemId) => {
        if (!window.confirm('Are you sure you want to reject this poetry?')) {
            return;
        }
        
        try {
            await api.patch(`/admin/poetry/${poemId}/reject`);
            toast.success('Poetry rejected');
            fetchPoems();
        } catch (err) {
            toast.error(err.message || 'Failed to reject poetry');
        }
    };

    const handleDelete = async (poemId) => {
        if (!window.confirm('Are you sure you want to delete this poetry? This action cannot be undone.')) {
            return;
        }
        
        try {
            await api.delete(`/admin/poetry/${poemId}`);
            toast.success('Poetry deleted');
            fetchPoems();
        } catch (err) {
            toast.error(err.message || 'Failed to delete poetry');
        }
    };

    const handleViewDetails = async (poemId) => {
        try {
            const poem = await api.get(`/poetry/${poemId}`);
            setSelectedPoem(poem);
            setShowModal(true);
        } catch (err) {
            toast.error('Failed to fetch poetry details');
        }
    };

    return (
        <AdminLayout>
            <header className="bg-[#e8dfc8] border-b border-black/10 sticky top-0 z-40">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-black text-[#050505] tracking-wider">POETRY</h1>
                    <p className="text-sm text-[#666] mt-1">Manage poetry submissions and moderation</p>
                </div>
            </header>

            <div className="p-8">
                {/* Filters */}
                <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666]" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title or poet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#f4ecd8] border border-black/10 rounded-lg text-[#050505] placeholder-[#999] focus:outline-none focus:border-[#c5a028]"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-[#666]" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-[#f4ecd8] border border-black/10 rounded-lg text-[#050505] focus:outline-none focus:border-[#c5a028]"
                            >
                                <option value="all">All Poetry</option>
                                <option value="pending">Pending</option>
                                <option value="published">Published</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Poetry Table */}
                <div className="bg-[#e8dfc8] rounded-xl border border-black/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-[#666]">Loading poetry...</div>
                    ) : poems.length === 0 ? (
                        <div className="p-12 text-center text-[#666]">No poetry found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#050505] text-[#f4ecd8]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Poet</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Genre</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Engagement</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/10">
                                        {poems.map((poem) => (
                                            <tr key={poem._id} className="hover:bg-[#f4ecd8] transition">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-[#050505]">{poem.title}</p>
                                                    <p className="text-xs text-[#666] mt-1">{poem.titleRoman}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#666]">
                                                    {poem.poet?.name || poem.poetName || 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-[#c5a028]/20 text-[#050505] rounded-full text-xs font-bold">
                                                        {poem.sinf || poem.genre || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        poem.status === 'published' ? 'bg-green-100 text-green-800' :
                                                        poem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {poem.status?.toUpperCase() || 'PUBLISHED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#666]">
                                                    <div className="flex gap-3">
                                                        <span>❤️ {poem.likesCount || 0}</span>
                                                        <span>⭐ {poem.ratingsCount || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#666]">
                                                    {new Date(poem.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(poem._id)}
                                                            className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} className="text-[#666]" />
                                                        </button>
                                                        {poem.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(poem._id)}
                                                                    className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle size={18} className="text-green-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(poem._id)}
                                                                    className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle size={18} className="text-orange-600" />
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(poem._id)}
                                                            className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} className="text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 bg-[#f4ecd8] border-t border-black/10 flex items-center justify-between">
                                <p className="text-sm text-[#666]">
                                    Page {page} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 bg-[#050505] text-[#f4ecd8] rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 bg-[#050505] text-[#f4ecd8] rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a1a1a] transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Poetry Details Modal */}
            {showModal && selectedPoem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#e8dfc8] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-black/10 flex justify-between items-center sticky top-0 bg-[#e8dfc8]">
                            <h2 className="text-2xl font-black text-[#050505]">POETRY DETAILS</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-2">Title (Urdu)</p>
                                <p className="text-2xl text-[#050505] font-bold">{selectedPoem.title}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-2">Title (Roman)</p>
                                <p className="text-xl text-[#050505]">{selectedPoem.titleRoman}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-2">Content</p>
                                <div className="p-6 bg-[#f4ecd8] rounded-lg">
                                    <p className="text-lg text-[#050505] whitespace-pre-wrap leading-relaxed">
                                        {selectedPoem.content}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-[#666] uppercase font-bold mb-1">Poet</p>
                                    <p className="text-[#050505]">{selectedPoem.poet?.name || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#666] uppercase font-bold mb-1">Genre</p>
                                    <p className="text-[#050505]">{selectedPoem.sinf || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#666] uppercase font-bold mb-1">Likes</p>
                                    <p className="text-[#050505]">{selectedPoem.likesCount || 0}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-[#666] uppercase font-bold mb-1">Rating</p>
                                    <p className="text-[#050505]">{selectedPoem.averageRating?.toFixed(1) || 'N/A'} ⭐</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Poetry;
