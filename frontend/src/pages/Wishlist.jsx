import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Heart, ShoppingCart, Trash2, ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, showToast } = useAppContext();

  const handleMoveToCart = (productId) => {
    addToCart(productId, 1);
    toggleWishlist(productId); // Remove from wishlist when moving to cart!
    showToast('Moved toy to Shopping Cart! 🛒');
  };

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left bg-slate-50/20 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 mb-8 tracking-wider">
        <Link to="/" className="hover:text-toy-coral">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-toy-coral">My Favorites Wishlist</span>
      </div>

      <h1 className="text-3xl font-black text-slate-850 mb-8 flex items-center gap-2 font-sans">
        My Favorites <Heart className="w-6.5 h-6.5 text-toy-coral fill-current" />
      </h1>

      {wishlist.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {wishlist.map((product) => {
              const displayPrice = product.discountPrice && product.discountPrice > 0 
                ? product.discountPrice 
                : product.price;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={product._id} 
                  className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between group relative shadow-[0_8px_30px_rgba(15,23,42,0.01)] hover:shadow-[0_15px_40px_rgba(15,23,42,0.03)] transition-all"
                >
                  
                  {/* Deletion utility */}
                  <button
                    onClick={() => toggleWishlist(product._id)}
                    className="absolute top-6 right-6 z-10 p-2 bg-white/95 text-slate-400 hover:text-toy-coral rounded-xl shadow-sm hover:scale-105 transition-all outline-none border border-slate-100/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Thumbnail */}
                  <Link to={`/product/${product._id}`} className="rounded-2xl bg-slate-50 border border-slate-100 p-4 aspect-square overflow-hidden mb-4 flex items-center justify-center relative">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between text-left">
                    <div>
                      <span className="text-[9px] font-black uppercase text-toy-teal bg-toy-teal/10 px-2.5 py-0.5 rounded border border-toy-teal/5 inline-block mb-2">
                        {product.ageGroup}
                      </span>
                      <Link to={`/product/${product._id}`}>
                        <h4 className="font-extrabold text-slate-800 text-xs hover:text-toy-coral transition-colors line-clamp-2 leading-tight lowercase first-letter:uppercase">
                          {product.name}
                        </h4>
                      </Link>
                    </div>

                    {/* Move to cart action */}
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-3">
                      <span className="font-black text-slate-800 text-xs">
                        INR {displayPrice}
                      </span>
                      <button
                        onClick={() => handleMoveToCart(product._id)}
                        className="bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <ShoppingCart className="w-3 h-3" /> Move to Cart
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[32px] p-16 text-center max-w-lg mx-auto mt-12 flex flex-col items-center gap-4 shadow-sm">
          <span className="text-5xl">❤️</span>
          <h3 className="font-extrabold text-slate-800 text-lg">Your Wishlist is Empty</h3>
          <p className="text-sm font-semibold text-slate-400 max-w-sm leading-relaxed">
            Bookmark toys and educational kits you love. They will show up here to move to your cart later.
          </p>
          <Link to="/shop" className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-8 rounded-2xl mt-2 flex items-center gap-1.5 shadow-md">
            Discover Toys Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
