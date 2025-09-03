// emailxp/frontend/src/pages/LandingPage.js

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header'; // Import the common public Header
import {
  BarChart2,
  Users,
  MailOpen,
  Bot,
  Sparkles,
  Gauge,
  CheckCircle,
  XCircle,
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from 'lucide-react';

function LandingPage() {
    const [openFaqId, setOpenFaqId] = useState(null);
    const faqContentRefs = useRef({});
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    // eslint-disable-next-line no-unused-vars
    const toggleFaq = (id) => { // Added ESLint disable directive here
        setOpenFaqId(prevId => (prevId === id ? null : id));
    };

    useEffect(() => {
        Object.keys(faqContentRefs.current).forEach(id => {
            const contentElement = faqContentRefs.current[id];
            if (contentElement) {
                if (id === openFaqId) {
                    contentElement.style.maxHeight = `${contentElement.scrollHeight}px`;
                    contentElement.style.paddingBottom = '1rem';
                } else {
                    contentElement.style.maxHeight = '0px';
                    contentElement.style.paddingBottom = '0';
                }
            }
        });
    }, [openFaqId]);

    // Functions to handle button clicks with authentication check
    const handleLiveDemoClick = () => {
        console.log('Live Demo not implemented yet.');
    };
    const handleLearnMoreClick = () => {
        console.log('Learn More not implemented yet.');
    };
    const handleGetStartedFreeClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };
    const handleGetStartedStarterClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };
    const handleGetStartedProClick = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };
    const handleContactSalesClick = () => {
        console.log('Contact Sales not implemented yet.');
    };
    const handleViewDemoClick = () => {
        console.log('View Demo not implemented yet.');
    };
    const handleSocialClick = (platform) => {
        console.log(`${platform} link not implemented yet.`);
    };
    const handleLegalClick = (policy) => {
        console.log(`${policy} policy not implemented yet.`);
    };
    const handleSolutionClick = (solution) => {
        console.log(`${solution} solution not implemented yet.`);
    };
    const handleCompanyClick = (page) => {
        console.log(`${page} page not implemented yet.`);
    };

    return (
        <div className="antialiased font-sans bg-light-cream">
            {/* RENDER THE COMMON PUBLIC HEADER HERE */}
            <Header />

            <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-dark-gray mb-6">
                        Powerful Email Marketing <span className="block">Made Simple</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto md:mx-0">
                        Our powerful, easy-to-use email marketing platform helps you connect with your audience, grow your business, and achieve your marketing goals with ease.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                        <button onClick={handleLiveDemoClick} className="bg-primary-red text-white px-8 py-3 rounded-lg shadow-lg hover:bg-custom-red-hover transition duration-300 text-lg font-semibold">Live Demo</button>
                        <button onClick={handleLearnMoreClick} className="bg-white text-primary-red border border-primary-red px-8 py-3 rounded-lg shadow-lg hover:bg-lighter-red transition duration-300 text-lg font-semibold">Learn More</button>
                    </div>
                </div>
                <div className="md:w-1/2 flex justify-center md:justify-end">
                    <img
                        src="/images/laptop.jpg"
                        alt="Email Marketing on Laptop"
                        className="rounded-xl shadow-2xl max-w-full h-auto"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0E0E0/ADADAD?text=Laptop+Image'; }}
                    />
                </div>
            </section>

            <section className="bg-light-cream py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Everything you need to succeed with email marketing</h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        Powerful, easy-to-use email marketing platform helps you connect with your audience, grow your business, and achieve your marketing goals with ease.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-md text-left">
                            <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                                <BarChart2 className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-dark-gray mb-2">Campaign Guide</h3>
                            <p className="text-gray-600">
                                Our powerful, easy-to-use email marketing platform helps you connect with your audience.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-left">
                            <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                                <Users className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-dark-gray mb-2">Audience Segmentation</h3>
                            <p className="text-gray-600">
                                Our powerful, easy-to-use email marketing platform helps you connect with your audience.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-left">
                            <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                                <MailOpen className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-dark-gray mb-2">Email Templates</h3>
                            <p className="text-gray-600">
                                Our powerful, easy-to-use email marketing platform helps you connect with your audience.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-left">
                            <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                                <Bot className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-dark-gray mb-2">Automation Workflows</h3>
                            <p className="text-gray-600">
                                Our powerful, easy-to-use email marketing platform helps you connect with your audience.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-left">
                            <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                                <Sparkles className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-dark-gray mb-2">A/B Testing</h3>
                            <p className="text-gray-600">
                                Our powerful, easy-to-use email marketing platform helps you connect with your audience.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md text-left">
                            <div className="w-12 h-12 bg-primary-red rounded-full flex items-center justify-center mb-4">
                                <Gauge className="text-white text-xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-dark-gray mb-2">Performance Analytics</h3>
                            <p className="text-gray-600">
                                Our powerful, easy-to-use email marketing platform helps you connect with your audience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-gray mb-4">Choose the right plan for your needs</h2>
                    <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                        We have different plans to suit your needs, whether you're a small business or a large enterprise.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Free Plan */}
                        <div className="bg-light-cream p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold text-dark-gray mb-4">Free</h3>
                            <p className="text-lg text-gray-600 mb-2">For individuals and small teams</p>
                            <div className="text-5xl font-bold text-primary-red mb-6">$0<span className="text-xl text-gray-500">/mo</span></div>
                            <ul className="text-gray-700 space-y-2 mb-8 text-left w-full">
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> 500 subscribers</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Basic email templates</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Limited analytics</li>
                                <li className="flex items-center"><XCircle className="text-gray-400 mr-2 h-5 w-5" /> No automation</li>
                            </ul>
                            <button onClick={handleGetStartedFreeClick} className="bg-primary-red text-white px-8 py-3 rounded-lg shadow-lg hover:bg-custom-red-hover transition duration-300 text-lg font-semibold w-full">
                                {user ? 'Go to Dashboard' : 'Get Started'}
                            </button>
                        </div>

                        {/* Starter Plan */}
                        <div className="bg-light-cream p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold text-dark-gray mb-4">Starter</h3>
                            <p className="text-lg text-gray-600 mb-2">For growing businesses</p>
                            <div className="text-5xl font-bold text-primary-red mb-6">$10<span className="text-xl text-gray-500">/mo</span></div>
                            <ul className="text-gray-700 space-y-2 mb-8 text-left w-full">
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> 5,000 subscribers</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> All basic features</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Advanced analytics</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Basic automation</li>
                            </ul>
                            <button onClick={handleGetStartedStarterClick} className="bg-primary-red text-white px-8 py-3 rounded-lg shadow-lg hover:bg-custom-red-hover transition duration-300 text-lg font-semibold w-full">
                                {user ? 'Go to Dashboard' : 'Get Started'}
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-light-cream p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold text-dark-gray mb-4">Pro</h3>
                            <p className="text-lg text-gray-600 mb-2">For professional marketers</p>
                            <div className="text-5xl font-bold text-primary-red mb-6">$20<span className="text-xl text-gray-500">/mo</span></div>
                            <ul className="text-gray-700 space-y-2 mb-8 text-left w-full">
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> 25,000 subscribers</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> All starter features</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> A/B testing</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Advanced automation</li>
                            </ul>
                            <button onClick={handleGetStartedProClick} className="bg-primary-red text-white px-8 py-3 rounded-lg shadow-lg hover:bg-custom-red-hover transition duration-300 text-lg font-semibold w-full">
                                {user ? 'Go to Dashboard' : 'Get Started'}
                            </button>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-light-cream p-6 rounded-xl shadow-md flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold text-dark-gray mb-4">Enterprise</h3>
                            <p className="text-lg text-gray-600 mb-2">For large organizations</p>
                            <div className="text-5xl font-bold text-primary-red mb-6">$30<span className="text-xl text-gray-500">/mo</span></div>
                            <ul className="text-gray-700 space-y-2 mb-8 text-left w-full">
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Unlimited subscribers</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> All pro features</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Dedicated support</li>
                                <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 h-5 w-5" /> Custom integrations</li>
                            </ul>
                            <button onClick={handleContactSalesClick} className="bg-primary-red text-white px-8 py-3 rounded-lg shadow-lg hover:bg-custom-red-hover transition duration-300 text-lg font-semibold w-full">Contact Sales</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-primary-red py-16 md:py-24 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to grow your business with EmailXP?</h2>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        {user ? (
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="bg-white text-primary-red px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-lg font-semibold"
                            >
                                Go to Dashboard
                            </button>
                        ) : (
                            <Link to="/register" className="bg-white text-primary-red px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-lg font-semibold">Sign Up Now</Link>
                        )}
                        <button onClick={handleViewDemoClick} className="border border-white text-white px-8 py-3 rounded-lg shadow-lg hover:bg-white hover:text-primary-red transition duration-300 text-lg font-semibold">View Demo</button>
                    </div>
                </div>
            </section>

            <footer className="bg-white py-12">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-600">
                    <div>
                        <div className="text-2xl font-bold text-dark-gray mb-4">EmailXP</div>
                        <p className="mb-4">© {new Date().getFullYear()} EmailXP. All rights reserved.</p>
                        <div className="flex space-x-4">
                            <button onClick={() => handleSocialClick('Twitter')} className="text-gray-500 hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer"><Twitter className="text-xl" /></button>
                            <button onClick={() => handleSocialClick('Facebook')} className="text-gray-500 hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer"><Facebook className="text-xl" /></button>
                            <button onClick={() => handleSocialClick('Instagram')} className="text-gray-500 hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer"><Instagram className="text-xl" /></button>
                            <button onClick={() => handleSocialClick('LinkedIn')} className="text-gray-500 hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer"><Linkedin className="text-xl" /></button>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-gray mb-4">Solutions</h4>
                        <ul className="space-y-2">
                            <li><button onClick={() => handleSolutionClick('Email Marketing')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Email Marketing</button></li>
                            <li><button onClick={() => handleSolutionClick('Automation')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Automation</button></li>
                            <li><button onClick={() => handleSolutionClick('Analytics')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Analytics</button></li>
                            <li><button onClick={() => handleSolutionClick('Templates')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Templates</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-gray mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><button onClick={() => handleCompanyClick('About Us')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">About Us</button></li>
                            <li><button onClick={() => handleCompanyClick('Careers')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Careers</button></li>
                            <li><button onClick={() => handleCompanyClick('Blog')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Blog</button></li>
                            <li><button onClick={() => handleCompanyClick('Contact')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Contact</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-dark-gray mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><button onClick={() => handleLegalClick('Privacy Policy')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Privacy Policy</button></li>
                            <li><button onClick={() => handleLegalClick('Terms of Service')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Terms of Service</button></li>
                            <li><button onClick={() => handleLegalClick('Cookie Policy')} className="hover:text-primary-red transition duration-300 bg-transparent border-none p-0 cursor-pointer text-left">Cookie Policy</button></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
