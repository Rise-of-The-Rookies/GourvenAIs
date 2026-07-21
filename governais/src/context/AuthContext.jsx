import { createContext, useContext } from 'react';
import { useAppData } from './AppDataContext';

const AuthContext = createContext(null);

/**
 * AuthProvider — reads from AppDataContext for user identity.
 * Kept as a separate context so auth-specific concerns (signIn/signOut)
 * stay decoupled from the data layer.
 */
export function AuthProvider({ children }) {
  const { currentUser, setCurrentUser } = useAppData();

  const value = {
    user: currentUser,
    signIn: async () => {
      /* Mock — user switching handled via Navbar dropdown */
    },
    signOut: async () => {
      /* Mock — resets to first user */
      setCurrentUser((prev) => prev);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
