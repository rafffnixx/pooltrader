import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <>
            <SEO title="Privacy Policy - PoolTrader" description="Privacy Policy for PoolTrader trading platform" />
            
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
                                    <span className="text-4xl">🔒</span>
                                </div>
                                <h1 className="text-4xl font-bold gradient-text">
                                    Privacy Policy
                                </h1>
                                <p className="text-[#6a7e82] mt-2">Last updated: June 14, 2024</p>
                            </div>
                            
                            <div className="space-y-6 divide-y divide-[#2a3538]">
                                <section className="pt-4 first:pt-0">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 1. Information We Collect
                                    </h2>
                                    <p className="text-[#a0b4b8] mb-3">
                                        We collect information you provide directly to us, such as when you create an account, make a deposit, or request a withdrawal. This includes:
                                    </p>
                                    <ul className="space-y-2 text-[#a0b4b8]">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Personal information (name, email address)
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Account credentials (password - stored securely with encryption)
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Transaction history and wallet balances
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Payment method information
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Communication preferences
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 2. How We Use Your Information
                                    </h2>
                                    <ul className="space-y-2 text-[#a0b4b8]">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To provide and maintain our trading platform services
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To process your deposits and withdrawals
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To calculate and distribute trading profits
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To communicate with you about your account
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To comply with legal and regulatory requirements
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To detect and prevent fraud
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 3. Data Security
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        We implement industry-standard security measures to protect your personal information:
                                    </p>
                                    <ul className="space-y-2 text-[#a0b4b8] mt-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            All passwords are hashed using bcrypt encryption
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            SSL/TLS encryption for all data transmission
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Regular security audits and updates
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Secure database with access controls
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            JWT tokens for API authentication
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 4. Information Sharing
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        We do not sell, trade, or rent your personal information to third parties. We may share information only:
                                    </p>
                                    <ul className="space-y-2 text-[#a0b4b8] mt-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            With your explicit consent
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To comply with legal obligations
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            To protect our rights and safety
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            With service providers who assist our operations
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 5. Your Rights
                                    </h2>
                                    <p className="text-[#a0b4b8]">You have the right to:</p>
                                    <ul className="space-y-2 text-[#a0b4b8] mt-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Access your personal information
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Correct inaccurate information
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Request deletion of your account
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Opt-out of marketing communications
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Export your transaction history
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 6. Cookies and Tracking
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        We use cookies and similar technologies to enhance your experience, analyze usage, and improve our platform. You can control cookie settings through your browser preferences.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 7. Children's Privacy
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        Our platform is not intended for persons under 18 years of age. We do not knowingly collect personal information from minors.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 8. Changes to This Policy
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 9. Contact Us
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        If you have questions about this Privacy Policy, please contact us at:
                                    </p>
                                    <p className="text-[#a0b4b8] mt-2">
                                        <span className="text-[#00d4aa]">Email:</span> privacy@pooltrader.com<br />
                                        <span className="text-[#00d4aa]">Address:</span> PoolTrader Platform<br />
                                        <span className="text-[#00d4aa]">Support:</span> https://pooltrader.vercel.app/contact
                                    </p>
                                </section>
                            </div>
                            
                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-[#2a3538] text-center">
                                <p className="text-sm text-[#6a7e82]">
                                    By using PoolTrader, you agree to this Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Privacy;