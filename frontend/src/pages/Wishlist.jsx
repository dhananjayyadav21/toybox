import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, showToast } = useAppContext();
  const [itemToDelete, setItemToDelete] = React.useState(null);

  const handleMoveToCart = (productId) => {
    addToCart(productId, 1);
    toggleWishlist(productId);
    showToast('Moved toy to Shopping Cart! 🛒');
  };

  return (
    <div className="bg-[#F1F3F6] min-h-screen pt-4 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1 text-[11px] font-normal text-slate-500 mb-4 select-none">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Wishlist</span>
        </div>

        <h1 className="text-xl font-bold text-[#212121] uppercase border-b border-slate-200 pb-3 mb-6 select-none">
          My Wishlist ({wishlist.length} Items)
        </h1>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {wishlist.map((product) => {
              const displayPrice = product.discountPrice && product.discountPrice > 0 
                ? product.discountPrice 
                : product.price;

              const discountPercent = product.discountPrice && product.price > product.discountPrice
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : 0;

              return (
                <div 
                  key={product._id} 
                  className="bg-white border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between relative shadow-sm"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => setItemToDelete(product._id)}
                    className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition-colors outline-none"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Thumbnail Image */}
                  <Link 
                    to={`/product/${product._id}`} 
                    className="aspect-square w-full overflow-hidden flex items-center justify-center p-2 mb-3 bg-white select-none"
                  >
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=200'}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>

                  {/* Info details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] text-[#878787] font-semibold uppercase tracking-wider block mb-1 select-none">
                        {product.brand || 'ToyBox'}
                      </span>
                      <Link to={`/product/${product._id}`} className="hover:text-[#2874F0]">
                        <h4 className="text-xs font-medium text-[#212121] leading-snug line-clamp-2">
                          {product.name}
                        </h4>
                      </Link>

                      {/* Pricing block */}
                      <div className="flex items-baseline gap-1.5 mt-2 select-none">
                        <span className="text-sm font-bold text-[#212121]">₹{displayPrice}</span>
                        {discountPercent > 0 && (
                          <>
                            <span className="text-[10px] text-slate-400 line-through font-normal">₹{product.price}</span>
                            <span className="text-[10px] text-[#388E3C] font-semibold">{discountPercent}% off</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Move to Cart button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 select-none">
                      <button
                        onClick={() => handleMoveToCart(product._id)}
                        className="w-full h-8 bg-[#FF9F00] hover:bg-[#e68e00] text-[#212121] font-bold text-[10px] uppercase rounded-lg flex items-center justify-center gap-1 shadow-sm transition-colors outline-none"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-16 text-center max-w-md mx-auto mt-12 select-none shadow-sm">
            <span className="text-4xl block mb-2">❤️</span>
            <h3 className="font-bold text-slate-800 text-sm uppercase">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explore STEM blocks, modular puzzles, RC speedways and hand crochet dolls.
            </p>
            <Link 
              to="/shop" 
              className="mt-6 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-8 py-2.5 rounded-lg inline-block shadow-sm"
            >
              Discover Toys Now
            </Link>
          </div>
        )}

      </div>

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          toggleWishlist(itemToDelete);
          setItemToDelete(null);
        }}
        title="Remove from Wishlist?"
        message="Are you sure you want to remove this item from your wishlist?"
        confirmText="Yes, Remove"
      />
    </div>
  );
}
