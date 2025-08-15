import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Calendar, ArrowLeft, UserPlus } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { User, Post } from '../types';
import { getUserByUsername } from '../services/userService';
import { getPostsByUserId } from '../services/postService';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Button from '../components/UI/Button';
import PostCard from '../components/Post/PostCard';

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [connStatus, setConnStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const [connDocId, setConnDocId] = useState<string | null>(null);
  const [connectUpsCount, setConnectUpsCount] = useState<number>(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!username) return;
      setLoading(true);

      try {
        const foundUser = await getUserByUsername(username);
        if (!foundUser || !foundUser.id) {
          setNotFound(true);
          return;
        }

        setUser(foundUser);

        const posts = await getPostsByUserId(foundUser.id);
        setUserPosts(posts);

        await loadConnectUpsCount(foundUser.id);

        if (currentUser?.id && foundUser.id !== currentUser.id) {
          await checkConnection(currentUser.id, foundUser.id);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [username]);

  const checkConnection = async (uidA: string, uidB: string) => {
    const q = query(
      collection(db, 'connections'),
      where('userIdA', 'in', [uidA, uidB]),
      where('userIdB', 'in', [uidA, uidB])
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const data = docSnap.data();
      setConnStatus(data.status);
      setConnDocId(docSnap.id);
    }
  };

  const loadConnectUpsCount = async (uid: string) => {
    const q1 = query(collection(db, 'connections'), where('status', '==', 'friends'), where('userIdA', '==', uid));
    const q2 = query(collection(db, 'connections'), where('status', '==', 'friends'), where('userIdB', '==', uid));

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    setConnectUpsCount(snap1.docs.length + snap2.docs.length);
  };

  const handleConnect = async () => {
    if (!currentUser || !user || connStatus !== 'none') return;

    const ref = await addDoc(collection(db, 'connections'), {
      userIdA: currentUser.id,
      userIdB: user.id,
      status: 'pending'
    });

    await addDoc(collection(db, 'notifications'), {
      toUserId: user.id,
      fromUserId: currentUser.id,
      type: 'connect_request',
      createdAt: Timestamp.now()
    });

    setConnDocId(ref.id);
    setConnStatus('pending');
  };

  const formatDate = (date: Date | string) => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? 'Invalid date'
      : parsedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  };

  if (notFound) return <Navigate to="/search" replace />;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>

          {currentUser?.id !== user.id && (
            <div className="flex space-x-2">
              {connStatus === 'none' && (
                <Button onClick={handleConnect}>ConnectUp</Button>
              )}
              {connStatus === 'pending' && (
                <Button className="bg-yellow-500 text-white" disabled>Pending</Button>
              )}
              {connStatus === 'friends' && (
                <>
                  <Button className="bg-green-600 text-white" disabled>Friends</Button>
                  <Button onClick={() => navigate(`/messageuser/${user.username}`)} className="bg-blue-600 text-white">
                    Message
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">@{user.username}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.joinedDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UserPlus className="h-4 w-4" />
                  <span>{connectUpsCount} ConnectUps</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{userPosts.length}</span>
                  <span>Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Posts by {user.name}
            </h2>
          </div>
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400">{user.name} hasn't shared any thoughts yet.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {userPosts.map(post => (
                <PostCard key={post.id} post={post} showActions={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
