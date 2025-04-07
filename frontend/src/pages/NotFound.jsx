import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div>
      <Navbar />
      
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition-colors"
          >
            Go Back Home
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound; 