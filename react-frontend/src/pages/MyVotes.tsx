import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

interface ElectionData {
    _id: string;
    title: string;
    startTime: string;
    endTime: string;
    boyCandidate: { name: string };
    girlCandidate: { name: string };
    createdAt: string;
}

const MyVotes: React.FC = () => {
    const [history, setHistory] = useState<ElectionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // In a real app with auth, the userId would come from a JWT or session
                // For this demo, we assume the user's ID is stored in localStorage after login
                // e.g. localStorage.setItem('userId', user.userId);
                // Currently, we don't have this, so we'll just mock a userId if it's missing.
                const storedUserId = localStorage.getItem('userId');

                if (!storedUserId) {
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:5000/auth/student/votes/${storedUserId}`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data.history);
                }
            } catch (error) {
                console.error("Failed to fetch voting history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Get participation count
    const participationCount = history.length;

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>My Voting History</h1>
                        <p>Track the elections you've participated in</p>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Stats Summary Card */}
                    <div className="card status-card">
                        <div className="card-header">
                            <h2 className="card-title">Participation Stats</h2>
                        </div>
                        <div className="status-content">
                            <div className="status-indicator success" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {participationCount}
                            </div>
                            <h3>Elections Voted In</h3>
                            <p>Thank you for participating in {participationCount} student council election{participationCount !== 1 ? 's' : ''}!</p>
                        </div>
                    </div>

                    {/* History List Header */}
                    <div className="card full-width" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header">
                            <h2 className="card-title">Past Votes</h2>
                        </div>

                        {isLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                                Loading history...
                            </div>
                        ) : history.length === 0 ? (
                            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                                <div className="card-icon" style={{ margin: '0 auto 1rem auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                </div>
                                <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Voting History</h3>
                                <p style={{ color: 'var(--text-dim)' }}>You haven't participated in any elections yet.</p>
                            </div>
                        ) : (
                            <div className="activity-table-container">
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>Election Title</th>
                                            <th className="text-right">Date Voted</th>
                                            <th className="text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((election) => (
                                            <tr key={election._id}>
                                                <td>{election.title}</td>
                                                <td className="text-right">
                                                    {new Date(election.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="text-right status-text voted">
                                                    Voted <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginLeft: '4px' }}><polyline points="20 6 9 17 4 12" /></svg>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyVotes;
