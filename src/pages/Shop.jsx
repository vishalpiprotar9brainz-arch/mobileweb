import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { dbService } from '../firebase';
import { ProductCard } from '../components/ProductCard';
import { useFrontendT } from '../context/LanguageContext';

export const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { T } = useFrontendT();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedCategory(params.get('category') || '');
        setSearchQuery(params.get('search') || '');
        setOnlyFeatured(params.get('featured') === 'true');
      }, [location.search]);

  useEffect(() => {
    const unsubProducts = dbService.subscribeProducts((prodsList) => {
      setProducts(prodsList);
      setLoading(false);
    });
    const unsubCategories = dbService.subscribeCategories((catsList) => {
      setCategories(catsList);
    });
    return () => { unsubProducts(); unsubCategories(); };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory) {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.brand.toLowerCase().includes(q) ||
             (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (onlyFeatured) result = result.filter(p => p.featured);
    if (sortOption === 'newest') {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortOption === 'price-low') {
      result.sort((a, b) => {
        const pA = a.offerPrice && a.offerPrice < a.price ? a.offerPrice : a.price;
        const pB = b.offerPrice && b.offerPrice < b.price ? b.offerPrice : b.price;
        return pA - pB;
      });
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => {
        const pA = a.offerPrice && a.offerPrice < a.price ? a.offerPrice : a.price;
        const pB = b.offerPrice && b.offerPrice < b.price ? b.offerPrice : b.price;
        return pB - pA;
      });
    }
    return result;
  }, [products, selectedCategory, searchQuery, sortOption, onlyFeatured]);

  const updateUrlParams = (cat, search, feat) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    if (search) params.set('search', search);
    if (feat) params.set('featured', 'true');
    const qs = params.toString();
    navigate(qs ? `/shop?${qs}` : '/shop');
  };

  const handleCategorySelect = (cat) => {
    const next = selectedCategory === cat ? '' : cat;
    setSelectedCategory(next);
    updateUrlParams(next, searchQuery, onlyFeatured);
  };

  const handleClearAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setOnlyFeatured(false);
    navigate('/shop');
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-brand-primary">Catalogue</span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1">{T('shop.title')}</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
            Discover and compare our latest premium smartphones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Filters Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Search */}
            <div className="p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">{T('shop.filters')}</h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && updateUrlParams(selectedCategory, searchQuery, onlyFeatured)}
                  placeholder={T('nav.searchPlaceholder')}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/50 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/50 text-light-text dark:text-dark-text"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-light-muted dark:text-dark-muted" />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); updateUrlParams(selectedCategory, '', onlyFeatured); }} className="absolute right-3 top-2.5 text-light-muted dark:text-dark-muted focus:outline-none">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Brands */}
            <div className="p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider">{T('shop.allBrands')}</h3>
                {selectedCategory && (
                  <button onClick={() => { setSelectedCategory(''); updateUrlParams('', searchQuery, onlyFeatured); }} className="text-[10px] font-medium text-rose-500 hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedCategory.toLowerCase() === cat.name.toLowerCase()
                        ? 'bg-brand-primary text-white'
                        : 'bg-light-bg dark:bg-dark-bg/50 hover:bg-light-border dark:hover:bg-dark-border/50 text-light-text dark:text-dark-text'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      selectedCategory.toLowerCase() === cat.name.toLowerCase()
                        ? 'bg-white/20 text-white'
                        : 'bg-light-border dark:bg-dark-border text-light-muted dark:text-dark-muted'
                    }`}>
                      {products.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & Featured */}
            <div className="p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm flex flex-col gap-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2.5">Status</h3>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                  <input
                    type="checkbox"
                    checked={onlyFeatured}
                    onChange={() => { const next = !onlyFeatured; setOnlyFeatured(next); updateUrlParams(selectedCategory, searchQuery, next); }}
                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                  />
                  <span>{T('shop.featured')}</span>
                </label>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{T('shop.sortBy')}</span>
                </h3>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-light-border bg-light-bg dark:border-dark-border dark:bg-dark-bg/50 text-xs text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                >
                  <option value="newest">{T('shop.newest')}</option>
                  <option value="price-low">{T('shop.priceAsc')}</option>
                  <option value="price-high">{T('shop.priceDesc')}</option>
                </select>
              </div>

              {(selectedCategory || searchQuery || onlyFeatured) && (
                <button
                  onClick={handleClearAllFilters}
                  className="w-full py-2.5 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-500 text-xs font-medium transition-colors"
                >
                  {T('shop.clearFilters')}
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6 text-xs text-light-muted dark:text-dark-muted">
              <div>
                Showing <span className="font-semibold text-light-text dark:text-dark-text">{filteredProducts.length}</span> models
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{T('shop.filters')}</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map(idx => (
                  <div key={idx} className="h-80 rounded-2xl shimmer-card" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 rounded-3xl border border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-light-border dark:bg-dark-border flex items-center justify-center text-lg">🔍</div>
                <div>
                  <h3 className="text-base font-semibold mb-1">{T('shop.noResults')}</h3>
                  <p className="text-xs text-light-muted dark:text-dark-muted max-w-xs leading-relaxed mx-auto">{T('shop.noResultsSub')}</p>
                </div>
                <button onClick={handleClearAllFilters} className="px-4 py-2 bg-brand-primary text-white text-xs font-medium rounded-full hover:opacity-90 transition-opacity">
                  {T('shop.clearFilters')}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
