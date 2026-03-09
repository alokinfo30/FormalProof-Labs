import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: proofs, isLoading, error } = useQuery('user-proofs', async () => {
    const response = await axios.get('/api/proofs');
    return response.data;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'proof-status-pending',
      verified: 'proof-status-verified',
      failed: 'proof-status-failed',
      error: 'proof-status-error'
    };
    
    return (
      <span className={statusClasses[status] || 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading proofs: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.username}!</p>
        </div>
        
        <Link
          to="/new-proof"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Proof
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-600 text-sm mb-2">Total Proofs</p>
          <p className="text-3xl font-bold text-gray-900">{proofs?.length || 0}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-600 text-sm mb-2">Verified</p>
          <p className="text-3xl font-bold text-green-600">
            {proofs?.filter(p => p.status === 'verified').length || 0}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-600 text-sm mb-2">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">
            {proofs?.filter(p => p.status === 'pending').length || 0}
          </p>
        </div>
      </div>

      {/* Proofs List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Proofs</h2>
        </div>

        {proofs?.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't submitted any proofs yet</p>
            <Link
              to="/new-proof"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Submit your first proof →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {proofs?.map((proof) => (
              <Link
                key={proof.id}
                to={`/proof/${proof.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-6 py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {proof.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {proof.statement}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(proof.status)}
                      <span className="text-sm text-gray-500">
                        {new Date(proof.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;