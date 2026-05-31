import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 80, damping: 15 }}
      className="group relative flex flex-col justify-between h-full bg-white rounded-3xl border border-slate-100/80 shadow-[0_8px_30px_-15px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.12)] hover:-translate-y-1.5 transition-all duration-500 ease-out overflow-hidden p-3"
    >
      
      {/* Product Image and Overlay Tools */}
      <div className="relative aspect-square w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-50">
        
        {/* Badges / Pill Tags */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-toy-coral to-rose-500 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
              -{discountPercent}% OFF
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-amber-500 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Only {product.stock} Left!
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-slate-500 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Out Of Stock
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => toggleWishlist(product._id)}
          className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-md text-slate-400 hover:text-toy-coral rounded-full shadow-md hover:shadow-lg transition-all outline-none"
        >
          <Heart className={`w-4 h-4 transition-colors ${isInWishlist ? 'text-toy-coral fill-current' : ''}`} />
        </motion.button>

        {/* Image Element */}
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Quick Add To Cart Button Drawer overlay on hover */}
        {product.stock > 0 && (
          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350 ease-out">
            <button
              onClick={() => addToCart(product._id)}
              className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-900 text-white font-extrabold text-[10px] rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wider shadow-md backdrop-blur-sm active:scale-97 transition-all duration-200"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Quick Buy
            </button>
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 flex flex-col justify-between pt-4 px-2">
        
        {/* Header & Meta */}
        <div className="text-left">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 mb-1.5">
            <span className="bg-toy-teal/10 text-toy-teal px-2 py-0.5 rounded-md uppercase tracking-wider font-extrabold border border-toy-teal/5">
              {product.category?.name || 'Toy'}
            </span>
            <span>•</span>
            <span className="tracking-wide">{product.ageGroup}</span>
          </div>

          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-extrabold text-sm text-slate-800 hover:text-toy-coral leading-tight transition-colors line-clamp-2 h-[36px]">
              {product.name}
            </h3>
          </Link>

          {/* Ratings row */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-toy-yellow fill-current">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.round(product.rating || 4.5) ? 'text-toy-yellow fill-current' : 'text-slate-200'}`} />
              ))}
            </div>
            <span className="text-[10px] font-black text-slate-500">({product.reviewsCount || 0})</span>
          </div>
        </div>

        {/* Rating and Purchase Row */}
        <div className="mt-4 pt-3 border-t border-slate-100/70 flex items-center justify-between gap-2 text-left">
          
          {/* Price details */}
          <div className="flex flex-col">
            {discountPercent > 0 ? (
              <>
                <span className="text-[10px] text-slate-400 line-through font-extrabold">INR {product.price}</span>
                <span className="text-base font-black text-toy-coral">INR {product.discountPrice}</span>
              </>
            ) : (
              <span className="text-base font-black text-slate-800">INR {product.price}</span>
            )}
          </div>

          {/* Action Trigger for Desktop view if hover isn't triggered */}
          {product.stock > 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => addToCart(product._id)}
              className="p-2.5 bg-toy-teal hover:bg-teal-500 text-white rounded-xl shadow-[0_4px_12px_rgba(78,205,196,0.2)] hover:shadow-neon-teal hover:scale-105 transition-all duration-300 outline-none flex items-center justify-center sm:hidden"
            >
              <ShoppingCart className="w-4 h-4" />
            </motion.button>
          ) : (
            <span className="text-[9px] font-black text-slate-400 py-1.5 px-2 bg-slate-100 rounded-lg uppercase tracking-wider">
              Restocking
            </span>
          )}

        </div>

      </div>

    </motion.div>
  );
}
