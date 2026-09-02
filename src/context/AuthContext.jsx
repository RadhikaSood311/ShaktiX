import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, updateProfile as firebaseUpdateProfile } from "firebase/auth";
import { auth } from "../firebase";
import { loginUser, signupUser, loginWithGoogleProvider, logoutUser } from "../firebase/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase Auth state changes as the single source of truth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user object to expose consistent properties for existing components
        const formattedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || "",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          photoURL: firebaseUser.photoURL || "",
          avatar: firebaseUser.photoURL || "",
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(formattedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    return await loginUser({ email, password });
  };

  const signup = async (profile) => {
    // profile contains { name, email, password }
    return await signupUser(profile);
  };

  const loginWithGoogle = async () => {
    return await loginWithGoogleProvider();
  };

  const logout = async () => {
    return await logoutUser();
  };

  const updateProfile = async (updates) => {
    try {
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: updates.name || updates.displayName || auth.currentUser.displayName,
          photoURL: updates.avatar || updates.photoURL || auth.currentUser.photoURL
        });
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, loginWithGoogle, logout, updateProfile }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
