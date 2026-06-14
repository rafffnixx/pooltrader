import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// API functions for public data
export const getActivePool = async () => {
    try {
        const response = await api.get('/active-pool');
        return response.data;
    } catch (error) {
        console.error('Error fetching active pool:', error);
        return { success: false, pool: null };
    }
};

export const getPoolDetails = async (poolId) => {
    try {
        const response = await api.get(`/pool/${poolId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pool details:', error);
        return { success: false };
    }
};

export const getStats = async () => {
    try {
        const response = await api.get('/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { success: false, stats: {} };
    }
};

export const getLeaderboard = async () => {
    try {
        const response = await api.get('/leaderboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { success: false, leaderboard: [] };
    }
};

export const getPoolsList = async () => {
    try {
        const response = await api.get('/pools-list');
        return response.data;
    } catch (error) {
        console.error('Error fetching pools:', error);
        return { success: false, pools: [] };
    }
};

export const getTrades = async (poolId) => {
    try {
        const response = await api.get(`/trades/${poolId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching trades:', error);
        return { success: false, trades: [] };
    }
};

// User specific endpoints
export const getUserContributions = async (userId) => {
    try {
        const response = await api.get(`/user/${userId}/contributions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user contributions:', error);
        return { success: false, contributions: [] };
    }
};

export const getUserProfile = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { success: false, user: null };
    }
};

export const getUserBalance = async () => {
    try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
            return response.data.user.currentBalance || 0;
        }
        return 0;
    } catch (error) {
        console.error('Error fetching user balance:', error);
        return 0;
    }
};

// Contribution endpoints
export const createContribution = async (poolId, amount, paymentMethod) => {
    try {
        const response = await api.post('/contributions', {
            pool_id: poolId,
            amount: amount,
            payment_method: paymentMethod
        });
        return response.data;
    } catch (error) {
        console.error('Error creating contribution:', error);
        return { success: false, message: error.response?.data?.message || 'Contribution failed' };
    }
};

// Withdrawal endpoints
export const requestWithdrawal = async (amount, paymentMethod, notes) => {
    try {
        const response = await api.post('/withdrawals', {
            amount: amount,
            payment_method: paymentMethod,
            notes: notes
        });
        return response.data;
    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        return { success: false, message: error.response?.data?.message || 'Withdrawal request failed' };
    }
};

export const getUserWithdrawals = async () => {
    try {
        const response = await api.get('/withdrawals/user');
        return response.data;
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        return { success: false, withdrawals: [] };
    }
};

// Transaction endpoints
export const getUserTransactions = async () => {
    try {
        const response = await api.get('/transactions/user');
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return { success: false, transactions: [] };
    }
};

export default api;