import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

interface Candidate {
    id: string; // This will map to userId from backend
    name: string;
    dept: string; // We'll use a placeholder or part of email if dept isn't available
    avatar: string;
    color: string;
}

const VotingSetup: React.FC = () => {
    const navigate = useNavigate();
    const [electionTitle, setElectionTitle] = useState('Student Council Election 2024');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Search states
    const [boySearch, setBoySearch] = useState('');
    const [girlSearch, setGirlSearch] = useState('');
    const [boySearchResult, setBoySearchResult] = useState<Candidate | null>(null);
    const [girlSearchResult, setGirlSearchResult] = useState<Candidate | null>(null);
    const [isSearchingBoy, setIsSearchingBoy] = useState(false);
    const [isSearchingGirl, setIsSearchingGirl] = useState(false);
    const [searchErrorBoy, setSearchErrorBoy] = useState('');
    const [searchErrorGirl, setSearchErrorGirl] = useState('');

    // Selection states (restricted to arrays of Candidates now)
    const [selectedBoys, setSelectedBoys] = useState<Candidate[]>([]);
    const [selectedGirls, setSelectedGirls] = useState<Candidate[]>([]);

    const handleSearch = async (userId: string, gender: 'boy' | 'girl') => {
        if (!userId) return;

        const setSearching = gender === 'boy' ? setIsSearchingBoy : setIsSearchingGirl;
        const setError = gender === 'boy' ? setSearchErrorBoy : setSearchErrorGirl;
        const setResult = gender === 'boy' ? setBoySearchResult : setGirlSearchResult;

        setSearching(true);
        setError('');
        setResult(null);

        if (!userId.toUpperCase().startsWith('ADR')) {
            setError('Only Student IDs starting with ADR are allowed.');
            setSearching(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/auth/find-user/${userId.toUpperCase()}`);
            const data = await response.json();

            if (response.ok) {
                const candidate: Candidate = {
                    id: data.userId,
                    name: data.name,
                    dept: data.userId.startsWith('ADR') ? 'College of Engineering' : 'KTU Student',
                    avatar: data.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
                    color: gender === 'boy' ? 'var(--primary-color)' : '#ec4899'
                };
                setResult(candidate);
            } else {
                setError(data.message || 'User not found');
            }
        } catch (_err) {
            setError('Connection error');
        } finally {
            setSearching(false);
        }
    };

    const handleLaunch = async () => {
        if (selectedBoys.length === 0 || selectedGirls.length === 0) {
            alert('Please select at least one boy and one girl candidate.');
            return;
        }
        if (!startTime || !endTime) {
            alert('Please set both a start time and an end time for the voting session.');
            return;
        }
        if (new Date(endTime) <= new Date(startTime)) {
            alert('End time must be after start time.');
            return;
        }

        try {
            // Send the exact local datetime strings from the inputs (e.g. "2024-03-07T16:50").
            // Along with it, send the timezone offset of the browser so the server knows exactly when this is in UTC.
            const offsetMinutes = new Date().getTimezoneOffset(); // e.g. -330 for IST

            const response = await fetch('http://localhost:5000/auth/elections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: electionTitle,
                    startTime,
                    endTime,
                    timezoneOffset: offsetMinutes,
                    boyCandidates: selectedBoys.map(boy => ({
                        userId: boy.id,
                        name: boy.name,
                        avatar: boy.avatar
                    })),
                    girlCandidates: selectedGirls.map(girl => ({
                        userId: girl.id,
                        name: girl.name,
                        avatar: girl.avatar
                    }))
                })
            });

            if (response.ok) {
                alert('Election session launched successfully!');
                navigate('/admin-dashboard');
            } else {
                const data = await response.json();
                alert(`Error: ${data.message || 'Could not launch election'}`);
            }
        } catch (error) {
            alert('Could not connect to the server');
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>Setup Voting Session</h1>
                        <p>Configure candidates and session details</p>
                    </div>
                </header>

                <div className="voting-setup-content">
                    {/* Session Details */}
                    <div className="card full-width">
                        <div className="card-header">
                            <h2 className="card-title">1. Session Details</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: '2 1 280px' }}>
                                <label>Election Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={electionTitle}
                                    onChange={(e) => setElectionTitle(e.target.value)}
                                    placeholder="e.g. Student Council 2024"
                                />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label>Voting Starts At</label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label>Voting Ends At</label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Boy Candidate Selection */}
                    <div className="card full-width">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title">2A. Select Boy Candidate</h2>
                            <span className="selection-count">Status: <strong>{selectedBoys.length} Selected</strong></span>
                        </div>

                        <div className="selection-layout">
                            {/* Available */}
                            <div className="selection-box">
                                <h4 className="selection-subtitle">Search Boys</h4>
                                <div className="search-input-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <input
                                        type="text"
                                        placeholder="Enter Student ID (ADR/KTU)..."
                                        value={boySearch}
                                        onChange={(e) => setBoySearch(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(boySearch, 'boy')}
                                    />
                                    <button
                                        onClick={() => handleSearch(boySearch, 'boy')}
                                        style={{ position: 'absolute', right: '10px', background: 'var(--primary-color)', border: 'none', borderRadius: '4px', color: 'white', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
                                    >
                                        Search
                                    </button>
                                </div>

                                <div className="candidate-list-scrollable" style={{ minHeight: '100px', justifyContent: 'center' }}>
                                    {isSearchingBoy ? (
                                        <div className="empty-state-sm">Searching database...</div>
                                    ) : searchErrorBoy ? (
                                        <div className="empty-state-sm" style={{ color: '#ef4444' }}>{searchErrorBoy}</div>
                                    ) : boySearchResult ? (
                                        <div className="candidate-item-row">
                                            <div className="candidate-item-info">
                                                <div className="avatar-sm" style={{ backgroundColor: boySearchResult.color }}>{boySearchResult.avatar}</div>
                                                <div>
                                                    <div className="name">{boySearchResult.name}</div>
                                                    <div className="dept">{boySearchResult.id}</div>
                                                </div>
                                            </div>
                                            <button className="btn-add-action" onClick={() => {
                                                if (!selectedBoys.find(b => b.id === boySearchResult.id)) {
                                                    setSelectedBoys([...selectedBoys, boySearchResult]);
                                                }
                                                setBoySearchResult(null);
                                                setBoySearch('');
                                            }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="empty-state-sm">Enter ID and press search</div>
                                    )}
                                </div>
                            </div>

                            {/* Ballot */}
                            <div className="selection-box ballot-box">
                                <h4 className="selection-subtitle">Final Ballot (Boy Candidates)</h4>
                                <div className="candidate-list-scrollable" style={{ minHeight: '100px', justifyContent: 'flex-start' }}>
                                    {selectedBoys.length === 0 ? (
                                        <div className="empty-state-md">No candidates selected</div>
                                    ) : (
                                        selectedBoys.map(boy => (
                                            <div key={boy.id} className="candidate-item-row selected">
                                                <div className="candidate-item-info">
                                                    <div className="avatar-sm" style={{ backgroundColor: boy.color }}>{boy.avatar}</div>
                                                    <div>
                                                        <div className="name">{boy.name}</div>
                                                        <div className="dept">{boy.id}</div>
                                                    </div>
                                                </div>
                                                <button className="btn-remove-action" onClick={() => setSelectedBoys(selectedBoys.filter(b => b.id !== boy.id))}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Girl Candidate Selection */}
                    <div className="card full-width">
                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 className="card-title">2B. Select Girl Candidate</h2>
                            <span className="selection-count">Status: <strong>{selectedGirls.length} Selected</strong></span>
                        </div>

                        <div className="selection-layout">
                            {/* Available */}
                            <div className="selection-box">
                                <h4 className="selection-subtitle">Search Girls</h4>
                                <div className="search-input-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                    <input
                                        type="text"
                                        placeholder="Enter Student ID (ADR/KTU)..."
                                        value={girlSearch}
                                        onChange={(e) => setGirlSearch(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(girlSearch, 'girl')}
                                    />
                                    <button
                                        onClick={() => handleSearch(girlSearch, 'girl')}
                                        style={{ position: 'absolute', right: '10px', background: '#ec4899', border: 'none', borderRadius: '4px', color: 'white', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
                                    >
                                        Search
                                    </button>
                                </div>
                                <div className="candidate-list-scrollable" style={{ minHeight: '100px', justifyContent: 'center' }}>
                                    {isSearchingGirl ? (
                                        <div className="empty-state-sm">Searching database...</div>
                                    ) : searchErrorGirl ? (
                                        <div className="empty-state-sm" style={{ color: '#ef4444' }}>{searchErrorGirl}</div>
                                    ) : girlSearchResult ? (
                                        <div className="candidate-item-row">
                                            <div className="candidate-item-info">
                                                <div className="avatar-sm" style={{ backgroundColor: girlSearchResult.color }}>{girlSearchResult.avatar}</div>
                                                <div>
                                                    <div className="name">{girlSearchResult.name}</div>
                                                    <div className="dept">{girlSearchResult.id}</div>
                                                </div>
                                            </div>
                                            <button className="btn-add-action" onClick={() => {
                                                if (!selectedGirls.find(g => g.id === girlSearchResult.id)) {
                                                    setSelectedGirls([...selectedGirls, girlSearchResult]);
                                                }
                                                setGirlSearchResult(null);
                                                setGirlSearch('');
                                            }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="empty-state-sm">Enter ID and press search</div>
                                    )}
                                </div>
                            </div>

                            {/* Ballot */}
                            <div className="selection-box ballot-box">
                                <h4 className="selection-subtitle">Final Ballot (Girl Candidates)</h4>
                                <div className="candidate-list-scrollable" style={{ minHeight: '100px', justifyContent: 'flex-start' }}>
                                    {selectedGirls.length === 0 ? (
                                        <div className="empty-state-md">No candidates selected</div>
                                    ) : (
                                        selectedGirls.map(girl => (
                                            <div key={girl.id} className="candidate-item-row selected">
                                                <div className="candidate-item-info">
                                                    <div className="avatar-sm" style={{ backgroundColor: girl.color }}>{girl.avatar}</div>
                                                    <div>
                                                        <div className="name">{girl.name}</div>
                                                        <div className="dept">{girl.id}</div>
                                                    </div>
                                                </div>
                                                <button className="btn-remove-action" onClick={() => setSelectedGirls(selectedGirls.filter(g => g.id !== girl.id))}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="action-footer-sticky">
                        <Link to="/admin-dashboard" className="btn btn-secondary" style={{ width: 'auto', padding: '1rem 2rem' }}>Cancel</Link>
                        <button className="btn btn-primary" onClick={handleLaunch} style={{ width: 'auto', padding: '1rem 3rem' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            Launch Voting Session
                        </button>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .voting-setup-content {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding-bottom: 6rem;
                }
                .selection-count {
                    font-size: 0.9rem;
                    color: var(--text-dim);
                }
                .selection-count strong { color: var(--accent-color); padding: 0 0.2rem; }

                .selection-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-top: 1.5rem;
                }
                @media (max-width: 900px) {
                    .selection-layout { grid-template-columns: 1fr; }
                }

                .selection-box {
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid var(--border-glass);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .ballot-box {
                    border-color: rgba(59, 130, 246, 0.3);
                    background: rgba(59, 130, 246, 0.05);
                }
                
                .selection-subtitle {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--text-dim);
                    margin: 0;
                }

                .search-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .search-input-wrapper svg {
                    position: absolute;
                    left: 1rem;
                    color: var(--text-dim);
                }
                .search-input-wrapper input {
                    width: 100%;
                    padding: 0.75rem 5rem 0.75rem 2.75rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-glass);
                    border-radius: 0.75rem;
                    color: white;
                    outline: none;
                    font-size: 0.9rem;
                }
                .search-input-wrapper input:focus { border-color: var(--primary-color); }

                .candidate-list-scrollable {
                    max-height: 350px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    padding-right: 0.5rem;
                }
                .candidate-list-scrollable::-webkit-scrollbar { width: 6px; }
                .candidate-list-scrollable::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 3px; }

                .candidate-item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-glass);
                    border-radius: 0.75rem;
                    transition: all 0.2s;
                }
                .candidate-item-row:hover { background: rgba(255, 255, 255, 0.05); }
                .candidate-item-row.selected {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: rgba(59, 130, 246, 0.2);
                }

                .candidate-item-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .candidate-item-info .name { font-weight: 600; font-size: 0.95rem; color: white; }
                .candidate-item-info .dept { font-size: 0.8rem; color: var(--text-dim); }

                .avatar-sm {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: white;
                }

                .btn-add-action, .btn-remove-action {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-add-action { color: var(--primary-color); }
                .btn-add-action:hover { background: rgba(59, 130, 246, 0.1); transform: scale(1.1); }
                .btn-remove-action { color: #ef4444; }
                .btn-remove-action:hover { background: rgba(239, 68, 68, 0.1); transform: scale(1.1); }

                .empty-state-sm, .empty-state-md {
                    text-align: center;
                    color: var(--text-dim);
                    padding: 1rem;
                    font-size: 0.85rem;
                    font-style: italic;
                }
                .empty-state-md { padding: 3rem; }

                .action-footer-sticky {
                    position: fixed;
                    bottom: 0;
                    right: 0;
                    left: 280px; /* Sidebar width */
                    padding: 1.5rem 2rem;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(12px);
                    border-top: 1px solid var(--border-glass);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.5rem;
                    z-index: 100;
                }
                @media (max-width: 1024px) {
                    .action-footer-sticky { left: 0; }
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                    color: var(--text-dim);
                    font-size: 0.9rem;
                }
                .input-field {
                    width: 100%;
                    padding: 1rem;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid var(--border-glass);
                    border-radius: 0.8rem;
                    color: white;
                    outline: none;
                }
                .input-field:focus { border-color: var(--primary-color); }
                `
            }} />
        </div>
    );
};

export default VotingSetup;
