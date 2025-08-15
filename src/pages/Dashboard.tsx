import React, { useEffect, useState } from 'react';
import { Calendar, Edit3, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateUserProfile } from '../services/authService';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { Post } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [friends, setFriends] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [updating, setUpdating] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null); // ✅ Fullscreen state

  useEffect(() => {
    if (user) {
      loadUserPosts();
      loadFriends();
    }
  }, [user]);

  const loadUserPosts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'posts'), where('userId', '==', user.id));
      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        posts.push({
          id: docSnap.id,
          userId: data.userId,
          username: data.username,
          name: data.name,
          content: data.content,
          imageUrl: data.imageUrl || '',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          likes: data.likes || [],
          comments: data.comments || []
        });
      });
      setUserPosts(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!user) return;
    try {
      const q1 = query(collection(db, 'connections'), where('status', '==', 'friends'), where('userIdA', '==', user.id));
      const q2 = query(collection(db, 'connections'), where('status', '==', 'friends'), where('userIdB', '==', user.id));
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      setFriends(snap1.docs.length + snap2.docs.length);
    } catch (err) {
      console.error('Error fetching connections:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setUserPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleEditName = () => {
    setIsEditing(true);
    setEditedName(user?.name || '');
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || !user) return;
    setUpdating(true);
    try {
      const success = await updateUserProfile(user.id, { name: editedName.trim() });
      if (success) {
        setIsEditing(false);
      } else {
        alert('Failed to update name. Try again.');
      }
    } catch (error) {
      console.error('Name update error:', error);
      alert('Something went wrong.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const parsed = new Date(date);
    return isNaN(parsed.getTime())
      ? 'Invalid date'
      : parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 relative">
          <div className="absolute top-4 right-4">
            <Button size="sm" onClick={() => navigate('/settings')}>⚙️ Settings</Button>
          </div>

          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name?.charAt(0) || 'U'}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="text-xl font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white"
                    />
                    <Button size="sm" onClick={handleSaveName} loading={updating}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
                    <button
                      onClick={handleEditName}
                      className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-1">@{user.username}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.joinedDate)}</span>
                </div>

                <div className="flex items-center space-x-1 cursor-pointer hover:underline" onClick={() => navigate('/connectups')}>
                  <UserPlus className="h-4 w-4" />
                  <span>{friends} ConnectUps</span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{userPosts.length}</span>
                  <span>Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Posts</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-600 text-white text-2xl rounded-full mx-auto mb-4 flex items-center justify-center">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Share your first post to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {userPosts.map(post => (
                <div key={post.id} className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {post.content && (
                    <p className="text-gray-900 dark:text-white">{post.content}</p>
                  )}

                  {post.imageUrl && (
  <div
    className="relative w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700"
    style={{
      backgroundImage: `url(${post.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(80%)',
    }}
  >
    <div className="relative bg-black bg-opacity-40 backdrop-blur-sm">
      <img
        src={post.imageUrl}
        alt="Post"
        onClick={() => setFullscreenImage(post.imageUrl)}
        className="w-full h-auto max-h-[400px] object-contain cursor-pointer transition-transform duration-300 hover:scale-[1.02] rounded-lg"
      />
    </div>
  </div>
)}


                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ❤️ {post.likes?.length || 0} likes · 💬 {post.comments?.length || 0} comments
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Fullscreen Image Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 text-white text-3xl hover:text-red-400 transition"
          >
            &times;
          </button>
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
