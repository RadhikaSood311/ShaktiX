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
    console.log("[DEBUG AuthContext] Subscribing to onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("[DEBUG AuthContext] onAuthStateChanged fired: USER LOGGED IN, UID:", firebaseUser.uid, "email:", firebaseUser.email);
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
        console.log("[DEBUG AuthContext] onAuthStateChanged fired: NO USER (Logged Out)");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async ({ email, password }) => {
    try {
      console.log("[DEBUG AuthContext] login called for email:", email);
      const res = await loginUser({ email, password });
      console.log("[DEBUG AuthContext] loginUser returned:", res);
      return res;
    } catch (err) {
      console.error("[DEBUG AuthContext] login error:", err);
      return { ok: false, error: err?.message || "Login failed. Please try again." };
    }
  };

  const signup = async (profile) => {
    try {
      console.log("[DEBUG AuthContext] signup called for email:", profile.email);
      const res = await signupUser(profile);
      console.log("[DEBUG AuthContext] signupUser returned:", res);
      return res;
    } catch (err) {
      console.error("[DEBUG AuthContext] signup error:", err);
      return { ok: false, error: err?.message || "Signup failed. Please try again." };
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log("[DEBUG AuthContext] loginWithGoogle called");
      const res = await loginWithGoogleProvider();
      console.log("[DEBUG AuthContext] loginWithGoogleProvider returned:", res);
      return res;
    } catch (err) {
      console.error("[DEBUG AuthContext] Google login error:", err);
      return { ok: false, error: err?.message || "Google sign-in failed." };
    }
  };

  const logout = async () => {
    try {
      console.log("[DEBUG AuthContext] logout called");
      const res = await logoutUser();
      console.log("[DEBUG AuthContext] logoutUser returned:", res);
      return res;
    } catch (err) {
      console.error("[DEBUG AuthContext] logout error:", err);
      return { ok: false, error: err?.message || "Logout failed." };
    }
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
      console.error("[DEBUG AuthContext] updateProfile error:", err);
      return { ok: false, error: err?.message || "Failed to update profile." };
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, signup, loginWithGoogle, logout, updateProfile }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
