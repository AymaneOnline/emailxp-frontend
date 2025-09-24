import React, { useState, useEffect, useRef } from 'react';
import { H1, H2, H3, H4, Body, Small, Muted } from '../components/ui/Typography';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import {
    Mail,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Twitter,
    Facebook,
    Instagram
} from 'lucide-react';

function LandingPage() {
    const [openFaqId, setOpenFaqId] = useState(null);
    const faqContentRefs = useRef({});
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const toggleFaq = (id) => {
        setOpenFaqId(prevId => (prevId === id ? null : id));
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            Object.keys(faqContentRefs.current).forEach(id => {
                const contentElement = faqContentRefs.current[id];
                if (contentElement) {
                    if (parseInt(id) === openFaqId) {
                        contentElement.style.maxHeight = `${contentElement.scrollHeight}px`;
                        contentElement.style.opacity = '1';
                    } else {
                        contentElement.style.maxHeight = '0';
                        contentElement.style.opacity = '0';
                    }
                }
            });
        });
    }, [openFaqId]);

    // Functions to handle button clicks with authentication check
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
    const handleSolutionClick = (solution) => {
        console.log(`${solution} solution not implemented yet.`);
    };
    const handleCompanyClick = (page) => {
        console.log(`${page} page not implemented yet.`);
    };

    return (
        <div className="antialiased font-sans bg-white">
            <Header />

            <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2 text-center md:text-left">
                        <H1 className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">Powerful Email Marketing<br /><span className="text-red-500">Made Simple</span></H1>
                        <Body className="text-lg text-gray-600 mb-8">Create, send, and analyze email campaigns that engage your audience and drive results, all from one intuitive platform.</Body>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <button onClick={handleGetStartedFreeClick} className="bg-red-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-600 transition duration-300">
                                Sign up free →
                            </button>
                            <button onClick={handleViewDemoClick} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-200 transition duration-300">
                                View demo
                            </button>
                        </div>
                    </div>
                    <div className="md:w-1/2 flex justify-center md:justify-end">
                        <img
                            src="/images/laptop.jpg"
                            alt="Email Marketing Platform Interface"
                            className="w-full rounded-lg shadow-2xl"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/E0E0E0/ADADAD?text=Laptop+Image'; }}
                        />
                    </div>
                </div>
            </section>

            <section id="features" className="bg-amber-50 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <Muted className="text-red-500 mb-2 inline-block">Features</Muted>
                        <H2 className="text-3xl md:text-4xl mb-4">Everything you need to succeed with email marketing</H2>
                        <Body className="text-lg text-gray-600 max-w-2xl mx-auto">Powerful features designed to make your email marketing effortless and effective.</Body>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Campaign Builder',
                                description: 'Create beautiful emails with our drag and drop editor. No coding required!'
                            },
                            {
                                title: 'Automation',
                                description: 'Set up triggers and workflows to automate your email marketing.'
                            },
                            {
                                title: 'Analytics',
                                description: 'Track performance with detailed analytics and reporting.'
                            },
                            {
                                title: 'List Management',
                                description: 'Organize and segment your subscribers effectively.'
                            },
                            {
                                title: 'Templates',
                                description: 'Choose from hundreds of professionally designed templates.'
                            },
                            {
                                title: 'A/B Testing',
                                description: 'Test different versions to optimize your campaigns.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="w-12 h-12 mb-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <Mail className="text-red-500 w-5 h-5" />
                                    </div>
                                </div>
                                <H3 className="text-lg mb-2">{feature.title}</H3>
                                <Small className="text-gray-600 mb-0">{feature.description}</Small>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="pricing" className="py-16 md:py-24 bg-amber-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <Muted className="text-red-500 mb-2 inline-block">Pricing</Muted>
                    <H2 className="text-3xl md:text-4xl mb-4">Choose the right plan for your needs</H2>
                    <Body className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">No hidden fees. All plans include core features. Upgrade or downgrade anytime.</Body>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                title: 'Free',
                                description: 'Get started with the basics',
                                price: '0',
                                features: [
                                    'Up to 500 subscribers',
                                    'Basic templates',
                                    'Community support'
                                ]
                            },
                            {
                                title: 'Starter',
                                description: 'Perfect for small businesses',
                                price: '29',
                                features: [
                                    'Up to 2,500 subscribers',
                                    'All templates',
                                    'Email support'
                                ]
                            },
                            {
                                title: 'Professional',
                                description: 'For growing businesses',
                                price: '59',
                                features: [
                                    'Up to 10,000 subscribers',
                                    'Advanced automation',
                                    'Priority support'
                                ]
                            },
                            {
                                title: 'Enterprise',
                                description: 'Custom solutions for large teams',
                                price: '299',
                                features: [
                                    'Unlimited subscribers',
                                    'Custom features',
                                    'Dedicated support'
                                ]
                            }
                        ].map((plan, i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                <H3 className="text-xl mb-2">{plan.title}</H3>
                                <Small className="text-gray-600 mb-4">{plan.description}</Small>
                                <div className="text-3xl font-bold text-gray-900 mb-4">
                                    ${plan.price}<span className="text-gray-500 text-lg">/month</span>
                                </div>
                                <ul className="text-gray-600 space-y-3 mb-8">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className="flex items-center">
                                            <CheckCircle className="text-red-500 w-4 h-4 mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => {
                                        if (plan.title === 'Free') handleGetStartedFreeClick();
                                        else if (plan.title === 'Starter') handleGetStartedStarterClick();
                                        else if (plan.title === 'Professional') handleGetStartedProClick();
                                        else handleContactSalesClick();
                                    }}
                                    className="w-full bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300"
                                >
                                    {plan.title === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="faq" className="bg-white py-16 md:py-24">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <Muted className="text-red-500 mb-2 inline-block">FAQ</Muted>
                        <H2 className="text-3xl md:text-4xl mb-4">Frequently asked questions</H2>
                        <Body className="text-lg text-gray-600">Find answers to common questions about EmailXP.</Body>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            {
                                id: 1,
                                question: "What is EmailXP?",
                                answer: "EmailXP is a comprehensive email marketing platform that helps businesses create, send, track campaign creation, performance tracking, and automation to enhance your email marketing efforts."
                            },
                            {
                                id: 2,
                                question: "How much does EmailXP cost?",
                                answer: "We offer a range of plans to suit different needs. Our free plan includes core features and supports up to 500 subscribers. Paid plans are available for growing businesses with advanced needs."
                            },
                            {
                                id: 3,
                                question: "Do I need technical skills to use EmailXP?",
                                answer: "No, EmailXP is designed to be user-friendly and intuitive. Our drag-and-drop editor and templates make it easy to create professional emails without any coding knowledge."
                            },
                            {
                                id: 4,
                                question: "Can I import my existing subscribers?",
                                answer: "Yes, you can easily import your existing subscriber lists into EmailXP. We support various file formats and provide tools to help ensure compliance with email marketing regulations."
                            }
                        ].map(faq => (
                            <div key={faq.id} className="bg-amber-50 rounded-lg overflow-hidden">
                                <button
                                    className="w-full px-6 py-4 text-left flex justify-between items-center transition duration-200"
                                    onClick={() => toggleFaq(faq.id)}
                                >
                                    <H4 className="text-base font-semibold text-gray-900 mb-0">{faq.question}</H4>
                                    {openFaqId === faq.id ? (
                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                </button>
                                <div 
                                    ref={(el) => (faqContentRefs.current[faq.id] = el)}
                                    className="overflow-hidden transition-all duration-300 ease-in-out bg-white"
                                    style={{ maxHeight: 0 }}
                                >
                                    <div className="px-6 py-4">
                                        <Small className="text-gray-600 mb-0">{faq.answer}</Small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-red-500 py-16 md:py-24 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <H2 className="text-3xl md:text-4xl mb-4">Ready to get started with EmailXP?</H2>
                    <Body className="text-lg opacity-90 mb-8">Join thousands of marketers who are growing their business with EmailXP.</Body>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={handleGetStartedFreeClick} className="bg-white text-red-500 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300">
                            Start for free
                        </button>
                        <button onClick={handleContactSalesClick} className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-red-500 transition duration-300">
                            Contact sales
                        </button>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <H3 className="text-2xl mb-4">Email<span className="text-red-500">XP</span></H3>
                            <Small className="text-gray-400 mb-4">Powerful email marketing platform</Small>
                            <div className="flex space-x-4">
                                <button onClick={() => handleSocialClick('Facebook')} className="text-gray-400 hover:text-white transition duration-300">
                                    <Facebook className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleSocialClick('Twitter')} className="text-gray-400 hover:text-white transition duration-300">
                                    <Twitter className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleSocialClick('Instagram')} className="text-gray-400 hover:text-white transition duration-300">
                                    <Instagram className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><button onClick={() => handleSolutionClick('Features')} className="text-gray-400 hover:text-white transition duration-300">Features</button></li>
                                <li><button onClick={() => handleSolutionClick('Help Center')} className="text-gray-400 hover:text-white transition duration-300">Help Center</button></li>
                                <li><button onClick={() => handleSolutionClick('Pricing')} className="text-gray-400 hover:text-white transition duration-300">Pricing</button></li>
                                <li><button onClick={() => handleSolutionClick('Resources')} className="text-gray-400 hover:text-white transition duration-300">Resources</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                <li><button onClick={() => handleCompanyClick('Blog')} className="text-gray-400 hover:text-white transition duration-300">Blog</button></li>
                                <li><button onClick={() => handleCompanyClick('Help Center')} className="text-gray-400 hover:text-white transition duration-300">Help Center</button></li>
                                <li><button onClick={() => handleCompanyClick('FAQs')} className="text-gray-400 hover:text-white transition duration-300">FAQs</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><button onClick={() => handleCompanyClick('About')} className="text-gray-400 hover:text-white transition duration-300">About</button></li>
                                <li><button onClick={() => handleCompanyClick('Contact')} className="text-gray-400 hover:text-white transition duration-300">Contact</button></li>
                                <li><button onClick={() => handleCompanyClick('Terms')} className="text-gray-400 hover:text-white transition duration-300">Terms</button></li>
                                <li><button onClick={() => handleCompanyClick('Privacy')} className="text-gray-400 hover:text-white transition duration-300">Privacy</button></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <Small className="text-gray-400 mb-4 md:mb-0">© 2025 EmailXP. All rights reserved.</Small>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                />
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 text-sm">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;