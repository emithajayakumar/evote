const API_URL = 'http://localhost:5000/auth';

export const registerUser = async (name: string, userId: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId, email, password }),
    });
    return response.json();
};

export const generateOtp = async (userId: string) => {
    const response = await fetch(`${API_URL}/otpgeneration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    return response.json();
};

export const verifyOtp = async (userId: string, otp: string) => {
    const response = await fetch(`${API_URL}/otpverfy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
    });
    return response.json();
};
