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

            // 3. Call Backend
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
                startDate: formData.startDate,
                endDate: formData.endDate
            });

            if (data && data.premium) {
                setFormData(prev => ({ ...prev, premiumAmount: data.premium }));
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
            // Ensure premiumAmount is passed. If 0 (fallback), calculate logic or use simulated
            premiumAmount: formData.premiumAmount > 0 ? formData.premiumAmount : 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">New Policy Quote</h2>
                    <p className="text-slate-400 text-sm mt-1">Fill all details to simulate AI pricing</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    
                    {/* --- ROW 1: Car & Coverage --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Car Year</label>
                            <input 
                                required type="number" name="carManifYear"
                                value={formData.carManifYear} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Coverage ($)</label>
                            <input 
                                required type="number" name="coverageAmount" step="1000"
                                value={formData.coverageAmount} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* --- ROW 2: Driver Age & Gender --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Driver Age</label>
                            <input 
                                required type="number" name="age" placeholder="e.g. 35" min="18" max="99"
                                value={formData.age} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                            <select 
                                name="gender" required
                                value={formData.gender} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>

                    {/* --- ROW 3: Experience & Mileage --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Driver Exp (Yrs)</label>
                            <input 
                                required type="number" name="driverExp" placeholder="e.g. 5"
                                value={formData.driverExp} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Annual Mileage</label>
                            <input 
                                required type="number" name="annualMileage" placeholder="e.g. 15000"
                                value={formData.annualMileage} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* --- ROW 4: Accidents & Region --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Accidents (Past 3y)</label>
                            <input 
                                required type="number" name="prevAccidents"
                                value={formData.prevAccidents} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Region Code</label>
                            <select 
                                name="regionCode" required
                                value={formData.regionCode} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">Select...</option>
                                <option value="26">Urban (26)</option>
                                <option value="50">Suburban (50)</option>
                                <option value="10">Rural (10)</option>
                            </select>
                        </div>
                    </div>

                    {/* --- ROW 5: Damage & Dates --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prior Vehicle Damage?</label>
                             <select 
                                 name="vehicleDamage"
                                 value={formData.vehicleDamage} onChange={handleChange}
                                 className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                             >
                                 <option value="No">No</option>
                                 <option value="Yes">Yes</option>
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                            <input 
                                required type="date" name="startDate"
                                value={formData.startDate} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
                            <input 
                                required type="date" name="endDate"
                                value={formData.endDate} onChange={handleChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    
                    {/* --- PREMIUM DISPLAY --- */}
                    {simulated && (
                        <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl flex justify-between items-center animate-fade-in mt-2">
                            <div>
                                <p className="text-emerald-500 text-xs font-bold uppercase tracking-wide">AI Calculated Premium</p>
                                <p className="text-slate-400 text-xs">For {formData.gender} driver, {formData.age} years old</p>
                            </div>
                            <span className="text-2xl font-bold text-emerald-400">
                                ${formData.premiumAmount.toLocaleString()}
                            </span>
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
                                        Connecting to Agent...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        Simulate Quote
                                    </>
                                )}
                            </button>
                        )}

                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors"
                            >
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