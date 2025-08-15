import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../types';
import { useAuth } from '../../context/AuthContext';
import CommentModal from './CommentModal';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  showActions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onDelete,
  showActions = true
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const isLiked = user ? post.likes.includes(user.id) : false;
  const isOwner = user?.id === post.userId;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleLike = () => {
    if (onLike && user) {
      onLike(post.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.name}'s thought`,
          text: post.content,
          url: window.location.href
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(`${post.content} - ${post.name} on ConnectUp`);
    }
  };

  return (
    <>
      <div className="relative rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        {/* Background Blur */}
        {post.imageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-md opacity-80"
            style={{
              backgroundImage: `url(${post.imageUrl})`,
              zIndex: 0
            }}
          ></div>
        )}

        {/* Overlay content */}
        <div className="relative z-10 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                onClick={() => navigate(`/profile/${post.username}`)}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
              >
                {post.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{post.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{post.username} • {formatDate(post.createdAt)}
                </p>
              </div>
            </div>

            {isOwner && onDelete && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <button
                      onClick={() => {
                        onDelete(post.id);
                        setShowMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="w-full max-h-[400px] overflow-hidden rounded-md mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <img
                src={post.imageUrl}
                alt="Post visual"
                className="max-w-full max-h-[400px] object-contain rounded-md cursor-pointer transition-transform hover:scale-105"
                onClick={() => setIsImageFullscreen(true)}
              />
            </div>
          )}

          {/* Content */}
          <p className="text-gray-900 dark:text-white leading-relaxed mb-4">{post.content}</p>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 transition ${
                    isLiked
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{post.likes.length}</span>
                </button>

                <button
                  onClick={() => setShowComments(true)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{post.comments.length}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 transition"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {showComments && <CommentModal post={post} onClose={() => setShowComments(false)} />}

      {/* Fullscreen Image Modal */}
      {isImageFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setIsImageFullscreen(false)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-red-400 transition"
          >
            <X />
          </button>
          <img
            src={post.imageUrl}
            alt="Full screen"
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default PostCard;
