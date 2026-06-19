import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "What is PoolTrader?",
            answer: "PoolTrader is a trading pool platform where multiple investors can pool their capital together for professional trading. Profits and losses are distributed proportionally based on contribution amounts."
        },
        {
            question: "How do I get started?",
            answer: "Simply create an account, make a deposit to your wallet, then choose an active pool to invest in. Your funds will be allocated to the pool and you'll start earning profits proportionally."
        },
        {
            question: "What are the minimum and maximum investments?",
            answer: "Minimum investment varies by pool but typically starts at $500. Maximum investment is also pool-dependent, usually up to $50,000 per pool."
        },
        {
            question: "How are profits distributed?",
            answer: "Profits are distributed based on your percentage of the total pool. For example, if you contributed 10% of the pool, you receive 10% of the profits, minus the management fee."
        },
        {
            question: "What is the management fee?",
            answer: "The management fee is typically 20% of profits. This fee is automatically deducted before profit distribution."
        },
        {
            question: "How long does it take to withdraw funds?",
            answer: "Withdrawal requests are processed within 24-48 hours after admin approval. Funds are sent to your chosen payment method."
        },
        {
            question: "Is my money safe?",
            answer: "Yes, we implement industry-standard security measures including SSL encryption, bcrypt password hashing, and secure database connections. Admin verification is required for all deposits and withdrawals."
        },
        {
            question: "Can I withdraw my investment early?",
            answer: "Funds allocated to active pools are locked until the pool ends. You can withdraw your unallocated wallet balance at any time."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept Bank Transfer, USDT (Crypto), and M-Pesa. Payment details are collected during deposit requests."
        },
        {
            question: "How do I reset my password?",
            answer: "Click 'Forgot Password' on the login page, enter your email, and you'll receive a reset link. Follow the instructions to create a new password."
        },
        {
            question: "Is there a mobile app?",
            answer: "PoolTrader is fully responsive and works on all devices through your web browser. A dedicated mobile app is coming soon!"
        },
        {
            question: "How do I contact support?",
            answer: "Use the Contact Us page to send a message. Our support team typically responds within 24-48 hours."
        }
    ];

    return (
        <>
            <SEO title="FAQ - PoolTrader" description="Frequently asked questions about PoolTrader" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-3xl mx-auto">
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
                                    <span className="text-4xl">❓</span>
                                </div>
                                <h1 className="text-3xl font-bold gradient-text">
                                    Frequently Asked Questions
                                </h1>
                                <p className="text-[#a0b4b8] mt-2">
                                    Find answers to common questions about PoolTrader
                                </p>
                            </div>
                            
                            {/* FAQ Accordion */}
                            <div className="space-y-3">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border border-[#2a3538] rounded-xl overflow-hidden card-hover">
                                        <button
                                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                            className={`w-full text-left p-4 transition flex justify-between items-center ${
                                                openIndex === index 
                                                    ? 'bg-[#1c2426] border-b border-[#00d4aa]/30' 
                                                    : 'bg-[#1c2426] hover:bg-[#2a3538]'
                                            }`}
                                        >
                                            <span className={`font-semibold ${openIndex === index ? 'text-[#00d4aa]' : 'text-[#e8f0f0]'}`}>
                                                {faq.question}
                                            </span>
                                            <span className={`text-2xl font-bold transition-transform duration-300 ${
                                                openIndex === index ? 'text-[#00d4aa] rotate-180' : 'text-[#a0b4b8]'
                                            }`}>
                                                {openIndex === index ? '−' : '+'}
                                            </span>
                                        </button>
                                        {openIndex === index && (
                                            <div className="p-4 text-[#a0b4b8] bg-[#161c1e] border-t border-[#2a3538] animate-fade-in">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Bottom CTA */}
                            <div className="mt-8 text-center pt-6 border-t border-[#2a3538]">
                                <p className="text-[#a0b4b8]">
                                    Still have questions?{' '}
                                    <Link to="/contact" className="text-[#00d4aa] hover:text-[#33ddbb] font-medium transition">
                                        Contact us
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FAQ;