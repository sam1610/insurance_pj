import React, { useState, useEffect, useRef } from 'react';
import { client } from "../DataHook/AmplifyClient" ;
import { useVirtualizer } from '@tanstack/react-virtual';

export default function CustomersView() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const { data } = await client.models.InsuranceData.userList({
                    type: 'PROFILE',
                });
                const sorted = (data || []).sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
                setCustomers(sorted);
            } catch (err) {
                console.error("Error fetching customers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const parentRef = useRef();
    const rowVirtualizer = useVirtualizer({
        count: customers.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72,
        overscan: 5,
    });

    if (loading) return <div className="p-8 text-center text-slate-500">Loading directory...</div>;

    return (
        <div className="p-4 h-screen flex flex-col">
            <h1 className="text-2xl font-bold text-sky-500 mb-6 shrink-0">Driver Directory</h1>
            
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex-1 overflow-hidden flex flex-col shadow-xl">
                <div className="grid grid-cols-12 bg-slate-900/50 p-4 border-b border-slate-700 font-bold text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <div className="col-span-5">Driver Name</div>
                    <div className="col-span-4">Risk Profile</div>
                    <div className="col-span-3 text-right">Location</div>
                </div>

                <div ref={parentRef} className="overflow-y-auto flex-1 p-2">
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const customer = customers[virtualItem.index];
                            return (
                                <div
                                    key={customer.pk}
                                    style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%',
                                        height: `${virtualItem.size}px`, transform: `translateY(${virtualItem.start}px)`,
                                    }}
                                    className="p-1"
                                >
                                    <div className="grid grid-cols-12 items-center p-3 bg-slate-800 hover:bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600 cursor-pointer h-full">
                                        
                                        {/* Name & Contact */}
                                        <div className="col-span-5 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-sky-900/50 flex items-center justify-center text-sky-400 font-bold text-xs border border-sky-800">
                                                {customer.firstName?.[0]}{customer.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{customer.firstName} {customer.lastName}</p>
                                                <p className="text-slate-500 text-xs">{customer.email}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Risk Profile (New Attributes) */}
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 text-xs">Exp:</span>
                                                <span className="text-white text-xs font-bold">{customer.driverExp || 0} yrs</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-slate-400 text-xs">Accidents:</span>
                                                <span className={`text-xs font-bold ${customer.prevAccidents > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {customer.prevAccidents || 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="col-span-3 text-right">
                                            <p className="text-slate-300 text-xs">{customer.address || 'N/A'}</p>
                                            <p className="text-slate-500 text-[10px] font-mono">ZIP: {customer.codePost || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}