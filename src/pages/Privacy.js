import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Privacy = () => {
    return (
        <>
            <SEO title="Privacy Policy - PoolTrader" description="Privacy Policy for PoolTrader trading platform" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Privacy Policy
                            </h1>
                            <p className="text-gray-500 mb-8">Last updated: June 14, 2024</p>
                            
                            <div className="space-y-6">
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">1. Information We Collect</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                                        We collect information you provide directly to us, such as when you create an account, make a deposit, or request a withdrawal. This includes:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                                        <li>Personal information (name, email address)</li>
                                        <li>Account credentials (password - stored securely with encryption)</li>
                                        <li>Transaction history and wallet balances</li>
                                        <li>Payment method information</li>
                                        <li>Communication preferences</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">2. How We Use Your Information</h2>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                                        <li>To provide and maintain our trading platform services</li>
                                        <li>To process your deposits and withdrawals</li>
                                        <li>To calculate and distribute trading profits</li>
                                        <li>To communicate with you about your account</li>
                                        <li>To comply with legal and regulatory requirements</li>
                                        <li>To detect and prevent fraud</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">3. Data Security</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We implement industry-standard security measures to protect your personal information:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 mt-2 space-y-2">
                                        <li>All passwords are hashed using bcrypt encryption</li>
                                        <li>SSL/TLS encryption for all data transmission</li>
                                        <li>Regular security audits and updates</li>
                                        <li>Secure database with access controls</li>
                                        <li>JWT tokens for API authentication</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">4. Information Sharing</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We do not sell, trade, or rent your personal information to third parties. We may share information only:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 mt-2 space-y-2">
                                        <li>With your explicit consent</li>
                                        <li>To comply with legal obligations</li>
                                        <li>To protect our rights and safety</li>
                                        <li>With service providers who assist our operations</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">5. Your Rights</h2>
                                    <p className="text-gray-600 dark:text-gray-400">You have the right to:</p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 mt-2 space-y-2">
                                        <li>Access your personal information</li>
                                        <li>Correct inaccurate information</li>
                                        <li>Request deletion of your account</li>
                                        <li>Opt-out of marketing communications</li>
                                        <li>Export your transaction history</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">6. Cookies and Tracking</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We use cookies and similar technologies to enhance your experience, analyze usage, and improve our platform. You can control cookie settings through your browser preferences.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">7. Children's Privacy</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Our platform is not intended for persons under 18 years of age. We do not knowingly collect personal information from minors.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">8. Changes to This Policy</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">9. Contact Us</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        If you have questions about this Privacy Policy, please contact us at:
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        Email: privacy@pooltrader.com<br />
                                        Address: PoolTrader Platform<br />
                                        Support: https://pooltrader.vercel.app/contact
                                    </p>
                                </section>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t dark:border-gray-700 text-center">
                                <p className="text-sm text-gray-500">
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