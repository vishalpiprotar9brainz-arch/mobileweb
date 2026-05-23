import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { dbService } from '../firebase';
import { ProductCard } from '../components/ProductCard';
import { useFrontendT } from '../context/LanguageContext';

export const Home = () => {
  const navigate = useNavigate();
  const { T } = useFrontendT();
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const getBrandStyle = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('apple')) return { 
      logo: (
        <svg className="h-6 sm:h-8 md:h-10 w-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33z"/>
        </svg>
      ), 
      bg: "bg-neutral-100 dark:bg-neutral-800" 
    };
    if (lower.includes('samsung')) return { 
      logo: (
        <svg className="h-2.5 sm:h-3.5 md:h-4.5 w-auto" viewBox="0 9.5 24 5" fill="currentColor">
          <path d="M19.8166 10.2808l.0459 2.6934h-.023l-.7793-2.6934h-1.2837v3.3925h.8481l-.0458-2.785h.023l.8366 2.785h1.2264v-3.3925zm-16.149 0l-.6418 3.427h.9284l.4699-3.1175h.0229l.4585 3.1174h.9169l-.6304-3.4269zm5.1805 0l-.424 2.6132h-.023l-.424-2.6132H6.5788l-.0688 3.427h.8596l.023-3.0832h.0114l.573 3.0831h.8711l.5731-3.083h.023l.0228 3.083h.8596l-.0802-3.4269zm-7.2664 2.4527c.0343.0802.0229.1949.0114.2522-.0229.1146-.1031.2292-.3324.2292-.2177 0-.3438-.126-.3438-.3095v-.3323H0v.2636c0 .7679.6074.9971 1.2493.9971.6189 0 1.1346-.2178 1.2149-.7794.0458-.298.0114-.4928 0-.5616-.1605-.722-1.467-.9283-1.5588-1.3295-.0114-.0688-.0114-.1375 0-.1834.023-.1146.1032-.2292.3095-.2292.2063 0 .321.126.321.3095v.2063h.8595v-.2407c0-.745-.6762-.8596-1.1576-.8596-.6074 0-1.1117.2063-1.2034.7564-.023.149-.0344.2866.0114.4585.1376.7106 1.364.9169 1.5358 1.3524m11.152 0c.0343.0803.0228.1834.0114.2522-.023.1146-.1032.2292-.3324.2292-.2178 0-.3438-.126-.3438-.3095v-.3323h-.917v.2636c0 .7564.596.9857 1.2379.9857.6189 0 1.1232-.2063 1.2034-.7794.0459-.298.0115-.4814 0-.5616-.1375-.7106-1.4327-.9284-1.5243-1.318-.0115-.0688-.0115-.1376 0-.1835.0229-.1146.1031-.2292.3094-.2292.1948 0 .321.126.321.3095v.2063h.848v-.2407c0-.745-.6647-.8596-1.146-.8596-.6075 0-1.1004.1948-1.192.7564-.023.149-.023.2866.0114.4585.1376.7106 1.341.9054 1.513 1.3524m2.8882.4585c.2407 0 .3094-.1605.3323-.2522.0115-.0343.0115-.0917.0115-.126v-2.533h.871v2.4642c0 .0688 0 .1948-.0114.2292-.0573.6419-.5616.8482-1.192.8482-.6303 0-1.1346-.2063-1.192-.8482 0-.0344-.0114-.1604-.0114-.2292v-2.4642h.871v2.533c0 .0458 0 .0916.0115.126 0 .0917.0688.2522.3095.2522m7.1518-.0344c.2522 0 .3324-.1605.3553-.2522.0115-.0343.0115-.0917.0115-.126v-.4929h-.3553v-.5043H24v.917c0 .0687 0 .1145-.0115.2292-.0573.6303-.596.8481-1.2034.8481-.6075 0-1.1461-.2178-1.2034-.8481-.0115-.1147-.0115-.1605-.0115-.2293v-1.444c0-.0574.0115-.172.0115-.2293.0802-.6419.596-.8482 1.2034-.8482s1.1347.2063 1.2034.8482c.0115.1031.0115.2292.0115.2292v.1146h-.8596v-.1948s0-.0803-.0115-.1261c-.0114-.0802-.0802-.2521-.3438-.2521-.2521 0-.321.1604-.3438.2521-.0115.0458-.0115.1032-.0115.1605v1.5702c0 .0458 0 .0916.0115.126 0 .0917.0917.2522.3323.2522"/>
        </svg>
      ), 
      bg: "bg-blue-50 dark:bg-blue-950/30" 
    };
    if (lower.includes('google') || lower.includes('pixel')) return { 
      logo: (
        <svg className="h-6 sm:h-8 md:h-10 w-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
        </svg>
      ), 
      bg: "bg-indigo-50 dark:bg-indigo-950/20" 
    };
    if (lower.includes('oneplus')) return { 
      logo: (
        <svg className="h-6 sm:h-8 md:h-10 w-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3.74V24h20.26V12.428h-2.256v9.317H2.254V5.995h9.318V3.742zM18.004 0v3.74h-3.758v2.256h3.758v3.758h2.255V5.996H24V3.74h-3.758V0zm-6.45 18.756V8.862H9.562c0 .682-.228 1.189-.577 1.504-.367.297-.91.437-1.556.437h-.245v1.625h2.133v6.31h2.237z"/>
        </svg>
      ), 
      bg: "bg-red-50 dark:bg-red-950/20" 
    };
    if (lower.includes('xiaomi')) return { 
      logo: (
        <svg className="h-6 sm:h-8 md:h-10 w-auto" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.016 0 4.756.255 2.493 2.516.23 4.776 0 8.033 0 12.012c0 3.98.23 7.235 2.494 9.497C4.757 23.77 8.017 24 12 24c3.983 0 7.243-.23 9.506-2.491C23.77 19.247 24 15.99 24 12.012c0-3.984-.233-7.243-2.502-9.504C19.234.252 15.978 0 12 0zM4.906 7.405h5.624c1.47 0 3.007.068 3.764.827.746.746.827 2.233.83 3.676v4.54a.15.15 0 0 1-.152.147h-1.947a.15.15 0 0 1-.152-.148V11.83c-.002-.806-.048-1.634-.464-2.051-.358-.36-1.026-.441-1.72-.458H7.158a.15.15 0 0 0-.151.147v6.98a.15.15 0 0 1-.152.148H4.906a.15.15 0 0 1-.15-.148V7.554a.15.15 0 0 1 .15-.149zm12.131 0h1.949a.15.15 0 0 1 .15.15v8.892a.15.15 0 0 1-.15.148h-1.949a.15.15 0 0 1-.151-.148V7.554a.15.15 0 0 1 .151-.149zM8.92 10.948h2.046c.083 0 .15.066.15.147v5.352a.15.15 0 0 1-.15.148H8.92a.15.15 0 0 1-.152-.148v-5.352a.15.15 0 0 1 .152-.147Z"/>
        </svg>
      ), 
      bg: "bg-orange-50 dark:bg-orange-950/20" 
    };
    return { logo: null, bg: "bg-slate-50 dark:bg-slate-900/60" };
  };

  const [categories, setCategories] = useState([]);

  // Subscribe to products and banners
  useEffect(() => {
    let unsubBanners = () => {};
    let unsubCategories = () => {};
    
    const unsubProducts = dbService.subscribeProducts((prodsList) => {
      setProducts(prodsList);
      
      unsubBanners = dbService.subscribeBanners((bannersList) => {
        setBanners(bannersList);
        
        unsubCategories = dbService.subscribeCategories((catsList) => {
          setCategories(catsList);
          setLoading(false);
        });
      });
    });

    return () => {
      unsubProducts();
      unsubBanners();
      unsubCategories();
    };
  }, []);

  // Auto-advance banner carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [banners]);

  const handleNextBanner = () => {
    setActiveBannerIdx((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Filter products for featured and latest
  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const latestProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text pb-20">
      
      {/* 1. HERO BANNER SLIDER */}
      <section className="relative w-full h-[360px] sm:h-[480px] md:h-[580px] bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border overflow-hidden">
        {loading ? (
          <div className="w-full h-full shimmer-card flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : banners.length > 0 ? (
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBannerIdx}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background Image with Dark/Light Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banners[activeBannerIdx].image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-light-bg via-light-bg/85 to-transparent dark:from-dark-bg dark:via-dark-bg/85 dark:to-transparent" />
                </div>

                {/* Banner Content Container */}
                <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                  <div className="max-w-xl text-light-text dark:text-dark-text">
                    {banners[activeBannerIdx].badge && (
                      <motion.span 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block bg-brand-primary/10 border border-brand-primary/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 text-brand-primary dark:bg-brand-primary/20 dark:border-brand-primary/40 dark:text-brand-secondary"
                      >
                        {banners[activeBannerIdx].badge}
                      </motion.span>
                    )}
                    <motion.h1 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-none mb-3 break-words text-balance"
                    >
                      {banners[activeBannerIdx].title}
                    </motion.h1>
                    <motion.h2
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg sm:text-xl md:text-2xl text-light-text/80 dark:text-dark-text/80 font-medium mb-4 break-words text-balance"
                    >
                      {banners[activeBannerIdx].subtitle}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm sm:text-base text-light-muted dark:text-dark-muted mb-8 line-clamp-3 break-words text-pretty"
                    >
                      {banners[activeBannerIdx].description}
                    </motion.p>
                    
                    {banners[activeBannerIdx].link && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Link
                          to={banners[activeBannerIdx].link}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/30 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          <span>{T('home.exploreDevice')}</span>
                          <ChevronRight className="w-4.5 h-4.5" />
                        </Link>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            {banners.length > 1 && (
              <>
                <button 
                  onClick={handlePrevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-light-surface/70 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border/30 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white text-light-text dark:text-white transition-colors focus:outline-none z-10 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-light-surface/70 dark:bg-dark-surface/50 border border-light-border dark:border-dark-border/30 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white text-light-text dark:text-white transition-colors focus:outline-none z-10 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBannerIdx(idx)}
                      className={`h-2 rounded-full transition-all duration-350 cursor-pointer ${
                        activeBannerIdx === idx ? 'w-8 bg-brand-primary' : 'bg-light-border dark:bg-slate-700 hover:bg-light-muted dark:hover:bg-slate-500 w-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Fallback banner in case no banners exist */
          <div className="w-full h-full flex flex-col justify-center items-center text-center bg-light-surface dark:bg-dark-surface px-4">
            <h1 className="text-4xl sm:text-5xl font-semibold text-light-text dark:text-dark-text tracking-tight mb-4">
              {T('home.heroPrimary')}
            </h1>
            <p className="text-light-muted dark:text-dark-muted text-sm max-w-md mb-8">
              {T('home.heroSub')}
            </p>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-full bg-brand-primary text-white font-medium text-sm hover:opacity-90 shadow-md"
            >
              {T('home.shopCatalog')}
            </Link>
          </div>
        )}
      </section>

      {/* 2. BRANDS CATEGORIES BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold tracking-widest text-brand-primary uppercase">{T('home.categories')}</span>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 text-light-text dark:text-dark-text">
            {T('home.searchByBrand')}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full place-items-center">
          {categories
            .filter((cat) => {
              const lower = cat.name.toLowerCase();
              return ['apple', 'samsung', 'google', 'oneplus', 'xiaomi'].some(brand => lower.includes(brand));
            })
            .sort((a, b) => {
              const order = ['apple', 'samsung', 'google', 'oneplus', 'xiaomi'];
              const idxA = order.findIndex(brand => a.name.toLowerCase().includes(brand));
              const idxB = order.findIndex(brand => b.name.toLowerCase().includes(brand));
              return idxA - idxB;
            })
            .map((cat) => {
              const style = getBrandStyle(cat.name);
              if (!style.logo) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
                  className={`flex items-center justify-center w-full h-16 sm:h-20 md:h-24 rounded-2xl ${style.bg} border border-light-border dark:border-dark-border/40 text-light-text dark:text-dark-text hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer`}
                >
                  {style.logo}
                </button>
              );
            })}
        </div>
      </section>

      {/* 3. FEATURED PHONES CAROUSEL */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
          <div className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <div className="flex items-center gap-1.5 text-brand-secondary text-xs font-semibold tracking-widest uppercase">
                <Sparkles className="w-4 h-4 text-brand-accent animate-float" />
                <span>{T('home.featuredLabel')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mt-1">
                {T('home.featuredTitle')}
              </h2>
            </div>
            <Link to="/shop?featured=true" className="text-xs sm:text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors">
              {T('home.viewAllFeatured')}
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="h-80 rounded-2xl shimmer-card" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. LATEST PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-24">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-brand-primary text-xs font-semibold tracking-widest uppercase">
              <TrendingUp className="w-4 h-4" />
              <span>{T('home.latestLabel')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight mt-1">
              {T('home.latestTitle')}
            </h2>
          </div>
          <Link to="/shop" className="text-xs sm:text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors">
            {T('home.browseShop')}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
              <div key={idx} className="h-80 rounded-2xl shimmer-card" />
            ))}
          </div>
        ) : latestProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-light-border dark:border-dark-border rounded-2xl">
            <p className="text-light-muted dark:text-dark-muted font-normal mb-2">{T('home.noProducts')}</p>
            <Link to="/admin" className="text-brand-primary font-medium text-sm">{T('home.addProduct')}</Link>
          </div>
        )}
      </section>



    </div>
  );
};
