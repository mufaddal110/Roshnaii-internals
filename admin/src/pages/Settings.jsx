import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import api from '../api';

const Settings = () => {
    const [settings, setSettings] = useState({
        loginSessionTimeout: 7,
        poetRegistrationEnabled: true,
        maintenanceMode: false,
        featuredPoetryLimit: 10,
        autoApprovePoetry: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/settings');
            if (response.settings) {
                setSettings(response.settings);
            }
        } catch (err) {
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/settings', settings);
            toast.success('Settings saved successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
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
            <header className="bg-[#e8dfc8] border-b border-black/10 sticky top-0 z-40">
                <div className="px-8 py-6">
                    <h1 className="text-3xl font-black text-[#050505] tracking-wider">SETTINGS</h1>
                    <p className="text-sm text-[#666] mt-1">Configure platform settings</p>
                </div>
            </header>

            <div className="p-8 max-w-4xl">
                <div className="space-y-6">
                    {/* Authentication Settings */}
                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h2 className="text-xl font-black text-[#050505] mb-4">AUTHENTICATION</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#666] uppercase mb-2">
                                    Login Session Timeout (Days)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    value={settings.loginSessionTimeout}
                                    onChange={(e) => handleChange('loginSessionTimeout', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-[#f4ecd8] border border-black/10 rounded-lg text-[#050505] focus:outline-none focus:border-[#c5a028]"
                                />
                                <p className="text-xs text-[#666] mt-2">
                                    How long users stay logged in before requiring re-authentication
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Registration Settings */}
                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h2 className="text-xl font-black text-[#050505] mb-4">REGISTRATION</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#f4ecd8] rounded-lg">
                                <div>
                                    <p className="font-bold text-[#050505]">Enable Poet Registration</p>
                                    <p className="text-sm text-[#666] mt-1">
                                        Allow new users to register as poets
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.poetRegistrationEnabled}
                                        onChange={(e) => handleChange('poetRegistrationEnabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-[#999] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#c5a028]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Content Settings */}
                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h2 className="text-xl font-black text-[#050505] mb-4">CONTENT MANAGEMENT</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#666] uppercase mb-2">
                                    Featured Poetry Limit
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={settings.featuredPoetryLimit}
                                    onChange={(e) => handleChange('featuredPoetryLimit', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 bg-[#f4ecd8] border border-black/10 rounded-lg text-[#050505] focus:outline-none focus:border-[#c5a028]"
                                />
                                <p className="text-xs text-[#666] mt-2">
                                    Maximum number of poems to display in featured section
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-[#f4ecd8] rounded-lg">
                                <div>
                                    <p className="font-bold text-[#050505]">Auto-Approve Poetry</p>
                                    <p className="text-sm text-[#666] mt-1">
                                        Automatically publish poetry without manual review
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.autoApprovePoetry}
                                        onChange={(e) => handleChange('autoApprovePoetry', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-[#999] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#c5a028]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* System Settings */}
                    <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
                        <h2 className="text-xl font-black text-[#050505] mb-4">SYSTEM</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#f4ecd8] rounded-lg">
                                <div>
                                    <p className="font-bold text-[#050505]">Maintenance Mode</p>
                                    <p className="text-sm text-[#666] mt-1">
                                        Temporarily disable public access to the platform
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-[#999] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-6 py-4 bg-[#050505] text-[#f4ecd8] rounded-lg font-bold hover:bg-[#1a1a1a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw size={20} className="animate-spin" />
                                    SAVING...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    SAVE SETTINGS
                                </>
                            )}
                        </button>
                        <button
                            onClick={fetchSettings}
                            className="px-6 py-4 bg-[#f4ecd8] text-[#050505] border border-black/10 rounded-lg font-bold hover:bg-[#e8dfc8] transition flex items-center gap-2"
                        >
                            <RefreshCw size={20} />
                            RESET
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
