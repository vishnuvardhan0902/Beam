import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
export const signInWithGoogle = async () => {
  try {
    // Use browserPopupRedirectResolver to handle popup blocks
    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    const user = result.user;
    return {
      googleId: user.uid,
      email: user.email,
      name: user.displayName,
      avatar: user.photoURL
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Please allow popups for this website to sign in with Google');
    }
    throw error;
  }
};

export { auth }; 