import React, { useState, useEffect } from 'react';
import PostCard from '../components/Post/PostCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { subscribeToPostsRealtime, likePost } from '../services/postService';

const HomeFeed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time posts updates
    const unsubscribe = subscribeToPostsRealtime((updatedPosts) => {
      setPosts(updatedPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) return;

    // Optimistic update
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes.includes(user.id);
          return {
            ...post,
            likes: isLiked
              ? post.likes.filter(id => id !== user.id)
              : [...post.likes, user.id]
          };
        }
        return post;
      })
    );

    // Update in Firebase
    await likePost(postId, user.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading your feed...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Home Feed</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {/* Discover thoughts and stories from your community */}
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to share your thoughts with the community!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
              />
            ))
          )}
        </div>

        {/* Load More (Placeholder) */}
        {posts.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up! 🎉
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeFeed;