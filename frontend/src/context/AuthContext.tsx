import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { login as loginApi, logout as logoutApi, register as registerApi, googleLogin as googleLoginApi } from '../services/api';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signOut, UserCredential } from 'firebase/auth';
import { User, AuthContextType, GoogleUser } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await loginApi(email, password);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err: any) {
      setLoading(false);
      setError(err.toString());
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await registerApi(name, email, password);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err: any) {
      setLoading(false);
      setError(err.toString());
      throw err;
    }
  };

  const googleLogin = async (): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with Google popup using Firebase
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      
      // Get Google user data
      const googleUser = result.user;
      const userData = await googleLoginApi({
        uid: googleUser.uid,
        email: googleUser.email || '',
        displayName: googleUser.displayName || '',
        photoURL: googleUser.photoURL || undefined,
      });
      
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err: any) {
      setLoading(false);
      setError(err.toString());
      await signOut(auth); // Sign out from Firebase if backend authentication fails
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      logoutApi();
      await signOut(auth); // Sign out from Firebase
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local user data even if Firebase logout fails
      logoutApi();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        googleLogin,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 