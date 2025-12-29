import React, { useState, useEffect, useMemo } from 'react';
import { client } from "../DataHook/AmplifyClient" ;
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


const KPI_CARD = ({ title, value, subtext, color = "text-white" }) => (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm hover:border-slate-600 transition-all">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {subtext && <p className="text-slate-500 text-xs mt-2">{subtext}</p>}
    </div>
);

export default function DashboardView() {
    const [stats, setStats] = useState({ policies: [], claims: [], loading: true });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Get all Policies using the 'policyList' index
                // This corresponds to: index('type').sortKeys(['sk']).name('policy').queryField("policyList")
                const { data: policies } = await client.models.InsuranceData.policyList({
                    type: 'POLICY'
                });

                // 2. Get all Claims using the 'ativePolicy' index logic (filtered manually or via similar query)
                // Since we don't have a 'claimList' queryField explicitly, we can reuse policyList if type is indexed, 
                // OR query 'ativePolicy' if we want status filtering. 
                // Let's assume we query by type='CLAIM' if the index allows, or filter client side.
                // Based on your schema: index('type').sortKeys(['sk']).name('policy')
                const { data: claims } = await client.models.InsuranceData.policyList({
                    type: 'CLAIM'
                });

                setStats({ policies, claims, loading: false });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setStats(s => ({ ...s, loading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    const kpis = useMemo(() => {
        if (stats.loading) return null;
        
        const totalPremium = stats.policies.reduce((acc, p) => acc + (p.premiumAmount || 0), 0);
        const activeClaims = stats.claims.filter(c => c.status !== 'CLOSED' && c.status !== 'REJECTED').length;
        
        return {
            totalPolicies: stats.policies.length,
            totalPremium,
            activeClaims,
            avgPremium: stats.policies.length ? (totalPremium / stats.policies.length) : 0
        };
    }, [stats]);

    const chartData = useMemo(() => {
        if (!stats.policies.length) return [];
        const statusCounts = stats.policies.reduce((acc, curr) => {
            const s = curr.status || 'UNKNOWN';
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));
    }, [stats.policies]);

    const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#64748b'];

    if (stats.loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading Intelligence...</div>;

    return (
        <div className="p-4 space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">AssurEnligne</h1>
                    <p className="text-slate-400 text-sm">Welcome back, Admin</p>
                </div>
                <span className="text-xs bg-sky-900/50 text-sky-400 px-3 py-1 rounded-full border border-sky-800">
                    Live Data
                </span>
            </header>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI_CARD title="Total Policies" value={kpis.totalPolicies} subtext="+12% from last month" />
                <KPI_CARD title="Annual Premium" value={`$${kpis.totalPremium.toLocaleString()}`} color="text-emerald-400" />
                <KPI_CARD title="Active Claims" value={kpis.activeClaims} color="text-amber-400" subtext="Requires attention" />
                <KPI_CARD title="Avg. Premium" value={`$${kpis.avgPremium.toFixed(0)}`} subtext="Per policy" />
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h3 className="text-white font-semibold mb-4 text-sm">Policy Status Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={chartData} 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h3 className="text-white font-semibold mb-4 text-sm">Recent Claims</h3>
                    <div className="space-y-3 overflow-y-auto max-h-64 pr-2">
                        {stats.claims.slice(0, 5).map(claim => (
                            <div key={claim.sk} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{claim.claimDescription || 'No Description'}</p>
                                    <p className="text-xs text-slate-500">{claim.incidentDate || 'N/A'}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                    claim.status === 'APPROVED' ? 'bg-green-900/30 text-green-400 border-green-800' :
                                    claim.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400 border-amber-800' :
                                    'bg-slate-800 text-slate-400 border-slate-600'
                                }`}>
                                    {claim.status}
                                </span>
                            </div>
                        ))}
                        {stats.claims.length === 0 && <p className="text-center text-slate-600 text-sm py-4">No active claims found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}