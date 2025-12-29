import { Authenticator } from '@aws-amplify/ui-react';
import { useState ,  useEffect} from 'react';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import {  client } from './DataHook/AmplifyClient';
import '@aws-amplify/ui-react/styles.css';

// Import your components
import Dashboard from './components/Dashboard';
import PoliciesView from './components/PoliciesView'; // The view for regular customers



export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <AppLogic user={user} signOut={signOut} />
      )}
    </Authenticator>
  );
}

function AppLogic({ user, signOut }) {
  const [userGroup, setUserGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const initializeUser = async () => {
      try {
        // 1. CHECK GROUP (Routing)
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
        
        // If you manually added them to Admin, this will be true. 
        // Otherwise, the Lambda made them a Customer.
        const isMin = groups.includes('Admin');
        setUserGroup(isMin ? 'ADMIN' : 'CUSTOMER');

        // 2. SYNC PROFILE (Database)
        // Check if this user exists in our DynamoDB table
        const { data: existingProfile } = await client.models.InsuranceData.get({
          pk: `USER#${user.userId}`,
          sk: 'PROFILE'
        });

        // If not, create the profile row
if (!existingProfile) {
  const attributes = await fetchUserAttributes();
  await client.models.InsuranceData.create({
    pk: `USER#${user.userId}`, 
    sk: 'PROFILE',             
    type: 'PROFILE', // <--- CHANGED from 'CUSTOMER' to 'PROFILE'
    
    // Map attributes
    email: attributes.email,
    firstName: attributes.given_name || 'New',
    lastName: attributes.family_name || 'User',
    phoneNbr: attributes.phone_number,
    
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  });
  console.log("New User Profile Created in DynamoDB");
}

      } catch (e) {
        console.error("Initialization Error:", e);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-slate-400">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full mr-3"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      {/* Top Bar for Sign Out */}
      <header className="flex justify-between items-center p-4 bg-slate-800 border-b border-slate-700">
        <h1 className="font-bold text-lg text-sky-400">Insurance App</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 hidden sm:block">Logged in as: {user.useremail}</span>
          <button 
            onClick={signOut} 
            className="text-xs bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded border border-red-800 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {userGroup === 'ADMIN' ? (
          // Admin View: Gets full Dashboard
          <Dashboard username={user.email} />
        ) : (
          // Customer View: Gets their specific view
          // We can reuse Dashboard or a specific PoliciesView depending on your preference
          <PoliciesView username={user.username} isCustomerView={true}
            userId={user.userId} />
        )}
      </main>
    </div>
  );
}