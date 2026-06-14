import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { getActivePool, getStats, getLeaderboard } from '../services/api';

const Home = () => {
    const [stats, setStats] = useState({
        poolTotal: 0,
        members: 0,
        monthlyPnL: 8.4
    });
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const heroImages = [
        {
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&h=1080&fit=crop",
            title: "Trade Together. Win Together.",
            subtitle: "Join a community of successful traders"
        },
        {
            image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1920&h=1080&fit=crop",
            title: "Professional Trading Management",
            subtitle: "Expert traders managing your capital"
        },
        {
            image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1920&h=1080&fit=crop",
            title: "Full Transparency",
            subtitle: "See every trade in real-time"
        }
    ];

    const [currentHero, setCurrentHero] = useState(0);

useEffect(() => {
    const interval = setInterval(() => {
        setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
}, [heroImages.length]); // Add heroImages.length to dependency array

    const fetchData = async () => {
        try {
            const poolData = await getActivePool();
            const statsData = await getStats();
            const leaderboardData = await getLeaderboard();

            if (poolData.success && poolData.pool) {
                setStats(prev => ({
                    ...prev,
                    poolTotal: poolData.pool.current_total,
                    members: statsData.stats?.users || 0
                }));
            }
            if (leaderboardData.success) {
                setLeaderboard(leaderboardData.leaderboard || []);
            }
        } catch (error) {
            console.error('Error fetching home data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <SEO 
                title="PoolTrader - Professional Trading Pool Platform"
                description="Join our trading pool and grow your investments together."
            />
            
            <div className="min-h-screen">
                {/* Hero Section with Background Image */}
                <div className="relative h-screen">
                    {heroImages.map((hero, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                currentHero === index ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${hero.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    ))}
                    
                    <div className="relative h-full flex items-center justify-center">
                        <div className="text-center text-white px-4 max-w-5xl mx-auto">
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                                {heroImages[currentHero].title}
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 text-gray-300">
                                {heroImages[currentHero].subtitle}
                            </p>
                            
                            {/* Live Stats Card */}
                            <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 max-w-3xl mx-auto mb-10 border border-gray-700">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Current Pool</p>
                                        <p className="text-2xl font-bold text-blue-400">${parseFloat(stats.poolTotal).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Active Members</p>
                                        <p className="text-2xl font-bold text-green-400">{stats.members}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Monthly P&L</p>
                                        <p className="text-2xl font-bold text-green-400">+{stats.monthlyPnL}%</p>
                                    </div>
                                </div>
                            </div>
                            
                            <Link 
                                to="/register" 
                                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 shadow-xl"
                            >
                                Start Trading Now →
                            </Link>
                        </div>
                    </div>
                    
                    {/* Hero Dots */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentHero(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    currentHero === index ? 'w-8 bg-blue-500' : 'bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Stats Counter Section */}
                <div className="py-20 bg-gradient-to-r from-blue-900 to-purple-900">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="text-center transform hover:scale-105 transition">
                                <div className="text-4xl mb-2">💰</div>
                                <div className="text-3xl font-bold text-white">$87.4K</div>
                                <p className="text-gray-300">Pool Volume</p>
                            </div>
                            <div className="text-center transform hover:scale-105 transition">
                                <div className="text-4xl mb-2">👥</div>
                                <div className="text-3xl font-bold text-white">{stats.members}+</div>
                                <p className="text-gray-300">Active Traders</p>
                            </div>
                            <div className="text-center transform hover:scale-105 transition">
                                <div className="text-4xl mb-2">📈</div>
                                <div className="text-3xl font-bold text-white">+{stats.monthlyPnL}%</div>
                                <p className="text-gray-300">Monthly Return</p>
                            </div>
                            <div className="text-center transform hover:scale-105 transition">
                                <div className="text-4xl mb-2">🎯</div>
                                <div className="text-3xl font-bold text-white">24/7</div>
                                <p className="text-gray-300">Live Trading</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="py-20 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition duration-300">
                                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">💰</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">1. Deposit</h3>
                                <p className="text-gray-600 dark:text-gray-400">Contribute $500 - $20,000 to join the active pool</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition duration-300">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📈</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">2. Trade</h3>
                                <p className="text-gray-600 dark:text-gray-400">Professional manager trades with full transparency</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center transform hover:scale-105 transition duration-300">
                                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🤝</span>
                                </div>
                                <h3 className="text-xl font-bold mb-2">3. Split Profits</h3>
                                <p className="text-gray-600 dark:text-gray-400">Profits distributed proportionally every session</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hall of Fame */}
                {leaderboard.length > 0 && (
                    <div className="py-20 bg-gradient-to-r from-gray-900 to-blue-900">
                        <div className="container mx-auto px-4">
                            <h2 className="text-4xl font-bold text-center text-white mb-12">🏆 Hall of Fame</h2>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden max-w-3xl mx-auto">
                                <table className="w-full">
                                    <thead className="bg-white/20">
                                        <tr>
                                            <th className="p-4 text-left text-white">Rank</th>
                                            <th className="p-4 text-left text-white">Member</th>
                                            <th className="p-4 text-left text-white">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((member, i) => (
                                            <tr key={i} className="border-b border-white/10">
                                                <td className="p-4 text-white">#{i+1}</td>
                                                <td className="p-4 text-white">{member.full_name}</td>
                                                <td className="p-4 text-green-400 font-semibold">${parseFloat(member.total_contributed).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Trading?</h2>
                        <p className="text-xl text-white/90 mb-8">Join thousands of successful traders on PoolTrader</p>
                        <Link 
                            to="/register" 
                            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105 shadow-xl"
                        >
                            Create Free Account →
                        </Link>
                    </div>
                </div>

                {/* Risk Warning */}
                <div className="py-8 bg-gray-900">
                    <div className="container mx-auto px-4">
                        <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                            <p className="text-sm text-gray-400">
                                ⚠️ <strong>Risk Warning:</strong> Trading involves substantial risk of loss. Past performance does not guarantee future results.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;