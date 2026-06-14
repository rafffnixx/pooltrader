import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <>
            <SEO title="About Us - PoolTrader" description="Learn about PoolTrader trading platform" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                                    <span className="text-4xl">🚀</span>
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    About PoolTrader
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Empowering traders through collective intelligence
                                </p>
                            </div>
                            
                            <div className="space-y-8">
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        At PoolTrader, we believe that together we can achieve more. Our mission is to democratize professional trading by allowing individuals to pool their capital and share in the profits of expert trading strategies.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">What We Offer</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                            <div className="text-2xl mb-2">💰</div>
                                            <h3 className="font-bold mb-1">Pooled Trading</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Combine capital with other traders for larger positions</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                            <div className="text-2xl mb-2">📊</div>
                                            <h3 className="font-bold mb-1">Professional Management</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Expert traders manage pooled funds</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                            <div className="text-2xl mb-2">🔐</div>
                                            <h3 className="font-bold mb-1">Full Transparency</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Real-time trade viewing and reporting</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                            <div className="text-2xl mb-2">🤝</div>
                                            <h3 className="font-bold mb-1">Fair Distribution</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Profits shared proportionally</p>
                                        </div>
                                    </div>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">Our Platform</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                        PoolTrader provides a secure, user-friendly platform for pooled trading:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                                        <li>Real-time wallet management</li>
                                        <li>Automated profit distribution</li>
                                        <li>Comprehensive trading history</li>
                                        <li>Admin-verified deposits and withdrawals</li>
                                        <li>Advanced trade management tools</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">Our Technology</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Built with cutting-edge technology to ensure reliability and security:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 mt-2 space-y-2">
                                        <li>React frontend with Tailwind CSS</li>
                                        <li>Node.js backend with Express</li>
                                        <li>PostgreSQL database</li>
                                        <li>JWT authentication</li>
                                        <li>Deployed on Vercel and Render</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">Our Values</h2>
                                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                                        <div className="text-center p-4">
                                            <div className="text-2xl mb-2">🔒</div>
                                            <p className="font-semibold">Security First</p>
                                            <p className="text-xs text-gray-500">Your funds and data are protected</p>
                                        </div>
                                        <div className="text-center p-4">
                                            <div className="text-2xl mb-2">📈</div>
                                            <p className="font-semibold">Transparency</p>
                                            <p className="text-xs text-gray-500">Real-time visibility into all trades</p>
                                        </div>
                                        <div className="text-center p-4">
                                            <div className="text-2xl mb-2">🎯</div>
                                            <p className="font-semibold">Excellence</p>
                                            <p className="text-xs text-gray-500">Commitment to quality and performance</p>
                                        </div>
                                    </div>
                                </section>
                                
                                <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
                                    <h2 className="text-2xl font-bold mb-3">Join Our Community</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Thousands of traders have already joined PoolTrader. Start your journey today and experience the power of collective trading.
                                    </p>
                                    <div className="flex gap-4">
                                        <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                                            Create Account
                                        </Link>
                                        <Link to="/contact" className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
                                            Contact Us
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;