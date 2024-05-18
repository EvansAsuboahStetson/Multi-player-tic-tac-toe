import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/authenticated';
import Login from './pages/login';
import Signup from './pages/signup';
import Game from './components/Game';

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
                    <Game />
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
