import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import DashboardView from './DashboardView'; 
// REMOVED: import PoliciesView ...

export default function Dashboard() {
    const { signOut } = useAuthenticator((context) => [context.user]);

    return (
        <div className="flex h-screen bg-slate-900 text-slate-200 font-sans overflow-hidden">
            
            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        AssurEnligne
                    </h2>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {/* Single Active Button */}
                    <button 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        <span className="font-bold text-sm">Overview</span>
                    </button>

                    {/* REMOVED: Policies Button */}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={signOut} className="w-full py-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-auto bg-slate-900 relative">
                {/* Always render DashboardView directly */}
                <DashboardView />
            </main>
        </div>
    );
}