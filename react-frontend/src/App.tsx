import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import VotingPage from './pages/VotingPage';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import VotingSetup from './pages/VotingSetup';
import OTPVerification from './pages/OTPVerification';
import MyVotes from './pages/MyVotes';
import Profile from './pages/Profile';
import AdminProfile from './pages/AdminProfile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/vote" element={<VotingPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/voting-setup" element={<VotingSetup />} />
        <Route path="/my-votes" element={<MyVotes />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        {/* We will add more routes as we migrate other pages */}
      </Routes>
    </Router>
  );
}

export default App;
