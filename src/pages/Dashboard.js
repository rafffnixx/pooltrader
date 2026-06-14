import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { getStats, getPoolsList } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pools, setPools] = useState([]);
    const [userContributions, setUserContributions] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedPool, setSelectedPool] = useState(null);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [contributeAmount, setContributeAmount] = useState(1000);
    const [walletBalance, setWalletBalance] = useState({
        total: 0,
        allocated: 0,
        withdrawable: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroSlides = [
        {
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&h=600&fit=crop",
            title: "Trade Together, Win Together",
            subtitle: "Pool your capital with expert traders",
            cta: "Start Trading"
        },
        {
            image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1920&h=600&fit=crop",
            title: "Professional Trading Setup",
            subtitle: "Multi-monitor trading stations for optimal performance",
            cta: "Join Now"
        },
        {
            image: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=1920&h=600&fit=crop",
            title: "Real-Time Market Analysis",
            subtitle: "Advanced charts and indicators",
            cta: "Get Started"
        }
    ];

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [poolsData, statsData, walletData, activitiesData] = await Promise.all([
                getPoolsList(),
                getStats(),
                api.get('/wallet/balance').catch(() => ({ data: { success: false, balance: { total: 0, allocated: 0, withdrawable: 0 } } })),
                api.get('/wallet/transactions').catch(() => ({ data: { success: false, transactions: [] } }))
            ]);
            
            if (poolsData.success) {
                setPools(poolsData.pools || []);
            }
            
            if (statsData.success) {
                setStats(statsData.stats);
            }
            
            if (walletData.data?.success) {
                setWalletBalance(walletData.data.balance);
            } else {
                // Fallback: calculate from user data
                if (user) {
                    const userRes = await api.get('/auth/me');
                    if (userRes.data.success) {
                        const totalBalance = userRes.data.user.currentBalance || 0;
                        // Get allocated from contributions
                        const contributionsRes = await api.get(`/user/${user.id}/contributions`);
                        let allocated = 0;
                        if (contributionsRes.data.success) {
                            allocated = contributionsRes.data.contributions
                                .filter(c => c.status === 'confirmed')
                                .reduce((sum, c) => sum + parseFloat(c.amount), 0);
                        }
                        setWalletBalance({
                            total: totalBalance,
                            allocated: allocated,
                            withdrawable: totalBalance - allocated,
                            pendingDeposits: 0,
                            pendingWithdrawals: 0
                        });
                    }
                }
            }
            
            if (activitiesData.data?.success) {
                setRecentActivities(activitiesData.data.transactions?.slice(0, 5) || []);
            }
            
            if (user) {
                const contributionsRes = await api.get(`/user/${user.id}/contributions`);
                if (contributionsRes.data.success) {
                    setUserContributions(contributionsRes.data.contributions || []);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleContribute = async (pool) => {
        setSelectedPool(pool);
        setContributeAmount(pool.min_contribution || 500);
        setShowContributeModal(true);
    };

    const submitContribution = async () => {
        if (!selectedPool) return;
        
        if (contributeAmount < selectedPool.min_contribution) {
            toast.error(`Minimum contribution is $${selectedPool.min_contribution}`);
            return;
        }
        
        if (contributeAmount > selectedPool.max_contribution) {
            toast.error(`Maximum contribution is $${selectedPool.max_contribution}`);
            return;
        }
        
        if (contributeAmount > walletBalance.withdrawable) {
            toast.error(`Insufficient balance. Available: $${walletBalance.withdrawable.toLocaleString()}`);
            return;
        }
        
        try {
            const response = await api.post('/wallet/allocate-to-pool', {
                pool_id: selectedPool.id,
                amount: contributeAmount
            });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setShowContributeModal(false);
                // Refresh all data to update balances and pool progress
                fetchDashboardData();
            } else {
                toast.error(response.data.message || 'Failed to allocate funds');
            }
        } catch (error) {
            console.error('Allocation error:', error);
            toast.error(error.response?.data?.message || 'Failed to allocate funds');
        }
    };

    const getUserContributionForPool = (poolId) => {
        const contribution = userContributions.find(c => c.pool_id === poolId && c.status === 'confirmed');
        return contribution ? parseFloat(contribution.amount) : 0;
    };

    const getUserShareForPool = (poolId) => {
        const contribution = userContributions.find(c => c.pool_id === poolId && c.status === 'confirmed');
        const pool = pools.find(p => p.id === poolId);
        if (contribution && pool && pool.current_total > 0) {
            return (parseFloat(contribution.amount) / parseFloat(pool.current_total)) * 100;
        }
        return 0;
    };

    const now = new Date();
    
    const activePools = pools.filter(pool => {
        const startDate = new Date(pool.start_date);
        const endDate = new Date(pool.end_date);
        const isDateValid = startDate <= now && endDate >= now;
        const isStatusValid = pool.status === 'open' || pool.status === 'active';
        return isStatusValid && isDateValid;
    });

    const upcomingPools = pools.filter(pool => {
        const startDate = new Date(pool.start_date);
        return startDate > now && (pool.status === 'open' || pool.status === 'active');
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your trading dashboard...</p>
                </div>
            </div>
        );
    }

    const totalInvested = userContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);

    return (
        <>
            <SEO title="Dashboard - PoolTrader" description="Your trading pool dashboard" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                {/* Hero Slider with Trading Images */}
                <div className="relative h-[400px] overflow-hidden">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                currentSlide === index ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="absolute inset-0 bg-black/40"></div>
                            <div className="relative h-full flex items-center justify-center text-center">
                                <div className="text-white px-4">
                                    <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
                                        {slide.title}
                                    </h1>
                                    <p className="text-xl md:text-2xl mb-8 text-gray-200">
                                        {slide.subtitle}
                                    </p>
                                    <Link 
                                        to="/register" 
                                        className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
                                    >
                                        {slide.cta} →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Slider Dots */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    currentSlide === index ? 'w-8 bg-blue-500' : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Welcome Section with Wallet */}
                    <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Welcome back, {user?.fullName?.split(' ')[0] || 'Trader'}!
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Here's your trading overview
                            </p>
                        </div>
                        <Link 
                            to="/wallet" 
                            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg"
                        >
                            <span>💰</span>
                            <span>Wallet: ${walletBalance.withdrawable.toLocaleString()}</span>
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
                            <div className="text-2xl mb-2">🏊</div>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalPools || 0}</p>
                            <p className="text-xs text-gray-500">Total Pools</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
                            <div className="text-2xl mb-2">💰</div>
                            <p className="text-2xl font-bold text-green-600">${(stats.totalContributions || 0).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Total Invested</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
                            <div className="text-2xl mb-2">📊</div>
                            <p className="text-2xl font-bold text-purple-600">${totalInvested.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Your Investment</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition">
                            <div className="text-2xl mb-2">📈</div>
                            <p className="text-2xl font-bold text-orange-600">{stats.totalTrades || 0}</p>
                            <p className="text-xs text-gray-500">Total Trades</p>
                        </div>
                    </div>

                    {/* Active Pools Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center">
                            <span className="bg-green-500 w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Active Pools ({activePools.length})
                        </h2>
                        {activePools.length === 0 ? (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                                <div className="text-5xl mb-4">🏊</div>
                                <p className="text-gray-500">No active pools at the moment. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activePools.map(pool => {
                                    const userAmount = getUserContributionForPool(pool.id);
                                    const userShare = getUserShareForPool(pool.id);
                                    const progress = (parseFloat(pool.current_total) / parseFloat(pool.total_target)) * 100;
                                    const daysLeft = Math.ceil((new Date(pool.end_date) - now) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <div key={pool.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:scale-105 cursor-pointer"
                                             onClick={() => navigate(`/pool/${pool.id}/details`)}>
                                            <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{pool.name}</h3>
                                                        <p className="text-xs text-gray-500 mt-1">{daysLeft} days remaining</p>
                                                    </div>
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">OPEN</span>
                                                </div>
                                                <p className="text-gray-500 text-sm mb-4">
                                                    {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                                </p>
                                                
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span>Progress</span>
                                                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>${parseFloat(pool.current_total).toLocaleString()}</span>
                                                        <span>Target: ${parseFloat(pool.total_target).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                
                                                {userAmount > 0 ? (
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your Investment</p>
                                                        <p className="font-bold text-blue-600">${userAmount.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">Share: {userShare.toFixed(2)}% of pool</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-center">
                                                        <p className="text-sm text-gray-500">Not invested yet</p>
                                                        <p className="text-xs text-gray-400">Min: ${parseFloat(pool.min_contribution).toLocaleString()}</p>
                                                    </div>
                                                )}
                                                
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleContribute(pool);
                                                    }}
                                                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                                                >
                                                    {userAmount > 0 ? 'Add More' : 'Invest Now'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Trading Setup Image Banner */}
                    <div className="mb-8 relative rounded-2xl overflow-hidden shadow-xl">
                        <img 
                            src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&h=400&fit=crop"
                            alt="Professional Trading Setup"
                            className="w-full h-48 md:h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 flex items-center justify-center">
                            <div className="text-center text-white p-6">
                                <h3 className="text-2xl md:text-3xl font-bold mb-2">Professional Trading Setup</h3>
                                <p className="text-gray-200 mb-4">Multi-monitor trading stations with real-time data</p>
                                <Link to="/pools/active" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                                    View Active Pools →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Pools Section */}
                    {upcomingPools.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4 flex items-center">
                                <span className="bg-yellow-500 w-3 h-3 rounded-full mr-2"></span>
                                Upcoming Pools ({upcomingPools.length})
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingPools.map(pool => {
                                    const daysUntil = Math.ceil((new Date(pool.start_date) - now) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <div key={pool.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 opacity-75">
                                            <h3 className="text-xl font-bold mb-2">{pool.name}</h3>
                                            <p className="text-gray-500 text-sm mb-2">
                                                Starts: {new Date(pool.start_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-yellow-600 text-sm font-semibold mb-4">Starts in {daysUntil} days</p>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500">Target: ${parseFloat(pool.total_target).toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">Min: ${parseFloat(pool.min_contribution).toLocaleString()}</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/pool/${pool.id}/details`)}
                                                className="w-full bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Your Investments Summary */}
                    {userContributions.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4">📊 Your Investment Summary</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-3 text-left">Pool</th>
                                            <th className="p-3 text-left">Amount Invested</th>
                                            <th className="p-3 text-left">Share %</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userContributions.map(contribution => {
                                            const pool = pools.find(p => p.id === contribution.pool_id);
                                            const share = pool && pool.current_total > 0 
                                                ? (parseFloat(contribution.amount) / parseFloat(pool.current_total)) * 100 
                                                : 0;
                                            
                                            return (
                                                <tr key={contribution.id} className="border-b dark:border-gray-700">
                                                    <td className="p-3 font-medium">{pool?.name || 'Pool'}</td>
                                                    <td className="p-3 text-green-600 font-semibold">${parseFloat(contribution.amount).toLocaleString()}</td>
                                                    <td className="p-3">{share.toFixed(2)}%</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            pool?.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {pool?.status === 'open' ? 'Active' : 'Closed'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <button 
                                                            onClick={() => navigate(`/pool/${contribution.pool_id}/details`)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                                        >
                                                            View Pool →
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Recent Activity Feed */}
                    {recentActivities.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center">
                                <span className="mr-2">🕐</span> Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {recentActivities.map((activity, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${activity.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div>
                                                <p className="font-medium capitalize">{activity.type}</p>
                                                <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className={`font-semibold ${activity.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                            {activity.type === 'deposit' ? '+' : '-'}${parseFloat(activity.amount).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/wallet" className="block text-center mt-4 text-blue-600 hover:text-blue-700 text-sm">
                                View all transactions →
                            </Link>
                        </div>
                    )}

                    {/* Contribution Modal */}
                    {showContributeModal && selectedPool && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">Invest in {selectedPool.name}</h2>
                                    <button onClick={() => setShowContributeModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your Available Balance</p>
                                        <p className="text-2xl font-bold text-green-600">${walletBalance.withdrawable.toLocaleString()}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Amount to Invest ($)</label>
                                        <input 
                                            type="number" 
                                            value={contributeAmount} 
                                            onChange={(e) => setContributeAmount(parseFloat(e.target.value))}
                                            min={selectedPool.min_contribution}
                                            max={Math.min(selectedPool.max_contribution, walletBalance.withdrawable)}
                                            step="100"
                                            className="w-full p-3 border rounded-lg text-lg font-semibold"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Min: ${parseFloat(selectedPool.min_contribution).toLocaleString()}</span>
                                            <span>Max: ${parseFloat(selectedPool.max_contribution).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Your Share After Investment</p>
                                        <p className="text-xl font-bold text-purple-600">
                                            {((contributeAmount + parseFloat(selectedPool.current_total)) > 0 
                                                ? (contributeAmount / (contributeAmount + parseFloat(selectedPool.current_total))) * 100 
                                                : 0).toFixed(2)}%
                                        </p>
                                    </div>
                                    
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            ⚡ Funds will be allocated from your wallet balance to this pool.
                                            Your withdrawable balance will decrease by this amount.
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setShowContributeModal(false)} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
                                        <button onClick={submitContribution} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">Confirm Investment</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;