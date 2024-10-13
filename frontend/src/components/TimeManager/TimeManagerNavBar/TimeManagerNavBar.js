import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import './TimeManagerNavBar.css';

const TimeManagerNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to get current location
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const [menuOpen, setMenuOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [activeSection, setActiveSection] = useState(location.pathname); // Track active section

    useEffect(() => {
        setActiveSection(location.pathname); // Update active section on route change
    }, [location.pathname]);


    const toggleMenu = () => {
        setMenuOpen(prevMenuOpen => !prevMenuOpen);
    };

    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <div>
            <AppBar position="static">
                <Toolbar className="main-page-container">
                    <Button 
                        color="inherit" 
                        onClick={() => navigate('/timemanager/planning')} 
                        className={`main-button ${activeSection === '/timemanager/planning' ? 'active' : ''}`}>
                        Planning
                    </Button>
                    <Button 
                        color="inherit" 
                        onClick={() => navigate('/timemanager/add-activity')} 
                        className={`main-button ${activeSection === '/timemanager/add-activity' ? 'active' : ''}`}>
                        Tracking
                    </Button>
                    <Button 
                        color="inherit" 
                        onClick={() => navigate('/timemanager/activities')} 
                        className={`main-button ${activeSection === '/timemanager/activities' ? 'active' : ''}`}>
                        Evaluating
                    </Button>
                </Toolbar>
            </AppBar>
                <Outlet />
        </div>
    );
};

export default TimeManagerNavBar;