import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User as UserType } from '../types';
import { searchUsers } from '../services/userService';
import Input from '../components/UI/Input';

const SearchUsers: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserType[]>([]);
  const [recentSearches, setRecentSearches] = useState<UserType[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const searchResults = await searchUsers(searchQuery);
      setResults(searchResults);

      if (searchResults.length > 0) {
        const user = searchResults[0];
        setRecentSearches((prev) => {
          const exists = prev.find((u) => u.id === user.id);
          if (exists) return prev;

          const updated = [user, ...prev];
          return updated.slice(0, 6);
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 200); // Delay to allow clicks
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) handleSearch(val);
  };

  const removeRecent = (id: string) => {
    setRecentSearches((prev) => prev.filter((u) => u.id !== id));
  };

  const clearAll = () => {
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleInputChange}
              placeholder="Search users..."
              className="pl-10"
            />
          </div>

          {/* 🔍 Dropdown for Recent Searches */}
          {showDropdown && recentSearches.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center px-3 pt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Recent Searches</span>
                <button onClick={clearAll} className="text-xs text-red-400 hover:underline">Clear all</button>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentSearches.map((user) => (
                  <li key={user.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex items-center space-x-3"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div className="text-sm text-gray-800 dark:text-white">{user.name}</div>
                    </Link>
                    <button onClick={() => removeRecent(user.id)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Results (optional UI) */}
        {results.length > 0 && (
          <div className="space-y-3 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Results ({results.length})
            </h2>
            {results.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.username}`}
                className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
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

export default SearchUsers;
