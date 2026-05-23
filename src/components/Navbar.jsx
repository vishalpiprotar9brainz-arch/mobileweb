import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, SlidersHorizontal, User, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useFrontendT } from '../context/LanguageContext';
import { dbService } from '../firebase';

export const Navbar = ({ searchPlaceholder }) => {
  const { frontendTheme, toggleFrontendTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const { T, toggle: toggleLang, label: langLabel, isGujarati } = useFrontendT();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({ logoText: 'AeroMobile' });
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  // Close mobile menu on route change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = dbService.subscribeSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = dbService.subscribeCategories((data) => {
      setCategories(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
    setShowCategories(false);
    setIsOpen(false);
  };

  const handleAdminPortalClick = async (e) => {
    e.preventDefault();
    setIsOpen(false);
    try { await logout(); } catch (err) { console.error(err); }
    navigate('/admin/login');
  };

  const ph = searchPlaceholder || T('nav.searchPlaceholder');

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 glass-effect border-b border-light-border dark:border-dark-border shadow-sm">
      {/* Announcement Banner */}
      {settings.announcement && (
        <div className="w-full bg-brand-primary text-white text-xs py-2 px-4 text-center font-medium tracking-wide overflow-hidden whitespace-nowrap overflow-ellipsis">
          {settings.announcement}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent hover:opacity-90 transition-opacity tracking-tight truncate max-w-[140px] sm:max-w-none">
              {settings.logoText || 'AeroMobile'}
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={ph}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-light-border bg-light-bg/50 focus:bg-light-surface dark:border-dark-border dark:bg-dark-surface/40 dark:focus:bg-dark-surface text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-normal transition-all duration-300"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-light-muted dark:text-dark-muted" />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-medium text-sm text-light-muted dark:text-dark-muted">
            <Link to="/" className={`hover:text-brand-primary transition-colors ${location.pathname === '/' ? 'text-brand-primary font-semibold' : ''}`}>
              {T('nav.home')}
            </Link>

            {/* Brands Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-1.5 hover:text-brand-primary transition-colors font-medium focus:outline-none"
              >
                <span>{T('nav.brands')}</span>
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

              {showCategories && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowCategories(false)} />
                  <div className="absolute left-0 mt-3 w-48 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-xl p-2 z-20 flex flex-col gap-1">
                    <Link
                      to="/shop"
                      onClick={() => setShowCategories(false)}
                      className="px-3 py-2 rounded-lg text-left hover:bg-light-bg dark:hover:bg-dark-border text-light-text dark:text-dark-text font-medium text-xs text-brand-primary"
                    >
                      {T('nav.viewAllDevices')}
                    </Link>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.name)}
                        className="px-3 py-2 rounded-lg text-left hover:bg-light-bg dark:hover:bg-dark-border font-medium text-light-text dark:text-dark-text text-xs"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Link to="/about" className={`hover:text-brand-primary transition-colors ${location.pathname === '/about' ? 'text-brand-primary font-semibold' : ''}`}>
              {T('nav.about')}
            </Link>
            <Link to="/contact" className={`hover:text-brand-primary transition-colors ${location.pathname === '/contact' ? 'text-brand-primary font-semibold' : ''}`}>
              {T('nav.contact')}
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleFrontendTheme}
              className="p-2 rounded-full border border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-border text-light-text dark:text-dark-text transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              {frontendTheme === 'dark'
                ? <Sun className="w-4 h-4 text-brand-accent animate-pulse-slow" />
                : <Moon className="w-4 h-4 text-brand-primary" />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              title={T('nav.languageSwitch')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-border text-light-text dark:text-dark-text transition-all focus:outline-none text-xs font-medium"
              aria-label="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-brand-primary" />
              <span className={isGujarati ? 'font-gujarati' : 'font-english'}>{langLabel}</span>
            </button>

            {/* Admin Portal */}
            <Link
              to="/admin/login"
              onClick={handleAdminPortalClick}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-light-text text-light-bg hover:opacity-90 dark:bg-dark-text dark:text-dark-bg transition-opacity"
            >
              <User className="w-3.5 h-3.5" />
              <span>{currentUser ? T('nav.adminDashboard') : T('nav.adminPortal')}</span>
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-2">
            <button
              onClick={toggleFrontendTheme}
              className="p-1.5 sm:p-2 rounded-full border border-light-border dark:border-dark-border text-light-text dark:text-dark-text transition-colors focus:outline-none"
            >
              {frontendTheme === 'dark'
                ? <Sun className="w-4 h-4 text-brand-accent" />
                : <Moon className="w-4 h-4 text-brand-primary" />}
            </button>

            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full border border-light-border dark:border-dark-border text-light-text dark:text-dark-text transition-colors focus:outline-none text-[10px] sm:text-xs font-medium"
              aria-label="Toggle Language"
            >
              <Languages className="w-3.5 h-3.5 text-brand-primary" />
              <span className={isGujarati ? 'font-gujarati' : 'font-english'}>{langLabel}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 sm:p-2 rounded-full border border-light-border dark:border-dark-border text-light-text dark:text-dark-text transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-t border-light-border dark:border-dark-border bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-lg px-4 py-6 shadow-xl flex flex-col gap-6">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={T('nav.mobileSearch')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-surface text-light-text dark:text-dark-text focus:outline-none font-normal text-sm"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-light-muted dark:text-dark-muted" />
          </form>

          {/* Links */}
          <div className="flex flex-col gap-4 font-medium text-lg text-light-text dark:text-dark-text">
            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">
              {T('nav.home')}
            </Link>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-light-muted dark:text-dark-muted uppercase tracking-wider">
                {T('nav.brandsLabel')}
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="px-2 py-1.5 bg-light-bg dark:bg-dark-border rounded-lg text-xs hover:bg-brand-primary hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <Link to="/about" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">
              {T('nav.about')}
            </Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="hover:text-brand-primary transition-colors">
              {T('nav.contact')}
            </Link>
          </div>

          {/* Bottom Admin Action */}
          <div className="pt-4 border-t border-light-border dark:border-dark-border">
            <Link
              to="/admin/login"
              onClick={handleAdminPortalClick}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary/90 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>{currentUser ? T('nav.adminDashboard') : T('nav.adminLogin')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
