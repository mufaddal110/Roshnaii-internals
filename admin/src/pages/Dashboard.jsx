import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import ActivityTimeline from '../components/ActivityTimeline';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [userGrowth, setUserGrowth] = useState([]);
    const [poemsPublished, setPoemsPublished] = useState([]);
    const [userPoetRatio, setUserPoetRatio] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [topLovedPoems, setTopLovedPoems] = useState([]);
    const [topFavoritedPoems, setTopFavoritedPoems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
        fetchDashboardData();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await api.auth.getUser();
            if (!user || !user.isAdmin) {
                navigate('/admin/login');
            }
        } catch (err) {
            navigate('/admin/login');
        }
    };

    const fetchDashboardData = async () => {
        try {
            const [
                statsRes,
                userGrowthRes,
                poemsRes,
                ratioRes,
                activityRes,
                lovedRes,
                favoritedRes
            ] = await Promise.all([
                api.get('/analytics/dashboard'),
                api.get('/analytics/user-growth?days=30'),
                api.get('/analytics/poems-published?days=30'),
                api.get('/analytics/user-poet-ratio'),
                api.get('/analytics/recent-activity?limit=10'),
                api.get('/analytics/top-poems?type=loved&limit=10'),
                api.get('/analytics/top-poems?type=favorited&limit=10')
            ]);

            setStats(statsRes);
            setUserGrowth(userGrowthRes);
            setPoemsPublished(poemsRes);
            setUserPoetRatio(ratioRes);
            setRecentActivity(activityRes);
            setTopLovedPoems(lovedRes);
            setTopFavoritedPoems(favoritedRes);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-2xl font-bold text-[#050505]">LOADING...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            {/* Header */}
            <header className="bg-[#e8dfc8] border-b border-black/10 sticky top-0 z-40">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-black text-[#050505] tracking-wider">DASHBOARD</h1>
                    <p className="text-sm text-[#666] mt-1">Overview of your poetry platform</p>
                </div>
            </header>

            <div className="p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" />
                    <StatsCard title="Total Poets" value={stats?.totalPoets || 0} icon="✍️" />
                    <StatsCard title="Published Poems" value={stats?.totalPublishedPoems || 0} icon="📜" />
                    <StatsCard title="Pending Reviews" value={stats?.totalPendingPoems || 0} icon="⏳" color="orange" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <StatsCard title="Logged In Today (Users)" value={stats?.loggedInUsersToday || 0} icon="🟢" />
                    <StatsCard title="Logged In Today (Poets)" value={stats?.loggedInPoetsToday || 0} icon="🟢" />
                </div>

                {/* Most Loved & Favorited */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h3 className="text-lg font-bold text-[#050505] mb-2">❤️ MOST LOVED KALAM</h3>
                        {stats?.mostLovedPoem ? (
                            <div>
                                <p className="text-[#4a4a4a] text-sm mb-1">{stats.mostLovedPoem.title}</p>
                                <p className="text-xs text-[#666666]">by {stats.mostLovedPoem.poet}</p>
                                <p className="text-2xl font-bold text-[#050505] mt-2">{stats.mostLovedPoem.likes} likes</p>
                            </div>
                        ) : (
                            <p className="text-[#666666]">No data</p>
                        )}
                    </div>

                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h3 className="text-lg font-bold text-[#050505] mb-2">⭐ MOST FAVORITED KALAM</h3>
                        {stats?.mostFavoritedPoem ? (
                            <div>
                                <p className="text-[#4a4a4a] text-sm mb-1">{stats.mostFavoritedPoem.title}</p>
                                <p className="text-xs text-[#666666]">by {stats.mostFavoritedPoem.poet}</p>
                                <p className="text-2xl font-bold text-[#050505] mt-2">{stats.mostFavoritedPoem.favorites} favorites</p>
                            </div>
                        ) : (
                            <p className="text-[#666666]">No data</p>
                        )}
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <LineChart data={userGrowth} title="User Growth (Last 30 Days)" />
                    <BarChart data={poemsPublished} title="Poems Published (Last 30 Days)" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1">
                        <PieChart data={userPoetRatio} title="User vs Poet Ratio" />
                    </div>
                    <div className="lg:col-span-2">
                        <ActivityTimeline activities={recentActivity} />
                    </div>
                </div>

                {/* Top Poems */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h3 className="text-lg font-bold text-[#050505] mb-4">TOP 10 MOST LOVED POEMS</h3>
                        <div className="space-y-3">
                            {topLovedPoems.map((poem, idx) => (
                                <div key={poem.id} className="flex justify-between items-center p-3 bg-[#f4ecd8] rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-semibold text-[#050505] text-sm">{idx + 1}. {poem.title}</p>
                                        <p className="text-xs text-[#666666]">by {poem.poet}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#050505]">{poem.likes}</p>
                                        <p className="text-xs text-[#666666]">likes</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h3 className="text-lg font-bold text-[#050505] mb-4">TOP 10 MOST FAVORITED POEMS</h3>
                        <div className="space-y-3">
                            {topFavoritedPoems.map((poem, idx) => (
                                <div key={poem.id} className="flex justify-between items-center p-3 bg-[#f4ecd8] rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-semibold text-[#050505] text-sm">{idx + 1}. {poem.title}</p>
                                        <p className="text-xs text-[#666666]">by {poem.poet}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#050505]">{poem.favorites}</p>
                                        <p className="text-xs text-[#666666]">favorites</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
