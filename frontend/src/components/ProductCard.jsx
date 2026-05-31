import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useAppContext();

  const isInWishlist = wishlist.some(item => (item._id || item) === product._id);

  // Calculate percentage discount
  const discountPercent = product.discountPrice && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const displayPrice = product.discountPrice && product.discountPrice > 0 
    ? product.discountPrice 
    : product.price;

  return (
    <div className="bg-white border border-slate-200 rounded-[8px] hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-[180ms] ease-in-out flex flex-col justify-between h-full relative overflow-hidden group select-none text-left p-3">
      
      {/* Wishlist Icon */}
      <button
        onClick={() => toggleWishlist(product._id)}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-white/90 hover:bg-slate-100 text-slate-400 hover:text-[#FB641B] rounded-full border border-slate-150 shadow-sm outline-none transition-colors"
      >
        <Heart className={`w-3.5 h-3.5 transition-colors ${isInWishlist ? 'text-[#FB641B] fill-[#FB641B]' : ''}`} />
      </button>

      {/* Image Block */}
      <Link to={`/product/${product._id}`} className="block aspect-square w-full bg-white mb-2 overflow-hidden flex items-center justify-center">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'}
          alt={product.name}
          className="w-full h-full object-contain p-1 transform group-hover:scale-[1.02] transition-transform duration-[180ms] ease-in-out"
          loading="lazy"
        />
      </Link>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between pt-1">
        
        <div className="flex flex-col gap-1">
          {/* Brand/Category label */}
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {product.brand || 'ToyBox'} • {product.ageGroup || 'Kids'}
          </span>

          {/* Product Title */}
          <Link to={`/product/${product._id}`} className="block">
            <h3 className="text-xs font-semibold text-[#212121] hover:text-[#2874F0] line-clamp-2 leading-snug min-h-[34px]">
              {product.name}
            </h3>
          </Link>

          {/* Ratings row */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
              {product.rating || 4.4} <Star className="w-2.5 h-2.5 fill-current" />
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              ({product.reviewsCount || 12})
            </span>
          </div>
        </div>

        {/* Pricing details & Add to Cart action */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-col gap-2">
          
          <div className="flex items-baseline flex-wrap gap-1.5">
            {/* Sale price */}
            <span className="text-sm font-bold text-[#212121]">
              ₹{displayPrice}
            </span>

            {/* Original strike-through */}
            {discountPercent > 0 && (
              <>
                <span className="text-[11px] text-slate-400 line-through font-normal">
                  ₹{product.price}
                </span>
                <span className="text-[11px] text-[#388E3C] font-semibold">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          {/* Add to Cart button */}
          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product._id)}
              className="w-full h-9 bg-[#FF9F00] hover:bg-[#e68e00] text-slate-900 font-bold text-[11px] rounded-[6px] shadow-sm flex items-center justify-center gap-1.5 uppercase transition-colors outline-none"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          ) : (
            <span className="w-full py-2 bg-slate-100 text-slate-400 font-semibold text-[10px] rounded-[6px] flex items-center justify-center uppercase tracking-wide">
              Out of stock
            </span>
          )}

        </div>

      </div>

    </div>
  );
}
