import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post, Comment } from '../types';

// ✅ Create a new post
export const createPost = async (
  userId: string,
  content: string,
  imageUrl: string = ''
): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false, error: 'User not found' };

    const userData = userSnap.data();

    const postData = {
      userId,
      username: userData?.username || '',
      name: userData?.name || '',
      content: content.trim(),
      imageUrl,
      createdAt: Timestamp.now(),
      likes: [],
      comments: []
    };

    await addDoc(collection(db, 'posts'), postData);
    return { success: true };
  } catch (error: any) {
    console.error('Error creating post:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Get all posts
export const getPosts = async (): Promise<Post[]> => {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const posts: Post[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      posts.push({
        id: docSnap.id,
        userId: data.userId,
        username: data.username || '',
        name: data.name || '',
        content: data.content,
        imageUrl: data.imageUrl || '',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        likes: data.likes || [],
        comments: (data.comments || []).map((c: any) => ({
          ...c,
          createdAt: c.createdAt?.toDate?.() || new Date()
        }))
      });
    });

    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

// ✅ Get posts by a specific user
export const getPostsByUserId = async (userId: string): Promise<Post[]> => {
  try {
    const q = query(collection(db, 'posts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const posts: Post[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      posts.push({
        id: docSnap.id,
        userId: data.userId,
        username: data.username,
        name: data.name,
        content: data.content,
        imageUrl: data.imageUrl || '',
        createdAt: data.createdAt.toDate(),
        likes: data.likes || [],
        comments: (data.comments || []).map((c: any) => ({
          ...c,
          createdAt: c.createdAt.toDate(),
        }))
      });
    });

    return posts;
  } catch (error) {
    console.error('Error in getPostsByUserId:', error);
    return [];
  }
};


// ✅ Like or unlike a post
export const likePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return false;

    const data = postSnap.data();
    const likes = data.likes || [];

    if (likes.includes(userId)) {
      await updateDoc(postRef, { likes: arrayRemove(userId) });
    } else {
      await updateDoc(postRef, { likes: arrayUnion(userId) });
    }

    return true;
  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return false;
  }
};

// ✅ Add a comment to a post
export const addComment = async (
  postId: string,
  userId: string,
  content: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userSnap.data();
    const comment: Comment = {
      id: Date.now().toString(),
      userId,
      username: userData.username || '',
      name: userData.name || '',
      content: content.trim(),
      createdAt: new Date()
    };

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        ...comment,
        createdAt: Timestamp.fromDate(comment.createdAt)
      })
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding comment:', error.message);
    return { success: false, error: error.message };
  }
};

// ✅ Delete a post
export const deletePost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) return false;
    const data = postSnap.data();
    if (data.userId !== userId) return false;

    await deleteDoc(postRef);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};

// ✅ Real-time subscription to all posts
export const subscribeToPostsRealtime = (callback: (posts: Post[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const posts: Post[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      posts.push({
        id: docSnap.id,
        userId: data.userId,
        username: data.username || '',
        name: data.name || '',
        content: data.content,
        imageUrl: data.imageUrl || '',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        likes: data.likes || [],
        comments: (data.comments || []).map((c: any) => ({
          ...c,
          createdAt: c.createdAt?.toDate?.() || new Date()
        }))
      });
    });
    callback(posts);
  });
};
