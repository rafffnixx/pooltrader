import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const About = () => {
    return (
        <>
            <SEO title="About Us - PoolTrader" description="Learn about PoolTrader trading platform" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <div className="mb-8">
                            <Link to="/" className="text-[#00d4aa] hover:text-[#33ddbb] font-medium transition inline-flex items-center gap-2">
                                ← Back to Home
                            </Link>
                        </div>
                        
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-8 card-hover">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-block p-4 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl mb-4 shadow-[0_0_30px_rgba(0,212,170,0.2)]">
                                    <span className="text-4xl">🚀</span>
                                </div>
                                <h1 className="text-4xl font-bold gradient-text">
                                    About PoolTrader
                                </h1>
                                <p className="text-[#a0b4b8] mt-2">
                                    Empowering traders through collective intelligence
                                </p>
                            </div>
                            
                            <div className="space-y-8">
                                {/* Mission Section */}
                                <section>
                                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> Our Mission
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        At PoolTrader, we believe that together we can achieve more. Our mission is to democratize professional trading by allowing individuals to pool their capital and share in the profits of expert trading strategies.
                                    </p>
                                </section>
                                
                                {/* What We Offer */}
                                <section>
                                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> What We Offer
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-[#1c2426] border border-[#2a3538] rounded-xl p-4 card-hover">
                                            <div className="text-2xl mb-2">💰</div>
                                            <h3 className="font-bold text-[#e8f0f0] mb-1">Pooled Trading</h3>
                                            <p className="text-sm text-[#a0b4b8]">Combine capital with other traders for larger positions</p>
                                        </div>
                                        <div className="bg-[#1c2426] border border-[#2a3538] rounded-xl p-4 card-hover">
                                            <div className="text-2xl mb-2">📊</div>
                                            <h3 className="font-bold text-[#e8f0f0] mb-1">Professional Management</h3>
                                            <p className="text-sm text-[#a0b4b8]">Expert traders manage pooled funds</p>
                                        </div>
                                        <div className="bg-[#1c2426] border border-[#2a3538] rounded-xl p-4 card-hover">
                                            <div className="text-2xl mb-2">🔐</div>
                                            <h3 className="font-bold text-[#e8f0f0] mb-1">Full Transparency</h3>
                                            <p className="text-sm text-[#a0b4b8]">Real-time trade viewing and reporting</p>
                                        </div>
                                        <div className="bg-[#1c2426] border border-[#2a3538] rounded-xl p-4 card-hover">
                                            <div className="text-2xl mb-2">🤝</div>
                                            <h3 className="font-bold text-[#e8f0f0] mb-1">Fair Distribution</h3>
                                            <p className="text-sm text-[#a0b4b8]">Profits shared proportionally</p>
                                        </div>
                                    </div>
                                </section>
                                
                                {/* Our Platform */}
                                <section>
                                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> Our Platform
                                    </h2>
                                    <p className="text-[#a0b4b8] mb-3">
                                        PoolTrader provides a secure, user-friendly platform for pooled trading:
                                    </p>
                                    <ul className="space-y-2 text-[#a0b4b8]">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Real-time wallet management
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Automated profit distribution
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Comprehensive trading history
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Admin-verified deposits and withdrawals
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Advanced trade management tools
                                        </li>
                                    </ul>
                                </section>
                                
                                {/* Our Technology */}
                                <section>
                                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> Our Technology
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        Built with cutting-edge technology to ensure reliability and security:
                                    </p>
                                    <ul className="space-y-2 text-[#a0b4b8] mt-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            React frontend with Tailwind CSS
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Node.js backend with Express
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            PostgreSQL database
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            JWT authentication
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Deployed on Vercel and Render
                                        </li>
                                    </ul>
                                </section>
                                
                                {/* Our Values */}
                                <section>
                                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> Our Values
                                    </h2>
                                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                                        <div className="text-center p-4 bg-[#1c2426] rounded-xl border border-[#2a3538] card-hover">
                                            <div className="text-2xl mb-2">🔒</div>
                                            <p className="font-semibold text-[#e8f0f0]">Security First</p>
                                            <p className="text-xs text-[#6a7e82]">Your funds and data are protected</p>
                                        </div>
                                        <div className="text-center p-4 bg-[#1c2426] rounded-xl border border-[#2a3538] card-hover">
                                            <div className="text-2xl mb-2">📈</div>
                                            <p className="font-semibold text-[#e8f0f0]">Transparency</p>
                                            <p className="text-xs text-[#6a7e82]">Real-time visibility into all trades</p>
                                        </div>
                                        <div className="text-center p-4 bg-[#1c2426] rounded-xl border border-[#2a3538] card-hover">
                                            <div className="text-2xl mb-2">🎯</div>
                                            <p className="font-semibold text-[#e8f0f0]">Excellence</p>
                                            <p className="text-xs text-[#6a7e82]">Commitment to quality and performance</p>
                                        </div>
                                    </div>
                                </section>
                                
                                {/* CTA Section */}
                                <section className="bg-gradient-to-r from-[#00d4aa]/10 to-[#00b894]/10 border border-[#00d4aa]/20 rounded-xl p-6 card-hover">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0] mb-3">Join Our Community</h2>
                                    <p className="text-[#a0b4b8] mb-4">
                                        Thousands of traders have already joined PoolTrader. Start your journey today and experience the power of collective trading.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <Link to="/register" className="btn btn-primary">
                                            Create Account
                                        </Link>
                                        <Link to="/contact" className="btn btn-outline">
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