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
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8">
                            <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                                    <span className="text-4xl">❓</span>
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Frequently Asked Questions
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Find answers to common questions about PoolTrader
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="border dark:border-gray-700 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                            className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition flex justify-between items-center"
                                        >
                                            <span className="font-semibold">{faq.question}</span>
                                            <span className="text-xl">{openIndex === index ? '−' : '+'}</span>
                                        </button>
                                        {openIndex === index && (
                                            <div className="p-4 text-gray-600 dark:text-gray-400 border-t dark:border-gray-700">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 text-center pt-6 border-t dark:border-gray-700">
                                <p className="text-gray-600 dark:text-gray-400">
                                    Still have questions? <Link to="/contact" className="text-blue-600 hover:text-blue-700">Contact us</Link>
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