import React, { useState } from 'react';
import DashboardView from './DashboardView';
import CustomersView from './CustomersView';
import PoliciesView from './PoliciesView';
import Analytics from './Analytics';

// --- Icons ---
const HomeIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const UsersIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const FileTextIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>;
const BarChartIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;

const classNames = (...classes) => classes.filter(Boolean).join(' ');

export default function Dashboard( username , isCustomerView=false) {
    const [activeView, setActiveView] = useState('dashboard');

    const renderView = () => {
        switch (activeView) {
            case 'dashboard': return <DashboardView />;
            case 'customers': return <CustomersView />;
            case 'policies': return <PoliciesView username={user.username} isCustomerView={false}/>;
            case 'analytics': return <Analytics />;
            default: return <DashboardView />;
        }
    };

    const NavButton = ({ view, icon: Icon, label }) => (
        <button 
            onClick={() => setActiveView(view)} 
            className={classNames(
                'flex-1 flex flex-col items-center justify-center py-3 transition-colors duration-200',
                activeView === view ? 'text-sky-400 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200'
            )}
        >
            <Icon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );

    return (
        <div className="bg-slate-900 text-slate-200 min-h-screen font-sans pb-20 selection:bg-sky-500/30">
            <main className="max-w-7xl mx-auto">
                {renderView()}
            </main>
            
            {/* Fixed Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex justify-around shadow-lg z-50">
                <NavButton view="dashboard" icon={HomeIcon} label="Home" />
                <NavButton view="customers" icon={UsersIcon} label="Customers" />
                <NavButton view="policies" icon={FileTextIcon} label="Policies" />
                <NavButton view="analytics" icon={BarChartIcon} label="Analytics" />
            </nav>
        </div>
    );
}