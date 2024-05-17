import React, { useState } from 'react';
import { useAuth } from '../context/authenticated';
import './Login.css'; // Use the same styling as the login page

const Signup = () => {
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(email, username, password);
            setSuccess('User registered successfully!');
            setError('');
        } catch (err) {
            setError(err.message);
            setSuccess('');
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
                <button className="signup-button" type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Signup;
