import React from 'react';
import SearchBarComponent from './SearchBar';

interface SearchBarProps {
  className?: string;
}

// Create a fallback component
const FallbackSearchBar: React.FC<SearchBarProps> = ({ className }: SearchBarProps) => (
  <div className={className}>
    <input
      type="text"
      placeholder="Search products..."
      className="w-full px-4 py-2 border border-gray-300 rounded-md"
      disabled
    />
  </div>
);

// Use proper import with fallback
const SearchBar: React.FC<SearchBarProps> = SearchBarComponent || FallbackSearchBar;

const SearchBarWrapper: React.FC<SearchBarProps> = (props) => {
  return <SearchBar {...props} />;
};

export default SearchBarWrapper; 