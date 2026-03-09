'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/rectifier-site-map');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060912',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(99, 102, 241, 0.2)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
