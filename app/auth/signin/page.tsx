import { signIn } from 'next-auth/react';

export default function SignInPage() {
  return (
    <div>
      <h1>Sign in to access the dashboard</h1>
      <button onClick={() => signIn('azure-ad')}>Sign in with Azure AD</button>
    </div>
  );
}