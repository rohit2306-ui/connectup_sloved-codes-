import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, Heart, Share2, Moon, Sun } from 'lucide-react';
import Button from '../components/UI/Button';
import { useTheme } from '../context/ThemeContext';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-500">
      {/* Header */}
      <header className="relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-700" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center items-center space-x-3 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white fill-current" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ConnectUp
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with thoughts, daily.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-3 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <Share2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Share Your Thoughts</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Express your daily thoughts and connect with others through meaningful conversations.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Build Community</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Discover like-minded people and build lasting connections through shared experiences.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Spread Positivity</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Like, comment, and support others in their journey of self-expression and growth.
            </p>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Join thousands sharing their daily thoughts
          </h2>
          
          {/* Mock Post Preview */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                J
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">John Doe</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">@johndoe • 2h ago</p>
              </div>
            </div>
            <p className="text-gray-900 dark:text-white leading-relaxed mb-4">
              Just had an incredible realization while walking in the park today. Sometimes the best ideas come when we least expect them. The key is to stay open and curious about the world around us. 🌟
            </p>
            <div className="flex items-center space-x-6 text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="text-sm">24</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">8</span>
              </div>
              <div className="flex items-center space-x-2">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Share</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 ConnectUp. Made with ❤️ for meaningful connections.</p>
      </footer>
    </div>
  );
};

export default LandingPage;