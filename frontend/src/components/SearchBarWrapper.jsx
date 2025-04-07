import React, { lazy, Suspense } from 'react';

// Try to dynamically import the SearchBar component
const SearchBarComponent = lazy(() => import('./SearchBar'));

// Fallback SearchBar component to use while loading
const FallbackSearchBar = ({ className }) => (
  <div className={`relative ${className}`}>
    <input
      type="text"
      disabled
      placeholder="Loading search..."
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

// SearchBar component that falls back to a simple version if the real one fails to load
const SearchBar = SearchBarComponent || FallbackSearchBar;

const SearchBarWrapper = (props) => {
  return (
    <Suspense fallback={<FallbackSearchBar {...props} />}>
      <SearchBar {...props} />
    </Suspense>
  );
};

export default SearchBarWrapper; 