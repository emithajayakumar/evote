import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';
import './VotingPage.css';

interface Candidate {
    userId: string;
    name: string;
    avatar?: string;
}

interface ElectionData {
    id: string;
    title: string;
    boyCandidates: Candidate[];
    girlCandidates: Candidate[];
}

const VotingPage: React.FC = () => {
    const [election, setElection] = useState<ElectionData | null>(null);
    const [selectedBoy, setSelectedBoy] = useState<string | null>(null);
    const [selectedGirl, setSelectedGirl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Loading ballot...');
    const [isVotingOpen, setIsVotingOpen] = useState(false);

    useEffect(() => {
        const fetchElection = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/elections/active');
                if (response.ok) {
                    const data = await response.json();
                    setElection({
                        id: data.election._id,
                        title: data.election.title,
                        boyCandidates: data.election.boyCandidates || [],
                        girlCandidates: data.election.girlCandidates || []
                    });
                    setIsVotingOpen(data.isVotingOpen);
                    setStatusMessage(data.statusMessage);
                } else {
                    const data = await response.json();
                    setStatusMessage(data.message || 'No active election at this time.');
                }
            } catch (error) {
                setStatusMessage('Could not connect to the election server.');
            }
        };
        fetchElection();
    }, []);

    const handleVoteSubmit = async () => {
        if (!selectedBoy || !selectedGirl) {
            alert('Please select one boy and one girl representative.');
            return;
        }

        if (!election) return;

        setIsSubmitting(true);

        try {
            // Grab the user ID from the login session
            const userId = localStorage.getItem('userId');

            if (!userId) {
                alert("You must be logged in to vote. Please log in again.");
                window.location.href = '/login';
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(`http://localhost:5000/auth/vote/${election.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    selectedBoy,
                    selectedGirl
                })
            });

            const data = await response.json();

            if (response.ok) {
                const boyHash = data.auditTrail?.boyTxHash;
                const girlHash = data.auditTrail?.girlTxHash;

                let successMsg = 'Your vote has been cast successfully!\n\nBlockchain Audit Trail:';
                if (boyHash) successMsg += `\nBoy Rep TX: ${boyHash.slice(0, 10)}...${boyHash.slice(-10)}`;
                if (girlHash) successMsg += `\nGirl Rep TX: ${girlHash.slice(0, 10)}...${girlHash.slice(-10)}`;

                alert(successMsg);
                window.location.href = '/student-dashboard';
            } else {
                alert(`Error: ${data.message}`);
                setIsSubmitting(false);
            }
        } catch (error) {
            alert('Could not connect to the server');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>Cast Your Vote</h1>
                        <p>{election ? election.title : 'No Election Selected'}</p>
                    </div>
                </header>

                <section className="voting-section">
                    <div className="election-info-card">
                        <div className="info-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                        </div>
                        <div className="info-text">
                            <h3>Voting Instructions</h3>
                            <p>You must select exactly <strong>one male</strong> and <strong>one female</strong> representative to submit your vote.</p>
                        </div>
                    </div>

                    <div className="candidates-container">
                        {/* Male Representatives */}
                        <div className="category-group">
                            <h2 className="category-title">
                                Boy Representative
                                <span className="count-badge">{selectedBoy ? '1/1' : '0/1'}</span>
                            </h2>
                            <div className="candidates-grid">
                                {election && election.boyCandidates && election.boyCandidates.map(boy => (
                                    <div
                                        key={boy.userId}
                                        className={`candidate-card ${selectedBoy === boy.userId ? 'selected' : ''}`}
                                        onClick={() => setSelectedBoy(boy.userId)}
                                    >
                                        <div className="card-selection-indicator">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        {boy.avatar ? (
                                            <div className="candidate-avatar">
                                                {boy.avatar}
                                            </div>
                                        ) : (
                                            <img src="/src/assets/profile.png" alt={boy.name} className="candidate-img" />
                                        )}
                                        <div className="candidate-info">
                                            <h3 className="candidate-name">{boy.name}</h3>
                                            <p className="candidate-dept">ID: {boy.userId}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Female Representatives */}
                        <div className="category-group">
                            <h2 className="category-title">
                                Girl Representative
                                <span className="count-badge">{selectedGirl ? '1/1' : '0/1'}</span>
                            </h2>
                            <div className="candidates-grid">
                                {election && election.girlCandidates && election.girlCandidates.map(girl => (
                                    <div
                                        key={girl.userId}
                                        className={`candidate-card ${selectedGirl === girl.userId ? 'selected' : ''}`}
                                        onClick={() => setSelectedGirl(girl.userId)}
                                    >
                                        <div className="card-selection-indicator">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        {girl.avatar ? (
                                            <div className="candidate-avatar">
                                                {girl.avatar}
                                            </div>
                                        ) : (
                                            <img src="/src/assets/profile.png" alt={girl.name} className="candidate-img" />
                                        )}
                                        <div className="candidate-info">
                                            <h3 className="candidate-name">{girl.name}</h3>
                                            <p className="candidate-dept">ID: {girl.userId}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="voting-footer">
                        <button
                            className="btn btn-primary submit-vote-btn"
                            onClick={handleVoteSubmit}
                            disabled={!selectedBoy || !selectedGirl || isSubmitting || !isVotingOpen}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="spinner"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Submit Final Vote
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                </>
                            )}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default VotingPage;
