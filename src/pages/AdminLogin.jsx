import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { Lock, Mail, Eye, EyeOff, Shield, Sun, Moon, Languages } from 'lucide-react';
import { useAdminT } from '../context/LanguageContext';

export const AdminLogin = () => {
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { adminTheme, toggleAdminTheme } = useTheme();
  const { T, toggle: toggleLang, label: langLabel, isGujarati } = useAdminT();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Force logout on login page mount
  useEffect(() => {
    logout().catch(console.error);
  }, [logout]);

  // Check for session expiration flag
  useEffect(() => {
    const isExpired = sessionStorage.getItem('admin_session_expired');
    if (isExpired === 'true') {
      showToast('Session expired. You have been logged out because another admin logged in from a different browser or device.', 'error');
      sessionStorage.removeItem('admin_session_expired');
    }
  }, [showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in both email and password.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      showToast('Signed in successfully as Administrator.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('[Admin Auth Failure]', err);
      showToast('Invalid username or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4 py-12 relative">
      {/* Theme + Language toggles in top-right corner */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={toggleLang}
          title={T('adminLogin.languageSwitch')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-border text-light-text dark:text-dark-text transition-all focus:outline-none text-xs font-medium"
        >
          <Languages className="w-3.5 h-3.5 text-brand-primary" />
          <span className={isGujarati ? 'font-gujarati' : 'font-english'}>{langLabel}</span>
        </button>
        <button
          onClick={toggleAdminTheme}
          className="p-2 rounded-full border border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-border text-light-text dark:text-dark-text transition-colors focus:outline-none"
        >
          {adminTheme === 'dark' ? <Sun className="w-4 h-4 text-brand-accent" /> : <Moon className="w-4 h-4 text-brand-primary" />}
        </button>
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{T('adminLogin.title')}</h1>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-1 max-w-[280px]">
            {T('adminLogin.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs sm:text-sm">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="font-medium text-light-text dark:text-dark-text">{T('adminLogin.email')}</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-light-text dark:text-dark-text"
              />
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-light-muted dark:text-dark-muted" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-medium text-light-text dark:text-dark-text">{T('adminLogin.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-light-text dark:text-dark-text"
              />
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-light-muted dark:text-dark-muted" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-brand-primary text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-brand-primary/95 transition-all cursor-pointer shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{T('adminLogin.unlock')}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
