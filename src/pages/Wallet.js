import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Wallet = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState({
        total: 0,
        allocated: 0,
        withdrawable: 0,
        pendingDeposits: 0,
        pendingWithdrawals: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [paymentDetails, setPaymentDetails] = useState({
        phoneNumber: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        walletAddress: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [balanceRes, transactionsRes, withdrawalsRes] = await Promise.all([
                api.get('/wallet/balance'),
                api.get('/wallet/transactions'),
                api.get('/wallet/withdrawals')
            ]);
            
            if (balanceRes.data.success) setBalance(balanceRes.data.balance);
            if (transactionsRes.data.success) setTransactions(transactionsRes.data.transactions);
            if (withdrawalsRes.data.success) setWithdrawals(withdrawalsRes.data.withdrawals);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
            toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!depositAmount || depositAmount < 10) {
            toast.error('Minimum deposit is $10');
            return;
        }
        
        let details = {};
        if (paymentMethod === 'mpesa') {
            if (!paymentDetails.phoneNumber) {
                toast.error('Please enter M-Pesa phone number');
                return;
            }
            details = { phoneNumber: paymentDetails.phoneNumber };
        } else if (paymentMethod === 'bank_transfer') {
            if (!paymentDetails.accountName || !paymentDetails.accountNumber) {
                toast.error('Please enter bank account details');
                return;
            }
            details = { 
                accountName: paymentDetails.accountName, 
                accountNumber: paymentDetails.accountNumber, 
                bankName: paymentDetails.bankName || 'Not specified'
            };
        } else if (paymentMethod === 'usdt') {
            if (!paymentDetails.walletAddress) {
                toast.error('Please enter USDT wallet address');
                return;
            }
            details = { walletAddress: paymentDetails.walletAddress };
        }
        
        try {
            const response = await api.post('/wallet/deposit-request', {
                amount: parseFloat(depositAmount),
                payment_method: paymentMethod,
                payment_details: details
            });
            
            if (response.data.success) {
                toast.success('Deposit request submitted! Awaiting admin confirmation.');
                setShowDepositModal(false);
                setDepositAmount('');
                setPaymentDetails({
                    phoneNumber: '',
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    walletAddress: ''
                });
                fetchWalletData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process deposit');
        }
    };

    const handleWithdrawRequest = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || withdrawAmount < 10) {
            toast.error('Minimum withdrawal is $10');
            return;
        }
        
        if (withdrawAmount > balance.withdrawable) {
            toast.error(`Insufficient withdrawable balance. Available: $${balance.withdrawable.toLocaleString()}`);
            return;
        }
        
        let details = {};
        if (paymentMethod === 'mpesa') {
            if (!paymentDetails.phoneNumber) {
                toast.error('Please enter M-Pesa phone number');
                return;
            }
            details = { phoneNumber: paymentDetails.phoneNumber };
        } else if (paymentMethod === 'bank_transfer') {
            if (!paymentDetails.accountName || !paymentDetails.accountNumber) {
                toast.error('Please enter bank account details');
                return;
            }
            details = { 
                accountName: paymentDetails.accountName, 
                accountNumber: paymentDetails.accountNumber, 
                bankName: paymentDetails.bankName || 'Not specified'
            };
        } else if (paymentMethod === 'usdt') {
            if (!paymentDetails.walletAddress) {
                toast.error('Please enter USDT wallet address');
                return;
            }
            details = { walletAddress: paymentDetails.walletAddress };
        }
        
        try {
            const response = await api.post('/wallet/withdraw-request', {
                amount: parseFloat(withdrawAmount),
                payment_method: paymentMethod,
                payment_details: details
            });
            
            if (response.data.success) {
                toast.success('Withdrawal request submitted! Admin will process it shortly.');
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                setPaymentDetails({
                    phoneNumber: '',
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    walletAddress: ''
                });
                fetchWalletData();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process withdrawal');
        }
    };

    const resetPaymentDetails = () => {
        setPaymentDetails({
            phoneNumber: '',
            accountName: '',
            accountNumber: '',
            bankName: '',
            walletAddress: ''
        });
    };

    const renderPaymentDetailsFields = () => {
        switch (paymentMethod) {
            case 'mpesa':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">M-Pesa Phone Number</label>
                        <input
                            type="tel"
                            value={paymentDetails.phoneNumber}
                            onChange={(e) => setPaymentDetails({...paymentDetails, phoneNumber: e.target.value})}
                            placeholder="0712345678"
                            className="w-full p-3 border rounded-lg"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">You will receive a payment request on this number</p>
                    </div>
                );
            case 'bank_transfer':
                return (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Account Name</label>
                            <input
                                type="text"
                                value={paymentDetails.accountName}
                                onChange={(e) => setPaymentDetails({...paymentDetails, accountName: e.target.value})}
                                placeholder="John Doe"
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Account Number</label>
                            <input
                                type="text"
                                value={paymentDetails.accountNumber}
                                onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                                placeholder="1234567890"
                                className="w-full p-3 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Bank Name (Optional)</label>
                            <input
                                type="text"
                                value={paymentDetails.bankName}
                                onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                                placeholder="Chase Bank"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>
                    </div>
                );
            case 'usdt':
                return (
                    <div>
                        <label className="block text-sm font-medium mb-1">USDT Wallet Address (ERC-20)</label>
                        <input
                            type="text"
                            value={paymentDetails.walletAddress}
                            onChange={(e) => setPaymentDetails({...paymentDetails, walletAddress: e.target.value})}
                            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5"
                            className="w-full p-3 border rounded-lg"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Make sure to use ERC-20 network</p>
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your wallet...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <SEO title="Wallet - PoolTrader" description="Manage your funds and withdrawals" />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header with Story */}
                    <div className="mb-8 text-center">
                        <div className="inline-block p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                            <span className="text-4xl">💰</span>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Your Trading Wallet
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
                            Manage your funds, track deposits, and withdraw your profits. 
                            Your money is safe and ready for trading when you are.
                        </p>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl p-4 text-white">
                            <p className="text-blue-100 text-sm">Total Balance</p>
                            <p className="text-2xl font-bold mt-1">${balance.total.toLocaleString()}</p>
                            <p className="text-blue-200 text-xs mt-1">💰 Total funds</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-xl p-4 text-white">
                            <p className="text-purple-100 text-sm">Allocated to Pools</p>
                            <p className="text-2xl font-bold mt-1">${balance.allocated.toLocaleString()}</p>
                            <p className="text-purple-200 text-xs mt-1">📊 Invested</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-4 text-white">
                            <p className="text-green-100 text-sm">Withdrawable</p>
                            <p className="text-2xl font-bold mt-1">${balance.withdrawable.toLocaleString()}</p>
                            <p className="text-green-200 text-xs mt-1">💵 Available</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-xl p-4 text-white">
                            <p className="text-yellow-100 text-sm">Pending Deposits</p>
                            <p className="text-2xl font-bold mt-1">${balance.pendingDeposits.toLocaleString()}</p>
                            <p className="text-yellow-200 text-xs mt-1">⏳ Awaiting confirmation</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-xl p-4 text-white">
                            <p className="text-red-100 text-sm">Pending Withdrawals</p>
                            <p className="text-2xl font-bold mt-1">${balance.pendingWithdrawals.toLocaleString()}</p>
                            <p className="text-red-200 text-xs mt-1">📤 Processing</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 mb-8">
                        <button 
                            onClick={() => {
                                setShowDepositModal(true);
                                resetPaymentDetails();
                            }}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition transform hover:scale-105 shadow-lg"
                        >
                            💰 Deposit Funds
                        </button>
                        <button 
                            onClick={() => {
                                setShowWithdrawModal(true);
                                resetPaymentDetails();
                            }}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 shadow-lg"
                        >
                            💸 Withdraw Funds
                        </button>
                        <Link 
                            to="/dashboard"
                            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition text-center"
                        >
                            📊 Go to Dashboard
                        </Link>
                    </div>

                    {/* How It Works Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4 flex items-center">
                            <span className="mr-2">💡</span> How It Works
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="font-bold text-blue-600">1. Deposit Funds</div>
                                <p>Request a deposit with your preferred payment method. Admin will confirm and funds will be added to your wallet.</p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="font-bold text-green-600">2. Allocate to Pools</div>
                                <p>Use your withdrawable balance to invest in active trading pools.</p>
                            </div>
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="font-bold text-purple-600">3. Withdraw Profits</div>
                                <p>Request withdrawal of your withdrawable balance anytime.</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                        <div className="p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold flex items-center">
                                <span className="mr-2">📋</span> Recent Transactions
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="p-4 text-left">Date</th>
                                        <th className="p-4 text-left">Type</th>
                                        <th className="p-4 text-left">Amount</th>
                                        <th className="p-4 text-left">Method</th>
                                        <th className="p-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="p-4">{new Date(t.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 capitalize">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    t.type === 'deposit' ? 'bg-green-100 text-green-800' : 
                                                    t.type === 'allocation' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {t.type === 'allocation' ? 'Investment' : t.type}
                                                </span>
                                            </td>
                                            <td className={`p-4 font-semibold ${
                                                t.type === 'deposit' || t.type === 'allocation' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {t.type === 'deposit' || t.type === 'allocation' ? '+' : '-'}${parseFloat(t.amount).toLocaleString()}
                                            </td>
                                            <td className="p-4">{t.payment_method || 'Wallet'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    t.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    t.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {t.status === 'completed' ? '✓ Completed' : t.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-500">
                                                No transactions yet. Make a deposit to get started!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Withdrawal Requests */}
                    {withdrawals.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                            <div className="p-6 border-b dark:border-gray-700">
                                <h2 className="text-xl font-bold flex items-center">
                                    <span className="mr-2">📤</span> Withdrawal History
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="p-4 text-left">Request Date</th>
                                            <th className="p-4 text-left">Amount</th>
                                            <th className="p-4 text-left">Method</th>
                                            <th className="p-4 text-left">Status</th>
                                            <th className="p-4 text-left">Processed Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((w) => (
                                            <tr key={w.id} className="border-b dark:border-gray-700">
                                                <td className="p-4">{new Date(w.request_date).toLocaleDateString()}</td>
                                                <td className="p-4 font-semibold">${parseFloat(w.amount).toLocaleString()}</td>
                                                <td className="p-4">{w.payment_method || '-'}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        w.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        w.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">{w.processed_date ? new Date(w.processed_date).toLocaleDateString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Deposit Modal */}
                    {showDepositModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">Deposit Funds</h2>
                                    <button onClick={() => setShowDepositModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>
                                <form onSubmit={handleDeposit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Amount ($)</label>
                                        <input 
                                            type="number" 
                                            value={depositAmount} 
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            min="10"
                                            step="10"
                                            required
                                            className="w-full p-3 border rounded-lg text-lg font-semibold"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                                        <select 
                                            value={paymentMethod} 
                                            onChange={(e) => {
                                                setPaymentMethod(e.target.value);
                                                resetPaymentDetails();
                                            }} 
                                            className="w-full p-3 border rounded-lg"
                                        >
                                            <option value="bank_transfer">🏦 Bank Transfer</option>
                                            <option value="usdt">₿ USDT (Crypto)</option>
                                            <option value="mpesa">📱 M-Pesa</option>
                                        </select>
                                    </div>
                                    
                                    {renderPaymentDetailsFields()}
                                    
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">💡 Instructions:</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {paymentMethod === 'bank_transfer' && 'After submitting, please transfer the amount to our bank account. Include your email as reference.'}
                                            {paymentMethod === 'usdt' && 'After submitting, please send USDT to the provided address. Your deposit will be confirmed once received.'}
                                            {paymentMethod === 'mpesa' && 'You will receive a payment request on your M-Pesa phone number.'}
                                        </p>
                                    </div>
                                    
                                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                                        Submit Deposit Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Withdraw Modal */}
                    {showWithdrawModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold">Withdraw Funds</h2>
                                    <button onClick={() => setShowWithdrawModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                                </div>
                                <form onSubmit={handleWithdrawRequest} className="space-y-4">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Available to Withdraw</p>
                                        <p className="text-2xl font-bold text-green-600">${balance.withdrawable.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Amount to Withdraw ($)</label>
                                        <input 
                                            type="number" 
                                            value={withdrawAmount} 
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            min="10"
                                            max={balance.withdrawable}
                                            step="10"
                                            required
                                            className="w-full p-3 border rounded-lg text-lg font-semibold"
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                                        <select 
                                            value={paymentMethod} 
                                            onChange={(e) => {
                                                setPaymentMethod(e.target.value);
                                                resetPaymentDetails();
                                            }} 
                                            className="w-full p-3 border rounded-lg"
                                        >
                                            <option value="bank_transfer">🏦 Bank Transfer</option>
                                            <option value="usdt">₿ USDT</option>
                                            <option value="mpesa">📱 M-Pesa</option>
                                        </select>
                                    </div>
                                    
                                    {renderPaymentDetailsFields()}
                                    
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <p className="text-xs text-gray-500">
                                            ⏳ Withdrawal requests are processed within 24-48 hours after admin approval.
                                            Funds will be sent to your provided payment details.
                                        </p>
                                    </div>
                                    
                                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                                        Submit Withdrawal Request
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wallet;