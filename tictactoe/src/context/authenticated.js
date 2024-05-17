import React, { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// Create a context for authentication
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth().
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (isAuthenticated && !socket) {
            const newSocket = io('http://localhost:4000');
            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });
            setSocket(newSocket);
        }
    }, [isAuthenticated, socket]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:4000/users/login', { email, password });
            setIsAuthenticated(true);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Error logging in. Please try again.');
        }
    };

    const signup = async (email, username, password) => {
        try {
            const response = await axios.post('http://localhost:4000/users/register', { email, username, password });
            setIsAuthenticated(true);
            return response.data;
        } catch (err) {
            throw new Error(err.response?.data?.error || 'Error registering user. Please try again.');
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, signup, logout, socket }}>
            {children}
        </AuthContext.Provider>
    );
};
