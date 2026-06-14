import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

const PoolTrades = () => {
    const { poolId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [pool, setPool] = useState(null);
    const [trades, setTrades] = useState([]);
    const [openPositions, setOpenPositions] = useState([]);
    const [tradeStats, setTradeStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddTradeModal, setShowAddTradeModal] = useState(false);
    const [selectedTrade, setSelectedTrade] = useState(null);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [formData, setFormData] = useState({
        symbol: '',
        direction: 'BUY',
        volume: '',
        open_price: '',
        stop_loss: '',
        take_profit: '',
        notes: ''
    });

    useEffect(() => {
        if (user?.isAdmin && poolId) {
            fetchPoolTrades();
        } else if (!user?.isAdmin) {
            setError('Admin access required');
            setLoading(false);
        }
    }, [poolId, user]);

    const fetchPoolTrades = async () => {
        setLoading(true);
        setError(null);
        try {
            const poolRes = await api.get(`/pools/${poolId}`).catch(err => {
                console.error('Pool fetch error:', err);
                return { data: { success: false } };
            });
            
            if (poolRes.data.success) {
                setPool(poolRes.data.pool);
            } else {
                setError('Pool not found');
                setLoading(false);
                return;
            }
            
            const [tradesRes, positionsRes, statsRes] = await Promise.all([
                api.get(`/admin/trade-management/pool/${poolId}/trades`).catch(err => {
                    console.error('Trades fetch error:', err);
                    return { data: { success: false, trades: [] } };
                }),
                api.get(`/admin/trade-management/pool/${poolId}/positions`).catch(err => {
                    console.error('Positions fetch error:', err);
                    return { data: { success: false, positions: [] } };
                }),
                api.get(`/admin/trade-management/pool/${poolId}/summary`).catch(err => {
                    console.error('Stats fetch error:', err);
                    return { data: { success: false, tradeStats: {} } };
                })
            ]);
            
            if (tradesRes.data.success) setTrades(tradesRes.data.trades || []);
            if (positionsRes.data.success) setOpenPositions(positionsRes.data.positions || []);
            if (statsRes.data.success) setTradeStats(statsRes.data.tradeStats || {});
            
        } catch (error) {
            console.error('Error fetching pool trades:', error);
            setError('Failed to load trade data');
            toast.error('Failed to load trade data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTrade = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/trade-management/trade', {
                ...formData,
                pool_id: parseInt(poolId),
                volume: parseFloat(formData.volume),
                open_price: parseFloat(formData.open_price),
                stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
                take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null
            });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setShowAddTradeModal(false);
                fetchPoolTrades();
                setFormData({
                    symbol: '',
                    direction: 'BUY',
                    volume: '',
                    open_price: '',
                    stop_loss: '',
                    take_profit: '',
                    notes: ''
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add trade');
        }
    };

    const handleCloseTrade = (trade) => {
        setSelectedTrade(trade);
        setShowCloseModal(true);
    };

    const confirmCloseTrade = async () => {
        const close_price = prompt(`Enter closing price for ${selectedTrade.symbol}:`);
        if (!close_price) return;
        
        const closed_reason = prompt('Reason for closing (optional):');
        
        try {
            const response = await api.post(`/admin/trade-management/trade/${selectedTrade.id}/close`, {
                close_price: parseFloat(close_price),
                closed_reason: closed_reason || 'Closed by admin'
            });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setShowCloseModal(false);
                setSelectedTrade(null);
                fetchPoolTrades();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to close trade');
        }
    };

    if (!user?.isAdmin) {
        return <Navigate to="/" />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button 
                        onClick={() => navigate('/admin')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Back to Admin Panel
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading trades...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title={`${pool?.name || 'Pool'} - Trade Management`} description="Manage trades for this pool" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button 
                            onClick={() => navigate('/admin')} 
                            className="text-blue-600 hover:text-blue-700 mb-2 inline-block flex items-center gap-2"
                        >
                            ← Back to Admin Panel
                        </button>
                        <h1 className="text-3xl font-bold">{pool?.name || 'Pool'} - Trade Management</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage open positions, add new trades, and track performance
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                            <p className="text-gray-500 text-sm">Total Trades</p>
                            <p className="text-2xl font-bold">{tradeStats.total_trades || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                            <p className="text-gray-500 text-sm">Open Positions</p>
                            <p className="text-2xl font-bold text-yellow-600">{tradeStats.open_trades || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                            <p className="text-gray-500 text-sm">Total Profit</p>
                            <p className="text-2xl font-bold text-green-600">${Math.abs(tradeStats.total_profit || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                            <p className="text-gray-500 text-sm">Total Loss</p>
                            <p className="text-2xl font-bold text-red-600">-${Math.abs(tradeStats.total_loss || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Add Trade Button */}
                    <div className="mb-6">
                        <button 
                            onClick={() => setShowAddTradeModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                        >
                            + Add New Trade
                        </button>
                    </div>

                    {/* Open Positions Section */}
                    {openPositions.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">📈 Open Positions</h2>
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[1000px]">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="p-4 text-left">Symbol</th>
                                                <th className="p-4 text-left">Direction</th>
                                                <th className="p-4 text-left">Volume</th>
                                                <th className="p-4 text-left">Entry Price</th>
                                                <th className="p-4 text-left">Stop Loss</th>
                                                <th className="p-4 text-left">Take Profit</th>
                                                <th className="p-4 text-left">Current P&L</th>
                                                <th className="p-4 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {openPositions.map(trade => (
                                                <tr key={trade.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                    <td className="p-4 font-semibold">{trade.symbol}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                            trade.direction === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {trade.direction}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">{trade.volume}</td>
                                                    <td className="p-4">${parseFloat(trade.open_price).toFixed(4)}</td>
                                                    <td className="p-4 text-red-600">{trade.stop_loss ? `$${parseFloat(trade.stop_loss).toFixed(4)}` : '-'}</td>
                                                    <td className="p-4 text-green-600">{trade.take_profit ? `$${parseFloat(trade.take_profit).toFixed(4)}` : '-'}</td>
                                                    <td className={`p-4 font-semibold ${(trade.current_pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        ${(trade.current_pnl || 0).toLocaleString()}
                                                        <span className="text-xs block">{(trade.pnl_percentage || 0).toFixed(2)}%</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <button 
                                                            onClick={() => handleCloseTrade(trade)} 
                                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                                        >
                                                            Close
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Trades History */}
                    <div>
                        <h2 className="text-2xl font-bold mb-4">📋 Trade History</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-4 text-left">Date</th>
                                            <th className="p-4 text-left">Symbol</th>
                                            <th className="p-4 text-left">Direction</th>
                                            <th className="p-4 text-left">Entry</th>
                                            <th className="p-4 text-left">Exit</th>
                                            <th className="p-4 text-left">P&L</th>
                                            <th className="p-4 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map(trade => (
                                            <tr key={trade.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="p-4">{new Date(trade.open_time).toLocaleDateString()}</td>
                                                <td className="p-4 font-semibold">{trade.symbol}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                        trade.direction === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {trade.direction}
                                                    </span>
                                                </td>
                                                <td className="p-4">${parseFloat(trade.open_price).toFixed(4)}</td>
                                                <td className="p-4">{trade.close_price ? `$${parseFloat(trade.close_price).toFixed(4)}` : '-'}</td>
                                                <td className={`p-4 font-semibold ${(trade.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {trade.profit_loss ? `$${parseFloat(trade.profit_loss).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        trade.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {trade.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {trades.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center text-gray-500">
                                                    No trades found for this pool
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Add Trade Modal */}
                    {showAddTradeModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">Add New Trade</h2>
                                    <button onClick={() => setShowAddTradeModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>
                                <form onSubmit={handleAddTrade} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Symbol</label>
                                        <input type="text" placeholder="e.g., EUR/USD, BTC/USD" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                            value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Direction</label>
                                        <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                            value={formData.direction} onChange={(e) => setFormData({...formData, direction: e.target.value})} required>
                                            <option value="BUY">📈 BUY (Long)</option>
                                            <option value="SELL">📉 SELL (Short)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Volume</label>
                                        <input type="number" step="0.01" placeholder="Volume" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                            value={formData.volume} onChange={(e) => setFormData({...formData, volume: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Open Price</label>
                                        <input type="number" step="0.0001" placeholder="Open Price" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                            value={formData.open_price} onChange={(e) => setFormData({...formData, open_price: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Stop Loss (Optional)</label>
                                        <input type="number" step="0.0001" placeholder="Stop Loss" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                            value={formData.stop_loss} onChange={(e) => setFormData({...formData, stop_loss: e.target.value})} />
                                        <p className="text-xs text-gray-500 mt-1">Automatic exit if price hits this level</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Take Profit (Optional)</label>
                                        <input type="number" step="0.0001" placeholder="Take Profit" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                            value={formData.take_profit} onChange={(e) => setFormData({...formData, take_profit: e.target.value})} />
                                        <p className="text-xs text-gray-500 mt-1">Automatic profit taking at this level</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Notes</label>
                                        <textarea placeholder="Trade notes" rows="2" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                            value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button type="button" onClick={() => setShowAddTradeModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Trade</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Close Trade Confirmation Modal */}
                    {showCloseModal && selectedTrade && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                                <h2 className="text-2xl font-bold mb-4">Close Trade</h2>
                                <p className="mb-4">Are you sure you want to close <strong>{selectedTrade.symbol}</strong>?</p>
                                <p className="text-sm text-gray-500 mb-4">Current P&L: ${(selectedTrade.current_pnl || 0).toLocaleString()}</p>
                                <div className="flex justify-end space-x-3">
                                    <button onClick={() => {
                                        setShowCloseModal(false);
                                        setSelectedTrade(null);
                                    }} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
                                    <button onClick={confirmCloseTrade} className="px-4 py-2 bg-red-600 text-white rounded-lg">Close Trade</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PoolTrades;