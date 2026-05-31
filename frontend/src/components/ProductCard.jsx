import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useAppContext();

  const isInWishlist = wishlist.some(item => (item._id || item) === product._id);

  const discountPercent = product.discountPrice && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice && product.discountPrice > 0
    ? product.discountPrice
    : product.price;

  return (
    <div className="bg-white rounded-2xl border border-violet-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50 transition-all duration-200 flex flex-col h-full relative overflow-hidden group select-none" style={{ transform: 'translateY(0)', transition: 'all 0.2s ease' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >

      {/* Discount badge */}
      {discountPercent > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            -{discountPercent}%
          </span>
        </div>
      )}

      {/* Wishlist button */}
      <button
        onClick={() => toggleWishlist(product._id)}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm border ${
          isInWishlist
            ? 'bg-rose-500 border-rose-400 text-white'
            : 'bg-white border-violet-100 text-gray-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50'
        }`}
      >
        <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Product image */}
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden bg-gradient-to-br from-violet-50 to-slate-50 rounded-t-2xl">
        <div className="aspect-square flex items-center justify-center p-4">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=400'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ease-in-out"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info block */}
      <div className="flex flex-col flex-1 p-3 gap-2">

        {/* Brand + age */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">
            {product.brand || 'ToyBox'}
          </span>
          {product.ageGroup && (
            <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
              {product.ageGroup}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-semibold text-gray-800 hover:text-violet-700 line-clamp-2 leading-snug transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
            {product.rating !== undefined ? Number(product.rating).toFixed(1) : '0.0'}
            <Star className="w-2.5 h-2.5 fill-current" />
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            ({product.reviewsCount || 0})
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="border-t border-violet-50 pt-2.5 flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-gray-900">₹{displayPrice}</span>
            {discountPercent > 0 && (
              <>
                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                <span className="text-xs font-semibold text-emerald-600">{discountPercent}% off</span>
              </>
            )}
          </div>

          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product._id)}
              className="w-full h-9 bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-violet-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          ) : (
            <span className="w-full h-9 bg-gray-100 text-gray-400 font-semibold text-xs rounded-xl flex items-center justify-center uppercase tracking-wide">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
