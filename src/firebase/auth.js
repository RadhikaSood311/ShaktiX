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
 * Prevents displaying raw Firebase stack traces while ensuring detailed feedback.
 */
export const mapAuthCodeToMessage = (errorCode, rawMessage = "") => {
  console.error("[DEBUG Auth] Mapping Firebase Auth Error Code:", errorCode, "| Raw Message:", rawMessage);
  
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'The email address format is invalid. Please check and try again.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or sign up for a new account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your password and try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. If you originally registered using Google, please sign in with Google below.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. If you previously signed in using Google, please use "Sign in with Google" below.';
    case 'auth/account-exists-with-different-credential':
    case 'auth/credential-already-in-use':
      return 'An account already exists with this email address using a different sign-in method (such as Google). Please sign in using that method.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with letters and numbers.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to multiple failed login attempts. Please wait a few minutes and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in your Firebase Console. Please enable Email/Password under Authentication > Sign-in method.';
    case 'auth/internal-error':
      return 'An internal authentication error occurred. Please try again.';
    default:
      if (rawMessage && typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
        const cleanedMsg = rawMessage.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/.*\)\.?$/i, '');
        return cleanedMsg || 'Authentication failed. Please check your details and try again.';
      }
      return 'Authentication failed. Please check your information and try again.';
  }
};

/**
 * Sign up a new user with Email and Password using Firebase Auth.
 */
export const signupUser = async ({ email, password, name }) => {
  console.log("[DEBUG firebase/auth.js] 1. signupUser called with email:", email, "name:", name);
  try {
    console.log("[DEBUG firebase/auth.js] 2. Calling createUserWithEmailAndPassword...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("[DEBUG firebase/auth.js] 3. createUserWithEmailAndPassword SUCCESS, UID:", userCredential?.user?.uid);
    
    if (name && userCredential.user) {
      try {
        console.log("[DEBUG firebase/auth.js] 4. Calling updateProfile with displayName:", name);
        await updateProfile(userCredential.user, { displayName: name });
        console.log("[DEBUG firebase/auth.js] 5. updateProfile SUCCESS");
      } catch (profileErr) {
        console.warn("[DEBUG firebase/auth.js] updateProfile warning:", profileErr);
      }
    }
    const result = { ok: true, user: userCredential.user };
    console.log("[DEBUG firebase/auth.js] 6. signupUser returning result:", result);
    return result;
  } catch (error) {
    console.error("[DEBUG firebase/auth.js] ERROR in createUserWithEmailAndPassword -> Code:", error?.code, "Message:", error?.message);
    const result = { ok: false, error: mapAuthCodeToMessage(error?.code, error?.message) };
    console.log("[DEBUG firebase/auth.js] 6. signupUser returning error result:", result);
    return result;
  }
};

/**
 * Log in an existing user with Email and Password using Firebase Auth.
 */
export const loginUser = async ({ email, password }) => {
  console.log("[DEBUG firebase/auth.js] loginUser called with email:", email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("[DEBUG firebase/auth.js] signInWithEmailAndPassword SUCCESS, UID:", userCredential?.user?.uid);
    return { ok: true, user: userCredential.user };
  } catch (error) {
    console.error("[DEBUG firebase/auth.js] ERROR in signInWithEmailAndPassword -> Code:", error?.code, "Message:", error?.message);
    return { ok: false, error: mapAuthCodeToMessage(error?.code, error?.message) };
  }
};

/**
 * Sign in using Google OAuth popup provider.
 */
export const loginWithGoogleProvider = async () => {
  console.log("[DEBUG firebase/auth.js] loginWithGoogleProvider called");
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    console.log("[DEBUG firebase/auth.js] signInWithPopup SUCCESS, UID:", userCredential?.user?.uid);
    return { ok: true, user: userCredential.user };
  } catch (error) {
    console.error("[DEBUG firebase/auth.js] ERROR in signInWithPopup -> Code:", error?.code, "Message:", error?.message);
    return { ok: false, error: mapAuthCodeToMessage(error?.code, error?.message) };
  }
};

/**
 * Log out current Firebase user.
 */
export const logoutUser = async () => {
  console.log("[DEBUG firebase/auth.js] logoutUser called");
  try {
    await signOut(auth);
    console.log("[DEBUG firebase/auth.js] signOut SUCCESS");
    return { ok: true };
  } catch (error) {
    console.error("[DEBUG firebase/auth.js] ERROR in signOut:", error);
    return { ok: false, error: error?.message || "Failed to sign out." };
  }
};
