import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { addComment } from '../../services/postService';
import Button from '../UI/Button';

interface CommentModalProps {
  post: Post;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ post, onClose, onCommentAdded }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await addComment(post.id, user.id, newComment);
      
      if (result.success) {
        setNewComment('');
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        setError(result.error || 'Failed to add comment');
      }
    } catch (error) {
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Post Content */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {post.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{post.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">@{post.username}</p>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white text-sm leading-relaxed">{post.content}</p>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto max-h-60">
          {post.comments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {comment.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {comment.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          @{comment.username}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Comment */}
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {error && (
              <div className="mb-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Button
                  type="submit"
                  disabled={!newComment.trim()}
                  loading={isSubmitting}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;