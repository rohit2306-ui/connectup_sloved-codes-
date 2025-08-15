import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUser, signInUser, signOutUser, getCurrentUserData } from '../services/authService';
import { User, AuthContextType, SignupData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, get their data from Firestore
        const userData = await getCurrentUserData(firebaseUser);
        setUser(userData);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    
    try {
      const result = await signInUser(emailOrUsername, password);
      setAuthLoading(false);
      return result.success;
    } catch (error) {
      setAuthLoading(false);
      return false;
    }
  };

  const signup = async (userData: SignupData): Promise<{ success: boolean; error?: string }> => {
  setAuthLoading(true);

  try {
    const result = await createUser(userData);
    setAuthLoading(false);
    return result;
  } catch (error) {
    setAuthLoading(false);
    return { success: false, error: 'Signup failed' };
  }
};


  const logout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading: authLoading,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};