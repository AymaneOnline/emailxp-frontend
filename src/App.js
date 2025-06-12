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
import SubscriberForm from './pages/SubscriberForm';
import AnalyticsDashboard from './components/AnalyticsDashboard'; // Keep this import

import './App.css';

function App() {
    const [backendMessage, setBackendMessage] = useState('');
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); // Managed locally
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Keep your backend connection check
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
                                {/* CHANGE THIS LINK: Point to the root '/' or keep it as '/dashboard' as an alias */}
                                <li style={{ marginLeft: '20px' }}><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li> {/* <--- UPDATED DASHBOARD LINK */}
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

                    {/* --- CHANGE START: Make AnalyticsDashboard the default logged-in view --- */}
                    <Route
                        path="/"
                        element={
                            user ? (
                                <AnalyticsDashboard user={user} /> // Now renders the AnalyticsDashboard
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <h2>Welcome!</h2>
                                    <p>Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to continue.</p>
                                </div>
                            )
                        }
                    />
                    {/* --- CHANGE END --- */}

                    {/* The /dashboard route can now be removed or kept as an alias if you wish.
                        For simplicity, I'll remove it here as it's redundant if '/' is the dashboard.
                        If you want '/dashboard' to still work as an alternative path, keep it.
                        For now, removing it makes '/' the single canonical path for the dashboard.
                    */}
                    {/* REMOVED:
                    <Route
                        path="/dashboard"
                        element={
                            user ? (
                                <AnalyticsDashboard user={user} />
                            ) : (
                                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                                    <p>You need to be logged in to view the analytics dashboard.</p>
                                    <Link to="/login">Go to Login</Link>
                                </div>
                            )
                        }
                    />
                    */}

                    <Route path="/lists" element={user ? <ListManagement /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to view your lists.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/new" element={user ? <ListForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to create a list.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/edit/:id" element={user ? <ListForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to edit a list.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/:listId/subscribers" element={user ? <SubscriberManagement /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to view subscribers.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/:listId/subscribers/new" element={user ? <SubscriberForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to add subscribers.</p><Link to="/login">Go to Login</Link></div>} />
                    <Route path="/lists/:listId/subscribers/edit/:subscriberId" element={user ? <SubscriberForm /> : <div style={{ textAlign: 'center', marginTop: '50px' }}><p>You need to be logged in to edit subscribers.</p><Link to="/login">Go to Login</Link></div>} />


                    {/* Campaign Routes (no change needed here) */}
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


                    {/* Template Routes (no change needed here) */}
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