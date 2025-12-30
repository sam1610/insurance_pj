import React, { useState } from 'react';

export default function CreatePolicyModal({ onClose, onSubmit, isSubmitting }) {
    // Initial Form State
    const [formData, setFormData] = useState({
        carManifYear: new Date().getFullYear(),
        coverageAmount: 15000, // Default car value
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        premiumAmount: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Calculate derived attributes before submitting
        const currentYear = new Date().getFullYear();
        const carAge = currentYear - parseInt(formData.carManifYear);
        
        // Simple Premium Logic: Base + (Age * 20) + (Coverage * 0.02)
        const estimatedPremium = 200 + (carAge * 20) + (formData.coverageAmount * 0.02);

        onSubmit({
            ...formData,
            carAge,
            premiumAmount: estimatedPremium
        });
    };

    // Live Premium Estimate for UI
    const currentYear = new Date().getFullYear();
    const estAge = currentYear - (parseInt(formData.carManifYear) || currentYear);
    const estPremium = 200 + (estAge * 20) + (formData.coverageAmount * 0.02);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">New Auto Policy</h2>
                    <p className="text-slate-400 text-sm mt-1">Insure a vehicle</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    
                    {/* Vehicle Details */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Car Manufacturing Year</label>
                        <input 
                            required
                            type="number" 
                            name="carManifYear"
                            min="1990"
                            max={new Date().getFullYear() + 1}
                            value={formData.carManifYear}
                            onChange={handleChange}
                            placeholder="e.g. 2020"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <p className="text-xs text-slate-500 mt-1 text-right">Vehicle Age: {estAge} years</p>
                    </div>

                    {/* Coverage Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Declared Value / Coverage ($)</label>
                        <input 
                            required
                            type="number" 
                            name="coverageAmount"
                            min="1000"
                            step="500"
                            value={formData.coverageAmount}
                            onChange={handleChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                            <input 
                                required
                                type="date" 
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                            <input 
                                required
                                type="date" 
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    
                    {/* Premium Preview */}
                    <div className="bg-indigo-900/20 border border-indigo-900/50 p-3 rounded-lg flex justify-between items-center mt-4">
                        <span className="text-indigo-400 text-sm">Estimated Annual Premium</span>
                        <span className="text-xl font-bold text-indigo-300">
                            ${estPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-800 mt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Create Policy"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}