import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChart = ({ data, title }) => {
    return (
        <div className="bg-[#e8dfc8] rounded-xl p-6 border border-black/10">
            <h3 className="text-lg font-bold text-[#050505] mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={data}>
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
                    <Line type="monotone" dataKey="users" stroke="#050505" strokeWidth={2} dot={{ fill: '#050505' }} />
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart;
