import React from 'react';
import './Navbar.css';

interface NavbarProps {
    onLoginClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = () => {
    return (
        <nav className="navbar">
            <div className="logo-container">
                <img src="/src/assets/logocea.jpeg" alt="CEA Logo" className="logo-img" />
                <span className="logo-text">College of Engineering Adoor | eVote</span>
            </div>
            <a href="/login" className="btn-login">
                Login
                <span className="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                </span>
            </a>
        </nav>
    );
};

export default Navbar;
