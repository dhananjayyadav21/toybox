import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trash2, ShoppingBag, ArrowRight, Sparkles, Tag, ShieldCheck, HelpCircle, Gift } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { 
    user, 
    cart, 
    updateCartQty, 
    removeFromCart, 
    showToast,
    isOfflineMode,
    getAuthHeaders 
  } = useAppContext();

  const navigate = useNavigate();

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Totals calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.product.discountPrice && item.product.discountPrice > 0 
        ? item.product.discountPrice 
        : item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  }, [cart]);

  const shippingCharges = subtotal > 999 || subtotal === 0 ? 0 : 150;

  const discountAmount = useMemo(() => {
    if (!activeCoupon) return 0;
    if (activeCoupon.discountType === 'percentage') {
      return Math.round((subtotal * activeCoupon.discountValue) / 100);
    } else {
      return Math.min(subtotal, activeCoupon.discountValue); // Fixed discount cannot exceed subtotal
    }
  }, [activeCoupon, subtotal]);

  const grandTotal = subtotal + shippingCharges - discountAmount;

  // Free shipping progress variables
  const progressPercent = Math.min((subtotal / 999) * 100, 100);
  const neededForFreeShipping = Math.max(999 - subtotal, 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to apply checkout coupons!', 'error');
      return;
    }
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      if (!isOfflineMode) {
        const res = await axios.post('/api/coupons/validate', { code: couponCode }, getAuthHeaders());
        setActiveCoupon(res.data);
        showToast(`Coupon ${res.data.code} applied successfully! 🎫`);
      } else {
        // Offline Mock validation
        const codeUpper = couponCode.toUpperCase();
        if (codeUpper === 'TOYBOX20') {
          setActiveCoupon({ code: 'TOYBOX20', discountType: 'percentage', discountValue: 20 });
          showToast('Coupon TOYBOX20 applied! 20% discount saved. 🎫');
        } else if (codeUpper === 'WELCOME10') {
          setActiveCoupon({ code: 'WELCOME10', discountType: 'percentage', discountValue: 10 });
          showToast('Coupon WELCOME10 applied! 10% discount saved. 🎫');
        } else if (codeUpper === 'FLAT500') {
          setActiveCoupon({ code: 'FLAT500', discountType: 'fixed', discountValue: 500 });
          showToast('Coupon FLAT500 applied! INR 500 discount saved. 🎫');
        } else {
          showToast('Invalid or expired coupon code in Sandbox.', 'error');
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to validate coupon', 'error');
    } finally {
      setCouponLoading(false);
      setCouponCode('');
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    showToast('Coupon code removed.');
  };

  const handleProceedCheckout = () => {
    if (cart.length === 0) {
      showToast('Your basket is empty!', 'error');
      return;
    }
    // Save active coupon details in session storage for checkout use!
    if (activeCoupon) {
      sessionStorage.setItem('activeCoupon', JSON.stringify(activeCoupon));
    } else {
      sessionStorage.removeItem('activeCoupon');
    }
    navigate('/checkout');
  };

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left bg-slate-50/20 pb-20">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 mb-6 tracking-wider">
        <Link to="/" className="hover:text-toy-coral">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-toy-coral">Shopping Basket</span>
      </div>

      <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-2 font-sans">
        My Basket <span className="text-toy-coral bg-toy-coral/10 px-3.5 py-1 rounded-2xl text-xs font-black shrink-0">{cart.length} ITEMS</span>
      </h1>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Basket list (Left 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* Free Shipping Progress Alert */}
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-[0_8px_30px_rgba(15,23,42,0.01)] text-left flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-toy-teal" /> 
                  {neededForFreeShipping > 0 
                    ? `Add INR ${neededForFreeShipping} more for FREE Express Shipping!` 
                    : '🎉 You have unlocked complimentary FREE SHIPPING!'
                  }
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Threshold: INR 999</span>
              </div>
              <div className="w-full h-2 bg-slate-150 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${neededForFreeShipping > 0 ? 'bg-toy-teal' : 'bg-gradient-to-r from-toy-teal to-emerald-400'}`} 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <AnimatePresence>
                {cart.map((item) => {
                  const displayPrice = item.product.discountPrice && item.product.discountPrice > 0 
                    ? item.product.discountPrice 
                    : item.product.price;
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.product._id} 
                      className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.01)]"
                    >
                      {/* Thumbnail / Name info */}
                      <div className="flex items-center gap-4 w-full text-left">
                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center p-2">
                          <img 
                            src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'} 
                            alt={item.product.name} 
                            className="w-full h-full object-contain rounded-xl" 
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1 block">{item.product.brand}</span>
                          <Link to={`/product/${item.product._id}`} className="hover:text-toy-coral transition-colors font-sans">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">
                              {item.product.name}
                            </h4>
                          </Link>
                          <span className="text-[10px] font-bold text-slate-400 block mt-1">Single Price: INR {displayPrice}</span>
                        </div>
                      </div>

                      {/* Actions / Quantity */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        
                        {/* Qty selectors */}
                        <div className="flex items-center border border-slate-100 rounded-2xl p-1 bg-slate-50">
                          <button 
                            onClick={() => updateCartQty(item.product._id, item.quantity - 1)}
                            className="w-7.5 h-7.5 rounded-xl hover:bg-white text-slate-500 font-extrabold text-sm flex items-center justify-center transition-all outline-none"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-slate-800 text-xs px-3">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQty(item.product._id, item.quantity + 1)}
                            className="w-7.5 h-7.5 rounded-xl hover:bg-white text-slate-500 font-extrabold text-sm flex items-center justify-center transition-all outline-none"
                          >
                            +
                          </button>
                        </div>

                        {/* Total item subprice */}
                        <div className="text-right w-24 shrink-0 text-left sm:text-right">
                          <span className="font-black text-slate-850 text-sm">INR {displayPrice * item.quantity}</span>
                        </div>

                        {/* Trash */}
                        <button 
                          onClick={() => removeFromCart(item.product._id)}
                          className="p-2.5 hover:bg-rose-50 text-slate-400 hover:text-toy-coral rounded-xl transition-all outline-none"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>

                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Cart Summary (Right Column) */}
          <div className="lg:col-span-1 flex flex-col gap-6 text-left">
            
            {/* Summary card */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider pb-3 border-b border-slate-50">
                Order Summary
              </h3>

              <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-800">INR {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="font-extrabold text-slate-800">
                    {shippingCharges > 0 ? `INR ${shippingCharges}` : 'FREE EXPRESS'}
                  </span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      Promotional Discount ({activeCoupon.code})
                    </span>
                    <span className="font-extrabold">- INR {discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-t border-slate-50 pt-4 flex justify-between items-baseline">
                <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Total Amount</span>
                <span className="text-2xl font-black text-toy-coral font-sans">INR {grandTotal}</span>
              </div>

              {/* Checkout CTA */}
              <button 
                onClick={handleProceedCheckout}
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl w-full mt-4 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                Proceed To Checkout <ArrowRight className="w-4.5 h-4.5" />
              </button>

              {/* Trust Indicators */}
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold justify-center pt-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Sandbox Secure Checkout Process</span>
              </div>
            </div>

            {/* Coupons Card */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
              <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider mb-3">Voucher Code</h4>
              {activeCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-black uppercase">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" /> {activeCoupon.code} ACTIVE
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-rose-500 hover:underline font-black uppercase"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g. TOYBOX20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:bg-white focus:border-toy-teal transition-all uppercase"
                  />
                  <button 
                    type="submit" 
                    disabled={couponLoading}
                    className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shrink-0 active:scale-95 transition-transform"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
              )}
              <div className="text-[10px] text-slate-400 font-bold mt-3.5 flex flex-col gap-1 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <span className="font-extrabold text-slate-500">🎫 Sandbox Test Vouchers:</span>
                <span>• <b>TOYBOX20</b> (20% Off percentage coupon)</span>
                <span>• <b>FLAT500</b> (Flat INR 500 fixed coupon)</span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[32px] p-16 text-center max-w-lg mx-auto mt-12 flex flex-col items-center gap-4 shadow-sm">
          <span className="text-5xl">🛒</span>
          <h3 className="font-extrabold text-slate-800 text-lg">Your Toy Box is Empty</h3>
          <p className="text-sm font-semibold text-slate-400 max-w-sm leading-relaxed">
            Fill your child's playroom with developmental shapes, building blocks, and fast RC racers.
          </p>
          <Link to="/shop" className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-8 rounded-2xl mt-2 flex items-center gap-1 shadow-md">
            Browse Toy Catalog <Sparkles className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
