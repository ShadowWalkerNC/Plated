import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)' }}>
      <SignIn />
    </div>
  );
}
