import React, { useState, useEffect } from 'react';
import { client } from "../DataHook/AmplifyClient" ;
import { v4 as uuidv4 } from 'uuid'; 
import CreatePolicyModal from './CreatePolicyModal';


export default function PoliciesView({ username, isCustomerView = false, userId }) {
    const [policies, setPolicies] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Logic
    const fetchPolicies = async () => {
        setLoading(true);
        try {
            // Using the user-specific query pattern for security
            // pk: USER#<userId>, sk: beginsWith 'POL#'
            const { data } = await client.models.InsuranceData.list({
                pk: `USER#${userId}`,
                sk: { beginsWith: 'POL#' }
            });
            
            // Client-side filtering if needed based on status tab
            let filtered = data;
            if (filter !== 'ALL') {
                filtered = data.filter(p => p.status === filter);
            }
            
            setPolicies(filtered);
        } catch (err) {
            console.error("Error fetching policies:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchPolicies();
    }, [filter, userId]);

    // Handle Policy Creation
    const handleCreatePolicy = async (formData) => {
        setIsSubmitting(true);
        try {
            const newPolicyId = `POL#${uuidv4().split('-')[0].toUpperCase()}`; // e.g., POL#1A2B3C
            
            await client.models.InsuranceData.create({
                // 1. COMPOSITE KEY
                pk: `USER#${userId}`,
                sk: newPolicyId,
                
                // 2. DISCRIMINATOR
                type: 'POLICY',
                
                // 3. POLICY ATTRIBUTES
                policyNumber: `REQ-${Date.now().toString().slice(-6)}`, // Auto-gen request ID
                coverageAmount: parseFloat(formData.coverageAmount),
                premiumAmount: (parseFloat(formData.coverageAmount) * 0.005), // Simple logic
                startDate: formData.startDate,
                endDate: formData.endDate,
                
                // Storing Property Address in a spare attribute if specific field doesn't exist
                // Assuming 'claimDescription' or similar string field can hold extra info, 
                // or just rely on standard fields. Here we rely on standard fields.
                
                // 4. SHARED ATTRIBUTES
                status: 'PENDING', // Start as Pending review
                createdAt: new Date().toISOString()
            });

            // Close and Refresh
            setIsModalOpen(false);
            fetchPolicies(); // Refresh list to show new item

        } catch (err) {
            console.error("Error creating policy:", err);
            alert("Failed to submit policy request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Header with Create Button */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-500">My Policies</h1>
                    <p className="text-slate-400 mt-1">Manage your real-estate insurance portfolio</p>
                </div>
                
                <div className="flex gap-3">
                     {/* Filter Tabs */}
                    <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                        {['ALL', 'ACTIVE', 'PENDING'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                                    filter === f 
                                    ? 'bg-emerald-600 text-white shadow-lg' 
                                    : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* CREATE BUTTON */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Demand
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
                    <p className="text-slate-400 mb-2">No policies found.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-emerald-400 hover:underline text-sm">Create your first demand</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map(policy => (
                        <div key={policy.sk} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500/50 transition-all group relative overflow-hidden">
                            {/* Decorative Icon */}
                            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <svg className="w-32 h-32 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z"/></svg>
                            </div>

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

                                <h3 className="text-white font-bold text-lg mb-1">Real Estate Coverage</h3>
                                <p className="text-slate-400 text-xs mb-6">Property Insurance</p>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                                    <div>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Coverage</p>
                                        <p className="text-white font-bold text-lg">${(policy.coverageAmount || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 text-[10px] uppercase font-bold">Premium</p>
                                        <p className="text-emerald-400 font-bold text-lg">${(policy.premiumAmount || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-slate-500 text-right">
                                    Start: {policy.startDate || 'N/A'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Injection */}
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