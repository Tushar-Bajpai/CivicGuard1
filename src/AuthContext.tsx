import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  civicScore: number;
  badges: string[];
  reportsCount: number;
  verifiedCount: number;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithGoogle: () => Promise<User | null>;
  signInAsDemo: (name?: string, email?: string) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  scoreToastEvent: { diff: number; id: number } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreToastEvent, setScoreToastEvent] = useState<{ diff: number; id: number } | null>(null);
  const prevScoreRef = useRef<number | null>(null);

  const fetchOrCreateUserProfile = async (firebaseUser: User, nameFromSignup?: string) => {
    if (!db) {
      console.warn("Firestore db is not configured. Skipping user profile fetch/create.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        console.log("Fetched existing user profile:", data);
      } else {
        // Document doesn't exist, create it
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          name: nameFromSignup || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Citizen",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || null,
          civicScore: 0, // starting civic score is 0
          badges: [],
          reportsCount: 0,
          verifiedCount: 0,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        console.log("Created brand new user profile in Firestore:", newProfile);
      }
    } catch (error) {
      console.error("Error managing user profile document in Firestore:", error);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchOrCreateUserProfile(currentUser);
    }
  };

  useEffect(() => {
    const savedDemo = localStorage.getItem("civicguard_demo_user");
    if (savedDemo) {
      try {
        const { mockUser, demoProfile } = JSON.parse(savedDemo);
        setCurrentUser(mockUser);
        setUserProfile(demoProfile);
        setLoading(false);
        return;
      } catch (e) {
        console.error("Failed to parse saved demo user:", e);
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchOrCreateUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen for realtime profile updates
  useEffect(() => {
    if (!db || !currentUser || currentUser.uid === "demo-user-123") return;
    const unsubscribeProfile = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        
        // Detect civicScore increase for toast notification
        if (prevScoreRef.current !== null && data.civicScore > prevScoreRef.current) {
          const diff = data.civicScore - prevScoreRef.current;
          setScoreToastEvent({ diff, id: Date.now() });
        }
        
        // Update ref and state
        prevScoreRef.current = data.civicScore;
        setUserProfile(data);
      }
    });
    return () => unsubscribeProfile();
  }, [currentUser]);

  const signInAsDemo = (name: string = "Civic Guard Guest", email: string = "demo@civicguard.org") => {
    setLoading(true);
    const mockUser = {
      uid: "demo-user-123",
      email: email,
      displayName: name,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
    } as User;

    const demoProfile: UserProfile = {
      id: "demo-user-123",
      name: name,
      email: email,
      photoURL: null,
      civicScore: 120,
      badges: ["Active Citizen", "Municipal Reporter"],
      reportsCount: 3,
      verifiedCount: 5,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(mockUser);
    setUserProfile(demoProfile);
    prevScoreRef.current = demoProfile.civicScore;
    localStorage.setItem("civicguard_demo_user", JSON.stringify({ mockUser, demoProfile }));
    setLoading(false);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update the Auth display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Explicitly create the Firestore document with specific fields
      if (db) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const newProfile: UserProfile = {
            id: firebaseUser.uid,
            name: name,
            email: email,
            photoURL: null,
            civicScore: 0, // 0 as requested
            badges: [], // empty array as requested
            reportsCount: 0,
            verifiedCount: 0,
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        } catch (firestoreErr) {
          console.error("Firestore user profile creation failed, falling back to local profile:", firestoreErr);
          const localProfile: UserProfile = {
            id: firebaseUser.uid,
            name: name,
            email: email,
            photoURL: null,
            civicScore: 0,
            badges: [],
            reportsCount: 0,
            verifiedCount: 0,
            createdAt: new Date().toISOString()
          };
          setUserProfile(localProfile);
        }
      }

      setCurrentUser(firebaseUser);
      return firebaseUser;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      await fetchOrCreateUserProfile(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      setCurrentUser(firebaseUser);
      await fetchOrCreateUserProfile(firebaseUser);
      return firebaseUser;
    } catch (error) {
      console.error("Error Google sign-in:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("civicguard_demo_user");
    if (!auth) {
      setCurrentUser(null);
      setUserProfile(null);
      return;
    }
    
    setLoading(true);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, signInAsDemo, logout, refreshProfile, scoreToastEvent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
