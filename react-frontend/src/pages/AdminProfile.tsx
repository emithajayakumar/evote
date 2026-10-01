import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

interface UserData {
    name: string;
    userId: string;
    email: string;
    role?: string;
}

const AdminProfile: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('No user logged in.');
                setIsLoading(false);
                return;
            }

            try {
                const url = `http://localhost:5000/auth/find-user/${userId}?t=${Date.now()}`;
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        name: data.name,
                        userId: data.userId,
                        email: data.email,
                        role: 'Administrator'
                    });
                } else {
                    const data = await response.json();
                    setError(data.message || 'Failed to fetch admin details.');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(`Connection error. Tried: http://localhost:5000/auth/find-user/${userId}. Is backend running?`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>Admin Profile</h1>
                        <p>Your administrative account details</p>
                    </div>
                </header>

                <div className="dashboard-grid">
                    <div className="card full-width">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                <p style={{ color: 'var(--text-dim)' }}>Loading profile details...</p>
                            </div>
                        ) : error ? (
                            <div style={{ textAlign: 'center', padding: '3rem' }}>
                                <p style={{ color: '#ef4444' }}>{error}</p>
                            </div>
                        ) : userData && (
                            <div className="profile-details-container">
                                <div className="profile-hero">
                                    <div className="profile-main-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                        {userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                    </div>
                                    <div className="profile-main-info">
                                        <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.25rem' }}>{userData.name}</h2>
                                        <p style={{ color: '#fcd34d', fontWeight: '600' }}>{userData.role}</p>
                                    </div>
                                </div>

                                <div className="profile-info-grid">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <div className="info-value">{userData.name}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Admin ID</label>
                                        <div className="info-value">{userData.userId}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Address</label>
                                        <div className="info-value">{userData.email}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Role</label>
                                        <div className="info-value" style={{ color: '#fcd34d' }}>{userData.role}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-details-container {
                    padding: 1rem;
                }
                .profile-hero {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid var(--border-glass);
                    margin-bottom: 2rem;
                }
                .profile-main-avatar {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: white;
                    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
                }
                .profile-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 2rem;
                }
                .info-item label {
                    display: block;
                    font-size: 0.85rem;
                    color: var(--text-dim);
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .info-value {
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid var(--border-glass);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    color: white;
                    font-size: 1.1rem;
                    min-height: 3.5rem;
                }
                @media (max-width: 600px) {
                    .profile-hero { flex-direction: column; text-align: center; gap: 1rem; }
                    .profile-info-grid { grid-template-columns: 1fr; }
                }
                `
            }} />
        </div>
    );
};

export default AdminProfile;
