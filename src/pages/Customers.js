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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">💰 Record Deposit</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Customer</label>
                                <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                    <option value="">Select Customer</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                                <input type="number" step="0.01" placeholder="Amount" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Method</label>
                                <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})} required>
                                    <option value="">Select Method</option>
                                    <option value="bank_transfer">🏦 Bank Transfer</option>
                                    <option value="usdt">₿ USDT (Crypto)</option>
                                    <option value="mpesa">📱 M-Pesa</option>
                                    <option value="card">💳 Credit Card</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Reference Number</label>
                                <input type="text" placeholder="Reference Number" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, reference_number: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                    Process Deposit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'profit') {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">📊 Calculate & Distribute Profits</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Pool</label>
                                <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={profitCalculation.poolId}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, poolId: e.target.value})}>
                                    <option value="">Select Pool</option>
                                    {activePools.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (${parseFloat(p.current_total).toLocaleString()} / ${parseFloat(p.total_target).toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Total Pool Amount</label>
                                <input type="number" step="0.01" placeholder="Total Pool Amount" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={profitCalculation.totalPool}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, totalPool: parseFloat(e.target.value)})} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Customer's Contribution Amount</label>
                                <input type="number" step="0.01" placeholder="User Contribution" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={profitCalculation.userContribution}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, userContribution: parseFloat(e.target.value)})} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Total Profit Made</label>
                                <input type="number" step="0.01" placeholder="Total Profit" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={profitCalculation.totalProfit}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, totalProfit: parseFloat(e.target.value)})} />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Management Fee (%)</label>
                                <input type="number" step="0.5" placeholder="Management Fee %" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    value={profitCalculation.managementFee}
                                    onChange={(e) => setProfitCalculation({...profitCalculation, managementFee: parseFloat(e.target.value)})} />
                            </div>
                            
                            <button
                                type="button"
                                onClick={calculateProfit}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Calculate Profit
                            </button>
                            
                            {profitCalculation.userProfit > 0 && (
                                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 space-y-2">
                                    <h3 className="font-bold text-lg">Profit Breakdown:</h3>
                                    <div className="flex justify-between">
                                        <span>Customer's Share Percentage:</span>
                                        <span className="font-semibold">{profitCalculation.userPercentage.toFixed(2)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Gross Profit for Customer:</span>
                                        <span className="font-semibold text-green-600">${(profitCalculation.userProfit + profitCalculation.managerFeeAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Management Fee ({profitCalculation.managementFee}%):</span>
                                        <span className="font-semibold text-orange-600">${profitCalculation.managerFeeAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="font-bold">Net Profit to Customer:</span>
                                        <span className="font-bold text-green-600">${profitCalculation.userProfit.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                                    Cancel
                                </button>
                                <button onClick={handleProfitDistribution} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                                    Distribute Profits
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (modalType === 'withdrawal') {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">💸 Process Withdrawal</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <form onSubmit={handleWithdrawalRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Customer</label>
                                <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                    <option value="">Select Customer</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.full_name} (Balance: ${parseFloat(u.current_balance || 0).toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Withdrawal Amount ($)</label>
                                <input type="number" step="0.01" placeholder="Amount" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Payment Method</label>
                                <select className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})} required>
                                    <option value="">Select Method</option>
                                    <option value="bank_transfer">🏦 Bank Transfer</option>
                                    <option value="usdt">₿ USDT</option>
                                    <option value="mpesa">📱 M-Pesa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea placeholder="Notes" rows="2" className="w-full p-2 border rounded-lg dark:bg-gray-700"
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                                    Request Withdrawal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        }

        if (modalType === 'userDetails' && userDetails) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Customer Details</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-semibold text-lg">{userDetails.user.full_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-semibold">{userDetails.user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Current Balance</p>
                                <p className="font-semibold text-2xl text-green-600">${userDetails.user.current_balance?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Deposited</p>
                                <p className="font-semibold text-blue-600">${userDetails.user.total_deposited?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Withdrawn</p>
                                <p className="font-semibold text-red-600">${userDetails.user.total_withdrawn?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Joined Date</p>
                                <p className="font-semibold">{new Date(userDetails.user.joined_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3">Transaction History</h3>
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-3 text-left">Date</th>
                                        <th className="p-3 text-left">Type</th>
                                        <th className="p-3 text-left">Amount</th>
                                        <th className="p-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userDetails.transactions?.map(t => (
                                        <tr key={t.id} className="border-b dark:border-gray-700">
                                            <td className="p-3">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="p-3 capitalize">{t.type}</td>
                                            <td className={`p-3 font-semibold ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${Math.abs(t.amount).toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    t.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {t.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => handleResetUserPassword(userDetails.user.id)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                                Reset Password
                            </button>
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
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
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading customers...</p>
                </div>
            </div>
        );
    }

    const totalBalance = users.reduce((sum, u) => sum + parseFloat(u.current_balance || 0), 0);
    const totalDeposits = users.reduce((sum, u) => sum + parseFloat(u.total_deposited || 0), 0);

    return (
        <>
            <SEO title="Customers - PoolTrader" description="Manage customers and funds" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            👥 Customer Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Manage customer funds, deposits, withdrawals, and profit distributions
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-2xl">👥</div>
                                <span className="text-sm font-semibold text-green-600">Total</span>
                            </div>
                            <h3 className="text-2xl font-bold">{users.length}</h3>
                            <p className="text-gray-500 text-sm mt-1">Total Customers</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-2xl">💰</div>
                                <span className="text-sm font-semibold text-green-600">Deposits</span>
                            </div>
                            <h3 className="text-2xl font-bold">${totalDeposits.toLocaleString()}</h3>
                            <p className="text-gray-500 text-sm mt-1">Total Deposits</p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-2xl">💳</div>
                                <span className="text-sm font-semibold text-green-600">Balance</span>
                            </div>
                            <h3 className="text-2xl font-bold">${totalBalance.toLocaleString()}</h3>
                            <p className="text-gray-500 text-sm mt-1">Total Customer Balance</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button onClick={() => { setModalType('deposit'); setShowModal(true); }} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md">
                            💰 Record Deposit
                        </button>
                        <button onClick={() => { setModalType('withdrawal'); setShowModal(true); }} className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-md">
                            💸 Process Withdrawal
                        </button>
                        <button onClick={() => { setModalType('profit'); setShowModal(true); }} className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-md">
                            📊 Calculate & Distribute Profits
                        </button>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-4 text-left">ID</th>
                                        <th className="p-4 text-left">Customer Name</th>
                                        <th className="p-4 text-left">Email</th>
                                        <th className="p-4 text-left">Current Balance</th>
                                        <th className="p-4 text-left">Total Deposited</th>
                                        <th className="p-4 text-left">Total Withdrawn</th>
                                        <th className="p-4 text-left">Joined</th>
                                        <th className="p-4 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(customer => (
                                        <tr key={customer.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="p-4">{customer.id}</td>
                                            <td className="p-4 font-medium">{customer.full_name}</td>
                                            <td className="p-4">{customer.email}</td>
                                            <td className="p-4 font-bold text-green-600">${parseFloat(customer.current_balance || 0).toLocaleString()}</td>
                                            <td className="p-4 text-blue-600">${parseFloat(customer.total_deposited || 0).toLocaleString()}</td>
                                            <td className="p-4 text-red-600">${parseFloat(customer.total_withdrawn || 0).toLocaleString()}</td>
                                            <td className="p-4">{new Date(customer.joined_date).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <button onClick={() => fetchUserDetails(customer.id)} className="text-blue-600 hover:text-blue-800 mr-3 transition" title="View Details">👁️</button>
                                                <button onClick={() => handleResetUserPassword(customer.id)} className="text-yellow-600 hover:text-yellow-800 transition" title="Reset Password">🔑</button>
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