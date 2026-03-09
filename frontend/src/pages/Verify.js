import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BeakerIcon, CalculatorIcon, FunctionIcon } from '@heroicons/react/24/outline';

const Verify = () => {
  const [activeTab, setActiveTab] = useState('expression');
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'expression', name: 'Expression Parser', icon: CalculatorIcon },
    { id: 'derivative', name: 'Derivative Verifier', icon: FunctionIcon },
    { id: 'integral', name: 'Integral Verifier', icon: BeakerIcon }
  ];

  const handleVerify = async () => {
    if (!input.trim()) {
      toast.error('Please enter an expression');
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'expression':
          response = await axios.post('/api/verify/expression', { expression: input });
          break;
        case 'derivative':
          // Parse input format: "f(x)=x^2, derivative=2x"
          const [funcPart, derivPart] = input.split(',').map(s => s.trim());
          const func = funcPart.split('=')[1] || funcPart;
          const expected = derivPart.split('=')[1] || derivPart;
          response = await axios.post('/api/verify/derivative', {
            function: func,
            variable: 'x',
            expected: expected
          });
          break;
        case 'integral':
          // Parse input format: "f(x)=sin(x), integral=-cos(x)"
          const [funcIntPart, intPart] = input.split(',').map(s => s.trim());
          const funcInt = funcIntPart.split('=')[1] || funcIntPart;
          const expectedInt = intPart.split('=')[1] || intPart;
          response = await axios.post('/api/verify/integral', {
            function: funcInt,
            variable: 'x',
            expected: expectedInt
          });
          break;
        default:
          return;
      }
      setResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Verify</h1>
        <p className="text-gray-600">
          Test individual mathematical expressions and operations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex -mb-px space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setInput('');
                setResult(null);
              }}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {activeTab === 'expression' && 'Enter Expression to Parse'}
          {activeTab === 'derivative' && 'Enter Function and Expected Derivative'}
          {activeTab === 'integral' && 'Enter Function and Expected Integral'}
        </h2>

        <div className="mb-4">
          {activeTab === 'expression' && (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., x^2 + 2*x + 1"
              className="input-field"
            />
          )}
          
          {(activeTab === 'derivative' || activeTab === 'integral') && (
            <div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeTab === 'derivative' 
                  ? "f(x)=x^2, derivative=2x" 
                  : "f(x)=sin(x), integral=-cos(x)"}
                className="input-field mb-2"
              />
              <p className="text-sm text-gray-500">
                Format: function=..., {activeTab === 'derivative' ? 'derivative' : 'integral'}=...
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Result</h3>
          
          {activeTab === 'expression' && (
            <div className="space-y-3">
              {result.valid ? (
                <>
                  <p className="text-green-600">✓ Valid expression</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Parsed: {result.parsed}</p>
                    <p className="text-sm text-gray-600">Simplified: {result.simplified}</p>
                  </div>
                </>
              ) : (
                <p className="text-red-600">✗ Invalid: {result.error}</p>
              )}
            </div>
          )}

          {(activeTab === 'derivative' || activeTab === 'integral') && (
            <div className="space-y-3">
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                  result.is_correct ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <p className={result.is_correct ? 'text-green-600' : 'text-red-600'}>
                  {result.is_correct ? '✓ Verified correctly' : '✗ Verification failed'}
                </p>
              </div>
              
              {activeTab === 'derivative' && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    Calculated derivative: {result.derivative}
                  </p>
                </div>
              )}
              
              {activeTab === 'integral' && (
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">
                    Calculated integral: {result.integral}
                  </p>
                </div>
              )}
              
              <p className="text-gray-700 mt-2">{result.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-indigo-50 rounded-xl p-6">
        <h4 className="font-semibold text-indigo-900 mb-2">Quick Tips</h4>
        <ul className="space-y-1 text-indigo-800 text-sm">
          <li>• Use ^ for exponents (e.g., x^2)</li>
          <li>• Use standard functions: sin, cos, tan, log, sqrt</li>
          <li>• Use * for multiplication (e.g., 2*x)</li>
          <li>• Use parentheses for grouping: (x+1)^2</li>
        </ul>
      </div>
    </div>
  );
};

export default Verify;