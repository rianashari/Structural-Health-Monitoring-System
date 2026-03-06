'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 800));

        const success = login(username, password);
        if (!success) {
            setError('Username atau password salah');
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="login-page">
            {/* Background effects */}
            <div className="login-bg-grid" />
            <div className="login-bg-glow login-bg-glow-1" />
            <div className="login-bg-glow login-bg-glow-2" />

            <div className="login-card">
                {/* Logo / Brand */}
                <div className="login-brand">
                    <div className="login-logo">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="login-title">SHM System</h1>
                    <p className="login-subtitle">Structural Health Monitoring</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="login-field">
                        <label htmlFor="username" className="login-label">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Masukkan username"
                            className="login-input"
                            autoComplete="username"
                            required
                            disabled={isLoggingIn}
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password" className="login-label">Password</label>
                        <div className="login-input-wrap">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                className="login-input"
                                autoComplete="current-password"
                                required
                                disabled={isLoggingIn}
                            />
                            <button
                                type="button"
                                className="login-eye-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={isLoggingIn || !username || !password}
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 size={16} className="login-spinner" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Verticality Monitoring System</p>
                </div>
            </div>
        </div>
    );
}
