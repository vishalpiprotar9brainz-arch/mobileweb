import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Cpu, Layers, Smartphone, Battery, CheckCircle, XCircle } from 'lucide-react';
import { dbService } from '../firebase';
import { useFrontendT } from '../context/LanguageContext';

export const ProductDetails = () => {
  const { id } = useParams();
  const { T } = useFrontendT();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const unsubscribe = dbService.subscribeProducts((productsList) => {
      const found = productsList.find(p => p.id === id);
      setProduct(found || null);
      setActiveImageIdx(0);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">📱</div>
        <h2 className="text-2xl font-semibold">{T('details.notFound')}</h2>
        <p className="text-light-muted dark:text-dark-muted text-sm max-w-sm text-center">
          The smartphone you are looking for doesn't exist, was renamed, or has been removed from our catalog.
        </p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
          <ChevronLeft className="w-4 h-4" />
          <span>{T('details.backToShop')}</span>
        </Link>
      </div>
    );
  }

  const { name, brand, price, offerPrice, specifications, description, images, stockStatus } = product;
  const hasDiscount = offerPrice && offerPrice < price;
  const isOutOfStock = stockStatus === 'Out of Stock';
  const savings = hasDiscount ? price - offerPrice : 0;
  const productImages = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'];
  const specKeys = specifications ? Object.keys(specifications) : [];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text pt-6 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs sm:text-sm font-medium">
          <Link to="/" className="text-light-muted dark:text-dark-muted hover:text-brand-primary">{T('nav.home')}</Link>
          <span className="text-light-muted dark:text-dark-muted">/</span>
          <Link to="/shop" className="text-light-muted dark:text-dark-muted hover:text-brand-primary">Shop</Link>
          <span className="text-light-muted dark:text-dark-muted">/</span>
          <span className="text-brand-primary font-medium line-clamp-1">{name}</span>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Image Gallery */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-3xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden flex items-center justify-center p-6 shadow-sm">
              <motion.img
                key={activeImageIdx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={productImages[activeImageIdx]}
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-xl bg-light-surface dark:bg-dark-surface border flex-shrink-0 flex items-center justify-center p-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-brand-primary ring-2 ring-brand-primary/30' : 'border-light-border dark:border-dark-border'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${idx}`} className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-secondary">
                {brand} Flagship
              </span>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1 mb-2">{name}</h1>
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{T('shop.outOfStock')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{T('shop.inStock')}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm">
              <div className="flex items-baseline gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-semibold text-light-text dark:text-dark-text tracking-tight">${offerPrice}</span>
                    <span className="text-lg text-light-muted dark:text-dark-muted line-through font-medium">${price}</span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-semibold text-light-text dark:text-dark-text tracking-tight">${price}</span>
                )}
              </div>
              {hasDiscount && (
                <div className="mt-2 text-xs font-medium text-emerald-500">
                  🎉 Special Deal: Save ${savings} on your purchase today!
                </div>
              )}
            </div>

            {/* Quick Specs */}
            {specifications && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {specifications.Processor && (
                  <div className="p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col gap-1 items-center text-center">
                    <Cpu className="w-5 h-5 text-brand-primary" />
                    <span className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Chipset</span>
                    <span className="text-xs font-medium line-clamp-1">{specifications.Processor}</span>
                  </div>
                )}
                {specifications.RAM && (
                  <div className="p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col gap-1 items-center text-center">
                    <Layers className="w-5 h-5 text-brand-primary" />
                    <span className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Memory</span>
                    <span className="text-xs font-medium">{specifications.RAM}</span>
                  </div>
                )}
                {specifications.Display && (
                  <div className="p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col gap-1 items-center text-center">
                    <Smartphone className="w-5 h-5 text-brand-primary" />
                    <span className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Display</span>
                    <span className="text-xs font-medium line-clamp-1">{specifications.Display}</span>
                  </div>
                )}
                {specifications.Battery && (
                  <div className="p-3.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex flex-col gap-1 items-center text-center">
                    <Battery className="w-5 h-5 text-brand-primary" />
                    <span className="text-[10px] text-light-muted dark:text-dark-muted uppercase font-medium">Battery</span>
                    <span className="text-xs font-medium line-clamp-1">{specifications.Battery}</span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">{T('details.about')}</h3>
              <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed font-normal">
                {description || 'No product description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Full Spec Table */}
        {specKeys.length > 0 && (
          <section className="mt-16 pt-12 border-t border-light-border dark:border-dark-border">
            <h2 className="text-2xl font-semibold tracking-tight mb-6">{T('details.specifications')}</h2>
            <div className="max-w-3xl rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border shadow-sm overflow-x-auto">
              <table className="w-full min-w-[320px] text-left border-collapse text-xs sm:text-sm">
                <tbody>
                  {specKeys.map((key, idx) => (
                    <tr key={key} className={`border-b border-light-border dark:border-dark-border/50 ${idx % 2 === 0 ? 'bg-light-bg/30 dark:bg-dark-bg/20' : ''}`}>
                      <td className="px-6 py-3.5 font-medium text-brand-primary w-1/3 sm:w-1/4">{key}</td>
                      <td className="px-6 py-3.5 text-light-text dark:text-dark-text font-normal">{specifications[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
