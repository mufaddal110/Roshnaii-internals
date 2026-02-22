import React from 'react';

const StatsCard = ({ title, value, icon, color = 'default' }) => {
    const colors = {
        default: 'bg-[#e8dfc8]',
        orange: 'bg-orange-100 border-orange-300'
    };

    return (
        <div className={`${colors[color]} rounded-xl p-6 border border-black/10 hover:shadow-lg transition`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{icon}</span>
                <span className="text-4xl font-black text-[#050505]">{value}</span>
            </div>
            <h3 className="text-sm font-bold text-[#4a4a4a] uppercase tracking-wide">{title}</h3>
        </div>
    );
};

export default StatsCard;
