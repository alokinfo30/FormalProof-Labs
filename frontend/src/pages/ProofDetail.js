import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const ProofDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchProof();
  }, [id]);

  const fetchProof = async () => {
    try {
      const response = await axios.get(`/api/proofs/${id}`);
      setProof(response.data);
    } catch (error) {
      console.error('Error fetching proof:', error);
      toast.error('Failed to load proof');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const response = await axios.post(`/api/proofs/${id}/verify`);
      toast.success('Verification completed!');
      fetchProof(); // Refresh proof data
    } catch (error) {
      console.error('Error verifying proof:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-700 bg-yellow-100',
      verified: 'text-green-700 bg-green-100',
      failed: 'text-red-700 bg-red-100',
      error: 'text-gray-700 bg-gray-100'
    };
    return colors[status] || 'text-gray-700 bg-gray-100';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Proof not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-indigo-600 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{proof.title}</h1>
          
          {user && proof.author === user.username && proof.status === 'pending' && (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center justify-center disabled:opacity-50"
            >
              <BeakerIcon className="h-5 w-5 mr-2" />
              {verifying ? 'Verifying...' : 'Run Verification'}
            </button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-gray-600 mb-1">
            <ShieldCheckIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Status</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proof.status)}`}>
            {proof.status.charAt(0).toUpperCase() + proof.status.slice(1)}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-gray-600 mb-1">
            <UserIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Author</span>
          </div>
          <p className="font-medium">{proof.author}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-gray-600 mb-1">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Created</span>
          </div>
          <p className="font-medium">{formatDate(proof.created_at)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center text-gray-600 mb-1">
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">Visibility</span>
          </div>
          <p className="font-medium">{proof.is_public ? 'Public' : 'Private'}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Statement */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mathematical Statement</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap">{proof.statement}</p>
          </div>
        </div>

        {/* Proof Attempt */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Proof Attempt</h2>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap">{proof.proof_attempt}</pre>
          </div>
        </div>

        {/* Verification Results */}
        {proof.verification_result && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Result</h2>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-indigo-900">{proof.verification_result}</p>
            </div>
          </div>
        )}

        {/* Audit Trail */}
        {proof.audit_trail && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Audit Trail</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {proof.audit_trail}
              </pre>
            </div>
          </div>
        )}

        {/* Verification Logs */}
        {proof.logs && proof.logs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Verification Logs</h2>
            <div className="space-y-4">
              {proof.logs.map((log, index) => (
                <div key={index} className="border-l-4 border-indigo-500 bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Step {log.step_number}</p>
                      <p className="text-gray-700 mt-1">{log.step_description}</p>
                      {log.error_message && (
                        <p className="text-red-600 text-sm mt-2">{log.error_message}</p>
                      )}
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      log.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                      log.verification_status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {log.verification_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProofDetail;