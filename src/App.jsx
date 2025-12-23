import { useAuthenticator } from '@aws-amplify/ui-react';

function App() {
  const { signOut, user } = useAuthenticator();

  return (
    <div>
      <h1>Hello, {user?.signInDetails?.loginId || 'Guest'}!</h1>
      <button onClick={signOut}>Sign Out</button>
      <h2> Bonjour </h2>
      {/* Your app content */}
    </div>
  );
}

export default App;