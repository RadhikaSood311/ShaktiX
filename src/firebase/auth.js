import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

/**
 * Maps Firebase Auth error codes to user-friendly human-readable messages.
 * Prevents displaying raw Firebase stack traces or technical codes to users.
 */
export const mapAuthCodeToMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address format is invalid. Please check and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again later.';
    default:
      return 'Authentication failed. Please check your information and try again.';
  }
};

/**
 * Sign up a new user with Email and Password using Firebase Auth.
 */
export const signupUser = async ({ email, password, name }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return { ok: true, user: userCredential.user };
  } catch (error) {
    return { ok: false, error: mapAuthCodeToMessage(error.code) };
  }
};

/**
 * Log in an existing user with Email and Password using Firebase Auth.
 */
export const loginUser = async ({ email, password }) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: userCredential.user };
  } catch (error) {
    return { ok: false, error: mapAuthCodeToMessage(error.code) };
  }
};

/**
 * Sign in using Google OAuth popup provider.
 */
export const loginWithGoogleProvider = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return { ok: true, user: userCredential.user };
  } catch (error) {
    return { ok: false, error: mapAuthCodeToMessage(error.code) };
  }
};

/**
 * Log out current Firebase user.
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};
