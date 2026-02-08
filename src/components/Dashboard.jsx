import React, { useState } from 'react';
// 1. IMPORT THE HOOK
import { useAuthenticator } from '@aws-amplify/ui-react'; 
import DashboardView from './DashboardView'; 
import PoliciesView from './PoliciesView';   

export default function Dashboard() {
    // 2. DEFINE THE USER VARIABLE (This was missing or broken)
    const { user, signOut } = useAuthenticator((context) => [context.user]);

    const [currentView, setCurrentView] = useState('dashboard');

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
                    <button 
                        onClick={() => setCurrentView('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            currentView === 'dashboard' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                    >
                        <span className="font-bold text-sm">Overview</span>
                    </button>

                    <button 
                        onClick={() => setCurrentView('policies')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            currentView === 'policies' 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                            : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                        }`}
                    >
                        <span className="font-bold text-sm">My Policies</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={signOut} className="w-full py-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-auto bg-slate-900 relative">
                {currentView === 'dashboard' && <DashboardView />}
                
                {/* 3. PASS THE USER ID SAFELY 
                   We use optional chaining (user?) just in case it loads slowly
                */}
                {currentView === 'policies' && (
                    <PoliciesView 
                        userId={user?.userId || user?.username} 
                        username={user?.username} 
                    />
                )}
            </main>
        </div>
    );
}