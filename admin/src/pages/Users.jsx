import React, { useState, useEffect } from 'react';
import { Search, Filter, Ban, Trash2, Eye, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import api from '../api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, roleFilter, searchTerm]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 20,
                ...(searchTerm && { search: searchTerm }),
                ...(roleFilter !== 'all' && { role: roleFilter })
            });
            
            const response = await api.get(`/users?${params}`);
            setUsers(response.users);
            setTotalPages(response.totalPages);
        } catch (err) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleBlockUser = async (userId, isBlocked) => {
        try {
            await api.patch(`/users/${userId}/block`, { block: !isBlocked });
            toast.success(isBlocked ? 'User unblocked' : 'User blocked');
            fetchUsers();
        } catch (err) {
            toast.error(err.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (err) {
            toast.error(err.message || 'Failed to delete user');
        }
    };

    const handleViewDetails = async (userId) => {
        try {
            const user = await api.get(`/users/${userId}`);
            setSelectedUser(user);
            setShowModal(true);
        } catch (err) {
            toast.error('Failed to fetch user details');
        }
    };

    return (
        <AdminLayout>
            <header className="bg-[#e8dfc8] border-b border-black/10 sticky top-0 z-40">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-black text-[#050505] tracking-wider">USERS</h1>
                    <p className="text-sm text-[#666] mt-1">Manage users and poets</p>
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
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#f4ecd8] border border-black/10 rounded-lg text-[#050505] placeholder-[#999] focus:outline-none focus:border-[#c5a028]"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-[#666]" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-4 py-3 bg-[#f4ecd8] border border-black/10 rounded-lg text-[#050505] focus:outline-none focus:border-[#c5a028]"
                            >
                                <option value="all">All Users</option>
                                <option value="user">Users Only</option>
                                <option value="poet">Poets Only</option>
                                <option value="admin">Admins Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-[#e8dfc8] rounded-xl border border-black/10 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-[#666]">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center text-[#666]">No users found</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#050505] text-[#f4ecd8]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/10">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-[#f4ecd8] transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#c5a028] flex items-center justify-center text-[#050505] font-bold">
                                                            {user.fullName?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-[#050505]">{user.fullName}</p>
                                                            <p className="text-xs text-[#666]">@{user.username || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#666]">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        user.isAdmin ? 'bg-red-100 text-red-800' :
                                                        user.isPoet ? 'bg-[#c5a028] text-[#050505]' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {user.isAdmin ? 'ADMIN' : user.isPoet ? 'POET' : 'USER'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.isBlocked ? (
                                                        <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                                                            <UserX size={16} /> Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                                                            <UserCheck size={16} /> Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#666]">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(user._id)}
                                                            className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} className="text-[#666]" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleBlockUser(user._id, user.isBlocked)}
                                                            className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                                                            title={user.isBlocked ? 'Unblock' : 'Block'}
                                                            disabled={user.isAdmin}
                                                        >
                                                            <Ban size={18} className={user.isBlocked ? 'text-green-600' : 'text-orange-600'} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                                                            title="Delete User"
                                                            disabled={user.isAdmin}
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

            {/* User Details Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#e8dfc8] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-black/10 flex justify-between items-center sticky top-0 bg-[#e8dfc8]">
                            <h2 className="text-2xl font-black text-[#050505]">USER DETAILS</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-[#f4ecd8] rounded-lg transition"
                            >
                                <span className="text-2xl">&times;</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-1">Full Name</p>
                                <p className="text-lg text-[#050505]">{selectedUser.fullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-1">Email</p>
                                <p className="text-lg text-[#050505]">{selectedUser.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-1">Username</p>
                                <p className="text-lg text-[#050505]">@{selectedUser.username || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-1">Favorite Shair</p>
                                <p className="text-lg text-[#050505]">{selectedUser.favoriteShair || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[#666] uppercase font-bold mb-1">Login History</p>
                                {selectedUser.loginHistory && selectedUser.loginHistory.length > 0 ? (
                                    <div className="space-y-2 mt-2">
                                        {selectedUser.loginHistory.slice(0, 5).map((login, idx) => (
                                            <div key={idx} className="p-3 bg-[#f4ecd8] rounded-lg">
                                                <p className="text-sm text-[#050505]">
                                                    {new Date(login.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[#666]">No login history</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Users;
