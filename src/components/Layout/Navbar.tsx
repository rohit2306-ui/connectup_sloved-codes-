import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  PlusCircle,
  User,
  LogOut,
  Moon,
  Sun,
  MessageCircle,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;

    const checkNewMessages = async () => {
      const q = query(
        collection(db, 'messages'),
        where('to', '==', user.id),
        where('seen', '==', false)
      );
      const snap = await getDocs(q);
      setHasNewMessages(!snap.empty);
    };

    const checkNewNotifications = async () => {
      const q = query(
        collection(db, 'notifications'),
        where('toUserId', '==', user.id),
        where('seen', '==', false)
      );
      const snap = await getDocs(q);
      setHasNewNotifications(!snap.empty);
    };

    checkNewMessages();
    checkNewNotifications();
  }, [user]);

  if (!user) return null;

  const navItems = [
    { path: '/feed', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/create', icon: PlusCircle, label: 'Create' },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notifications',
      dot: hasNewNotifications,
    },
    {
      path: '/allmessages',
      icon: MessageCircle,
      label: 'Messages',
      dot: hasNewMessages,
    },
    { path: '/dashboard', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/feed" className="flex items-center space-x-2">
            <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">ConnectUp</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, icon: Icon, label, dot }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === path
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {dot && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300">
                Hi, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-around py-2">
            {navItems.map(({ path, icon: Icon, label, dot }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex flex-col items-center py-2 px-3 rounded-md text-xs font-medium transition-colors duration-200 ${
                  location.pathname === path
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                {dot && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
