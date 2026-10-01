import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

interface UserData {
    name: string;
    userId: string;
    email: string;
    class: string;
    year: string;
    department: string;
}

const Profile: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Omit<UserData, 'userId' | 'email'>>({
        name: '',
        class: '',
        year: '',
        department: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('No user logged in.');
                setIsLoading(false);
                return;
            }

            try {
                const url = `http://localhost:5000/auth/find-user/${userId}`;
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setUserData({
                        name: data.name,
                        userId: data.userId,
                        email: data.email,
                        class: data.class || "",
                        year: data.year || "",
                        department: data.department || ""
                    });
                    setEditForm({
                        name: data.name,
                        class: data.class || "",
                        year: data.year || "",
                        department: data.department || ""
                    });
                } else {
                    const data = await response.json();
                    setError(data.message || 'Failed to fetch profile details.');
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

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing, reset form
            if (userData) {
                setEditForm({
                    name: userData.name,
                    class: userData.class,
                    year: userData.year,
                    department: userData.department
                });
            }
        }
        setIsEditing(!isEditing);
        setError('');
        setSuccessMessage('');
    };

    const handleSaveProfile = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const url = `http://localhost:5000/auth/update-profile/${userId}?t=${Date.now()}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (response.ok) {
                const data = await response.json();
                setUserData(data.user);
                setIsEditing(false);
                setSuccessMessage('Profile updated successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update profile.');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError(`Connection error. Tried: http://localhost:5000/auth/update-profile/${userId}. Is backend running?`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>User Profile</h1>
                        <p>Your personal information and account details</p>
                    </div>
                    {!isLoading && !error && (
                        <button
                            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={handleEditToggle}
                            disabled={isSaving}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    )}
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
                                {isEditing && <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={handleEditToggle}>Back to Profile</button>}
                            </div>
                        ) : userData && (
                            <div className="profile-details-container">
                                {successMessage && (
                                    <div className="alert-success" style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                        {successMessage}
                                    </div>
                                )}
                                <div className="profile-hero">
                                    <div className="profile-main-avatar">
                                        {userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                    </div>
                                    <div className="profile-main-info">
                                        {isEditing ? (
                                            <div className="edit-field">
                                                <label>Display Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="edit-input"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '0.25rem' }}>{userData.name}</h2>
                                                <p style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Student</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="profile-info-grid">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <div className="info-value">{userData.name}</div>
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <label>Student ID</label>
                                        <div className="info-value">{userData.userId}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Address</label>
                                        <div className="info-value">{userData.email}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Class</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                placeholder="e.g. CS-A"
                                                value={editForm.class}
                                                onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <div className="info-value">{userData.class || 'Not specified'}</div>
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <label>Year</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                placeholder="e.g. 2024"
                                                value={editForm.year}
                                                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <div className="info-value">{userData.year || 'Not specified'}</div>
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <label>Department</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                placeholder="e.g. Computer Science"
                                                value={editForm.department}
                                                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                className="edit-input"
                                            />
                                        ) : (
                                            <div className="info-value">{userData.department || 'Not specified'}</div>
                                        )}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="edit-actions" style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            style={{ padding: '0.75rem 2rem' }}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={handleEditToggle}
                                            disabled={isSaving}
                                            style={{ padding: '0.75rem 2rem' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
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
                .edit-input {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--primary-color);
                    border-radius: 0.75rem;
                    padding: 1rem;
                    color: white;
                    font-size: 1.1rem;
                    outline: none;
                }
                .edit-input:focus {
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
                }
                .edit-field label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--accent-color);
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
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

export default Profile;
