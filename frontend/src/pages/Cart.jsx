import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Trash2, ShoppingCart, ChevronRight, Tag, ShieldCheck, Gift } from 'lucide-react';
import axios from 'axios';
import ConfirmationModal from '../components/ConfirmationModal';

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
  const [itemToDelete, setItemToDelete] = useState(null);
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
      return Math.min(subtotal, activeCoupon.discountValue);
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
    if (activeCoupon) {
      sessionStorage.setItem('activeCoupon', JSON.stringify(activeCoupon));
    } else {
      sessionStorage.removeItem('activeCoupon');
    }
    navigate('/checkout');
  };

  return (
    <div className="bg-[#F1F3F6] min-h-screen pt-4 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1 text-[11px] font-normal text-slate-500 mb-4 select-none">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Shopping Cart</span>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            
            {/* LEFT SIDE: Products List (Amazon Layout style) */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {/* Free Shipping Meter */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm select-none">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-[#2874F0]" />
                    {neededForFreeShipping > 0 
                      ? `Add ₹${neededForFreeShipping} more for FREE Express Shipping!` 
                      : '🎉 Congratulations! Your order is eligible for FREE Delivery.'
                    }
                  </span>
                  <span className="text-[10px] text-slate-450">Min: ₹999</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-lg overflow-hidden">
                  <div 
                    className="h-full bg-[#388E3C] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Main items card list */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
                <h1 className="text-base font-bold text-[#212121] uppercase border-b border-slate-100 pb-3 mb-4 select-none">
                  Shopping Cart ({cart.length} items)
                </h1>

                <div className="flex flex-col gap-4 divide-y divide-slate-100">
                  {cart.map((item, idx) => {
                    const displayPrice = item.product.discountPrice && item.product.discountPrice > 0 
                      ? item.product.discountPrice 
                      : item.product.price;

                    return (
                      <div key={item.product._id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 py-4 ${idx === 0 ? 'pt-0' : ''}`}>
                        
                        {/* Preview and details */}
                        <div className="flex items-center gap-4 text-left flex-1 min-w-0">
                          
                          {/* Image */}
                          <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 select-none">
                            <img 
                              src={item.product.images?.[0]} 
                              alt={item.product.name} 
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Titles */}
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] text-[#878787] font-semibold uppercase tracking-wider block">
                              {item.product.brand || 'ToyBox'}
                            </span>
                            <Link to={`/product/${item.product._id}`} className="hover:text-[#2874F0]">
                              <h4 className="text-xs font-medium text-[#212121] leading-snug line-clamp-2">
                                {item.product.name}
                              </h4>
                            </Link>
                            <span className="text-[11px] text-[#878787] font-normal block mt-1">
                              Unit Price: ₹{displayPrice}
                            </span>
                          </div>

                        </div>

                        {/* Adjust quantities & trash actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 md:gap-8 shrink-0 select-none">
                          
                          {/* Dropdown selectors */}
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-400 font-semibold">Qty:</span>
                            <select
                              value={item.quantity}
                              onChange={(e) => updateCartQty(item.product._id, Number(e.target.value))}
                              className="bg-white border border-slate-350 rounded-lg py-0.5 px-2 text-xs font-bold outline-none text-slate-800"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                                <option key={q} value={q}>{q}</option>
                              ))}
                            </select>
                          </div>

                          {/* Subtotal */}
                          <div className="w-20 text-right">
                            <span className="text-xs font-bold text-[#212121]">
                              ₹{displayPrice * item.quantity}
                            </span>
                          </div>

                          {/* Trash indicator */}
                          <button 
                            onClick={() => setItemToDelete(item.product._id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors outline-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT SIDE: Summary Panel (Amazon Layout Style) */}
            <div className="lg:col-span-1 flex flex-col gap-4 text-left select-none">
              
              {/* Order pricing summary */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm sticky top-[120px]">
                <h3 className="font-bold text-[#212121] text-xs uppercase tracking-wider border-b border-slate-100 pb-3 mb-3">
                  Price Details
                </h3>

                <div className="flex flex-col gap-3.5 text-xs font-medium text-slate-600 border-b border-slate-100 pb-4">
                  <div className="flex justify-between">
                    <span>Price ({cart.length} items)</span>
                    <span className="font-bold text-[#212121]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className={`font-bold ${shippingCharges === 0 ? 'text-[#388E3C]' : 'text-[#212121]'}`}>
                      {shippingCharges > 0 ? `₹${shippingCharges}` : 'FREE'}
                    </span>
                  </div>
                  {activeCoupon && (
                    <div className="flex justify-between text-[#388E3C]">
                      <span>Coupon Savings ({activeCoupon.code})</span>
                      <span className="font-bold">- ₹{discountAmount}</span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="py-4 flex justify-between items-baseline border-b border-slate-100 mb-4">
                  <span className="font-bold text-[#212121] text-xs uppercase">Total Amount</span>
                  <span className="text-xl font-bold text-[#212121]">₹{grandTotal}</span>
                </div>

                {/* Checkout CTA */}
                <button 
                  onClick={handleProceedCheckout}
                  className="w-full h-11 bg-[#FB641B] hover:bg-[#e15610] text-white font-bold text-xs uppercase rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors outline-none"
                >
                  Proceed to Buy
                </button>

                {/* Trust security checks */}
                <div className="flex items-center gap-2 text-[10px] text-slate-450 justify-center mt-3">
                  <ShieldCheck className="w-4 h-4 text-[#388E3C] shrink-0" />
                  <span>Sandbox Secured Checkout Process</span>
                </div>
              </div>

              {/* Coupons card */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-[#212121] text-xs uppercase mb-3">Apply Coupon</h4>
                {activeCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
                    <span className="text-emerald-800 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#388E3C]" /> {activeCoupon.code} APPLIED
                    </span>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-red-500 font-bold hover:underline"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g. TOYBOX20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs outline-none focus:border-slate-450 uppercase placeholder-slate-400"
                    />
                    <button 
                      type="submit" 
                      disabled={couponLoading}
                      className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs px-4 py-1.5 rounded-[2px] shrink-0 transition-colors flex items-center justify-center gap-1"
                    >
                      {couponLoading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Applying...
                        </>
                      ) : 'Apply'}
                    </button>
                  </form>
                )}
                <div className="text-[10px] text-slate-450 mt-3 flex flex-col gap-1.5 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                  <span className="font-bold text-slate-500">🎫 Sandbox Vouchers:</span>
                  <span>• <b>TOYBOX20</b> (20% Off percentage savings)</span>
                  <span>• <b>FLAT500</b> (Flat ₹500 fixed savings)</span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-16 text-center max-w-md mx-auto mt-12 select-none shadow-sm">
            <span className="text-4xl block mb-2">🛒</span>
            <h3 className="font-bold text-slate-800 text-sm uppercase">Your Shopping Cart is Empty</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explore STEM blocks, modular puzzles, RC speedways and hand crochet dolls.
            </p>
            <Link 
              to="/shop" 
              className="mt-6 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-8 py-2.5 rounded-lg inline-block shadow-sm"
            >
              Shop All Toys
            </Link>
          </div>
        )}

      </div>
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          removeFromCart(itemToDelete);
          setItemToDelete(null);
        }}
        title="Remove Item?"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Yes, Remove"
      />
    </div>
  );
}
