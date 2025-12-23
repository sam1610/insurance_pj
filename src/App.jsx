import { useAuthenticator } from '@aws-amplify/ui-react';
import Dashboard from './components/Dashboard';

function App() {
  const { signOut, user } = useAuthenticator();

  return (
    <div>
      <Dashboard/>
    </div>
  );
}

export default App;