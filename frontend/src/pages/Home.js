import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BeakerIcon, 
  ShieldCheckIcon, 
  DocumentCheckIcon,
  ArrowRightIcon,
  UsersIcon,
  ChartBarIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />,
      title: 'Automated Verification',
      description: 'AI-powered formal verification of mathematical proofs using symbolic engines and theorem provers'
    },
    {
      icon: <DocumentCheckIcon className="h-8 w-8 text-indigo-600" />,
      title: 'Audit Trail',
      description: 'Comprehensive human-readable audit trails for every proof step'
    },
    {
      icon: <UsersIcon className="h-8 w-8 text-indigo-600" />,
      title: 'Collaborative Review',
      description: 'Peer-review system for AI-generated mathematical knowledge'
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-indigo-600" />,
      title: 'Version Control',
      description: 'Track changes and collaborate with versioned proofs'
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-indigo-600" />,
      title: 'Public Repository',
      description: 'Share verified proofs with the global mathematical community'
    },
    {
      icon: <BeakerIcon className="h-8 w-8 text-indigo-600" />,
      title: 'AI Integration',
      description: 'Bridge between AI-generated claims and trusted theorems'
    }
  ];

  const stats = [
    { label: 'Proofs Verified', value: '1,234' },
    { label: 'Active Users', value: '5,678' },
    { label: 'Success Rate', value: '94%' },
    { label: 'Countries', value: '45+' }
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full mb-8">
          <span className="text-sm font-medium">🚀 Introducing FormalProof Labs</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          The Future of
          <span className="text-indigo-600"> Mathematical Proof</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A cloud platform that bridges AI-generated mathematical claims with trusted, 
          verifiable theorems through automated formal verification.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <Link
              to="/new-proof"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center justify-center"
            >
              Submit a Proof
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/public"
                className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                View Public Proofs
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-600 text-sm md:text-base">
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Why Choose FormalProof Labs?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Mathematical Verification?
        </h2>
        <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
          Join the platform that's making AI-generated mathematics trustworthy and verifiable.
        </p>
        {!isAuthenticated && (
          <Link
            to="/register"
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-lg text-lg font-semibold inline-block transition-colors"
          >
            Create Free Account
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;