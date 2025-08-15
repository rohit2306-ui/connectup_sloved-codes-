import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

export const searchUsers = async (searchQuery: string): Promise<User[]> => {
  try {
    if (!searchQuery.trim()) {
      // Return all users if no search query
      const usersQuery = query(collection(db, 'users'), orderBy('joinedDate', 'desc'));
      const querySnapshot = await getDocs(usersQuery);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: data.id,
          name: data.name,
          email: data.email,
          username: data.username,
          joinedDate: data.joinedDate.toDate(),
          avatar: data.avatar
        });
      });
      
      return users;
    }

    // Search by username
    const usernameQuery = query(
      collection(db, 'users'),
      where('username', '>=', searchQuery.toLowerCase()),
      where('username', '<=', searchQuery.toLowerCase() + '\uf8ff')
    );
    
    // Search by name (case-insensitive)
    const nameQuery = query(
      collection(db, 'users'),
      where('name', '>=', searchQuery),
      where('name', '<=', searchQuery + '\uf8ff')
    );

    const [usernameSnapshot, nameSnapshot] = await Promise.all([
      getDocs(usernameQuery),
      getDocs(nameQuery)
    ]);

    const users: User[] = [];
    const userIds = new Set<string>();

    // Add users from username search
    usernameSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!userIds.has(data.id)) {
        userIds.add(data.id);
        users.push({
          id: data.id,
          name: data.name,
          email: data.email,
          username: data.username,
          joinedDate: data.joinedDate.toDate(),
          avatar: data.avatar
        });
      }
    });

    // Add users from name search
    nameSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!userIds.has(data.id)) {
        userIds.add(data.id);
        users.push({
          id: data.id,
          name: data.name,
          email: data.email,
          username: data.username,
          joinedDate: data.joinedDate.toDate(),
          avatar: data.avatar
        });
      }
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', username)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      return null;
    }

    const userData = querySnapshot.docs[0].data();
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      joinedDate: userData.joinedDate.toDate(),
      avatar: userData.avatar
    };
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      joinedDate: userData.joinedDate.toDate(),
      avatar: userData.avatar
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};