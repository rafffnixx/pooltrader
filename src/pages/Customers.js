import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';

const Customers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [activePools, setActivePools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});
    const [profitCalculation, setProfitCalculation] = useState({
        poolId: '',
        totalPool: 0,
        userContribution: 0,
        userPercentage: 0,
        totalProfit: 0,
        managementFee: 10,
        userProfit: 0,
        managerFeeAmount: 0
    });

    // Helper function to format currency
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '-';
        const num = parseFloat(value);
        if (isNaN(num)) return '-';
        return `$${num.toLocaleString()}`;
    };

    useEffect(() => {
        if (user?.isAdmin) {
            fetchAllUsers();
        }
    }, [user]);

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            if (response.data.success) {
                setUsers(response.data.users);
            }
            
            const poolsResponse = await api.get('/admin/pools');
            if (poolsResponse.data.success) {
                setActivePools(poolsResponse.data.pools.filter(p => p.status === 'open'));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await api.get(`/admin/user-details/${userId}`);
            if (response.data.success) {
                setUserDetails(response.data);
                setSelectedUser(userId);
                setShowModal(true);
                setModalType('userDetails');
            }
        } catch (error) {
            toast.error('Failed to load user details');
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/deposit', formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setShowModal(false);
                fetchAllUsers();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process deposit');
        }
    };

    const handleWithdrawalRequest = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/admin/withdrawal-request', formData);
            if (response.data.success) {
                toast.success('Withdrawal request created');
                setShowModal(false);
                fetchAllUsers();
                setFormData({});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create withdrawal request');
        }
    };

    const calculateProfit = () => {
        const userSharePercent = (profitCalculation.userContribution / profitCalculation.totalPool) * 100;
        const grossProfit = profitCalculation.totalProfit * (userSharePercent / 100);
        const managerFeeAmount = grossProfit * (profitCalculation.managementFee / 100);
        const userNetProfit = grossProfit - managerFeeAmount;
        
        setProfitCalculation({
            ...profitCalculation,
            userPercentage: userSharePercent,
            userProfit: userNetProfit,
            managerFeeAmount: managerFeeAmount
        });
    };

    const handleProfitDistribution = async () => {
        const { poolId, totalProfit } = profitCalculation;
        if (!poolId || !totalProfit) {
            toast.error('Please select a pool and enter total profit');
            return;
        }
        
        try {
            const response = await api.post(`/admin/calculate-profits/${poolId}`, {
                total_profit_loss: totalProfit
            });
            if (response.data.success) {
                toast.success('Profits distributed successfully!');
                setShowModal(false);
                fetchAllUsers();
                setProfitCalculation({
                    poolId: '',
                    totalPool: 0,
                    userContribution: 0,
                    userPercentage: 0,
                    totalProfit: 0,
                    managementFee: 10,
                    userProfit: 0,
                    managerFeeAmount: 0
                });
            }
        } catch (error) {
            toast.error('Failed to distribute profits');
        }
    };

    const handleResetUserPassword = async (userId) => {
        const newPassword = prompt('Enter new password for user (min 6 characters):');
        if (newPassword && newPassword.length >= 6) {
            try {
                await api.post(`/admin/reset-user-password/${userId}`, { newPassword });
                toast.success('Password reset successfully');
            } catch (error) {
                toast.error('Failed to reset password');
            }
        } else {
            toast.error('Password must be at least 6 characters');
        }
    };

    if (!user?.isAdmin) {
        return <Navigate to="/" />;
    }

    const renderModal = () => {
        if (!showModal) return null;

        if (modalType === 'deposit') {
            return (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full modal-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#e8f0f0]">💰 Record Deposit</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                        </div>
                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Select Customer</label>
                                <select className="w-full p-2 border border-[#2a3538] rounded-xl bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                    <option value="">Select Customer</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Amount ($)</label>
                                <input type="number" step="0.01" placeholder="Amount" className="input-dark"
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Payment Method</label>
                                <select className="w-full p-2 border border-[#2a3538] rounded-xl bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})} required>
                                    <option value="">Select Method</option>
                                    <option value="bank_transfer">🏦 Bank Transfer</option>
                                    <option value="usdt">₿ USDT (Crypto)</option>
                                    <option value="mpesa">📱 M-Pesa</option>
                                    <option value="card">💳 Credit Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Reference Number</label>
                                <input type="text" placeholder="Reference Number" className="input-dark"
                                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-success">Process Deposit</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'profit') {
            return (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto modal-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#e8f0f0]">📊 Calculate & Distribute Profits</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Select Pool</label>
                                <select className="w-full p-2 border border-[#2a3538] rounded-xl bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                                    value={profitCalculation.poolId}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, poolId: e.target.value})}>
                                    <option value="">Select Pool</option>
                                    {activePools.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({formatCurrency(p.current_total)} / {formatCurrency(p.total_target)})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Total Pool Amount</label>
                                <input type="number" step="0.01" placeholder="Total Pool Amount" className="input-dark"
                                    value={profitCalculation.totalPool}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, totalPool: parseFloat(e.target.value)})} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Customer's Contribution Amount</label>
                                <input type="number" step="0.01" placeholder="User Contribution" className="input-dark"
                                    value={profitCalculation.userContribution}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, userContribution: parseFloat(e.target.value)})} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Total Profit Made</label>
                                <input type="number" step="0.01" placeholder="Total Profit" className="input-dark"
                                    value={profitCalculation.totalProfit}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, totalProfit: parseFloat(e.target.value)})} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Management Fee (%)</label>
                                <input type="number" step="0.5" placeholder="Management Fee %" className="input-dark"
                                    value={profitCalculation.managementFee}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, managementFee: parseFloat(e.target.value)})} />
                            </div>
                            
                            <button
                                type="button"
                                onClick={calculateProfit}
                                className="w-full btn btn-primary"
                            >
                                Calculate Profit
                            </button>
                            
                            {profitCalculation.userProfit > 0 && (
                                <div className="bg-[#1c2426] rounded-xl p-4 space-y-2 border border-[#00d4aa]/20">
                                    <h3 className="font-bold text-lg text-[#e8f0f0]">Profit Breakdown:</h3>
                                    <div className="flex justify-between text-[#a0b4b8]">
                                        <span>Customer's Share Percentage:</span>
                                        <span className="font-semibold text-[#e8f0f0]">{profitCalculation.userPercentage.toFixed(2)}%</span>
                                    </div>
                                    <div className="flex justify-between text-[#a0b4b8]">
                                        <span>Gross Profit for Customer:</span>
                                        <span className="font-semibold text-[#00d4aa]">{formatCurrency(profitCalculation.userProfit + profitCalculation.managerFeeAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#a0b4b8]">
                                        <span>Management Fee ({profitCalculation.managementFee}%):</span>
                                        <span className="font-semibold text-[#ffd93d]">{formatCurrency(profitCalculation.managerFeeAmount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-[#2a3538]">
                                        <span className="font-bold text-[#e8f0f0]">Net Profit to Customer:</span>
                                        <span className="font-bold text-[#00d4aa]">{formatCurrency(profitCalculation.userProfit)}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                <button onClick={handleProfitDistribution} className="btn btn-primary">Distribute Profits</button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (modalType === 'withdrawal') {
            return (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-md w-full modal-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#e8f0f0]">💸 Process Withdrawal</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                        </div>
                        <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Select Customer</label>
                                <select className="w-full p-2 border border-[#2a3538] rounded-xl bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                    <option value="">Select Customer</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} (Balance: {formatCurrency(u.current_balance)})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Withdrawal Amount ($)</label>
                                <input type="number" step="0.01" placeholder="Amount" className="input-dark"
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Payment Method</label>
                                <select className="w-full p-2 border border-[#2a3538] rounded-xl bg-[#1c2426] text-[#e8f0f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]"
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})} required>
                                    <option value="">Select Method</option>
                                    <option value="bank_transfer">🏦 Bank Transfer</option>
                                    <option value="usdt">₿ USDT</option>
                                    <option value="mpesa">📱 M-Pesa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#a0b4b8] mb-1">Notes</label>
                                <textarea placeholder="Notes" rows="2" className="input-dark"
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-[#2a3538]">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-warning">Request Withdrawal</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'userDetails' && userDetails) {
            return (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-dark">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#e8f0f0]">Customer Details</h2>
                            <button onClick={() => setShowModal(false)} className="text-[#a0b4b8] hover:text-[#e8f0f0] text-2xl transition">✕</button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-[#1c2426] rounded-xl border border-[#2a3538]">
                            <div>
                                <p className="text-sm text-[#6a7e82]">Full Name</p>
                                <p className="font-semibold text-lg text-[#e8f0f0]">{userDetails.user.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Email</p>
                                <p className="font-semibold text-[#e8f0f0]">{userDetails.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Current Balance</p>
                                <p className="font-semibold text-2xl text-[#00d4aa]">{formatCurrency(userDetails.user.current_balance)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Total Deposited</p>
                                <p className="font-semibold text-[#4aa0ff]">{formatCurrency(userDetails.user.total_deposited)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Total Withdrawn</p>
                                <p className="font-semibold text-[#ff6b6b]">{formatCurrency(userDetails.user.total_withdrawn)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6a7e82]">Joined Date</p>
                                <p className="font-semibold text-[#e8f0f0]">{new Date(userDetails.user.joined_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-[#e8f0f0] mb-3">Transaction History</h3>
                        <div className="overflow-x-auto mb-4">
                            <table className="table-dark">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userDetails.transactions?.map(t => (
                                        <tr key={t.id} className="hover:bg-[#1c2426] transition">
                                            <td className="p-4 text-[#a0b4b8]">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 capitalize text-[#e8f0f0]">{t.type}</td>
                                            <td className={`p-4 font-semibold ${t.amount > 0 ? 'text-[#00d4aa]' : 'text-[#ff6b6b]'}`}>
                                                {formatCurrency(t.amount)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => handleResetUserPassword(userDetails.user.id)} className="btn btn-warning">
                                Reset Password
                            </button>
                            <button onClick={() => setShowModal(false)} className="btn btn-primary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#0a0e0f]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d4aa] mx-auto mb-4"></div>
                    <p className="text-[#a0b4b8]">Loading customers...</p>
                </div>
            </div>
        );
    }

    const totalBalance = users.reduce((sum, u) => sum + parseFloat(u.current_balance || 0), 0);
    const totalDeposits = users.reduce((sum, u) => sum + parseFloat(u.total_deposited || 0), 0);

    return (
        <>
            <SEO title="Customers - PoolTrader" description="Manage customers and funds" />
            
            <div className="min-h-screen bg-[#0a0e0f]">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold gradient-text">
                            👥 Customer Management
                        </h1>
                        <p className="text-[#a0b4b8] mt-2">
                            Manage customer funds, deposits, withdrawals, and profit distributions
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="stat-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-[#1c2426] rounded-xl text-2xl">👥</div>
                                <span className="text-sm font-semibold text-[#00d4aa]">Total</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#e8f0f0]">{users.length}</h3>
                            <p className="text-[#6a7e82] text-sm mt-1">Total Customers</p>
                        </div>
                        
                        <div className="stat-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-[#1c2426] rounded-xl text-2xl">💰</div>
                                <span className="text-sm font-semibold text-[#00d4aa]">Deposits</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#e8f0f0]">{formatCurrency(totalDeposits)}</h3>
                            <p className="text-[#6a7e82] text-sm mt-1">Total Deposits</p>
                        </div>
                        
                        <div className="stat-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-[#1c2426] rounded-xl text-2xl">💳</div>
                                <span className="text-sm font-semibold text-[#00d4aa]">Balance</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#e8f0f0]">{formatCurrency(totalBalance)}</h3>
                            <p className="text-[#6a7e82] text-sm mt-1">Total Customer Balance</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button onClick={() => { setModalType('deposit'); setShowModal(true); }} className="btn btn-success">
                            💰 Record Deposit
                        </button>
                        <button onClick={() => { setModalType('withdrawal'); setShowModal(true); }} className="btn btn-warning">
                            💸 Process Withdrawal
                        </button>
                        <button onClick={() => { setModalType('profit'); setShowModal(true); }} className="btn btn-primary">
                            📊 Calculate & Distribute Profits
                        </button>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-[#161c1e] border border-[#2a3538] rounded-2xl overflow-hidden card-hover">
                        <div className="overflow-x-auto">
                            <table className="table-dark">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer Name</th>
                                        <th>Email</th>
                                        <th>Current Balance</th>
                                        <th>Total Deposited</th>
                                        <th>Total Withdrawn</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(customer => (
                                        <tr key={customer.id} className="hover:bg-[#1c2426] transition">
                                            <td className="p-4 text-[#a0b4b8]">{customer.id}</td>
                                            <td className="p-4 font-medium text-[#e8f0f0]">{customer.full_name}</td>
                                            <td className="p-4 text-[#a0b4b8]">{customer.email}</td>
                                            <td className="p-4 font-bold text-[#00d4aa]">{formatCurrency(customer.current_balance)}</td>
                                            <td className="p-4 text-[#4aa0ff]">{formatCurrency(customer.total_deposited)}</td>
                                            <td className="p-4 text-[#ff6b6b]">{formatCurrency(customer.total_withdrawn)}</td>
                                            <td className="p-4 text-[#a0b4b8]">{new Date(customer.joined_date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <button onClick={() => fetchUserDetails(customer.id)} className="text-[#00d4aa] hover:text-[#33ddbb] mr-3 transition" title="View Details">👁️</button>
                                                <button onClick={() => handleResetUserPassword(customer.id)} className="text-[#ffd93d] hover:text-[#f5a623] transition" title="Reset Password">🔑</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {renderModal()}
                </div>
            </div>
        </>
    );
};

export default Customers;