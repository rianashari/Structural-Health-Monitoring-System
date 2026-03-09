'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple hardcoded credentials
const VALID_USERNAME = 'nyk_verti';
const VALID_PASSWORD = 'adminnyk123';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; speed: number }>>([]);

    // Redirect if already logged in
    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true') {
            router.replace('/');
        }
    }, [router]);

    // Generate floating particles for background
    useEffect(() => {
        const generated = Array.from({ length: 18 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 6 + 2,
            opacity: Math.random() * 0.4 + 0.1,
            speed: Math.random() * 20 + 10,
        }));
        setParticles(generated);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise((r) => setTimeout(r, 600));

        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', Date.now().toString());
            router.push('/rectifier-site-map');
        } else {
            setError('Username atau password salah. Silakan coba lagi.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%)',
        }}>
            {/* Animated background grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
            }} />

            {/* Floating particles */}
            {particles.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(99, 102, 241, 0.6)',
                        opacity: p.opacity,
                        pointerEvents: 'none',
                        animation: `floatParticle ${p.speed}s ease-in-out infinite alternate`,
                    }}
                />
            ))}

            {/* Glowing orbs */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '384px', height: '384px',
                borderRadius: '50%', opacity: 0.2, filter: 'blur(48px)',
                background: 'radial-gradient(circle, #6366f1, transparent)',
            }} />
            <div style={{
                position: 'absolute', bottom: '-10%', right: '-10%', width: '384px', height: '384px',
                borderRadius: '50%', opacity: 0.2, filter: 'blur(48px)',
                background: 'radial-gradient(circle, #4f46e5, transparent)',
            }} />
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '600px', height: '600px', borderRadius: '50%', opacity: 0.05, filter: 'blur(48px)',
                background: 'radial-gradient(circle, #818cf8, transparent)',
            }} />

            {/* Login Card */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '420px',
                margin: '0 1rem',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '24px',
                boxShadow: '0 0 60px rgba(99, 102, 241, 0.15), 0 25px 60px rgba(0,0,0,0.5)',
            }}>
                {/* Top accent bar */}
                <div style={{
                    height: '4px',
                    width: '100%',
                    borderRadius: '24px 24px 0 0',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                }} />

                <div style={{ padding: '2rem' }}>
                    {/* Logo / Icon */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '1rem',
                            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M13 2L4.5 13H12L11 22L19.5 11H12L13 2Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                            SHM Monitoring
                        </h1>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'rgba(148, 163, 184, 0.8)' }}>
                            Structural Health Monitoring System
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        {/* Username */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(148, 163, 184, 1)' }}>
                                Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="Masukkan username"
                                    style={{
                                        width: '100%',
                                        paddingLeft: '40px',
                                        paddingRight: '16px',
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        background: 'rgba(30, 41, 59, 0.8)',
                                        border: '1px solid rgba(99, 102, 241, 0.25)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.8)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.25)')}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'rgba(148, 163, 184, 1)' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    placeholder="Masukkan password"
                                    style={{
                                        width: '100%',
                                        paddingLeft: '40px',
                                        paddingRight: '48px',
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        background: 'rgba(30, 41, 59, 0.8)',
                                        border: '1px solid rgba(99, 102, 241, 0.25)',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.8)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'rgba(99,102,241,0.25)')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                        opacity: 0.5, cursor: 'pointer', background: 'none', border: 'none', padding: 0,
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.875rem',
                                marginBottom: '1.25rem',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#fca5a5',
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            id="login-btn"
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                color: '#fff',
                                border: 'none',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.2s',
                                fontFamily: 'inherit',
                                background: isLoading
                                    ? 'rgba(99, 102, 241, 0.5)'
                                    : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                boxShadow: isLoading ? 'none' : '0 0 20px rgba(99,102,241,0.4)',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                    (e.target as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(99,102,241,0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                                (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(99,102,241,0.4)';
                            }}
                        >
                            {isLoading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Masuk...
                                </span>
                            ) : (
                                'Masuk ke Dashboard'
                            )}
                        </button>
                    </form>

                    {/* Footer hint */}
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', marginTop: '1.5rem', color: 'rgba(100, 116, 139, 0.7)' }}>
                        © 2025 PT NAYAKA PRATAMA MONITORING SYSTEM
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes floatParticle {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-30px) scale(1.2); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(100, 116, 139, 0.6);
        }
      `}</style>
        </div>
    );
}
