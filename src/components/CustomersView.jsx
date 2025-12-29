import React, { useState, useEffect, useRef } from 'react';
import { client } from "../DataHook/AmplifyClient" ;
import { useVirtualizer } from '@tanstack/react-virtual';


export default function CustomersView() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                // Using the exact QueryField from your schema: queryField("userList")
                // Index: index('type').sortKeys(['pk'])
                const { data } = await client.models.InsuranceData.userList({
                    type: 'PROFILE',
                    // Optional: limit: 100
                });
                // Sort by name for display
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

    // Virtualization setup
    const parentRef = useRef();
    const rowVirtualizer = useVirtualizer({
        count: customers.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 72, // approx height of row
        overscan: 5,
    });

    if (loading) return <div className="p-8 text-center text-slate-500">Loading directory...</div>;

    return (
        <div className="p-4 h-screen flex flex-col">
            <h1 className="text-2xl font-bold text-sky-500 mb-6 shrink-0">Customers Directory</h1>
            
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex-1 overflow-hidden flex flex-col shadow-xl">
                {/* Header */}
                <div className="grid grid-cols-12 bg-slate-900/50 p-4 border-b border-slate-700 font-bold text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-4">Contact</div>
                    <div className="col-span-4 text-right">User ID</div>
                </div>

                {/* Virtual List */}
                <div ref={parentRef} className="overflow-y-auto flex-1 p-2">
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
                        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                            const customer = customers[virtualItem.index];
                            return (
                                <div
                                    key={customer.pk}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualItem.size}px`,
                                        transform: `translateY(${virtualItem.start}px)`,
                                    }}
                                    className="p-1"
                                >
                                    <div className="grid grid-cols-12 items-center p-3 bg-slate-800 hover:bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600 cursor-pointer h-full">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-sky-900/50 flex items-center justify-center text-sky-400 font-bold text-xs border border-sky-800">
                                                {customer.firstName?.[0]}{customer.lastName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{customer.firstName} {customer.lastName}</p>
                                                <p className="text-slate-500 text-xs">{customer.address || 'No address'}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <p className="text-slate-300 text-xs">{customer.email}</p>
                                            <p className="text-slate-500 text-[10px]">{customer.phoneNbr}</p>
                                        </div>
                                        <div className="col-span-4 text-right">
                                            <code className="text-[10px] text-slate-600 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                                                {customer.pk.replace('USER#', '')}
                                            </code>
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