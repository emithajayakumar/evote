import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

interface Student {
    userId: string;
    name: string;
    email: string;
}

const API = 'http://localhost:5000/auth';

const UserManagement: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentid, setStudentid] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [modalError, setModalError] = useState('');

    // Load registered students from DB on mount
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API}/registered-students`);
            if (response.ok) {
                const data = await response.json();
                setStudents(data);
            }
        } catch (err) {
            console.error('Failed to load students:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Are you sure you want to remove this student?')) return;
        try {
            await fetch(`${API}/registered-students/${userId}`, { method: 'DELETE' });
            setStudents(students.filter(s => s.userId !== userId));
        } catch (err) {
            alert('Failed to remove student. Is the server running?');
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentid) return;
        setModalError('');

        if (!studentid.startsWith('ADR')) {
            setModalError('Only Student IDs starting with "ADR" can be added here.');
            return;
        }

        setIsAdding(true);
        try {
            const response = await fetch(`${API}/registered-students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: studentid })
            });
            const data = await response.json();

            if (response.ok) {
                setStudents([...students, data]);
                setStudentid('');
                setIsModalOpen(false);
            } else {
                setModalError(data.message || 'Could not add student.');
            }
        } catch (error) {
            setModalError('Could not connect to the server.');
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>User Management</h1>
                        <p>Manage registered students and voters</p>
                    </div>
                </header>

                <div className="card full-width">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 className="card-title">Registered Students</h2>
                            <p className="card-description">Total: {students.length} Student{students.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: 'auto' }}
                            onClick={() => { setIsModalOpen(true); setModalError(''); setStudentid(''); }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Add Student
                        </button>
                    </div>

                    <div className="activity-table-container">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>Loading students...</div>
                        ) : students.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                                <p style={{ marginBottom: '0.5rem' }}>No students registered yet.</p>
                                <p style={{ fontSize: '0.85rem' }}>Use the "Add Student" button to register a student.</p>
                            </div>
                        ) : (
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Student ID</th>
                                        <th>Full Name</th>
                                        <th>Email Address</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.userId}>
                                            <td style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{s.userId}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="avatar-sm">{s.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                                                    {s.name}
                                                </div>
                                            </td>
                                            <td>{s.email}</td>
                                            <td className="text-right">
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => handleDelete(s.userId)}
                                                    title="Remove Student"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Student</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddStudent}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="studentid">Student ID</label>
                                    <input
                                        type="text"
                                        id="studentid"
                                        placeholder="Enter Student ID (e.g. ADR2024...)"
                                        value={studentid}
                                        onChange={(e) => { setStudentid(e.target.value.toUpperCase()); setModalError(''); }}
                                        required
                                        autoFocus
                                    />
                                </div>
                                {modalError && (
                                    <p style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
                                        ⚠️ {modalError}
                                    </p>
                                )}
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                                    Student name and email will be fetched automatically from the database.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isAdding}>
                                    {isAdding ? 'Adding...' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-color);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }
        .btn-icon.delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        /* Modal Styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }

        .modal {
            background: #1e293b;
            border: 1px solid var(--border-glass);
            border-radius: 1.5rem;
            width: 100%;
            max-width: 450px;
            padding: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
        }

        .close-btn {
            background: transparent;
            border: none;
            color: var(--text-dim);
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
        }

        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--text-dim);
        }

        .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid var(--border-glass);
            border-radius: 0.75rem;
            color: white;
            font-size: 1rem;
            transition: all 0.2s;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
      `}} />
        </div>
    );
};

export default UserManagement;
