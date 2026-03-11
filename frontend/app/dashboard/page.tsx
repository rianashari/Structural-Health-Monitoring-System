'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect old /dashboard (without deviceId) to the map page
export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect dashboard to site map initially to bypass auth requirement
        router.replace('/site-map');
    }, [router]);

    return null;
}
