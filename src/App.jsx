import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// ─── Code Splitting (Lazy Loading) ─────────────────────────────────────────
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const ProductDetails = lazy(() => import('./pages/ProductDetails').then(m => ({ default: m.ProductDetails })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import('./pages/ContactUs').then(m => ({ default: m.ContactUs })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// ─── Suspense Fallback Loader ─────────────────────────────────────────────
const SuspenseLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center bg-light-bg dark:bg-dark-bg">
    <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
    <p className="text-sm font-medium text-light-muted dark:text-dark-muted animate-pulse">
      Loading AeroMobile...
    </p>
  </div>
);

// ─── Protected Route Guard ─────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide animate-pulse">Checking credentials & session...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// ─── App Layout ─────────────────────────────────────────────────────────────
/**
 * Applies independent theme + language classes to a wrapper <div>.
 *
 * Frontend routes → frontendTheme + frontendLang  → class: dark?  lang-en | lang-gu
 * Admin routes    → adminTheme   + adminLang       → class: dark?  lang-en | lang-gu
 *
 * Because Tailwind v4 uses @custom-variant dark (&:where(.dark, .dark *)), the
 * .dark class anywhere in the ancestor chain activates dark: utilities — so
 * scoping .dark to this wrapper div is fully sufficient.
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const { frontendTheme, adminTheme } = useTheme();
  const { frontendLang, adminLang } = useLanguage();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const theme = isAdminRoute ? adminTheme : frontendTheme;
  const lang  = isAdminRoute ? adminLang  : frontendLang;

  const themeClass = theme === 'dark' ? 'dark' : '';
  const langClass  = lang  === 'gu'   ? 'lang-gu' : 'lang-en';

  // Update html element for accessibility / browser chrome (scrollbars, color-scheme)
  useEffect(() => {
    const html = document.documentElement;
    html.style.colorScheme = theme;
    html.setAttribute('lang', lang === 'gu' ? 'gu' : 'en');
  }, [theme, lang]);

  return (
    <div className={`${themeClass} ${langClass}`}>
      <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
        {!isAdminRoute && <Navbar />}
        <main className="flex-grow">
          {children}
        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </div>
  );
};

// ─── Root App ───────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppLayout>
<Suspense fallback={<SuspenseLoader />}>
<Routes>
  {/* Frontend Routes */}
  <Route path="/" element={<Home />} />
  <Route path="/shop" element={<Shop />} />
  <Route path="/product/:id" element={<ProductDetails />} />
  <Route path="/about" element={<AboutUs />} />
  <Route path="/contact" element={<ContactUs />} />

  {/* Admin Routes */}
  <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

  {/* 404 */}
                  <Route path="*" element={
                    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                      <span className="text-6xl">🔍</span>
                      <h2 className="text-2xl font-black">Page Not Found</h2>
                      <p className="text-sm text-light-muted dark:text-dark-muted max-w-xs leading-relaxed">
                        The URL link you followed might be broken or the page has been moved.
                      </p>
                      <a href="/" className="px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-full hover:opacity-90 transition-opacity">
                        Return Storefront Home
                      </a>
                    </div>
                  } />
                </Routes>
</Suspense>
</AppLayout>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
