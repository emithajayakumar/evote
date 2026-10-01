import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const AdminDashboard: React.FC = () => {
    const [adminName, setAdminName] = useState<string>('Administrator');
    const [adminRole, setAdminRole] = useState<string>('System Admin');
    const [isElectionActive, setIsElectionActive] = useState(false);
    const [electionTitle, setElectionTitle] = useState('');
    const [totalVotesCast, setTotalVotesCast] = useState(0);
    const [totalEligibleVoters, setTotalEligibleVoters] = useState(0);
    const [boyCandidates, setBoyCandidates] = useState<any[]>([]);
    const [girlCandidates, setGirlCandidates] = useState<any[]>([]);

    useEffect(() => {
        const fetchAdminData = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const response = await fetch(`http://localhost:5000/auth/find-user/${userId}?t=${Date.now()}`);
                    if (response.ok) {
                        const data = await response.json();
                        setAdminName(data.name || 'Administrator');
                        setAdminRole(data.role || 'Administrator');
                    }
                } catch (error) {
                    console.error('Failed to fetch admin data:', error);
                }
            }
        };

        const fetchDashboardData = async () => {
            try {
                // Fetch registered students count
                const studentsRes = await fetch(`http://localhost:5000/auth/registered-students?t=${Date.now()}`);
                if (studentsRes.ok) {
                    const studentsData = await studentsRes.json();
                    setTotalEligibleVoters(studentsData.length);
                }

                // Fetch active election details
                const electionRes = await fetch(`http://localhost:5000/auth/elections/active?t=${Date.now()}`);
                if (electionRes.ok) {
                    const data = await electionRes.json();
                    setIsElectionActive(data.isVotingOpen);
                    if (data.isVotingOpen && data.election) {
                        setElectionTitle(data.election.title);
                        setTotalVotesCast(data.election.votedBy?.length || 0);
                        setBoyCandidates(data.election.boyCandidates || []);
                        setGirlCandidates(data.election.girlCandidates || []);
                    } else {
                        setBoyCandidates([]);
                        setGirlCandidates([]);
                    }
                }
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            }
        };

        fetchAdminData();
        fetchDashboardData();

        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleEndVoting = async () => {
        if (!window.confirm('Are you sure you want to end the voting session immediately? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/elections/end', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert('Voting session ended successfully.');
                setIsElectionActive(false);
                setElectionTitle('');
                // If you want to clear stats upon ending, you could uncomment these:
                // setTotalVotesCast(0);
                // setBoyCandidates([]);
                // setGirlCandidates([]);
            } else {
                const data = await response.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Failed to end voting:', error);
            alert('Failed to connect to the server.');
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>Admin Dashboard</h1>
                        <p>Overview of voting system status</p>
                    </div>

                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{adminName}</span>
                            <span className="user-role">{adminRole}</span>
                        </div>
                        <img src="/src/assets/profile.png" alt="Profile" className="profile-img" />
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Live Election Banner (Conditional) */}
                    {isElectionActive && (
                        <div className="card full-width" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="stat-status online" style={{ padding: '0.5rem', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '50%' }}>
                                        <div className="status-dot" style={{ margin: 0 }}></div>
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Voting is LIVE</h2>
                                        <p style={{ color: '#93c5fd', fontSize: '0.9rem' }}>{electionTitle}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Voting Controls Card */}
                    <div className="card featured-card">
                        <div className="card-header">
                            <h2 className="card-title">Voting Controls</h2>
                        </div>
                        <div className="action-buttons-group">
                            <Link to="/voting-setup" className="btn-admin-action primary" style={{ pointerEvents: isElectionActive ? 'none' : 'auto', opacity: isElectionActive ? 0.5 : 1 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
                                {isElectionActive ? 'Session in Progress' : 'Start Voting Session'}
                            </Link>
                            <button
                                className="btn-admin-action danger"
                                disabled={!isElectionActive}
                                style={{ opacity: isElectionActive ? 1 : 0.5 }}
                                onClick={handleEndVoting}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><rect x="9" y="9" width="6" height="6" /></svg>
                                End Voting
                            </button>
                        </div>
                    </div>

                    {/* Total Votes Stat Card */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Total Votes Cast</h2>
                        </div>
                        <div className="stat-main">
                            <span className="stat-value-large">{totalVotesCast}</span>
                        </div>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${totalEligibleVoters > 0 ? (totalVotesCast / totalEligibleVoters) * 100 : 0}%` }}></div>
                        </div>
                        <p className="stat-footer-text">
                            {totalEligibleVoters > 0 ? Math.round((totalVotesCast / totalEligibleVoters) * 100) : 0}% Participation Rate
                        </p>
                    </div>

                    {/* Active Voters Card (Now Total Eligible Voters) */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Total Eligible Voters</h2>
                        </div>
                        <div className="stat-main">
                            <span className="stat-value-large">{totalEligibleVoters}</span>
                            <div className="stat-status online">
                                <div className="status-dot"></div>
                                System Ready
                            </div>
                        </div>
                        <div className="tag-container">
                            <Link to="/user-management" className="tag info" style={{ textDecoration: 'none' }}>Manage Voters</Link>
                        </div>
                    </div>

                    {/* Live Election Results Card */}
                    {isElectionActive ? (
                        <div className="card full-width">
                            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 className="card-title">Live Election Results</h2>
                                <span className="badge-live">Live Updates</span>
                            </div>

                            <div className="results-grid">
                                {/* Boy Representative Results */}
                                <div>
                                    <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accent-boy"><path d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" /><path d="M18 22H6l1-10h10l1 10z" /></svg>
                                        Boy Class Representative
                                    </h3>

                                    {boyCandidates.sort((a, b) => b.votes - a.votes).map((candidate: any) => {
                                        const percentage = totalVotesCast > 0 ? Math.round((candidate.votes / totalVotesCast) * 100) : 0;
                                        return (
                                            <div key={candidate.userId} className="candidate-result-item">
                                                <div className="candidate-header-info">
                                                    <span className="candidate-name-text">{candidate.name || candidate.userId}</span>
                                                    <span className="candidate-percentage accent-boy">{percentage}% ({candidate.votes} votes)</span>
                                                </div>
                                                <div className="results-progress-container">
                                                    <div className="results-progress-bar bg-boy" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {boyCandidates.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No boy candidates found.</p>}
                                </div>

                                {/* Girl Representative Results */}
                                <div>
                                    <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="accent-girl"><circle cx="12" cy="7" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /></svg>
                                        Girl Class Representative
                                    </h3>

                                    {girlCandidates.sort((a, b) => b.votes - a.votes).map((candidate: any) => {
                                        const percentage = totalVotesCast > 0 ? Math.round((candidate.votes / totalVotesCast) * 100) : 0;
                                        return (
                                            <div key={candidate.userId} className="candidate-result-item">
                                                <div className="candidate-header-info">
                                                    <span className="candidate-name-text">{candidate.name || candidate.userId}</span>
                                                    <span className="candidate-percentage accent-girl">{percentage}% ({candidate.votes} votes)</span>
                                                </div>
                                                <div className="results-progress-container">
                                                    <div className="results-progress-bar bg-girl" style={{ width: `${percentage}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {girlCandidates.length === 0 && <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No girl candidates found.</p>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card full-width" style={{ textAlign: 'center', padding: '3rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            <h2 className="card-title" style={{ color: 'var(--text-dim)' }}>No Active Election</h2>
                            <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>Results will appear here once an election session is launched from the Voting Setup page.</p>
                        </div>
                    )}
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .action-buttons-group {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                    margin-top: 1rem;
                }
                .btn-admin-action {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1.25rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.3s;
                    text-decoration: none;
                    border: none;
                    cursor: pointer;
                }
                .btn-admin-action.primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4);
                }
                .btn-admin-action.danger {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.4);
                }
                .btn-admin-action:hover {
                    transform: translateY(-2px);
                    filter: brightness(1.1);
                }
                .stat-main {
                    margin: 1.5rem 0;
                }
                .stat-value-large {
                    font-size: 3rem;
                    font-weight: 800;
                    color: white;
                    display: block;
                    line-height: 1;
                }
                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.85rem;
                    margin-top: 0.5rem;
                    font-weight: 600;
                }
                .stat-trend.positive { color: #4ade80; }
                .progress-container {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    margin: 1.5rem 0 0.5rem;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    background: var(--primary-color);
                    border-radius: 4px;
                }
                .stat-footer-text {
                    font-size: 0.85rem;
                    color: var(--text-dim);
                }
                .stat-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    margin-top: 0.5rem;
                    font-weight: 600;
                }
                .stat-status.online { color: #4ade80; }
                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: #4ade80;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #4ade80;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.4; }
                    50% { opacity: 1; }
                    100% { opacity: 0.4; }
                }
                .tag-container {
                    display: flex;
                    gap: 0.75rem;
                    margin-top: 1.5rem;
                }
                .tag {
                    padding: 0.4rem 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    border-radius: 6px;
                    border: 1px solid transparent;
                }
                .tag.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; border-color: rgba(34, 197, 94, 0.2); }
                .tag.info { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }
            `}} />
        </div>
    );
};

export default AdminDashboard;
