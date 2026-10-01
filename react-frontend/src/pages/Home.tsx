import React from 'react';
import Navbar from '../components/Navbar';
import './Home.css';

const Home: React.FC = () => {
    return (
        <div className="home-container">
            <Navbar />

            <section className="hero">
                <div className="overlay"></div>
                <div className="hero-content">
                    <div className="badge">Secure • Transparent • Digital</div>
                    <h1>The Future of <br /><span>Campus Democracy</span></h1>
                    <p>
                        Secure, transparent, and efficient digital voting system for the
                        College of Engineering Adoor. Your voice matters, make it count.
                    </p>
                    <div className="hero-buttons">
                        <a href="/login" className="btn-primary">
                            Cast Your Vote
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </a>
                    </div>
                </div>
            </section>

            <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>
        </div>
    );
};

export default Home;
