'use client';

import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import {
  onAuthStateChanged,
  signOut,
  type User,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface UserContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          try {
            await setDoc(userDocRef, {
              displayName: user.displayName,
              email: user.email,
            });
          } catch (error: any) {
            console.error('Failed to create user profile:', error);
            toast({
              variant: 'destructive',
              title: 'Profile Creation Failed',
              description: 'Could not create your user profile in the database.',
            });
          }
        }
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, db, toast]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      toast({
        variant: 'destructive',
        title: 'Sign-In Failed',
        description:
          error.code === 'auth/popup-closed-by-user'
            ? 'The sign-in window was closed. Please try again.'
            : 'An unexpected error occurred during sign-in.',
      });
      if (error.code === 'auth/popup-closed-by-user') {
        setLoading(false);
      }
    }
  }, [auth, router, toast]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Firebase logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
      });
    }
  }, [auth, router, toast]);

  const value = useMemo(
    () => ({
      user,
      signInWithGoogle,
      logout,
      loading,
    }),
    [user, loading, signInWithGoogle, logout]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
