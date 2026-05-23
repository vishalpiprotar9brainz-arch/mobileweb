import { createContext, useContext, useState, useEffect } from 'react';
import { t as translate } from '../translations/index.js';

const LanguageContext = createContext();

/**
 * Manages TWO fully independent language states:
 *  - frontendLang → saved in localStorage['frontend-language']
 *  - adminLang    → saved in localStorage['admin-language']
 *
 * The AppLayout wrapper applies the right .lang-en / .lang-gu class
 * based on the current URL route.
 */
export const LanguageProvider = ({ children }) => {
  const [frontendLang, setFrontendLang] = useState(() => {
    return localStorage.getItem('frontend-language') || 'en';
  });

  const [adminLang, setAdminLang] = useState(() => {
    return localStorage.getItem('admin-language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('frontend-language', frontendLang);
  }, [frontendLang]);

  useEffect(() => {
    localStorage.setItem('admin-language', adminLang);
  }, [adminLang]);

  const toggleFrontendLang = () =>
    setFrontendLang(prev => (prev === 'en' ? 'gu' : 'en'));

  const toggleAdminLang = () =>
    setAdminLang(prev => (prev === 'en' ? 'gu' : 'en'));

  /**
   * Returns a translator function bound to the given panel.
   * Usage: const T = useT('frontend'); T('nav.home') → 'Home' or 'હોમ'
   *        const T = useT('admin');    T('admin.overview') → 'Overview' or 'ઓવરવ્યૂ'
   */
  const getFrontendT = () => (key) => translate(frontendLang, key);
  const getAdminT = () => (key) => translate(adminLang, key);

  return (
    <LanguageContext.Provider
      value={{
        frontendLang,
        adminLang,
        isFrontendGujarati: frontendLang === 'gu',
        isAdminGujarati: adminLang === 'gu',
        toggleFrontendLang,
        toggleAdminLang,
        getFrontendT,
        getAdminT,
        // Labels for the toggle button
        frontendLangLabel: frontendLang === 'en' ? 'EN' : 'ગુ',
        adminLangLabel: adminLang === 'en' ? 'EN' : 'ગુ',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

/**
 * Convenience hook for FRONTEND components.
 * Returns a translator function T(key) and the current language code.
 */
export const useFrontendT = () => {
  const { frontendLang, getFrontendT, toggleFrontendLang, frontendLangLabel, isFrontendGujarati } = useLanguage();
  return {
    T: getFrontendT(),
    lang: frontendLang,
    toggle: toggleFrontendLang,
    label: frontendLangLabel,
    isGujarati: isFrontendGujarati,
  };
};

/**
 * Convenience hook for ADMIN components.
 * Returns a translator function T(key) and the current language code.
 */
export const useAdminT = () => {
  const { adminLang, getAdminT, toggleAdminLang, adminLangLabel, isAdminGujarati } = useLanguage();
  return {
    T: getAdminT(),
    lang: adminLang,
    toggle: toggleAdminLang,
    label: adminLangLabel,
    isGujarati: isAdminGujarati,
  };
};
