import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TestTrades = () => {
    const { poolId } = useParams();
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function test() {
            try {
                console.log('User:', user);
                console.log('Pool ID:', poolId);
                console.log('Token:', localStorage.getItem('token'));
                
                const response = await api.get(`/admin/trade-management/pool/${poolId}/trades`);
                console.log('Response:', response.data);
                setResult(response.data);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message);
            }
        }
        test();
    }, [poolId, user]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Page</h1>
            <div className="mb-4">
                <p><strong>User logged in:</strong> {user ? 'Yes' : 'No'}</p>
                <p><strong>User is Admin:</strong> {user?.isAdmin ? 'Yes' : 'No'}</p>
                <p><strong>Pool ID:</strong> {poolId}</p>
            </div>
            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                    Error: {error}
                </div>
            )}
            {result && (
                <div className="bg-green-100 text-green-700 p-4 rounded">
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
            {!result && !error && (
                <div className="text-gray-500">Loading...</div>
            )}
        </div>
    );
};

export default TestTrades;