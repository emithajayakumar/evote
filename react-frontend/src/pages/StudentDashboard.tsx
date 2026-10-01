import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

interface Candidate {
    userId: string;
    name: string;
    gender: string;
    votes: number;
}

interface ElectionData {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    boyCandidates: Candidate[];
    girlCandidates: Candidate[];
    votedBy: string[];
}

const StudentDashboard: React.FC = () => {
    const [election, setElection] = useState<ElectionData | null>(null);
    const [isVotingOpen, setIsVotingOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Checking election status...');
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');
    const [userFullId, setUserFullId] = useState<string>('');
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        const fetchElection = async () => {
            try {
                const response = await fetch(`http://localhost:5000/auth/elections/active?t=${Date.now()}`);
                if (response.ok) {
                    const data = await response.json();
                    setElection({
                        id: data.election._id,
                        title: data.election.title,
                        startTime: data.election.startTime,
                        endTime: data.election.endTime,
                        boyCandidates: data.election.boyCandidates || [],
                        girlCandidates: data.election.girlCandidates || [],
                        votedBy: data.election.votedBy || []
                    });
                    setIsVotingOpen(data.isVotingOpen);
                    setStatusMessage(data.statusMessage);

                    if (userId && data.election.votedBy?.includes(userId)) {
                        setHasVoted(true);
                    } else {
                        setHasVoted(false);
                    }
                } else {
                    setElection(null);
                    setStatusMessage('No active election at this time.');
                    setHasVoted(false);
                }
            } catch (error) {
                setStatusMessage('Could not connect to the election server.');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchUser = async () => {
            if (userId) {
                try {
                    const response = await fetch(`http://localhost:5000/auth/find-user/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setUserName(data.name);
                        setUserFullId(data.userId);
                    }
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                }
            }
        };

        fetchElection();
        fetchUser();

        // 10-second polling for live updates
        const interval = setInterval(fetchElection, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>Welcome, {userName ? userName.split(' ')[0] : 'Student'}</h1>
                        <p>ID: {userFullId || 'N/A'}</p>
                    </div>

                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{userName || 'Student Name'}</span>
                            <span className="user-role">Student</span>
                        </div>
                        <img src="/src/assets/profile.png" alt="Profile" className="profile-img" />
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Main Election Card */}
                    {isLoading ? (
                        <div className="card featured-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                            <p style={{ color: 'var(--text-dim)' }}>Loading election data...</p>
                        </div>
                    ) : isVotingOpen && election ? (
                        <div className="card featured-card">
                            <div className="card-header">
                                <div className="header-text">
                                    <div className="election-meta">
                                        <span className="badge success">Voting Open</span>
                                        <span className="time-left">Closes at {new Date(election.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <h2 className="card-title">{election.title}</h2>
                                    <p className="card-description">
                                        The election is currently live. Cast your vote for your class representatives now.
                                    </p>
                                </div>
                                <div className="card-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="large-icon"><path d="M12 2a10 10 0 1 0 10 10H12V2Z" /><path d="M12 12 2.1 12.1" /><path d="M2 12a10 10 0 0 1 10-10l5.5 1.5" /><path d="m21.1 12.1-5.6-5.6" /></svg>
                                </div>
                            </div>

                            <div className="card-actions">
                                {hasVoted ? (
                                    <div className="voted-status-banner">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                        <span>You have already cast your vote</span>
                                    </div>
                                ) : (
                                    <a href="/vote" className="btn btn-primary">
                                        Vote Now
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card featured-card" style={{ background: 'rgba(15, 23, 42, 0.4)', borderColor: 'var(--border-glass)' }}>
                            <div className="card-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                                <div className="card-icon" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                </div>
                                <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{election ? election.title : 'No Active Election'}</h2>
                                <p className="card-description" style={{ fontSize: '1.1rem', color: 'var(--accent-color)' }}>
                                    {statusMessage}
                                </p>
                                {election && !isVotingOpen && new Date() < new Date(election.startTime) && (
                                    <p style={{ marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                        Opens at: {new Date(election.startTime).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Voting Status Card */}
                    <div className="card status-card">
                        <div className="card-header">
                            <h2 className="card-title">Voting Status</h2>
                        </div>
                        <div className="status-content">
                            <div className={`status-indicator ${hasVoted ? 'success' : 'warning'}`}>
                                {hasVoted ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                )}
                            </div>
                            <h3>{hasVoted ? 'Voted' : 'Not Yet Voted'}</h3>
                            <p>{hasVoted ? 'Your vote has been successfully recorded on the blockchain.' : 'You are registered and verified. Please cast your vote before the session ends.'}</p>
                        </div>
                    </div>

                    {/* Election Standings Card */}
                    <div className="card full-width">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title">Current Election Standings</h2>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span className="badge-live">Live</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Last updated: Just now</span>
                            </div>
                        </div>

                        <div className="results-grid" style={{ marginTop: '1.5rem' }}>
                            {/* Boy Representative Results */}
                            <div>
                                <h3 className="card-title" style={{ fontSize: '1rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accent-boy"><path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" /><path d="M18 22H6l1-10h10l1 10z" /></svg>
                                    Boy Class Representative
                                </h3>

                                {election && election.boyCandidates.length > 0 ? (
                                    election.boyCandidates.map(boy => {
                                        const votesCast = election.votedBy?.length || 0;
                                        const percentage = votesCast > 0 ? Math.round((boy.votes / votesCast) * 100) : 0;
                                        return (
                                            <div key={boy.userId} className="candidate-result-item">
                                                <div className="candidate-header-info">
                                                    <span className="candidate-name-text" style={{ color: 'white' }}>{boy.name}</span>
                                                    <span className="candidate-percentage accent-boy">{percentage}%</span>
                                                </div>
                                                <div className="results-progress-container">
                                                    <div className="results-progress-bar bg-boy" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No boy candidates in this election.</p>
                                )}
                            </div>

                            {/* Girl Representative Results */}
                            <div>
                                <h3 className="card-title" style={{ fontSize: '1rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'none' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accent-girl"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>
                                    Girl Class Representative
                                </h3>

                                {election && election.girlCandidates.length > 0 ? (
                                    election.girlCandidates.map(girl => {
                                        const votesCast = election.votedBy?.length || 0;
                                        const percentage = votesCast > 0 ? Math.round((girl.votes / votesCast) * 100) : 0;
                                        return (
                                            <div key={girl.userId} className="candidate-result-item">
                                                <div className="candidate-header-info">
                                                    <span className="candidate-name-text" style={{ color: 'white' }}>{girl.name}</span>
                                                    <span className="candidate-percentage accent-girl">{percentage}%</span>
                                                </div>
                                                <div className="results-progress-container">
                                                    <div className="results-progress-bar bg-girl" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No girl candidates in this election.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Recent Activity Card */}
                    <div className="card full-width">
                        <div className="card-header">
                            <h2 className="card-title">Recent Activity</h2>
                        </div>
                        <div className="activity-table-container">
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Election Title</th>
                                        <th className="text-right">Date</th>
                                        <th className="text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hasVoted && election ? (
                                        <tr>
                                            <td>{election.title}</td>
                                            <td className="text-right">{new Date(election.startTime).toLocaleDateString()}</td>
                                            <td className="text-right status-text voted">Voted</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                                                No recent voting activity.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
