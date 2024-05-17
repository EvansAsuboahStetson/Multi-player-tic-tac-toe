import React, { useState } from 'react';
import './App.css';
import TicTacToe from './components/TicTackMini';

import { AuthProvider, useAuth } from './context/authenticated';
import Login from './pages/login';
import Signup from './pages/signup';


const AppContent = () => {
    const { isAuthenticated, logout } = useAuth();
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="App">
            {isAuthenticated ? (
                <>
                    <button className="logout-button" onClick={logout}>Logout</button>
                    <TicTacToe />
                </>
            ) : (
                <>
                    {isLogin ? <Login /> : <Signup />}
                    <button className="toggle-button" onClick={toggleForm}>
                        {isLogin ? 'Go to Sign Up' : 'Go to Login'}
                    </button>
                </>
            )}
        </div>
    );
};

const App = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;
