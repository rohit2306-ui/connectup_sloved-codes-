import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X } from 'lucide-react';
import { put } from '@vercel/blob';
import Button from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/postService';

const CreatePost: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxLength = 500;
  const remainingChars = maxLength - content.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!content.trim() && !image) {
      setError('Please write something or upload an image.');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';

      if (image) {
        const { url } = await put(`uploads/${Date.now()}_${image.name}`, image, {
          access: 'public',
          token: import.meta.env.VITE_BLOB_TOKEN,
        });
        imageUrl = url;
      }

      const result = await createPost(user?.id || '', content, imageUrl);

      if (result.success) {
        navigate('/feed');
      } else {
        setError(result.error || 'Post failed. Try again.');
      }
    } catch (err) {
      setError('Failed to post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() && !window.confirm('Discard this post?')) return;
    navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Post</h1>
          <p className="text-gray-600 dark:text-gray-400">Share your thoughts</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="content" className="text-sm text-gray-400 block mb-1">
                What's on your mind?
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px] rounded-md p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                maxLength={maxLength}
              />
              <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                {remainingChars} characters remaining
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-white file:bg-blue-600 file:border-0 file:px-4 file:py-2 file:rounded file:text-white file:cursor-pointer"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
