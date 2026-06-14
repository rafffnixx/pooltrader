import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <>
            <SEO title="Terms of Service - PoolTrader" description="Terms of Service for PoolTrader trading platform" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Terms of Service
                            </h1>
                            <p className="text-gray-500 mb-8">Effective Date: June 14, 2024</p>
                            
                            <div className="space-y-6">
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">1. Acceptance of Terms</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        By accessing or using PoolTrader platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">2. Eligibility</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        You must be at least 18 years old to use our platform. By using PoolTrader, you represent that you meet this requirement and have the legal capacity to enter into these terms.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">3. Account Registration</h2>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                                        <li>Provide accurate and complete information</li>
                                        <li>Maintain the security of your account credentials</li>
                                        <li>Notify us immediately of any unauthorized access</li>
                                        <li>You are responsible for all activities under your account</li>
                                        <li>We reserve the right to suspend or terminate accounts</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">4. Investment Risks</h2>
                                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4 rounded">
                                        <p className="font-bold text-red-800 dark:text-red-300">⚠️ Risk Warning</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Trading involves substantial risk of loss. Past performance does not guarantee future results. You should never invest money you cannot afford to lose.
                                        </p>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        You acknowledge and accept that:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 mt-2 space-y-2">
                                        <li>All investments carry risk of loss</li>
                                        <li>Market conditions can change rapidly</li>
                                        <li>Past performance does not indicate future results</li>
                                        <li>You are solely responsible for your investment decisions</li>
                                        <li>We do not provide financial advice</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">5. Pool Contributions</h2>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                                        <li>Minimum and maximum contribution limits apply per pool</li>
                                        <li>Funds are allocated from your wallet balance</li>
                                        <li>Contributions are final once confirmed</li>
                                        <li>Profits are distributed according to pool terms</li>
                                        <li>Management fees may apply (as specified per pool)</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">6. Deposits and Withdrawals</h2>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 space-y-2">
                                        <li>Deposits are confirmed after admin verification</li>
                                        <li>Withdrawal requests are processed within 24-48 hours</li>
                                        <li>Minimum withdrawal amount is $10</li>
                                        <li>Fees may apply for certain payment methods</li>
                                        <li>We reserve the right to verify transactions</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">7. Prohibited Activities</h2>
                                    <p className="text-gray-600 dark:text-gray-400">You agree not to:</p>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 ml-4 mt-2 space-y-2">
                                        <li>Use the platform for illegal purposes</li>
                                        <li>Manipulate or interfere with trading operations</li>
                                        <li>Attempt to hack or bypass security measures</li>
                                        <li>Create multiple accounts or impersonate others</li>
                                        <li>Engage in any fraudulent activity</li>
                                    </ul>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">8. Termination</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms or is harmful to other users or our platform.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">9. Limitation of Liability</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        To the maximum extent permitted by law, PoolTrader shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our platform.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">10. Changes to Terms</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">11. Governing Law</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                                    </p>
                                </section>
                                
                                <section>
                                    <h2 className="text-2xl font-bold mb-3">12. Contact Information</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        For questions about these Terms, please contact us at:<br />
                                        Email: legal@pooltrader.com<br />
                                        Platform: https://pooltrader.vercel.app
                                    </p>
                                </section>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t dark:border-gray-700 text-center">
                                <p className="text-sm text-gray-500">
                                    By using PoolTrader, you acknowledge that you have read and agree to these Terms of Service.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Terms;