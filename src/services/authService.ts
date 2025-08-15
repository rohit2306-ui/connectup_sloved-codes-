import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  query,
  where,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, SignupData } from '../types';

export const createUser = async (
  userData: SignupData
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check for unique username
    const usernameQuery = query(
      collection(db, 'users'),
      where('username', '==', userData.username)
    );
    const usernameSnapshot = await getDocs(usernameQuery);
    if (!usernameSnapshot.empty) {
      return { success: false, error: 'Username already exists' };
    }

    // Create user in Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user = userCredential.user;

    // Set Firebase displayName
    await updateProfile(user, {
      displayName: userData.name
    });

    // Save user info to Firestore
    const userDoc = {
      id: user.uid,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      joinedDate: new Date(),
      avatar: null
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return { success: true };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

export const signInUser = async (
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let email = emailOrUsername;

    // Username login support
    if (!emailOrUsername.includes('@')) {
      const q = query(collection(db, 'users'), where('username', '==', emailOrUsername));
      const snap = await getDocs(q);
      if (snap.empty) return { success: false, error: 'User not found' };
      email = snap.docs[0].data().email;
    }

    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: 'Invalid email/username or password' };
  }
};

export const signOutUser = async (): Promise<{ success: boolean }> => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false };
  }
};

export const getCurrentUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', firebaseUser.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    const data = docSnap.data();

    return {
      id: firebaseUser.uid,
      name: data.name,
      email: data.email,
      username: data.username,
      joinedDate: data.joinedDate?.toDate ? data.joinedDate.toDate() : new Date(data.joinedDate),
      avatar: data.avatar || null
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<boolean> => {
  try {
    await setDoc(doc(db, 'users', userId), updates, { merge: true });

    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: updates.name
      });
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
};
