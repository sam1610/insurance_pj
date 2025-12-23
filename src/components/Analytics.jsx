import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const client = generateClient();

export default function Analytics() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            // Aggregate policies to show starts per month
            const { data: policies } = await client.models.InsuranceData.policyList({ type: 'POLICY' });
            
            // Simple transformation: Count policies by Start Month
            const timeline = {};
            policies.forEach(p => {
                if(!p.startDate) return;
                const month = p.startDate.slice(0, 7); // YYYY-MM
                if(!timeline[month]) timeline[month] = { month, policies: 0, premiums: 0 };
                timeline[month].policies += 1;
                timeline[month].premiums += (p.premiumAmount || 0);
            });

            // Convert to array and sort
            const chartData = Object.values(timeline).sort((a,b) => a.month.localeCompare(b.month));
            setData(chartData);
        };
        loadData();
    }, []);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-indigo-400">Business Intelligence</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Revenue Trend */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-white font-semibold mb-4">Premium Revenue Trend</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickFormatter={v => v.split('-')[1]} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                <Line type="monotone" dataKey="premiums" stroke="#818cf8" strokeWidth={3} dot={{r: 4, fill:'#818cf8'}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Policy Volume */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                    <h3 className="text-white font-semibold mb-4">New Policies per Month</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickFormatter={v => v.split('-')[1]} />
                                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                                <Tooltip cursor={{fill: '#334155', opacity: 0.2}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                <Bar dataKey="policies" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}