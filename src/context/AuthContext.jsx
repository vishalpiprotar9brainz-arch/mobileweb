import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Authentication status changes
  useEffect(() => {
    // Force logout on initial load / page refresh if pathname starts with /admin
    const isEditingAdmin = window.location.pathname.startsWith('/admin');
    if (isEditingAdmin) {
      authService.logout().catch(console.error);
    }

    const unsubscribe = authService.subscribeAuth((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to session database changes when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeSession = authService.subscribeSession((sessionData) => {
      if (sessionData) {
        const localSessionId = sessionStorage.getItem('admin_session_id');
        if (localSessionId && sessionData.sessionId !== localSessionId) {
          console.warn("[Auth Security] Active admin session hijacked by another device or browser. Terminating session...");
          
          // Trigger expired state flag
          sessionStorage.setItem('admin_session_expired', 'true');
          sessionStorage.removeItem('admin_session_id');
          
          // Call logout to clear remote/local state and update currentUser
          authService.logout().then(() => {
            setCurrentUser(null);
          });
        }
      }
    });

    return () => unsubscribeSession();
  }, [currentUser]);

  const login = useCallback(async (email, password) => {
    const user = await authService.login(email, password);
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    const result = await authService.logout();
    setCurrentUser(null);
    return result;
  }, []);

  const value = {
    currentUser: currentUser || authService.getCurrentUserSync(),
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
