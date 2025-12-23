import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

export default function PoliciesView() {
    const [policies, setPolicies] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicies = async () => {
            setLoading(true);
            try {
                let result;
                if (filter === 'ALL') {
                     // Use 'policyList' index: index('type').sortKeys(['sk'])
                    result = await client.models.InsuranceData.policyList({
                        type: 'POLICY'
                    });
                } else {
                    // Use 'ativePolicy' index: index('type').sortKeys(['status'])
                    // Note: Your schema defined queryField as "ativePolicy" (typo preserved)
                    result = await client.models.InsuranceData.ativePolicy({
                        type: 'POLICY',
                        status: { eq: filter }
                    });
                }
                setPolicies(result.data);
            } catch (err) {
                console.error("Error fetching policies:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, [filter]);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-emerald-500">Policies</h1>
                <div className="flex gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
                    {['ALL', 'ACTIVE', 'EXPIRED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                filter === f 
                                ? 'bg-emerald-600 text-white shadow-lg' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-32 bg-slate-800 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {policies.map(policy => (
                        <div key={policy.sk} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-emerald-500/50 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                            </div>

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <p className="text-slate-400 text-xs font-mono">#{policy.policyNumber}</p>
                                    <h3 className="text-white font-bold text-lg mt-1">General Coverage</h3>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${
                                    policy.status === 'ACTIVE' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-red-900/40 text-red-400 border border-red-800'
                                }`}>
                                    {policy.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase">Premium</p>
                                    <p className="text-emerald-400 font-bold text-lg">${policy.premiumAmount}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-[10px] uppercase">Coverage</p>
                                    <p className="text-white font-bold text-lg">${(policy.coverageAmount/1000).toFixed(0)}k</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between text-xs text-slate-400 relative z-10">
                                <span>Starts: {policy.startDate}</span>
                                <span>Ends: {policy.endDate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}