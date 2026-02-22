import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    FileText, 
    MessageSquare, 
    Settings, 
    LogOut,
    Menu,
    X
} from 'lucide-react';
import api from '../api';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/poetry', icon: FileText, label: 'Poetry' },
        { path: '/admin/feedback', icon: MessageSquare, label: 'Feedback' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLogout = async () => {
        await api.auth.logout();
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-[#f4ecd8] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside 
                className={`${
                    sidebarOpen ? 'w-64' : 'w-20'
                } bg-[#050505] text-[#f4ecd8] transition-all duration-300 flex-col hidden lg:flex`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-[#c5a028]/20">
                    <div className="flex items-center justify-between">
                        {sidebarOpen && (
                            <div>
                                <h1 className="text-xl font-black tracking-wider text-[#c5a028]">ROSHNAII</h1>
                                <p className="text-xs text-[#999] mt-1">Admin Panel</p>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                                    isActive
                                        ? 'bg-[#c5a028] text-[#050505] font-bold'
                                        : 'text-[#999] hover:bg-[#1a1a1a] hover:text-[#f4ecd8]'
                                }`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span className="text-sm">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[#c5a028]/20">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-[#999] hover:bg-[#1a1a1a] hover:text-red-400 transition"
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span className="text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#050505] border-b border-[#c5a028]/20">
                <div className="flex items-center justify-between p-4">
                    <div>
                        <h1 className="text-lg font-black tracking-wider text-[#c5a028]">ROSHNAII</h1>
                        <p className="text-xs text-[#999]">Admin Panel</p>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-[#f4ecd8] hover:bg-[#1a1a1a] rounded-lg transition"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="bg-[#050505] border-t border-[#c5a028]/20">
                        <nav className="p-4 space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                                            isActive
                                                ? 'bg-[#c5a028] text-[#050505] font-bold'
                                                : 'text-[#999] hover:bg-[#1a1a1a] hover:text-[#f4ecd8]'
                                        }`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-[#999] hover:bg-[#1a1a1a] hover:text-red-400 transition"
                            >
                                <LogOut size={20} />
                                <span className="text-sm">Logout</span>
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto lg:mt-0 mt-20">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
