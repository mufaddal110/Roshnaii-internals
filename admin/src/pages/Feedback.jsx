import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import api from '../api';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, [filter]);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?rating=${filter}` : '';
            const response = await api.get(`/feedback${params}`);
            setFeedbacks(response.feedbacks || response);
        } catch (err) {
            toast.error('Failed to fetch feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (feedbackId) => {
        try {
            await api.patch(`/feedback/${feedbackId}/resolve`);
            toast.success('Feedback marked as resolved');
            fetchFeedbacks();
        } catch (err) {
            toast.error(err.message || 'Failed to resolve feedback');
        }
    };

    const handleReply = async (feedbackId) => {
        if (!replyText.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        try {
            await api.post(`/feedback/${feedbackId}/reply`, { reply: replyText });
            toast.success('Reply sent successfully');
            setReplyText('');
            setShowModal(false);
            fetchFeedbacks();
        } catch (err) {
            toast.error(err.message || 'Failed to send reply');
        }
    };

    const handleDelete = async (feedbackId) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) {
            return;
        }

        try {
            await api.delete(`/feedback/${feedbackId}`);
            toast.success('Feedback deleted');
            fetchFeedbacks();
        } catch (err) {
            toast.error(err.message || 'Failed to delete feedback');
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={i < rating ? 'fill-[#c5a028] text-[#c5a028]' : 'text-[#999]'}
            />
        ));
    };

    return (
        <AdminLayout>
            <header className="bg-[#e8dfc8] border-b border-black/10 sticky top-0 z-40">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-black text-[#050505] tracking-wider">FEEDBACK</h1>
                    <p className="text-sm text-[#666] mt-1">View and manage user feedback</p>
                </div>
            </header>

            <div className="p-8">
                {/* Filter Tabs */}
                <div className="bg-[#e8dfc8] rounded-xl p-2 border border-black/10 mb-6 flex gap-2">
                    {['all', '5', '4', '3', '2', '1'].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => setFilter(rating)}
                            className={`flex-1 px-4 py-3 rounded-lg text-sm font-bold transition ${
                                filter === rating
                                    ? 'bg-[#050505] text-[#f4ecd8]'
                                    : 'text-[#666] hover:bg-[#f4ecd8]'
                            }`}
                        >
                            {rating === 'all' ? 'ALL' : `${rating} STARS`}
                        </button>
                    ))}
                </div>

                {/* Feedback List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-[#e8dfc8] rounded-xl p-12 border border-black/10 text-center text-[#666]">
                            Loading feedback...
                        </div>
                    ) : feedbacks.length === 0 ? (
                        <div className="bg-[#e8dfc8] rounded-xl p-12 border border-black/10 text-center text-[#666]">
                            No feedback found
                        </div>
                    ) : (
                        feedbacks.map((feedback) => (
                            <div
                                key={feedback._id}
                                className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10 hover:shadow-lg transition"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-[#c5a028] flex items-center justify-center text-[#050505] font-bold">
                                                {feedback.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#050505]">
                                                    {feedback.user?.fullName || 'Anonymous'}
                                                </p>
                                                <p className="text-xs text-[#666]">
                                                    {new Date(feedback.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(feedback.rating)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {feedback.resolved ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1">
                                                <CheckCircle size={14} /> RESOLVED
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                                PENDING
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-[#050505] mb-4 leading-relaxed">{feedback.message}</p>

                                {feedback.reply && (
                                    <div className="bg-[#f4ecd8] rounded-lg p-4 mb-4 border-l-4 border-[#c5a028]">
                                        <p className="text-xs text-[#666] uppercase font-bold mb-2">Admin Reply:</p>
                                        <p className="text-[#050505]">{feedback.reply}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-4 border-t border-black/10">
                                    {!feedback.resolved && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setSelectedFeedback(feedback);
                                                    setShowModal(true);
                                                }}
                                                className="px-4 py-2 bg-[#050505] text-[#f4ecd8] rounded-lg text-sm font-bold hover:bg-[#1a1a1a] transition flex items-center gap-2"
                                            >
                                                <MessageSquare size={16} /> Reply
                                            </button>
                                            <button
                                                onClick={() => handleResolve(feedback._id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition flex items-center gap-2"
                                            >
                                                <CheckCircle size={16} /> Mark Resolved
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDelete(feedback._id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition flex items-center gap-2 ml-auto"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {showModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#e8dfc8] rounded-xl max-w-2xl w-full">
                        <div className="p-6 border-b border-black/10 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-[#050505]">REPLY TO FEEDBACK</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setReplyText('');
                                }}
                                className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-[#f4ecd8] rounded-lg p-4">
                                <p className="text-xs text-[#666] uppercase font-bold mb-2">Original Feedback:</p>
                                <p className="text-[#050505]">{selectedFeedback.message}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-[#666] uppercase font-bold mb-2">
                                    Your Reply:
                                </label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-[#f4ecd8] border border-black/10 rounded-lg text-[#050505] placeholder-[#999] focus:outline-none focus:border-[#c5a028] resize-none"
                                    placeholder="Type your reply here..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleReply(selectedFeedback._id)}
                                    className="flex-1 px-6 py-3 bg-[#050505] text-[#f4ecd8] rounded-lg font-bold hover:bg-[#1a1a1a] transition"
                                >
                                    Send Reply
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setReplyText('');
                                    }}
                                    className="px-6 py-3 bg-[#f4ecd8] text-[#050505] border border-black/10 rounded-lg font-bold hover:bg-[#e8dfc8] transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Feedback;
