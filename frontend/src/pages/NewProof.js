import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LightBulbIcon } from '@heroicons/react/24/outline';

const proofSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  statement: z.string().min(10, 'Statement must be at least 10 characters'),
  proof_attempt: z.string().min(20, 'Proof attempt must be at least 20 characters'),
  is_public: z.boolean().default(false)
});

const NewProof = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      is_public: false
    }
  });

  const examples = [
    {
      title: "Derivative of x²",
      statement: "Prove that the derivative of f(x) = x² is 2x",
      proof: "f(x) = x²\nf'(x) = lim(h→0) [(x+h)² - x²]/h\n= lim(h→0) [x² + 2xh + h² - x²]/h\n= lim(h→0) [2xh + h²]/h\n= lim(h→0) [2x + h]\n= 2x"
    },
    {
      title: "Integral of sin(x)",
      statement: "Find the indefinite integral of sin(x)",
      proof: "∫ sin(x) dx = -cos(x) + C\nVerification: d/dx[-cos(x)] = sin(x)"
    }
  ];

  const loadExample = (example) => {
    document.getElementById('title').value = example.title;
    document.getElementById('statement').value = example.statement;
    document.getElementById('proof_attempt').value = example.proof;
    
    // Trigger react-hook-form to update
    const event = new Event('input', { bubbles: true });
    document.getElementById('title').dispatchEvent(event);
    document.getElementById('statement').dispatchEvent(event);
    document.getElementById('proof_attempt').dispatchEvent(event);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await axios.post('/api/proofs', data);
      toast.success('Proof submitted successfully!');
      navigate(`/proof/${response.data.proof_id}`);
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast.error(error.response?.data?.message || 'Failed to submit proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit New Proof</h1>
        <p className="text-gray-600">
          Enter your mathematical statement and proof attempt. Our automated verifier will analyze each step.
        </p>
      </div>

      {/* Examples */}
      <div className="bg-indigo-50 rounded-xl p-6 mb-8">
        <div className="flex items-center mb-4">
          <LightBulbIcon className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-indigo-900">Example Proofs</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example)}
              className="text-left p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-indigo-200"
            >
              <h3 className="font-semibold text-indigo-900 mb-1">{example.title}</h3>
              <p className="text-sm text-gray-600">{example.statement}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Proof Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="input-field"
              placeholder="e.g., Proof of the Quadratic Formula"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="statement" className="block text-sm font-medium text-gray-700 mb-2">
              Mathematical Statement
            </label>
            <textarea
              id="statement"
              {...register('statement')}
              rows={4}
              className="input-field"
              placeholder="State the theorem or mathematical claim to prove..."
            />
            {errors.statement && (
              <p className="mt-1 text-sm text-red-600">{errors.statement.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="proof_attempt" className="block text-sm font-medium text-gray-700 mb-2">
              Proof Attempt
            </label>
            <textarea
              id="proof_attempt"
              {...register('proof_attempt')}
              rows={10}
              className="input-field font-mono"
              placeholder="Write your proof step by step...&#10;Use '=' for equalities&#10;Each step on a new line"
            />
            {errors.proof_attempt && (
              <p className="mt-1 text-sm text-red-600">{errors.proof_attempt.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="is_public"
              type="checkbox"
              {...register('is_public')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
              Make this proof public (visible to everyone)
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proof for Verification'}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for Better Verification</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Write each step on a new line for better parsing</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use standard mathematical notation (e.g., x^2 for x², sqrt for square root)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Clearly indicate equalities with '=' signs</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>The verifier works best with algebraic and calculus proofs</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NewProof;