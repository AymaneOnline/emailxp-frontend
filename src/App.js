// emailxp/frontend/src/App.js

import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ListManagement from './pages/ListManagement';
import CampaignManagement from './pages/CampaignManagement';
import TemplateManagement from './pages/TemplateManagement';
import TemplateForm from './pages/TemplateForm';
import TemplateView from './pages/TemplateView';
import CampaignForm from './pages/CampaignForm';
import CampaignDetails from './pages/CampaignDetails';
import SubscriberManagement from './pages/SubscriberManagement';
import ListForm from './pages/ListForm';
import SubscriberForm from './pages/SubscriberForm'; // <--- NEW IMPORT

import './App.css';

function App() {
    const [backendMessage, setBackendMessage] = useState('');
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetch('https://emailxp-backend-production.up.railway.app')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => setBackendMessage(data))
            .catch(err => {
                console.error('Error fetching backend:', err);
                setError(`Failed to connect to backend: ${err.message}. Is the backend server running at http://localhost:5000/?`);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="App">
            <header className="App-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#282c34', color: 'white' }}>
                <h1 style={{ margin: 0 }}>Email Marketing App</h1>
                <nav>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex' }}>
                        {!user ? (
                            <>
                                <li style={{ marginLeft: '20px' }}><Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link></li>
                                <li style={{ marginLeft: '20px' }}><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></li>
                            </>
                        ) : (
                            <>
                                <li style={{ marginLeft: '20px' }}><span style={{ color: 'white' }}>Welcome, {user.name}!</span></li>
                                <li style={{ marginLeft: '20px' }}><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li>
                                <li style={{ marginLeft: '20px' }}><Link to="/lists" style={{ color: 'white', textDecoration: 'none' }}>Lists</Link></li>
                                <li style={{ marginLeft: '20px' }}><Link to="/campaigns" style={{ color: 'white', textDecoration: 'none' }}>Campaigns</Link></li>
                                <li style={{ marginLeft: '20px' }}><Link to="/templates" style={{ color: 'white', textDecoration: 'none' }}>Templates</Link></li>
                                <li style={{ marginLeft: '20px' }}><button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>Logout</button></li>
                            </>
                        )}
                    </ul>
                </nav>
            </header>

            <main style={{ padding: '20px' }}>
                <p>Backend Status: {backendMessage || (error || 'Connecting...')}</p>

                <Routes>
                    <Route path="/register" element={<Register setUser={setUser} />} />
                    <Route path="/login" element={<Login setUser={setUser} />} />
                    <Route
                        path="/"
                        element={
                            user ? (
                                <div>
                                    <h2>Dashboard</h2>
                                    <p>This is your personalized dashboard.</p>
                                    <p>You are logged in as: {user.email}</p>
                                    <p>Go to <Link to="/lists">Email Lists</Link> to manage your subscribers.</p>
                                    <p>Go to <Link to="/campaigns">Email Campaigns</Link> to create and manage your emails.</p>
                                    <p>Go to <Link to="/templates">Email Templates</Link> to create and manage your templates.</p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <h2>Welcome!</h2>
                                    <p>Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to continue.</p>
                                </div>
                            )
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            user ? (
                                <div>
                                    <h3>Your Email Marketing Dashboard</h3>
                                    <p>Here you can manage your email lists and campaigns.</p>
                                    <p>Go to <Link to="/lists">Email Lists</Link> to get started!</p>
                                    <p>Go to <Link to="/campaigns">Email Campaigns</Link> to create and manage your emails.</p>
                                    <p>Go to <Link to="/templates">Email Templates</Link> to create and manage your templates.</p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to view this page.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />
                    <Route path="/lists" element={user ? <ListManagement /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to view your lists.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/new" element={user ? <ListForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to create a list.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/edit/:id" element={user ? <ListForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to edit a list.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/:listId/subscribers" element={user ? <SubscriberManagement /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to view subscribers.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/:listId/subscribers/new" element={user ? <SubscriberForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to add subscribers.</p><Link to="/login">Go to Login</Link></div>} /> {/* <--- NEW ROUTE */}
                    <Route path="/lists/:listId/subscribers/edit/:subscriberId" element={user ? <SubscriberForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to edit subscribers.</p><Link to="/login">Go to Login</Link></div>} /> {/* <--- NEW ROUTE (for future use) */}


                    {/* Campaign Routes */}
                    <Route
                        path="/campaigns"
                        element={
                            user ? (
                                <CampaignManagement />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to view your campaigns.</p><Link to="/login">Go to Login</Link></div>
                            )
                        }
                    />
                    <Route
                        path="/campaigns/new"
                        element={
                            user ? (
                                <CampaignForm />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to create a campaign.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />
                    <Route
                        path="/campaigns/edit/:id"
                        element={
                            user ? (
                                <CampaignForm />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to edit a campaign.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />
                    <Route
                        path="/campaigns/:id"
                        element={
                            user ? (
                                <CampaignDetails />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to view campaign details.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />


                    {/* Template Routes */}
                    <Route
                        path="/templates"
                        element={
                            user ? (
                                <TemplateManagement />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to view your templates.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />
                    <Route
                        path="/templates/new"
                        element={
                            user ? (
                                <TemplateForm />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to create a template.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />
                    <Route
                        path="/templates/edit/:id"
                        element={
                            user ? (
                                <TemplateForm />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to edit a template.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />
                    <Route
                        path="/templates/:id"
                        element={
                            user ? (
                                <TemplateView />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px'}}><p>You need to be logged in to view this template.</p><Link to="/login">Go to Login</Link></div>
                            )
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;