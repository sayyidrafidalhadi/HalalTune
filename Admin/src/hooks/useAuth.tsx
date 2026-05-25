import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Initializing onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("AuthProvider: Auth state changed", user ? "User logged in" : "No user");
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error("AuthProvider: onAuthStateChanged error", error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass).then(() => {});
  const signOut = () => firebaseSignOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
        <p className="text-white/40 font-medium animate-pulse">Initializing Security...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
