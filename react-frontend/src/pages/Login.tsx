import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { generateOtp } from '../api/auth';
import './Login.css';

const Login: React.FC = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const input = document.getElementById('loginUserId');
        if (input) input.focus();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId.startsWith('ADR') && !userId.startsWith('KTU')) {
            setError('ID must start with ADR (Student) or KTU (Admin)');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const data = await generateOtp(userId);

            if (data.message === 'otp send ') {
                navigate('/verify-otp', { state: { userId } });
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (_err) {
            setError('Connection error. Is backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="overlay"></div>

            <nav className="auth-nav">
                <Link to="/" className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back to Home
                </Link>
            </nav>

            <div className="auth-container">
                <div className="auth-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in with your ADR or KTU ID</p>
                </div>

                <form className="form-box" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="loginUserId">User ID</label>
                        <input
                            type="text"
                            id="loginUserId"
                            className="input-field"
                            placeholder="Enter your ID (ADR... or KTU...)"
                            required
                            value={userId}
                            onChange={(e) => setUserId(e.target.value.toUpperCase())}
                            autoComplete="username"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="loginPassword">Password</label>
                        <input
                            type="password"
                            id="loginPassword"
                            className="input-field"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? <div className="spinner"></div> : (
                            <>
                                Generate OTP
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                            </>
                        )}
                    </button>

                    <div className="divider">
                        <span>New User?</span>
                    </div>

                    <Link to="/register" className="btn-register">
                        Create an Account
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default Login;
