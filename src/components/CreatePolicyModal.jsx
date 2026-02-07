import React, { useState } from 'react';
import { client } from '../DataHook/AmplifyClient'; 

export default function CreatePolicyModal({ onClose, onSubmit, isSubmitting }) {
    // 1. State
    const [formData, setFormData] = useState({
        carManifYear: new Date().getFullYear(),
        age: '',             
        gender: '',          
        driverExp: '',       
        prevAccidents: 0,    
        annualMileage: '',   
        regionCode: '',      
        vehicleDamage: 'No', 
        coverageAmount: 15000,
        vintage: 150, 
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        premiumAmount: 0
    });

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulated, setSimulated] = useState(false);

    // 2. Validation
    const isFormComplete = 
        formData.carManifYear && 
        formData.age !== '' &&
        formData.gender !== '' &&       
        formData.driverExp !== '' &&
        formData.annualMileage !== '' &&
        formData.regionCode !== '' &&
        formData.vintage !== '' && 
        formData.startDate && 
        formData.endDate;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Reset simulation if user edits the form
        if (simulated) {
            setSimulated(false);
            setFormData(prev => ({ ...prev, premiumAmount: 0 }));
        }
    };

    const handleSimulate = async () => {
        setIsSimulating(true);
        try {
            const currentYear = new Date().getFullYear();
            const carAge = currentYear - parseInt(formData.carManifYear);

            const { data, errors } = await client.queries.getPremiumQuote({
                age: parseInt(formData.age),
                gender: formData.gender,            
                carAge: carAge,
                driverExp: parseInt(formData.driverExp),
                prevAccidents: parseInt(formData.prevAccidents),
                vehicleDamage: formData.vehicleDamage,
                regionCode: formData.regionCode,
                annualMileage: parseInt(formData.annualMileage),
                coverageAmount: parseFloat(formData.coverageAmount),
                vintage: parseInt(formData.vintage), 
                startDate: formData.startDate,
                endDate: formData.endDate
            });

            if (data && data.premium) {
                setFormData(prev => ({ 
                    ...prev, 
                    premiumAmount: data.premium
                }));
                setSimulated(true);
            } else {
                console.error("AI Error:", errors);
                alert("AI could not generate a quote. Please check your inputs.");
            }
        } catch (err) {
            console.error("Simulation failed:", err);
            alert("Simulation failed.");
        } finally {
            setIsSimulating(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentYear = new Date().getFullYear();
        const carAge = currentYear - parseInt(formData.carManifYear);
        
        onSubmit({
            ...formData,
            carAge,
            premiumAmount: formData.premiumAmount > 0 ? formData.premiumAmount : 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">New Policy Quote</h2>
                    <p className="text-slate-400 text-sm mt-1">Fill all details to simulate AI pricing</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    
                    {/* --- INPUT SECTIONS --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Car Year</label>
                            <input required type="number" name="carManifYear" value={formData.carManifYear} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Coverage ($)</label>
                            <input required type="number" name="coverageAmount" step="1000" value={formData.coverageAmount} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Driver Age</label>
                            <input required type="number" name="age" placeholder="e.g. 35" min="18" max="99" value={formData.age} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                            <select name="gender" required value={formData.gender} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none">
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Driver Exp (Yrs)</label>
                            <input required type="number" name="driverExp" placeholder="e.g. 5" value={formData.driverExp} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Annual Mileage</label>
                            <input required type="number" name="annualMileage" placeholder="e.g. 15000" value={formData.annualMileage} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Accidents (Past 3y)</label>
                            <input required type="number" name="prevAccidents" value={formData.prevAccidents} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Region Code</label>
                            <select name="regionCode" required value={formData.regionCode} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none">
                                <option value="">Select...</option>
                                <option value="26">Urban (26)</option>
                                <option value="50">Suburban (50)</option>
                                <option value="10">Rural (10)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prior Damage?</label>
                             <select name="vehicleDamage" value={formData.vehicleDamage} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none">
                                 <option value="No">No</option>
                                 <option value="Yes">Yes</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tenure (Days)</label>
                             <input required type="number" name="vintage" placeholder="e.g. 100" value={formData.vintage} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                            <input required type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                    
                    {/* --- 🔥 CLEANED RESULT SECTION (No ML) --- */}
                    {simulated && (
                        <div className="mt-4 animate-fade-in">
                            <div className="bg-slate-800 border border-emerald-500/30 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-lg shadow-emerald-900/10">
                                <p className="text-emerald-500 text-xs font-black uppercase tracking-widest mb-2">AI Calculated Premium</p>
                                <span className="text-4xl font-black text-white">
                                    ${formData.premiumAmount.toLocaleString()}
                                </span>
                                <p className="text-slate-500 text-xs mt-2">
                                    Generated by AWS Bedrock using Bias Rules
                                </p>
                            </div>
                        </div>
                    )}

                    {/* --- ACTIONS --- */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-800 mt-2">
                        {!simulated && (
                            <button 
                                type="button" 
                                onClick={handleSimulate}
                                disabled={!isFormComplete || isSimulating}
                                className={`w-full py-3 font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${
                                    isFormComplete 
                                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20' 
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                {isSimulating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Calculating...
                                    </>
                                ) : (
                                    "Simulate Quote"
                                )}
                            </button>
                        )}

                        <div className="flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={!simulated || isSubmitting}
                                className={`flex-1 px-4 py-2.5 font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${
                                    simulated
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? "Processing..." : "Submit Policy"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}