'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const auth = localStorage.getItem('isAuthenticated') === 'true';
            const user = localStorage.getItem('username') || '';
            setIsAuthenticated(auth);
            setUsername(user);

            if (!auth) {
                router.replace('/login');
            }
        }
    }, [router]);

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        router.replace('/login');
    };

    return { isAuthenticated, username, logout };
}
