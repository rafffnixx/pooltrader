import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { getActivePool, getPoolDetails, getPoolsList } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ActivePool = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pool, setPool] = useState(null);
    const [trades, setTrades] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [allPools, setAllPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPoolId, setSelectedPoolId] = useState(id || null);

    useEffect(() => {
        fetchPools();
    }, []);

    useEffect(() => {
        if (selectedPoolId) {
            fetchPoolData(selectedPoolId);
        } else {
            fetchActivePoolData();
        }
    }, [selectedPoolId]);

    const fetchPools = async () => {
        try {
            const response = await getPoolsList();
            if (response.success) {
                setAllPools(response.pools || []);
            }
        } catch (error) {
            console.error('Error fetching pools:', error);
        }
    };

    const fetchActivePoolData = async () => {
        setLoading(true);
        try {
            const poolData = await getActivePool();
            
            if (poolData.success && poolData.pool) {
                setPool(poolData.pool);
                setSelectedPoolId(poolData.pool.id);
                
                const detailsData = await getPoolDetails(poolData.pool.id);
                if (detailsData.success) {
                    setTrades(detailsData.trades || []);
                    setContributions(detailsData.contributions || []);
                }
            }
        } catch (error) {
            console.error('Error fetching active pool data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPoolData = async (poolId) => {
        setLoading(true);
        try {
            const detailsData = await getPoolDetails(poolId);
            if (detailsData.success) {
                setPool(detailsData.pool);
                setTrades(detailsData.trades || []);
                setContributions(detailsData.contributions || []);
            }
        } catch (error) {
            console.error('Error fetching pool data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePoolSelect = (poolId) => {
        setSelectedPoolId(poolId);
        navigate(`/pools/active/${poolId}`);
    };

    // Chart data for pool performance
    const chartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Today'],
        datasets: [
            {
                label: 'Pool Value',
                data: pool ? [
                    parseFloat(pool.current_total) * 0.7,
                    parseFloat(pool.current_total) * 0.8,
                    parseFloat(pool.current_total) * 0.85,
                    parseFloat(pool.current_total) * 0.93,
                    parseFloat(pool.current_total)
                ] : [0, 0, 0, 0, 0],
                fill: true,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointHoverRadius: 8,
                pointRadius: 4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#9ca3af' },
            },
            tooltip: {
                callbacks: {
                    label: (context) => `$${context.parsed.y.toLocaleString()}`
                }
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: (value) => '$' + value.toLocaleString(),
                    color: '#9ca3af',
                },
                grid: { color: 'rgba(156, 163, 175, 0.1)' },
            },
            x: {
                ticks: { color: '#9ca3af' },
                grid: { display: false },
            },
        },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading pool data...</p>
                </div>
            </div>
        );
    }

    const filledPercentage = pool ? (parseFloat(pool.current_total) / parseFloat(pool.total_target)) * 100 : 0;

    return (
        <>
            <SEO title={pool ? `${pool.name} - PoolTrader` : "Active Pool - PoolTrader"} description="View current active trading pool" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Trading Pools
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Select a pool to view details or join an active session
                        </p>
                    </div>

                    {/* Pool Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {allPools.map((p) => {
                            const poolFill = (parseFloat(p.current_total) / parseFloat(p.total_target)) * 100;
                            const isActive = selectedPoolId === p.id;
                            
                            return (
                                <div
                                    key={p.id}
                                    onClick={() => handlePoolSelect(p.id)}
                                    className={`group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                        isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                                    }`}
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition">
                                        <div className={`h-2 bg-gradient-to-r ${
                                            p.status === 'open' ? 'from-green-500 to-green-600' : 
                                            p.status === 'active' ? 'from-blue-500 to-blue-600' : 'from-gray-500 to-gray-600'
                                        }`}></div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold">{p.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    p.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                    p.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {p.status.toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                                    <span className="font-semibold">{poolFill.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            p.status === 'open' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                                        }`}
                                                        style={{ width: `${poolFill}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between text-sm mb-4">
                                                <div>
                                                    <p className="text-gray-500">Target</p>
                                                    <p className="font-semibold">${parseFloat(p.total_target).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Current</p>
                                                    <p className="font-semibold text-blue-600">${parseFloat(p.current_total).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Members</p>
                                                    <p className="font-semibold">{p.member_count || 0}</p>
                                                </div>
                                            </div>
                                            
                                            {isActive && (
                                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
                                                        ✓ Currently Viewing
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Selected Pool Details */}
                    {pool && (
                        <>
                            {/* Pool Stats Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
                                <div className="grid md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Pool Value</p>
                                        <p className="text-3xl font-bold">${parseFloat(pool.current_total).toLocaleString()}</p>
                                        <p className="text-blue-200 text-sm">of ${parseFloat(pool.total_target).toLocaleString()} target</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm">Active Trades</p>
                                        <p className="text-3xl font-bold">{trades.filter(t => t.status === 'open').length}</p>
                                        <p className="text-blue-200 text-sm">positions open</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Members</p>
                                        <p className="text-3xl font-bold">{contributions.length}</p>
                                        <p className="text-blue-200 text-sm">active investors</p>
                                    </div>
                                    <div>
                                        <p className="text-blue-100 text-sm">Manager Fee</p>
                                        <p className="text-3xl font-bold">{pool.manager_fee_percent}%</p>
                                        <p className="text-blue-200 text-sm">on profits</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pool Details */}
                            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                                {/* Pool Terms Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold mb-4 flex items-center">
                                        <span className="mr-2">📋</span> Pool Terms
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">Pool Name</span>
                                            <span className="font-semibold">{pool.name}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">Trading Period</span>
                                            <span className="font-semibold">
                                                {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">Min Contribution</span>
                                            <span className="font-semibold">${parseFloat(pool.min_contribution).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b dark:border-gray-700">
                                            <span className="text-gray-600 dark:text-gray-400">Max Contribution</span>
                                            <span className="font-semibold">${parseFloat(pool.max_contribution).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-600 dark:text-gray-400">Status</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                pool.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                pool.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {pool.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Chart */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold mb-4 flex items-center">
                                        <span className="mr-2">📈</span> Performance Chart
                                    </h2>
                                    <div className="h-64">
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>

                            {/* Contribution Leaderboard */}
                            {contributions.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
                                    <h2 className="text-xl font-bold mb-4 flex items-center">
                                        <span className="mr-2">🏆</span> Top Contributors
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <tr>
                                                    <th className="p-4 text-left">Rank</th>
                                                    <th className="p-4 text-left">Member</th>
                                                    <th className="p-4 text-left">Amount</th>
                                                    <th className="p-4 text-left">Share %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {contributions.map((c, index) => (
                                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                #{index + 1}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 font-medium">{c.full_name || `User ${c.user_id}`}</td>
                                                        <td className="p-4 font-semibold text-green-600">${parseFloat(c.amount).toLocaleString()}</td>
                                                        <td className="p-4">{parseFloat(c.percentage_share || 0).toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Trading History */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                                <h2 className="text-xl font-bold p-6 pb-0 flex items-center">
                                    <span className="mr-2">📊</span> Trading History
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="p-4 text-left">Time</th>
                                                <th className="p-4 text-left">Symbol</th>
                                                <th className="p-4 text-left">Direction</th>
                                                <th className="p-4 text-left">Volume</th>
                                                <th className="p-4 text-left">Entry Price</th>
                                                <th className="p-4 text-left">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {trades.map((trade) => (
                                                <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <td className="p-4 text-sm">{new Date(trade.open_time).toLocaleString()}</td>
                                                    <td className="p-4 font-medium">{trade.symbol}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            trade.direction === 'BUY' 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                        }`}>
                                                            {trade.direction}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">{trade.volume}</td>
                                                    <td className="p-4">${parseFloat(trade.open_price).toFixed(4)}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            trade.status === 'open' 
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {trade.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {trades.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                                        No trades yet for this pool
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Call to Action */}
                            {pool.status === 'open' && (
                                <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 text-center border border-yellow-200 dark:border-yellow-800">
                                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-3xl">🚀</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Ready to Join This Pool?</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                        Contribute to this pool and start earning profits from professional trading
                                    </p>
                                    <Link 
                                        to="/contribute" 
                                        className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition transform hover:scale-105 shadow-xl"
                                    >
                                        Contribute Now →
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ActivePool;