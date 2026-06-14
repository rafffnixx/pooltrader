import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Simulate email sending (integrate with actual email API in production)
        setTimeout(() => {
            toast.success('Message sent! We will respond within 24-48 hours.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setSubmitting(false);
        }, 1500);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <>
            <SEO title="Contact Us - PoolTrader" description="Contact PoolTrader support team" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <Link to="/" className="text-blue-600 hover:text-blue-700">← Back to Home</Link>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Contact Form */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                                </p>
                                
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Subject *</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="What is this regarding?"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Message *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="Please provide details about your inquiry..."
                                        />
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            </div>
                            
                            {/* Contact Information */}
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">📧</div>
                                            <div>
                                                <p className="font-semibold">Email</p>
                                                <p className="text-gray-600 dark:text-gray-400">support@pooltrader.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">💬</div>
                                            <div>
                                                <p className="font-semibold">Response Time</p>
                                                <p className="text-gray-600 dark:text-gray-400">24-48 hours</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">🌐</div>
                                            <div>
                                                <p className="font-semibold">Website</p>
                                                <p className="text-gray-600 dark:text-gray-400">https://pooltrader.vercel.app</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold mb-4">Support Hours</h2>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Monday - Friday</span>
                                            <span className="font-semibold">9:00 AM - 6:00 PM (EST)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Saturday</span>
                                            <span className="font-semibold">10:00 AM - 4:00 PM (EST)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Sunday</span>
                                            <span className="font-semibold">Closed</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold mb-3">Quick Links</h2>
                                    <div className="space-y-2">
                                        <Link to="/faq" className="block text-blue-600 hover:text-blue-700">FAQ</Link>
                                        <Link to="/privacy" className="block text-blue-600 hover:text-blue-700">Privacy Policy</Link>
                                        <Link to="/terms" className="block text-blue-600 hover:text-blue-700">Terms of Service</Link>
                                        <Link to="/about" className="block text-blue-600 hover:text-blue-700">About Us</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;