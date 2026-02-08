// PoliciesView.jsx
import React, { useState, useEffect } from 'react';
import { client } from "../DataHook/AmplifyClient";
import CreatePolicyModal from './CreatePolicyModal';

export default function PoliciesView({ username, userId }) {
    const [policies, setPolicies] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPolicies = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            // Fetch policies owned by this user
            const { data } = await client.models.InsuranceData.userList({
                type: 'POLICY',
                pk: { eq: `USER#${userId}` }
            });
            
            let filtered = data;
            if (filter !== 'ALL') filtered = data.filter(p => p.status === filter);
            setPolicies(filtered);
        } catch (err) {
            console.error("Error fetching policies:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, [filter, userId]);

    const handleCreatePolicy = async (formData) => {
        setIsSubmitting(true);
        try {
            // Native ID generation
            const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
                ? crypto.randomUUID().split('-')[0].toUpperCase()
                : Math.random().toString(36).substring(2, 9).toUpperCase();

            await client.models.InsuranceData.create({
                pk: `USER#${userId}`,
                sk: `POL#${uniqueId}`,
                type: 'POLICY',
                policyNumber: `AUTO-${Date.now().toString().slice(-6)}`,
                premiumAmount: parseFloat(formData.premiumAmount),
                startDate: formData.startDate,
                endDate: formData.endDate,
                carManifYear: parseInt(formData.carManifYear),
                carAge: parseInt(formData.carAge),
                status: 'PENDING',
                createdAt: new Date().toISOString()
            });

            setIsModalOpen(false);
            fetchPolicies();
        } catch (err) {
            console.error("Error creating policy:", err);
            alert("Failed to submit policy.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // ... (Keep your existing Return JSX: Header, Filter Buttons, List Grid, Modal) ...
    // ... (The return logic you posted was correct, just ensure it uses these updated handlers) ...
    return (
        <div className="p-4 max-w-7xl mx-auto">
             {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-indigo-400">My Vehicles</h1>
                    <p className="text-slate-400 mt-1">Manage your auto insurance policies</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                        {['ALL', 'ACTIVE', 'PENDING'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                                    filter === f 
                                    ? 'bg-indigo-600 text-white shadow-lg' 
                                    : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-900/20 transition-all"
                    >
                        Insure Vehicle
                    </button>
                </div>
            </div>

            {/* List View */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-800 rounded-xl animate-pulse"></div>)}
                </div>
            ) : policies.length === 0 ? (
                 <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <p className="text-slate-400 mb-2">No active policies found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map(policy => (
                        <div key={policy.sk} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500/50 transition-all group relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                                        policy.status === 'ACTIVE' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 
                                        policy.status === 'PENDING' ? 'bg-amber-900/40 text-amber-400 border border-amber-800' :
                                        'bg-slate-700 text-slate-400'
                                    }`}>
                                        {policy.status}
                                    </span>
                                    <p className="text-slate-500 text-xs font-mono">#{policy.policyNumber}</p>
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1">{policy.carManifYear} Model</h3>
                                <p className="text-slate-400 text-xs mb-6">Vehicle Age: {policy.carAge} years</p>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Expires</p>
                                        <p className="text-white font-bold text-sm">{policy.endDate || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Premium</p>
                                        <p className="text-indigo-400 font-bold text-lg">${(policy.premiumAmount || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CreatePolicyModal 
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreatePolicy}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}