import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Smartphone } from 'lucide-react';
import { dbService } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useFrontendT } from '../context/LanguageContext';

export const Footer = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { T } = useFrontendT();

  const handleAdminPortalClick = async (e) => {
    e.preventDefault();
    try { await logout(); } catch (err) { console.error(err); }
    navigate('/admin/login');
  };

  const [settings, setSettings] = useState({
    storeName: 'AeroMobile Store',
    email: 'support@aeromobile.com',
    phone: '+1 (800) 555-MOBI',
    address: '742 Evergreen Terrace, Cupertino, CA 95014',
    logoText: 'AeroMobile',
    tagline: 'Your Premium Destination for Flagship Mobile Devices',
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const unsubSettings = dbService.subscribeSettings((data) => {
      if (data) setSettings(data);
    });
    const unsubCategories = dbService.subscribeCategories((data) => {
      setCategories(data);
    });
    return () => { unsubSettings(); unsubCategories(); };
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <footer className="bg-light-surface dark:bg-[#0b0f19] text-light-muted dark:text-gray-400 pt-16 pb-8 border-t border-light-border dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-light-border dark:border-gray-800/80">

          {/* Logo & Tagline */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-2xl font-semibold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent tracking-tight">
              {settings.logoText || 'AeroMobile'}
            </Link>
            <p className="text-sm text-light-muted dark:text-gray-400 font-medium leading-relaxed">
              {settings.tagline || 'Your Premium Destination for Flagship Mobile Devices'}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              {[
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>,
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>,
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>,
              ].map((svgPath, i) => (
                <a key={i} href="#" className="p-2.5 rounded-full bg-light-bg border border-light-border text-light-muted hover:bg-brand-primary hover:text-white dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-300 flex items-center justify-center">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">{svgPath}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="text-light-text dark:text-white text-sm font-semibold uppercase tracking-wider">{T('footer.quickNav')}</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/" className="hover:text-brand-primary dark:hover:text-white transition-colors">{T('footer.homeStore')}</Link></li>
              <li><Link to="/shop" className="hover:text-brand-primary dark:hover:text-white transition-colors">{T('footer.browseMobiles')}</Link></li>
              <li><Link to="/about" className="hover:text-brand-primary dark:hover:text-white transition-colors">{T('footer.aboutStory')}</Link></li>
              <li><Link to="/contact" className="hover:text-brand-primary dark:hover:text-white transition-colors">{T('footer.getInTouch')}</Link></li>
              <li><Link to="/admin/login" onClick={handleAdminPortalClick} className="hover:text-brand-primary dark:hover:text-white transition-colors">{T('footer.adminPortal')}</Link></li>
            </ul>
          </div>

          {/* Shop by Brand */}
          <div className="flex flex-col gap-4">
            <h3 className="text-light-text dark:text-white text-sm font-semibold uppercase tracking-wider">{T('footer.shopByBrand')}</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.name)}
                    className="hover:text-brand-primary dark:hover:text-white transition-colors text-left focus:outline-none cursor-pointer"
                  >
                    {cat.name} {T('footer.store')}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-light-text dark:text-white text-sm font-semibold uppercase tracking-wider">{T('footer.storeContact')}</h3>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-secondary flex-shrink-0 mt-0.5" />
                <span className="text-light-muted dark:text-gray-400">{settings.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-secondary flex-shrink-0 mt-0.5" />
                <span className="break-all text-light-muted dark:text-gray-400">{settings.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-secondary flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed text-light-muted dark:text-gray-400">{settings.address}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-light-muted/80 dark:text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} {settings.storeName}. {T('footer.allRights')}</p>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-brand-primary" />
            <span>{T('footer.designedFor')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
