import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Manages TWO fully independent themes:
 *  - frontendTheme → saved in localStorage['frontend-theme']
 *  - adminTheme    → saved in localStorage['admin-theme']
 *
 * The AppLayout wrapper reads which one to apply based on the current URL.
 * The <html> element's colorScheme is updated based on whichever panel is active.
 */
export const ThemeProvider = ({ children }) => {
  const [frontendTheme, setFrontendTheme] = useState(() => {
    return localStorage.getItem('frontend-theme') || 'light';
  });

  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem('admin-theme') || 'dark';
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('frontend-theme', frontendTheme);
  }, [frontendTheme]);

  useEffect(() => {
    localStorage.setItem('admin-theme', adminTheme);
  }, [adminTheme]);

  const toggleFrontendTheme = () =>
    setFrontendTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const toggleAdminTheme = () =>
    setAdminTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider
      value={{
        frontendTheme,
        adminTheme,
        toggleFrontendTheme,
        toggleAdminTheme,
        // Convenience: isDark for whichever route you're on (resolved by AppLayout)
        isFrontendDark: frontendTheme === 'dark',
        isAdminDark: adminTheme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
