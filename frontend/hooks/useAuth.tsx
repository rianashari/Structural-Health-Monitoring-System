'use client';
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_USERNAME = 'nyk_verti';
const VALID_PASSWORD = 'adminnyk123';
const AUTH_KEY = 'shm_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(AUTH_KEY);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.username && data.authenticated) {
                    setIsAuthenticated(true);
                    setUsername(data.username);
                }
            } catch {
                localStorage.removeItem(AUTH_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((user: string, pass: string): boolean => {
        if (user === VALID_USERNAME && pass === VALID_PASSWORD) {
            setIsAuthenticated(true);
            setUsername(user);
            localStorage.setItem(AUTH_KEY, JSON.stringify({ username: user, authenticated: true }));
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUsername(null);
        localStorage.removeItem(AUTH_KEY);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
