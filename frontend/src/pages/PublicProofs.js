import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const PublicProofs = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchPublicProofs();
  }, [debouncedSearch]);

  const fetchPublicProofs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search/public', {
        params: { q: debouncedSearch }
      });
      setProofs(response.data);
    } catch (error) {
      console.error('Error fetching public proofs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      error: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`${colors[status]} px-2 py-1 rounded-full text-xs font-medium`}>
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Public Proof Repository</h1>
        <p className="text-gray-600">
          Explore verified and community-submitted mathematical proofs
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proofs by title or statement..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Proofs Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : proofs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-600">No public proofs found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proofs.map((proof) => (
            <Link
              key={proof.id}
              to={`/proof/${proof.id}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                  {proof.title}
                </h2>
                {getStatusBadge(proof.status)}
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {proof.statement}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>By {proof.author}</span>
                <span>{new Date(proof.created_at).toLocaleDateString()}</span>
              </div>
              
              {proof.verified_at && (
                <p className="text-xs text-green-600 mt-2">
                  Verified on {new Date(proof.verified_at).toLocaleDateString()}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProofs;