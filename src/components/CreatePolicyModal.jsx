import React, { useState } from 'react';

export default function CreatePolicyModal({ onClose, onSubmit, isSubmitting }) {
    // Initial Form State
    const [formData, setFormData] = useState({
        propertyAddress: '', 
        coverageAmount: 50000,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        propertyType: 'Apartment'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">New Real-Estate Insurance</h2>
                    <p className="text-slate-400 text-sm mt-1">Request coverage for your property</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    
                    {/* Property Address */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Property Location</label>
                        <input 
                            required
                            type="text" 
                            name="propertyAddress"
                            value={formData.propertyAddress}
                            onChange={handleChange}
                            placeholder="e.g. 123 Manama Street, Block 338"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                        />
                    </div>

                    {/* Property Type */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Property Type</label>
                        <select 
                            name="propertyType"
                            value={formData.propertyType}
                            onChange={handleChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                        >
                            <option value="Apartment">Apartment</option>
                            <option value="Villa">Villa</option>
                            <option value="Commercial">Commercial Shop</option>
                        </select>
                    </div>

                    {/* Coverage Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Requested Coverage ($)</label>
                        <input 
                            required
                            type="number" 
                            name="coverageAmount"
                            min="10000"
                            step="1000"
                            value={formData.coverageAmount}
                            onChange={handleChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
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
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
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
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    
                    {/* Calculated Premium Preview (Fake Logic for UI) */}
                    <div className="bg-emerald-900/20 border border-emerald-900/50 p-3 rounded-lg flex justify-between items-center mt-4">
                        <span className="text-emerald-500 text-sm">Estimated Monthly Premium</span>
                        <span className="text-xl font-bold text-emerald-400">
                            ${((formData.coverageAmount * 0.005) / 12).toFixed(2)}
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
                            className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                "Submit Demand"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}