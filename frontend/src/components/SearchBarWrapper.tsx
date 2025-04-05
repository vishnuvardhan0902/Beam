import React from 'react';

interface SearchBarProps {
  className?: string;
}

// Try to import the SearchBar component
let SearchBar: React.FC<SearchBarProps>;
try {
  SearchBar = require('./SearchBar').default;
} catch (error) {
  console.warn('SearchBar component not found:', error);
  // Fallback SearchBar component
  SearchBar = ({ className }: SearchBarProps) => (
    <div className={className}>
      <input
        type="text"
        placeholder="Search products..."
        className="w-full px-4 py-2 border border-gray-300 rounded-md"
        disabled
      />
    </div>
  );
}

const SearchBarWrapper: React.FC<SearchBarProps> = (props) => {
  return <SearchBar {...props} />;
};

export default SearchBarWrapper; 