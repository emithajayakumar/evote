import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import './Login.css';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        userId: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: id === 'userId' ? value.toUpperCase() : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.userId.startsWith('ADR') && !formData.userId.startsWith('KTU')) {
            setError('ID must start with ADR (Student) or KTU (Teacher/Admin)');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await registerUser(formData.name, formData.userId, formData.email, formData.password);
            if (data.message === 'registeration successfull') {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.message || 'Registration failed');
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
                    <h2>Join eVote</h2>
                    <p>ADR IDs for Students | KTU IDs for Teachers/Admins</p>
                </div>

                <form className="form-box" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            className="input-field"
                            placeholder="Enter your full name"
                            required
                            value={formData.name}
                            onChange={handleFieldChange}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="userId">User ID</label>
                        <input
                            type="text"
                            id="userId"
                            className="input-field"
                            placeholder="e.g. ADR... (Student) or KTU... (Teacher)"
                            required
                            value={formData.userId}
                            onChange={handleFieldChange}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="input-field"
                            placeholder="yourname@gmail.com"
                            required
                            value={formData.email}
                            onChange={handleFieldChange}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="input-field"
                            placeholder="Create a strong password"
                            required
                            value={formData.password}
                            onChange={handleFieldChange}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="input-field"
                            placeholder="Confirm your password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleFieldChange}
                        />
                    </div>

                    {error && <p className="error-msg" style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
                    {success && <p className="success-msg" style={{ color: '#22c55e', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}

                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <div className="spinner"></div>
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Register
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                            </>
                        )}
                    </button>

                    <div className="divider">
                        <span>Already have an account?</span>
                    </div>

                    <Link to="/login" className="btn-register">
                        Sign In Instead
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                    </Link>
                </form>
            </div>
        </div>
    );
};

export default Register;
