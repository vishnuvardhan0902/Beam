import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as ApiService from '../services/api';
import { auth, googleProvider } from '../config/firebase';
import { signOut, getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle Google sign-in
  const signInWithGoogle = async () => {
    try {
      // First try popup (it's better UX when it works)
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error with popup auth, falling back to redirect:", error);
      // Fallback to redirect if popup fails
      signInWithRedirect(auth, googleProvider);
      return null;
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('userInfo');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
        
        // Check for redirect result from Google authentication
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('Got redirect result:', result.user);
          // Process the Google sign-in result
          const googleUser = result.user;
          try {
            const userData = await ApiService.googleLogin({
              googleId: googleUser.uid,
              email: googleUser.email || '',
              name: googleUser.displayName || '',
              avatar: googleUser.photoURL || undefined,
            });
            
            setUser(userData);
          } catch (err: any) {
            const message = err.message || 'Google login failed';
            setError(message);
            await signOut(auth); // Sign out from Firebase if backend authentication fails
            console.error('Google redirect auth error:', message);
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err);
        // Clear invalid data
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await ApiService.login(email, password);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const userData = await ApiService.register(name, email, password);
      setUser(userData);
      return userData;
    } catch (err: any) {
      const message = err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting Google authentication');
      
      // Use combined method that tries popup first, then falls back to redirect
      const result = await signInWithGoogle();
      
      if (result && result.user) {
        console.log('Got Google user:', result.user);
        // Get Google user data
        const googleUser = result.user;
        const userData = await ApiService.googleLogin({
          googleId: googleUser.uid,
          email: googleUser.email || '',
          name: googleUser.displayName || '',
          avatar: googleUser.photoURL || undefined,
        });
        
        setUser(userData);
        return userData;
      }
      
      // If we got null, it means we're in redirect flow
      // The redirect will be handled in the useEffect
      return {} as User; // Temporary user object for TypeScript
      
    } catch (err: any) {
      // Only set error if it's not a redirect (which shows as an error but isn't)
      if (err.code !== 'auth/redirect-cancelled-by-user') {
        const message = err.message || 'Google login failed';
        setError(message);
        console.error('Google auth error:', err);
        throw new Error(message);
      }
      return {} as User; // Return empty for redirect flow
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await ApiService.logout();
      await signOut(auth); // Sign out from Firebase
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local user data even if Firebase logout fails
      ApiService.logout();
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Function to update user data directly (useful for updating seller status)
  const updateUserState = (userData: User): void => {
    setUser(userData);
    // Also update the stored user data
    localStorage.setItem('userInfo', JSON.stringify(userData));
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
        updateUserState,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        isSeller: user?.isSeller || false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthContextProvider');
  }
  return context;
};

export default AuthContext; 