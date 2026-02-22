import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, title }) => {
    return (
        <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
            <h3 className="text-lg font-bold text-[#050505] mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                    <XAxis dataKey="date" stroke="#4a4a4a" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#4a4a4a" style={{ fontSize: '12px' }} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#f4ecd8', 
                            border: '1px solid #050505',
                            borderRadius: '8px'
                        }} 
                    />
                    <Bar dataKey="poems" fill="#050505" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChart;
