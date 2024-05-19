import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSocketInitialized, setIsSocketInitialized] = useState(false);
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.get('http://localhost:4000/users/validateToken')
                .then(response => {
                    setIsAuthenticated(true);
                    setUser(response.data.user);
                    initializeSocket(response.data.user.username);
                })
                .catch(error => {
                    console.error('Token validation error:', error);
                    logout();
                });
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            initializeSocket(user.username);
        }
    }, [isAuthenticated, user]);

    const initializeSocket = (username) => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        socketRef.current = io('http://localhost:4000', {
            query: { username }
        });

        socketRef.current.on('connect', () => {
            setIsSocketInitialized(true);
            socketRef.current.emit('register', username); // Emit register event
        });

        socketRef.current.on('disconnect', () => {
            setIsSocketInitialized(false);


            console.log('Socket disconnected:', socketRef.current.id);
        });
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:4000/users/login', { email, password });
            setIsAuthenticated(true);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            setAuthError(null);
            initializeSocket(response.data.user.username);
        } catch (error) {
            setAuthError(error.response?.data?.error || 'Login failed');
            console.error('Login error:', error.response?.data?.error);
        }
    };

    const signup = async (email, username, password) => {
        try {
            const response = await axios.post('http://localhost:4000/users/register', { email, username, password });
            setIsAuthenticated(true);
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            setAuthError(null);
            initializeSocket(response.data.user.username);
        } catch (error) {
            setAuthError(error.response?.data?.error || 'Signup failed');
            console.error('Signup error:', error.response?.data?.error);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, signup, logout, socket: socketRef.current, isSocketInitialized, user, authError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
