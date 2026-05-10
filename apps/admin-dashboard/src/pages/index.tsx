import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if session exists, otherwise to login
    // For now, let's just redirect to login
    router.push('/auth/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting...</h1>
        <p className="text-gray-500">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  );
}
