'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old /dashboard (without deviceId) to the map page
export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/rectifier-site-map');
    }, [router]);

    return null;
}
