import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOtp, generateOtp } from '../api/auth';
import './Login.css'; // Reuse Login.css for common auth styles

const OTPVerification: React.FC = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const userId = (location.state as { userId?: string })?.userId;

    useEffect(() => {
        if (!userId) {
            navigate('/login');
        }
    }, [userId, navigate]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus move
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsLoading(true);
        setError('');

        const otpValue = otp.join('');
        try {
            const data = await verifyOtp(userId, otpValue);
            if (data.message === 'verifed successfully') {
                setMessage('Verified! Accessing Dashboard...');
                localStorage.setItem('userId', userId);
                setTimeout(() => {
                    if (userId.startsWith('KTU')) {
                        navigate('/admin-dashboard');
                    } else if (userId.startsWith('ADR')) {
                        navigate('/student-dashboard');
                    }
                }, 1500);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (_err) {
            setError('Connection error. Is backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            await generateOtp(userId);
            setMessage('New OTP sent to your email.');
        } catch (_err) {
            setError('Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="overlay"></div>

            <div className="auth-container">
                <div className="auth-header">
                    <h2>Verification Required</h2>
                    <p>We've sent a 6-digit code to your email associated with <strong>{userId}</strong></p>
                </div>

                <form className="form-box" onSubmit={handleSubmit}>
                    <div className="otp-input-container">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                id={`otp-${idx}`}
                                type="text"
                                className="otp-digit"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                required
                            />
                        ))}
                    </div>

                    {error && <p className="error-msg">{error}</p>}
                    {message && <p className="success-msg">{message}</p>}

                    <button type="submit" className="btn-submit" disabled={isLoading || otp.includes('')}>
                        {isLoading ? <div className="spinner"></div> : 'Verify & Sign In'}
                    </button>

                    <div className="divider">
                        <span>Didn't get code?</span>
                    </div>

                    <button type="button" className="btn-register" onClick={handleResend} disabled={isLoading}>
                        Resend OTP
                    </button>

                    <Link to="/login" className="forgot-link" style={{ textAlign: 'center', marginTop: '1rem' }}>
                        Try another account
                    </Link>
                </form>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .otp-input-container {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          margin-bottom: 2rem;
        }
        .otp-digit {
          width: 45px;
          height: 55px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-glass);
          border-radius: 0.75rem;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: all 0.3s;
        }
        .otp-digit:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .error-msg { color: #ef4444; font-size: 0.85rem; text-align: center; margin-bottom: 1rem; }
        .success-msg { color: #22c55e; font-size: 0.85rem; text-align: center; margin-bottom: 1rem; }
      `}} />
        </div>
    );
};

export default OTPVerification;
