import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Percent, AlertCircle, ShoppingBag } from 'lucide-react';
import { useFrontendT } from '../context/LanguageContext';

export const ProductCard = ({ product }) => {
  const { T } = useFrontendT();
  const { id, name, brand, price, offerPrice, images, stockStatus, featured } = product;

  const hasDiscount = offerPrice && offerPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - offerPrice) / price) * 100) : 0;
  const isOutOfStock = stockStatus === 'Out of Stock';

  const displayImage = images && images.length > 0
    ? images[0]
    : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex flex-col justify-between w-full h-full rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Badges */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5">
        {hasDiscount && !isOutOfStock && (
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-lg bg-emerald-500 text-white shadow-md">
            <Percent className="w-3 h-3" />
            <span>{T('card.save')} {discountPercent}%</span>
          </span>
        )}
        {isOutOfStock && (
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-lg bg-rose-500 text-white shadow-md">
            <AlertCircle className="w-3 h-3" />
            <span>{T('card.soldOut')}</span>
          </span>
        )}
        {featured && !isOutOfStock && (
          <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-lg bg-brand-primary text-white shadow-md">
            {T('card.featured')}
          </span>
        )}
      </div>

      {/* Image */}
      <Link to={`/product/${id}`} className="relative block aspect-square w-full overflow-hidden bg-gray-50 dark:bg-slate-900/50 border-b border-light-border dark:border-dark-border cursor-pointer">
        <img
          src={displayImage}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>

      {/* Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-secondary">{brand}</span>
          <Link to={`/product/${id}`} className="block mt-1">
            <h3 className="text-sm sm:text-base font-medium text-light-text dark:text-dark-text group-hover:text-brand-primary transition-colors line-clamp-2 break-words text-balance min-h-[40px] sm:min-h-[48px]">
              {name}
            </h3>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-light-muted dark:text-dark-muted line-through">${price}</span>
                <span className="text-lg font-semibold text-light-text dark:text-dark-text tracking-tight">${offerPrice}</span>
              </>
            ) : (
              <span className="text-lg font-semibold text-light-text dark:text-dark-text tracking-tight">${price}</span>
            )}
          </div>

          <Link
            to={`/product/${id}`}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
              isOutOfStock
                ? 'bg-light-bg dark:bg-dark-border text-light-muted dark:text-dark-muted cursor-not-allowed'
                : 'bg-brand-primary/10 group-hover:bg-brand-primary text-brand-primary group-hover:text-white'
            }`}
          >
            {isOutOfStock ? <AlertCircle className="w-4.5 h-4.5" /> : <ShoppingBag className="w-4.5 h-4.5" />}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
