'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SESSION_DURATION = 8 * 60 * 60 * 1000;

export function useAuth() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [username, setUsername] = useState<string>('');

    const checkSession = useCallback(() => {
        if (typeof window === 'undefined') return false;

        const auth = localStorage.getItem('isAuthenticated') === 'true';
        const loginTime = localStorage.getItem('loginTime');

        if (!auth || !loginTime) return false;

        const elapsed = Date.now() - parseInt(loginTime, 10);
        if (elapsed > SESSION_DURATION) {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
            localStorage.removeItem('loginTime');
            return false;
        }

        return true;
    }, []);

    useEffect(() => {
        const valid = checkSession();
        const user = localStorage.getItem('username') || '';
        setIsAuthenticated(valid);
        setUsername(user);

        if (!valid) {
            router.replace('/login');
        }
    }, [router, checkSession]);

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        setIsAuthenticated(false);
        router.replace('/login');
    };

    return { isAuthenticated, username, logout };
}
