import React, { useState, useEffect, useMemo } from 'react';
import { client } from "../DataHook/AmplifyClient";
import {
PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const KPICard = ({ title, value, subtext, color = "text-white", borderColor = "border-slate-700" }) => (
<div className={`bg-slate-800 p-5 rounded-xl border ${borderColor} shadow-lg hover:border-slate-500 transition-all duration-300`}>
<p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
<p className={`text-3xl font-black ${color}`}>{value}</p>
{subtext && <p className="text-slate-500 text-[10px] font-medium mt-2">{subtext}</p>}
</div>
);

export default function DashboardView() {
const [stats, setStats] = useState({
policies: [],
claims: [],
loading: true,
error: null
});

useEffect(() => {
const fetchDashboardData = async () => {
try {
// A. Fetch Policies
const { data: policies, errors: policyErrors } = await client.models.InsuranceData.policyList({
type: 'POLICY'
});

if (policyErrors) throw new Error("Failed to fetch policies");

// --- 🔍 DEBUG: LOG ALL POLICIES ---
console.log("🔥 DASHBOARD DEBUG - ALL FETCHED POLICIES:", policies);
console.log(`✅ Count: ${policies.length}`);
// ----------------------------------

// B. Fetch Claims
const { data: claims } = await client.models.InsuranceData.policyList({
type: 'CLAIM'
});

setStats({ policies, claims: claims || [], loading: false, error: null });
} catch (error) {
console.error("Dashboard Error:", error);
setStats(s => ({ ...s, loading: false, error: error.message }));
}
};

fetchDashboardData();
}, []);

const kpis = useMemo(() => {
if (stats.loading || !stats.policies.length) return null;
const totalPremium = stats.policies.reduce((acc, p) => acc + (p.premiumAmount || 0), 0);
const policyCount = stats.policies.length;
const avgPremium = policyCount ? totalPremium / policyCount : 0;

const statusCounts = stats.policies.reduce((acc, p) => {
acc[p.status] = (acc[p.status] || 0) + 1;
return acc;
}, {});
const topStatus = Object.keys(statusCounts).reduce((a, b) => statusCounts[a] > statusCounts[b] ? a : b, 'N/A');

return {
totalPolicies: policyCount,
totalPremium,
avgPremium,
topStatus
};
}, [stats]);

const statusChartData = useMemo(() => {
if (!stats.policies.length) return [];
const counts = stats.policies.reduce((acc, curr) => {
const s = curr.status || 'UNKNOWN';
acc[s] = (acc[s] || 0) + 1;
return acc;
}, {});

return Object.keys(counts).map(key => ({
name: key,
value: counts[key]
}));
}, [stats.policies]);

const STATUS_COLORS = {
'ACTIVE': '#22c55e',
'PENDING': '#eab308',
'CANCELLED': '#64748b',
'REJECTED': '#ef4444',
'APPROVED': '#3b82f6',
'EXPIRED': '#f97316'
};

if (stats.loading) return (
<div className="flex h-full items-center justify-center p-8">
<div className="text-slate-500 animate-pulse flex flex-col items-center gap-2">
<div className="w-8 h-8 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin"></div>
<span className="text-sm font-bold">Loading Intelligence...</span>
</div>
</div>
);

return (
<div className="p-6 space-y-6 bg-slate-900 min-h-screen text-slate-200">
<header className="flex justify-between items-end border-b border-slate-800 pb-4">
<div>
<h1 className="text-2xl font-black text-white tracking-tight">AssurEnligne</h1>
<p className="text-slate-400 text-sm font-medium">Underwriting Dashboard</p>
</div>
<div className="flex items-center gap-2">
<span className="relative flex h-3 w-3">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
<span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
</span>
<span className="text-xs font-bold text-emerald-400">Live Data</span>
</div>
</header>

{kpis && (
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
<KPICard title="Total Policies" value={kpis.totalPolicies} subtext="All time records" color="text-white" borderColor="border-indigo-500/30" />
<KPICard title="Total Premium" value={`$${kpis.totalPremium.toLocaleString()}`} subtext="Gross Written Premium" color="text-emerald-400" borderColor="border-emerald-500/30" />
<KPICard title="Avg. Premium" value={`$${kpis.avgPremium.toFixed(0)}`} subtext="Per policy average" color="text-sky-400" borderColor="border-sky-500/30" />
<KPICard title="Dominant Status" value={kpis.topStatus} subtext="Most frequent status" color="text-amber-400" borderColor="border-amber-500/30" />
</div>
)}

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
<h3 className="text-white font-bold mb-6 text-sm flex items-center gap-2">
<span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
Policy Status Distribution
</h3>
<div className="h-72 w-full">
<ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie
data={statusChartData}
cx="50%"
cy="50%"
innerRadius={80}
outerRadius={100}
paddingAngle={5}
dataKey="value"
stroke="none"
>
{statusChartData.map((entry, index) => (
<Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
))}
</Pie>
<Tooltip
contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
itemStyle={{ color: '#fff' }}
/>
<Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-slate-400 text-xs font-bold ml-1">{value}</span>} />
</PieChart>
</ResponsiveContainer>
</div>
</div>

<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl flex flex-col">
<h3 className="text-white font-bold mb-6 text-sm flex items-center gap-2">
<span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
Recent Policies
</h3>
<div className="flex-1 overflow-y-auto max-h-72 pr-2 space-y-3 custom-scrollbar">
{stats.policies.length === 0 ? (
<div className="text-center text-slate-500 py-10">No policies found</div>
) : (
stats.policies
.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
.slice(0, 10)
.map((policy) => (
<div key={policy.sk} className="group flex justify-between items-center p-3 bg-slate-900/50 hover:bg-slate-700/50 transition-colors rounded-lg border border-slate-700/50">
<div className="flex flex-col">
<span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
{policy.policyNumber || 'NO-NUMBER'}
</span>
<span className="text-[10px] text-slate-500 uppercase tracking-wider">
{policy.carManifYear} Model • {policy.pk ? policy.pk.split('#')[1] : 'N/A'}
</span>
</div>
<div className="text-right">
<span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
policy.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
policy.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
policy.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
'bg-slate-500/10 text-slate-400 border-slate-500/20'
}`}>
{policy.status}
</span>
<p className="text-xs font-bold text-slate-300 mt-1">
${policy.premiumAmount}
</p>
</div>
</div>
))
)}
</div>
</div>
</div>
</div>
);
}