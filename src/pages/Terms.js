import React from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Terms = () => {
    return (
        <>
            <SEO title="Terms of Service - PoolTrader" description="Terms of Service for PoolTrader trading platform" />
            
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
                                    <span className="text-4xl">📋</span>
                                </div>
                                <h1 className="text-4xl font-bold gradient-text">
                                    Terms of Service
                                </h1>
                                <p className="text-[#6a7e82] mt-2">Effective Date: June 14, 2024</p>
                            </div>
                            
                            <div className="space-y-6 divide-y divide-[#2a3538]">
                                <section className="pt-4 first:pt-0">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 1. Acceptance of Terms
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        By accessing or using PoolTrader platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 2. Eligibility
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        You must be at least 18 years old to use our platform. By using PoolTrader, you represent that you meet this requirement and have the legal capacity to enter into these terms.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 3. Account Registration
                                    </h2>
                                    <ul className="space-y-2 text-[#a0b4b8]">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Provide accurate and complete information
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Maintain the security of your account credentials
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Notify us immediately of any unauthorized access
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            You are responsible for all activities under your account
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            We reserve the right to suspend or terminate accounts
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 4. Investment Risks
                                    </h2>
                                    <div className="bg-[#1c2426] border-l-4 border-[#ff6b6b] p-4 mb-4 rounded-lg">
                                        <p className="font-bold text-[#ff6b6b]">⚠️ Risk Warning</p>
                                        <p className="text-sm text-[#a0b4b8] mt-1">
                                            Trading involves substantial risk of loss. Past performance does not guarantee future results. You should never invest money you cannot afford to lose.
                                        </p>
                                    </div>
                                    <p className="text-[#a0b4b8]">
                                        You acknowledge and accept that:
                                    </p>
                                    <ul className="space-y-2 text-[#a0b4b8] mt-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            All investments carry risk of loss
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Market conditions can change rapidly
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Past performance does not indicate future results
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            You are solely responsible for your investment decisions
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            We do not provide financial advice
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 5. Pool Contributions
                                    </h2>
                                    <ul className="space-y-2 text-[#a0b4b8]">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Minimum and maximum contribution limits apply per pool
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Funds are allocated from your wallet balance
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Contributions are final once confirmed
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Profits are distributed according to pool terms
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Management fees may apply (as specified per pool)
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 6. Deposits and Withdrawals
                                    </h2>
                                    <ul className="space-y-2 text-[#a0b4b8]">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Deposits are confirmed after admin verification
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Withdrawal requests are processed within 24-48 hours
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Minimum withdrawal amount is $10
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Fees may apply for certain payment methods
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            We reserve the right to verify transactions
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 7. Prohibited Activities
                                    </h2>
                                    <p className="text-[#a0b4b8]">You agree not to:</p>
                                    <ul className="space-y-2 text-[#a0b4b8] mt-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Use the platform for illegal purposes
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Manipulate or interfere with trading operations
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Attempt to hack or bypass security measures
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Create multiple accounts or impersonate others
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#00d4aa]">▸</span>
                                            Engage in any fraudulent activity
                                        </li>
                                    </ul>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 8. Termination
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        We may terminate or suspend your account immediately, without prior notice, for conduct that violates these Terms or is harmful to other users or our platform.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 9. Limitation of Liability
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        To the maximum extent permitted by law, PoolTrader shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our platform.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 10. Changes to Terms
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 11. Governing Law
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        These terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                                    </p>
                                </section>
                                
                                <section className="pt-4">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-3 flex items-center gap-2">
                                        <span className="text-[#00d4aa]">●</span> 12. Contact Information
                                    </h2>
                                    <p className="text-[#a0b4b8]">
                                        For questions about these Terms, please contact us at:<br />
                                        <span className="text-[#00d4aa]">Email:</span> legal@pooltrader.com<br />
                                        <span className="text-[#00d4aa]">Platform:</span> https://pooltrader.vercel.app
                                    </p>
                                </section>
                            </div>
                            
                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-[#2a3538] text-center">
                                <p className="text-sm text-[#6a7e82]">
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