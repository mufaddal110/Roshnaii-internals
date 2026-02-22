import React from 'react';

const ActivityTimeline = ({ activities }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'poetry': return '📜';
            case 'login': return '🔐';
            default: return '📌';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000 / 60); // minutes
        
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    return (
        <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
            <h3 className="text-lg font-bold text-[#050505] mb-4">RECENT ACTIVITY</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#f4ecd8] rounded-lg">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1">
                            <p className="text-sm text-[#050505]">
                                <span className="font-semibold">{activity.user}</span>
                                {' '}{activity.action}
                                {activity.title && <span className="font-semibold"> "{activity.title}"</span>}
                            </p>
                            {activity.poet && (
                                <p className="text-xs text-[#666666]">by {activity.poet}</p>
                            )}
                            <p className="text-xs text-[#666666] mt-1">{formatTime(activity.timestamp)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityTimeline;
