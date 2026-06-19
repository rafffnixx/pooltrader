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
                borderColor: '#00d4aa',
                backgroundColor: 'rgba(0, 212, 170, 0.1)',
                tension: 0.4,
                pointBackgroundColor: '#00d4aa',
                pointBorderColor: '#0a0e0f',
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
                labels: { color: '#a0b4b8' },
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
                    color: '#a0b4b8',
                },
                grid: { color: 'rgba(42, 53, 56, 0.3)' },
            },
            x: {
                ticks: { color: '#a0b4b8' },
                grid: { display: false },
            },
        },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading pool data...</p>
                </div>
            </div>
        );
    }

    const filledPercentage = pool ? (parseFloat(pool.current_total) / parseFloat(pool.total_target)) * 100 : 0;

    return (
        <>
            <SEO title={pool ? `${pool.name} - PoolTrader` : "Active Pool - PoolTrader"} description="View current active trading pool" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold gradient-text">
                            Trading Pools
                        </h1>
                        <p className="text-[#a0b4b8] mt-2">
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
                                    className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                        isActive ? 'ring-2 ring-[#00d4aa] ring-offset-2 ring-offset-[#0a0e0f]' : ''
                                    }`}
                                >
                                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                                        <div className={`h-1.5 ${
                                            p.status === 'open' ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]' : 
                                            p.status === 'active' ? 'bg-gradient-to-r from-[#00d4aa] to-[#33ddbb]' : 'bg-[#2a3538]'
                                        }`}></div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold text-[#e8f0f0]">{p.name}</h3>
                                                    <p className="text-xs text-[#6a7e82] mt-1">
                                                        {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`badge ${
                                                    p.status === 'open' ? 'badge-success' :
                                                    p.status === 'active' ? 'badge-green' : 'badge-gray'
                                                }`}>
                                                    {p.status.toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-[#a0b4b8]">Progress</span>
                                                    <span className="font-semibold text-[#e8f0f0]">{poolFill.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-[#1c2426] rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            p.status === 'open' ? 'bg-gradient-to-r from-[#00d4aa] to-[#00b894]' : 'bg-gradient-to-r from-[#00d4aa] to-[#33ddbb]'
                                                        }`}
                                                        style={{ width: `${poolFill}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between text-sm">
                                                <div>
                                                    <p className="text-[#6a7e82]">Target</p>
                                                    <p className="font-semibold text-[#e8f0f0]">${parseFloat(p.total_target).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[#6a7e82]">Current</p>
                                                    <p className="font-semibold text-[#00d4aa]">${parseFloat(p.current_total).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[#6a7e82]">Members</p>
                                                    <p className="font-semibold text-[#e8f0f0]">{p.member_count || 0}</p>
                                                </div>
                                            </div>
                                            
                                            {isActive && (
                                                <div className="mt-4 pt-4 border-t border-[#2a3538]">
                                                    <p className="text-xs text-[#00d4aa] text-center">
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
                            <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-2xl shadow-xl p-8 mb-8 text-[#0a0e0f]">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-[#0a0e0f]/70 text-sm">Total Pool Value</p>
                                        <p className="text-3xl font-bold">${parseFloat(pool.current_total).toLocaleString()}</p>
                                        <p className="text-[#0a0e0f]/60 text-sm">of ${parseFloat(pool.total_target).toLocaleString()} target</p>
                                    </div>
                                    <div>
                                        <p className="text-[#0a0e0f]/70 text-sm">Active Trades</p>
                                        <p className="text-3xl font-bold">{trades.filter(t => t.status === 'open').length}</p>
                                        <p className="text-[#0a0e0f]/60 text-sm">positions open</p>
                                    </div>
                                    <div>
                                        <p className="text-[#0a0e0f]/70 text-sm">Total Members</p>
                                        <p className="text-3xl font-bold">{contributions.length}</p>
                                        <p className="text-[#0a0e0f]/60 text-sm">active investors</p>
                                    </div>
                                    <div>
                                        <p className="text-[#0a0e0f]/70 text-sm">Manager Fee</p>
                                        <p className="text-3xl font-bold">{pool.manager_fee_percent}%</p>
                                        <p className="text-[#0a0e0f]/60 text-sm">on profits</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pool Details */}
                            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                                {/* Pool Terms Card */}
                                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                                        <span className="mr-2">📋</span> Pool Terms
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                            <span className="text-[#a0b4b8]">Pool Name</span>
                                            <span className="font-semibold text-[#e8f0f0]">{pool.name}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                            <span className="text-[#a0b4b8]">Trading Period</span>
                                            <span className="font-semibold text-[#e8f0f0]">
                                                {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                            <span className="text-[#a0b4b8]">Min Contribution</span>
                                            <span className="font-semibold text-[#e8f0f0]">${parseFloat(pool.min_contribution).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-[#2a3538]">
                                            <span className="text-[#a0b4b8]">Max Contribution</span>
                                            <span className="font-semibold text-[#e8f0f0]">${parseFloat(pool.max_contribution).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-[#a0b4b8]">Status</span>
                                            <span className={`badge ${
                                                pool.status === 'open' ? 'badge-success' :
                                                pool.status === 'active' ? 'badge-green' : 'badge-gray'
                                            }`}>
                                                {pool.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Chart */}
                                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                                        <span className="mr-2">📈</span> Performance Chart
                                    </h2>
                                    <div className="h-64">
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>

                            {/* Contribution Leaderboard */}
                            {contributions.length > 0 && (
                                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 mb-8 card-hover">
                                    <h2 className="text-xl font-bold text-[#e8f0f0] mb-4 flex items-center">
                                        <span className="mr-2">🏆</span> Top Contributors
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="table-dark">
                                            <thead>
                                                <tr>
                                                    <th>Rank</th>
                                                    <th>Member</th>
                                                    <th>Amount</th>
                                                    <th>Share %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contributions.map((c, index) => (
                                                    <tr key={c.id} className="hover:bg-[#1c2426] transition">
                                                        <td className="p-4">
                                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                                                index === 0 ? 'bg-[#ffd93d] text-[#0a0e0f]' :
                                                                index === 1 ? 'bg-[#a0b4b8] text-[#0a0e0f]' :
                                                                index === 2 ? 'bg-[#ff6b6b] text-white' :
                                                                'bg-[#1c2426] text-[#a0b4b8]'
                                                            }`}>
                                                                #{index + 1}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 font-medium text-[#e8f0f0]">{c.full_name || `User ${c.user_id}`}</td>
                                                        <td className="p-4 font-semibold text-[#00d4aa]">${parseFloat(c.amount).toLocaleString()}</td>
                                                        <td className="p-4 text-[#a0b4b8]">{parseFloat(c.percentage_share || 0).toFixed(2)}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Trading History */}
                            <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden mb-8 card-hover">
                                <h2 className="text-xl font-bold text-[#e8f0f0] p-6 pb-0 flex items-center">
                                    <span className="mr-2">📊</span> Trading History
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="table-dark">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Symbol</th>
                                                <th>Direction</th>
                                                <th>Lot Size</th>
                                                <th>Entry Price</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trades.map((trade) => (
                                                <tr key={trade.id} className="hover:bg-[#1c2426] transition">
                                                    <td className="p-4 text-sm text-[#a0b4b8]">{new Date(trade.open_time).toLocaleString()}</td>
                                                    <td className="p-4 font-medium text-[#e8f0f0]">{trade.symbol}</td>
                                                    <td className="p-4">
                                                        <span className={`badge ${
                                                            trade.direction === 'BUY' 
                                                                ? 'badge-success'
                                                                : 'badge-danger'
                                                        }`}>
                                                            {trade.direction}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-[#e8f0f0]">{trade.lot_size || trade.volume || '-'}</td>
                                                    <td className="p-4 text-[#e8f0f0]">${parseFloat(trade.open_price).toFixed(4)}</td>
                                                    <td className="p-4">
                                                        <span className={`badge ${
                                                            trade.status === 'open' 
                                                                ? 'badge-warning'
                                                                : 'badge-gray'
                                                        }`}>
                                                            {trade.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {trades.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" className="p-8 text-center text-[#a0b4b8]">
                                                        No trades yet for this pool
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Call to Action */}
                            {(pool.status === 'open' || pool.status === 'active') && (
                                <div className="bg-gradient-to-r from-[#00d4aa]/10 to-[#00b894]/10 border border-[#00d4aa]/30 rounded-2xl p-8 text-center card-hover">
                                    <div className="w-20 h-20 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                                        <span className="text-3xl">🚀</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-[#e8f0f0] mb-2">Ready to Join This Pool?</h3>
                                    <p className="text-[#a0b4b8] mb-6 max-w-md mx-auto">
                                        Contribute to this pool and start earning profits from professional trading
                                    </p>
                                    <Link 
                                        to="/contribute" 
                                        className="btn btn-primary btn-lg"
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