import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { getStats, getPoolsList } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
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
    const [leaderboard, setLeaderboard] = useState([]);

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

    const statsData = [
        { icon: '💰', value: '$0', label: 'Pool Volume', key: 'poolVolume' },
        { icon: '👥', value: '0', label: 'Active Traders', key: 'members' },
        { icon: '📈', value: '+0%', label: 'Monthly Return', key: 'monthlyPnL' },
        { icon: '🎯', value: '24/7', label: 'Live Trading', key: 'liveTrading' }
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
            const [poolsData, statsData, leaderboardData] = await Promise.all([
                getPoolsList(),
                getStats(),
                api.get('/leaderboard').catch(() => ({ data: { success: false, leaderboard: [] } }))
            ]);
            
            if (poolsData.success) {
                setPools(poolsData.pools || []);
            }
            
            if (statsData.success) {
                setStats(statsData.stats);
            }
            
            if (leaderboardData.data?.success) {
                setLeaderboard(leaderboardData.data.leaderboard || []);
            }

            // Fetch user-specific data if logged in
            if (user) {
                const [walletData, activitiesData, contributionsRes] = await Promise.all([
                    api.get('/wallet/balance').catch(() => ({ data: { success: false, balance: { total: 0, allocated: 0, withdrawable: 0 } } })),
                    api.get('/wallet/transactions').catch(() => ({ data: { success: false, transactions: [] } })),
                    api.get(`/user/${user.id}/contributions`).catch(() => ({ data: { success: false, contributions: [] } }))
                ]);
                
                if (walletData.data?.success) {
                    setWalletBalance(walletData.data.balance);
                } else if (user) {
                    const userRes = await api.get('/auth/me');
                    if (userRes.data.success) {
                        const totalBalance = userRes.data.user.currentBalance || 0;
                        let allocated = 0;
                        if (contributionsRes.data?.success) {
                            allocated = contributionsRes.data.contributions
                                .filter(c => c.status === 'confirmed')
                                .reduce((sum, c) => sum + parseFloat(c.amount), 0);
                        }
                        setWalletBalance({
                            total: totalBalance,
                            allocated: allocated,
                            withdrawable: totalBalance - allocated
                        });
                    }
                }
                
                if (activitiesData.data?.success) {
                    setRecentActivities(activitiesData.data.transactions?.slice(0, 5) || []);
                }
                
                if (contributionsRes.data?.success) {
                    setUserContributions(contributionsRes.data.contributions || []);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (isAuthenticated) {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleContribute = async (pool) => {
        if (!user) {
            toast.error('Please login to invest');
            navigate('/login');
            return;
        }
        setSelectedPool(pool);
        setContributeAmount(pool.min_contribution || 500);
        setShowContributeModal(true);
    };

    const submitContribution = async () => {
        if (!selectedPool || !user) return;
        
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
        if (!user) return 0;
        const contribution = userContributions.find(c => c.pool_id === poolId && c.status === 'confirmed');
        return contribution ? parseFloat(contribution.amount) : 0;
    };

    const getUserShareForPool = (poolId) => {
        if (!user) return 0;
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

    const totalInvested = user ? userContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0) : 0;

    // Get stats for display
    const displayStats = {
        poolVolume: stats.totalContributions || 0,
        members: stats.users || 0,
        monthlyPnL: stats.monthlyPnL || 8.4,
        liveTrading: '24/7'
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading your trading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title={user ? "Dashboard - PoolTrader" : "PoolTrader - Professional Trading Pool Platform"} 
                 description="Join our trading pool and grow your investments together." />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                {/* Hero Slider with Trading Images */}
                <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${
                                currentSlide === index ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="relative h-full flex items-center justify-center text-center">
                                <div className="text-white px-4 max-w-4xl">
                                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                                        {slide.title}
                                    </h1>
                                    <p className="text-lg md:text-2xl mb-6 text-gray-300">
                                        {slide.subtitle}
                                    </p>
                                    {!user ? (
                                        <Link 
                                            to="/register" 
                                            className="inline-block bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-[#0a0e0f] px-8 py-3 rounded-xl font-semibold hover:shadow-[0_8px_30px_rgba(0,212,170,0.35)] transition transform hover:scale-105"
                                        >
                                            {slide.cta} →
                                        </Link>
                                    ) : (
                                        <div className="flex flex-wrap justify-center gap-3">
                                            <Link 
                                                to="/pools/active" 
                                                className="inline-block bg-gradient-to-r from-[#00d4aa] to-[#00b894] text-[#0a0e0f] px-8 py-3 rounded-xl font-semibold hover:shadow-[0_8px_30px_rgba(0,212,170,0.35)] transition transform hover:scale-105"
                                            >
                                                View Active Pools →
                                            </Link>
                                            <button 
                                                onClick={() => {
                                                    if (activePools.length > 0) {
                                                        handleContribute(activePools[0]);
                                                    } else {
                                                        toast.info('No active pools available');
                                                    }
                                                }}
                                                className="inline-block bg-[#1c2426] text-[#e8f0f0] px-8 py-3 rounded-xl font-semibold border border-[#2a3538] hover:border-[#00d4aa] transition transform hover:scale-105"
                                            >
                                                Invest Now →
                                            </button>
                                        </div>
                                    )}
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
                                    currentSlide === index ? 'w-8 bg-[#00d4aa]' : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {statsData.map((stat, idx) => (
                            <div key={idx} className="stat-card">
                                <div className="stat-icon">{stat.icon}</div>
                                <div className="stat-value">
                                    {stat.key === 'poolVolume' && `$${parseFloat(displayStats.poolVolume || 0).toLocaleString()}`}
                                    {stat.key === 'members' && displayStats.members}
                                    {stat.key === 'monthlyPnL' && `+${displayStats.monthlyPnL}%`}
                                    {stat.key === 'liveTrading' && displayStats.liveTrading}
                                </div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Welcome Section - Only for logged in users */}
                    {user && (
                        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold gradient-text">
                                    Welcome back, {user?.fullName?.split(' ')[0] || 'Trader'}!
                                </h1>
                                <p className="text-[#a0b4b8] mt-1">
                                    Here's your trading overview
                                </p>
                            </div>
                            <Link 
                                to="/wallet" 
                                className="btn btn-success"
                            >
                                <span>💰</span>
                                <span>Wallet: ${walletBalance.withdrawable.toLocaleString()}</span>
                            </Link>
                        </div>
                    )}

                    {/* User Investment Summary - Only for logged in users */}
                    {user && userContributions.length > 0 && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 mb-8 card-hover">
                            <h2 className="text-xl font-bold text-[#e8f0f0] mb-4">📊 Your Investment Summary</h2>
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Pool</th>
                                            <th>Amount Invested</th>
                                            <th>Share %</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userContributions.map(contribution => {
                                            const pool = pools.find(p => p.id === contribution.pool_id);
                                            const share = pool && pool.current_total > 0 
                                                ? (parseFloat(contribution.amount) / parseFloat(pool.current_total)) * 100 
                                                : 0;
                                            
                                            return (
                                                <tr key={contribution.id}>
                                                    <td className="font-medium">{pool?.name || 'Pool'}</td>
                                                    <td className="text-[#00d4aa] font-semibold">${parseFloat(contribution.amount).toLocaleString()}</td>
                                                    <td>{share.toFixed(2)}%</td>
                                                    <td>
                                                        <span className={`badge ${pool?.status === 'open' ? 'badge-success' : 'badge-gray'}`}>
                                                            {pool?.status === 'open' ? 'Active' : 'Closed'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button 
                                                            onClick={() => navigate(`/pool/${contribution.pool_id}/details`)}
                                                            className="text-[#00d4aa] hover:text-[#33ddbb] text-sm font-medium"
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

                    {/* Active Pools Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                            <span className="bg-[#00d4aa] w-3 h-3 rounded-full mr-2 animate-pulse"></span>
                            Active Pools ({activePools.length})
                        </h2>
                        {activePools.length === 0 ? (
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-12 text-center card-hover">
                                <div className="text-5xl mb-4">🏊</div>
                                <p className="text-[#a0b4b8]">No active pools at the moment. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activePools.map(pool => {
                                    const userAmount = user ? getUserContributionForPool(pool.id) : 0;
                                    const userShare = user ? getUserShareForPool(pool.id) : 0;
                                    const progress = (parseFloat(pool.current_total) / parseFloat(pool.total_target)) * 100;
                                    const daysLeft = Math.ceil((new Date(pool.end_date) - now) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <div key={pool.id} className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover cursor-pointer"
                                             onClick={() => navigate(`/pool/${pool.id}/details`)}>
                                            <div className="h-1.5 bg-gradient-to-r from-[#00d4aa] to-[#00b894]"></div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[#e8f0f0]">{pool.name}</h3>
                                                        <p className="text-xs text-[#6a7e82] mt-1">{daysLeft} days remaining</p>
                                                    </div>
                                                    <span className="badge badge-success">OPEN</span>
                                                </div>
                                                <p className="text-[#a0b4b8] text-sm mb-4">
                                                    {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                                </p>
                                                
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-[#a0b4b8]">Progress</span>
                                                        <span className="font-semibold text-[#e8f0f0]">{progress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-[#1c2426] rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-[#6a7e82] mt-1">
                                                        <span>${parseFloat(pool.current_total).toLocaleString()}</span>
                                                        <span>Target: ${parseFloat(pool.total_target).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                
                                                {user && userAmount > 0 ? (
                                                    <div className="bg-[#1c2426] rounded-lg p-3 mb-4">
                                                        <p className="text-sm text-[#a0b4b8]">Your Investment</p>
                                                        <p className="font-bold text-[#00d4aa]">${userAmount.toLocaleString()}</p>
                                                        <p className="text-xs text-[#6a7e82]">Share: {userShare.toFixed(2)}% of pool</p>
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#1c2426] rounded-lg p-3 mb-4 text-center">
                                                        <p className="text-sm text-[#a0b4b8]">{user ? 'Not invested yet' : 'Login to invest'}</p>
                                                        <p className="text-xs text-[#6a7e82]">Min: ${parseFloat(pool.min_contribution).toLocaleString()}</p>
                                                    </div>
                                                )}
                                                
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!user) {
                                                            toast.error('Please login to invest');
                                                            navigate('/login');
                                                            return;
                                                        }
                                                        handleContribute(pool);
                                                    }}
                                                    className="w-full btn btn-primary"
                                                >
                                                    {user && userAmount > 0 ? 'Add More' : user ? 'Invest Now' : 'Login to Invest'}
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
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e0f]/80 to-[#00d4aa]/30 flex items-center justify-center">
                            <div className="text-center text-white p-6">
                                <h3 className="text-2xl md:text-3xl font-bold mb-2">Professional Trading Setup</h3>
                                <p className="text-gray-300 mb-4">Multi-monitor trading stations with real-time data</p>
                                <Link to="/pools/active" className="btn btn-primary">
                                    View Active Pools →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Pools Section */}
                    {upcomingPools.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                                <span className="bg-[#ffd93d] w-3 h-3 rounded-full mr-2"></span>
                                Upcoming Pools ({upcomingPools.length})
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingPools.map(pool => {
                                    const daysUntil = Math.ceil((new Date(pool.start_date) - now) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <div key={pool.id} className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 opacity-75 card-hover">
                                            <h3 className="text-xl font-bold text-[#e8f0f0] mb-2">{pool.name}</h3>
                                            <p className="text-[#a0b4b8] text-sm mb-2">
                                                Starts: {new Date(pool.start_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-[#ffd93d] text-sm font-semibold mb-4">Starts in {daysUntil} days</p>
                                            <div className="mb-4">
                                                <p className="text-sm text-[#a0b4b8]">Target: ${parseFloat(pool.total_target).toLocaleString()}</p>
                                                <p className="text-xs text-[#6a7e82]">Min: ${parseFloat(pool.min_contribution).toLocaleString()}</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/pool/${pool.id}/details`)}
                                                className="w-full btn btn-outline"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}



                    {/* Hall of Fame - Public Section */}
                    {leaderboard.length > 0 && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 mt-8 card-hover">
                            <h2 className="text-xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                                <span className="mr-2">🏆</span> Hall of Fame
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Member</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.slice(0, 10).map((member, i) => (
                                            <tr key={i}>
                                                <td className="font-bold text-[#00d4aa]">#{i+1}</td>
                                                <td>{member.full_name || 'Anonymous'}</td>
                                                <td className="text-[#00d4aa] font-semibold">${parseFloat(member.total_contributed || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* CTA Section - Only for non-logged in users */}
                    {!user && (
                        <div className="py-12 mt-8 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl px-6">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-[#0a0e0f] mb-4">Ready to Start Trading?</h2>
                                <p className="text-[#0a0e0f]/80 text-lg mb-6">Join thousands of successful traders on PoolTrader</p>
                                <Link 
                                    to="/register" 
                                    className="inline-block bg-[#0a0e0f] text-[#00d4aa] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1c2426] transition transform hover:scale-105 shadow-xl"
                                >
                                    Create Free Account →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Contribution Modal - Only for logged in users */}
                    {user && showContributeModal && selectedPool && (
                        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full modal-dark">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-[#e8f0f0]">Invest in {selectedPool.name}</h2>
                                    <button onClick={() => setShowContributeModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl">✕</button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="p-3 bg-[#1c2426] rounded-lg">
                                        <p className="text-sm text-[#a0b4b8]">Your Available Balance</p>
                                        <p className="text-2xl font-bold text-[#00d4aa]">${walletBalance.withdrawable.toLocaleString()}</p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Amount to Invest ($)</label>
                                        <input 
                                            type="number" 
                                            value={contributeAmount} 
                                            onChange={(e) => setContributeAmount(parseFloat(e.target.value))}
                                            min={selectedPool.min_contribution}
                                            max={Math.min(selectedPool.max_contribution, walletBalance.withdrawable)}
                                            step="100"
                                            className="input-dark text-lg font-semibold"
                                        />
                                        <div className="flex justify-between text-xs text-[#6a7e82] mt-1">
                                            <span>Min: ${parseFloat(selectedPool.min_contribution).toLocaleString()}</span>
                                            <span>Max: ${parseFloat(selectedPool.max_contribution).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#1c2426] p-3 rounded-lg">
                                        <p className="text-sm text-[#a0b4b8]">Your Share After Investment</p>
                                        <p className="text-xl font-bold text-[#00d4aa]">
                                            {((contributeAmount + parseFloat(selectedPool.current_total)) > 0 
                                                ? (contributeAmount / (contributeAmount + parseFloat(selectedPool.current_total))) * 100 
                                                : 0).toFixed(2)}%
                                        </p>
                                    </div>
                                    
                                    <div className="bg-[#1c2426] p-3 rounded-lg border-l-4 border-[#ffd93d]">
                                        <p className="text-xs text-[#a0b4b8]">
                                            ⚡ Funds will be allocated from your wallet balance to this pool.
                                            Your withdrawable balance will decrease by this amount.
                                        </p>
                                    </div>
                                    
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setShowContributeModal(false)} className="flex-1 btn btn-outline">Cancel</button>
                                        <button onClick={submitContribution} className="flex-1 btn btn-success">Confirm Investment</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Risk Warning */}
                    <div className="mt-8 bg-[#161c1e] border-l-4 border-[#ff6b6b] p-4 rounded-lg">
                        <p className="text-sm text-[#a0b4b8]">
                            ⚠️ <strong className="text-[#ff6b6b]">Risk Warning:</strong> Trading involves substantial risk of loss. Past performance does not guarantee future results.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;