import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

const Admin = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [pools, setPools] = useState([]);
    const [trades, setTrades] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});

    // Helper function to format currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return `$${num.toLocaleString()}`;
    };

    useEffect(() => {
        if (user?.isAdmin) {
            fetchAllData();
        }
    }, [activeTab]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const response = await api.get('/admin/dashboard-stats');
                if (response.data.success) {
                    setStats(response.data.stats);
                }
                const usersRes = await api.get('/admin/users');
                if (usersRes.data.success) {
                    setUsers(usersRes.data.users);
                }
            }
            if (activeTab === 'users') {
                const response = await api.get('/admin/users');
                if (response.data.success) {
                    setUsers(response.data.users);
                }
            }
            if (activeTab === 'pools') {
                const response = await api.get('/admin/pools');
                if (response.data.success) {
                    setPools(response.data.pools);
                }
            }
            if (activeTab === 'trades') {
                const response = await api.get('/admin/trades');
                if (response.data.success) {
                    setTrades(response.data.trades);
                }
            }
            if (activeTab === 'contributions') {
                const response = await api.get('/admin/contributions');
                if (response.data.success) {
                    setContributions(response.data.contributions);
                }
            }
            if (activeTab === 'withdrawals') {
                const response = await api.get('/admin/withdrawals');
                if (response.data.success) {
                    setWithdrawals(response.data.withdrawals);
                }
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/users', formData);
            if (response.data.success) {
                toast.success('User created successfully');
                setShowModal(false);
                fetchAllData();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleCreatePool = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/pools', formData);
            if (response.data.success) {
                toast.success('Pool created successfully');
                setShowModal(false);
                fetchAllData();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create pool');
        }
    };

    const handleCreateTrade = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/trades', formData);
            if (response.data.success) {
                toast.success('Trade created successfully');
                setShowModal(false);
                fetchAllData();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create trade');
        }
    };

    const handleApproveWithdrawal = async (withdrawalId) => {
        try {
            const response = await api.post(`/admin/withdrawals/${withdrawalId}/approve`);
            if (response.data.success) {
                toast.success('Withdrawal approved');
                fetchAllData();
            }
        } catch (error) {
            toast.error('Failed to approve withdrawal');
        }
    };

    const handleResetPassword = async (userId) => {
        const newPassword = prompt('Enter new password:');
        if (newPassword) {
            try {
                await api.post(`/admin/users/${userId}/reset-password`, { new_password: newPassword });
                toast.success('Password reset successfully');
            } catch (error) {
                toast.error('Failed to reset password');
            }
        }
    };

    if (!user?.isAdmin) {
        return <Navigate to="/" />;
    }

    const renderModal = () => {
        if (!showModal) return null;
        
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto modal-dark">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-[#e8f0f0]">
                            {modalType === 'user' && 'Create New User'}
                            {modalType === 'pool' && 'Create New Pool'}
                            {modalType === 'trade' && 'Create New Trade'}
                        </h2>
                        <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                    </div>
                    
                    <form onSubmit={
                        modalType === 'user' ? handleCreateUser :
                        modalType === 'pool' ? handleCreatePool :
                        handleCreateTrade
                    } className="space-y-4">
                        {modalType === 'user' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Email</label>
                                    <input type="email" placeholder="Email" className="input-dark" 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Full Name</label>
                                    <input type="text" placeholder="Full Name" className="input-dark"
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Password</label>
                                    <input type="password" placeholder="Password" className="input-dark"
                                        onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center text-[#a0b4b8] cursor-pointer">
                                        <input type="checkbox" className="mr-2 w-4 h-4 accent-[#00d4aa]" 
                                            onChange={(e) => setFormData({...formData, is_admin: e.target.checked})} />
                                        Is Admin
                                    </label>
                                </div>
                            </>
                        )}
                        
                        {modalType === 'pool' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Pool Name</label>
                                    <input type="text" placeholder="Pool Name" className="input-dark"
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Description</label>
                                    <textarea placeholder="Description" className="input-dark" rows="2"
                                        onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Start Date</label>
                                        <input type="date" className="input-dark"
                                            onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">End Date</label>
                                        <input type="date" className="input-dark"
                                            onChange={(e) => setFormData({...formData, end_date: e.target.value})} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Target Amount</label>
                                    <input type="number" placeholder="Target Amount" className="input-dark"
                                        onChange={(e) => setFormData({...formData, total_target: e.target.value})} required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Min Contribution</label>
                                        <input type="number" placeholder="Min" className="input-dark"
                                            onChange={(e) => setFormData({...formData, min_contribution: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Max Contribution</label>
                                        <input type="number" placeholder="Max" className="input-dark"
                                            onChange={(e) => setFormData({...formData, max_contribution: e.target.value})} />
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {modalType === 'trade' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Pool ID</label>
                                    <input type="number" placeholder="Pool ID" className="input-dark"
                                        onChange={(e) => setFormData({...formData, pool_id: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Symbol</label>
                                    <input type="text" placeholder="Symbol (e.g., EUR/USD)" className="input-dark"
                                        onChange={(e) => setFormData({...formData, symbol: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Direction</label>
                                    <select className="input-dark"
                                        onChange={(e) => setFormData({...formData, direction: e.target.value})} required>
                                        <option value="">Select Direction</option>
                                        <option value="BUY">📈 BUY</option>
                                        <option value="SELL">📉 SELL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Volume</label>
                                    <input type="number" placeholder="Volume" step="0.01" className="input-dark"
                                        onChange={(e) => setFormData({...formData, volume: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Open Price</label>
                                    <input type="number" placeholder="Open Price" step="0.0001" className="input-dark"
                                        onChange={(e) => setFormData({...formData, open_price: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Entry Amount ($)</label>
                                    <input type="number" placeholder="Entry Amount" step="0.01" className="input-dark"
                                        onChange={(e) => setFormData({...formData, entry_amount: e.target.value})} />
                                </div>
                            </>
                        )}
                        
                        <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                            <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Admin Panel - PoolTrader" description="Administration panel" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
                            <p className="text-[#a0b4b8] mt-1">Manage users, pools, trades, and more</p>
                        </div>
                        <div className="flex space-x-3 flex-wrap gap-2">
                            <button onClick={() => { setModalType('user'); setShowModal(true); }} className="btn btn-success">
                                + Add User
                            </button>
                            <button onClick={() => { setModalType('pool'); setShowModal(true); }} className="btn btn-primary">
                                + Create Pool
                            </button>
                            <button onClick={() => { setModalType('trade'); setShowModal(true); }} className="btn btn-secondary">
                                + Add Trade
                            </button>
                        </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex flex-wrap border-b border-[#2a3538] mb-8 gap-1">
                        {['dashboard', 'users', 'pools', 'trades', 'contributions', 'withdrawals'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-3 font-semibold transition capitalize rounded-t-lg ${
                                    activeTab === tab 
                                        ? 'bg-[#161c1e] text-[#00d4aa] border-b-2 border-[#00d4aa]'
                                        : 'text-[#a0b4b8] hover:text-[#e8f0f0] hover:bg-[#1c2426]'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="stat-card">
                                <div className="stat-label">Total Users</div>
                                <div className="stat-value text-[#4aa0ff]">{stats.totalUsers || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Total Pools</div>
                                <div className="stat-value text-[#00d4aa]">{stats.totalPools || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Total Trades</div>
                                <div className="stat-value text-[#a855f7]">{stats.totalTrades || 0}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Total Contributions</div>
                                <div className="stat-value text-[#ffd93d]">{formatCurrency(stats.totalContributions)}</div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Balance</th>
                                            <th>Admin</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4 text-[#a0b4b8]">{u.id}</td>
                                                <td className="p-4 font-medium text-[#e8f0f0]">{u.full_name}</td>
                                                <td className="p-4 text-[#a0b4b8]">{u.email}</td>
                                                <td className="p-4 font-semibold text-[#00d4aa]">{formatCurrency(u.current_balance)}</td>
                                                <td className="p-4 text-[#a0b4b8]">{u.is_admin ? '✅' : '-'}</td>
                                                <td className="p-4">
                                                    <button onClick={() => handleResetPassword(u.id)} className="text-[#ffd93d] hover:text-[#f5a623] transition text-sm font-medium">
                                                        Reset PW
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pools Tab */}
                    {activeTab === 'pools' && (
                        <div className="space-y-4">
                            {pools.map(pool => {
                                const progress = (parseFloat(pool.current_total || 0) / parseFloat(pool.total_target)) * 100;
                                return (
                                    <div key={pool.id} className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 card-hover">
                                        <div className="flex justify-between items-start flex-wrap gap-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-[#e8f0f0]">{pool.name}</h3>
                                                    <span className={`badge ${pool.status === 'open' ? 'badge-success' : 'badge-gray'}`}>
                                                        {pool.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-[#a0b4b8] text-sm">
                                                    {new Date(pool.start_date).toLocaleDateString()} - {new Date(pool.end_date).toLocaleDateString()}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-6">
                                                    <div>
                                                        <span className="text-[#6a7e82] text-sm">Target</span>
                                                        <p className="font-semibold text-[#e8f0f0]">{formatCurrency(pool.total_target)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#6a7e82] text-sm">Current</span>
                                                        <p className="font-semibold text-[#00d4aa]">{formatCurrency(pool.current_total)}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#6a7e82] text-sm">Members</span>
                                                        <p className="font-semibold text-[#e8f0f0]">{pool.member_count || 0}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#6a7e82] text-sm">Trades</span>
                                                        <p className="font-semibold text-[#e8f0f0]">{pool.trade_count || 0}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 w-full max-w-md">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-[#a0b4b8]">Progress</span>
                                                        <span className="text-[#e8f0f0] font-semibold">{progress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-[#1c2426] rounded-full h-2">
                                                        <div className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Trades Tab */}
                    {activeTab === 'trades' && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>Pool</th>
                                            <th>Symbol</th>
                                            <th>Direction</th>
                                            <th>Lot Size</th>
                                            <th>Entry</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trades.map(trade => (
                                            <tr key={trade.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4 text-[#e8f0f0]">{trade.pool_name}</td>
                                                <td className="p-4 font-semibold text-[#e8f0f0]">{trade.symbol}</td>
                                                <td className="p-4">
                                                    <span className={`badge ${trade.direction === 'BUY' ? 'badge-success' : 'badge-danger'}`}>
                                                        {trade.direction}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[#e8f0f0]">{trade.lot_size || trade.volume || '-'}</td>
                                                <td className="p-4 text-[#e8f0f0]">${parseFloat(trade.open_price).toFixed(4)}</td>
                                                <td className="p-4">
                                                    <span className={`badge ${trade.status === 'open' ? 'badge-warning' : 'badge-gray'}`}>
                                                        {trade.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Contributions Tab */}
                    {activeTab === 'contributions' && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Pool</th>
                                            <th>Amount</th>
                                            <th>Share %</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contributions.map(c => (
                                            <tr key={c.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4 text-[#e8f0f0]">{c.user_name}</td>
                                                <td className="p-4 text-[#e8f0f0]">{c.pool_name}</td>
                                                <td className="p-4 font-semibold text-[#00d4aa]">{formatCurrency(c.amount)}</td>
                                                <td className="p-4 text-[#a0b4b8]">{parseFloat(c.percentage_share || 0).toFixed(2)}%</td>
                                                <td className="p-4 text-[#a0b4b8]">{new Date(c.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Withdrawals Tab */}
                    {activeTab === 'withdrawals' && (
                        <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                            <div className="overflow-x-auto">
                                <table className="table-dark">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Request Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map(w => (
                                            <tr key={w.id} className="hover:bg-[#1c2426] transition">
                                                <td className="p-4 text-[#e8f0f0]">{w.user_name}</td>
                                                <td className="p-4 font-semibold text-[#ff6b6b]">{formatCurrency(w.amount)}</td>
                                                <td className="p-4">
                                                    <span className={`badge ${w.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-[#a0b4b8]">{new Date(w.request_date).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    {w.status === 'pending' && (
                                                        <button onClick={() => handleApproveWithdrawal(w.id)} className="btn btn-success btn-sm">
                                                            Approve
                                                        </button>
                                                    )}
                                                    {w.status === 'approved' && (
                                                        <span className="text-[#00d4aa] text-sm font-medium">✓ Approved</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {renderModal()}
                </div>
            </div>
        </>
    );
};

export default Admin;