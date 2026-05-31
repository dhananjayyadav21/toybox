import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Wallet,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const { 
    user, 
    cart, 
    addAddress, 
    showToast, 
    isOfflineMode, 
    getAuthHeaders,
    fetchData
  } = useAppContext();

  const navigate = useNavigate();

  // Load Coupon saved in session from Cart
  const activeCoupon = useMemo(() => {
    const saved = sessionStorage.getItem('activeCoupon');
    return saved ? JSON.parse(saved) : null;
  }, []);

  // Shipping Address State
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '', city: '', state: '', postalCode: '', country: 'India'
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or Razorpay
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Simulator Modal State
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simulatedOrderPayload, setSimulatedOrderPayload] = useState(null);
  const [simulatedStep, setSimulatedStep] = useState('select'); // select, processing
  const [activePaymentTab, setActivePaymentTab] = useState('card');

  // Compute pricing
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

  // Protect path: must be logged in and have items
  useEffect(() => {
    if (!user) {
      showToast('Please login to complete your checkout!', 'error');
      navigate('/login?redirect=checkout');
      return;
    }
    if (cart.length === 0 && !orderSuccess) {
      showToast('Your basket is empty!', 'error');
      navigate('/cart');
    }
  }, [user, cart, orderSuccess]);

  const handleAddNewAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      showToast('Please fill all address fields', 'error');
      return;
    }
    addAddress(newAddress);
    setNewAddress({ street: '', city: '', state: '', postalCode: '', country: 'India' });
    setIsAddingNewAddress(false);
    setSelectedAddressIdx(user.addresses.length); // Auto select newly added address!
  };

  const handlePlaceOrder = async () => {
    if (!user.addresses || user.addresses.length === 0) {
      showToast('Please specify a shipping address!', 'error');
      return;
    }

    const shippingAddress = user.addresses[selectedAddressIdx];
    const orderItems = cart.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.discountPrice && item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price
    }));

    setCheckoutLoading(true);

    if (paymentMethod === 'COD') {
      // Cash on Delivery direct checkout
      try {
        if (!isOfflineMode) {
          const res = await axios.post('/api/orders', {
            products: orderItems,
            shippingAddress,
            paymentMethod: 'COD',
            totalAmount: grandTotal
          }, getAuthHeaders());
          
          triggerOrderSuccess(res.data);
        } else {
          // Offline Mock order
          const mockOrder = {
            _id: 'ord_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            user,
            products: cart,
            shippingAddress,
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            orderStatus: 'Pending',
            totalAmount: grandTotal,
            createdAt: new Date()
          };
          triggerOrderSuccess(mockOrder);
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to place order', 'error');
      } finally {
        setCheckoutLoading(false);
      }
    } else {
      // Razorpay Checkout
      try {
        let orderRes;
        if (!isOfflineMode) {
          orderRes = await axios.post('/api/payment/create-order', { amount: grandTotal }, getAuthHeaders());
        } else {
          orderRes = {
            data: {
              success: true,
              orderId: `order_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
              amount: grandTotal * 100,
              currency: 'INR',
              key: 'rzp_test_mock_key_123',
              mode: 'simulator'
            }
          };
        }

        const rzpData = orderRes.data;

        if (rzpData.mode === 'simulator') {
          // Trigger custom simulator modal!
          setSimulatedOrderPayload({
            rzpData,
            shippingAddress,
            orderItems
          });
          setSimulatedStep('select');
          setShowSimulatorModal(true);
          setCheckoutLoading(false);
        } else {
          // Live Razorpay options
          const options = {
            key: rzpData.key,
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: 'ToyBox Premium Store',
            description: 'Order Payment Checkout',
            image: 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800',
            order_id: rzpData.orderId,
            handler: async function (response) {
              try {
                // First save local DB order
                const localOrderRes = await axios.post('/api/orders', {
                  products: orderItems,
                  shippingAddress,
                  paymentMethod: 'Razorpay',
                  totalAmount: grandTotal,
                  razorpayOrderId: rzpData.orderId
                }, getAuthHeaders());

                const localOrderId = localOrderRes.data._id;

                // Call verification API
                const verifyRes = await axios.post('/api/payment/verify', {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: localOrderId
                }, getAuthHeaders());

                if (verifyRes.data.success) {
                  const finalUpdatedOrder = {
                    ...localOrderRes.data,
                    paymentStatus: 'Paid',
                    razorpayPaymentId: response.razorpay_payment_id
                  };
                  triggerOrderSuccess(finalUpdatedOrder);
                } else {
                  showToast('Payment verification failed!', 'error');
                }
              } catch (err) {
                showToast('Failed to finalize Razorpay order transaction.', 'error');
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: user.mobile
            },
            notes: {
              address: shippingAddress.street
            },
            theme: {
              color: '#FF6B6B'
            }
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.open();
          setCheckoutLoading(false);
        }
      } catch (err) {
        showToast('Razorpay initialization failed', 'error');
        setCheckoutLoading(false);
      }
    }
  };

  // Mock Pay Success trigger
  const handleSimulatedPaymentSuccess = async () => {
    setSimulatedStep('processing');
    
    // Simulate real gateway loading
    setTimeout(async () => {
      const { rzpData, shippingAddress, orderItems } = simulatedOrderPayload;

      try {
        let createdOrder;
        if (!isOfflineMode) {
          // Save local order
          const localOrderRes = await axios.post('/api/orders', {
            products: orderItems,
            shippingAddress,
            paymentMethod: 'Razorpay',
            totalAmount: grandTotal,
            razorpayOrderId: rzpData.orderId
          }, getAuthHeaders());

          // Verify simulated signature
          const verifyRes = await axios.post('/api/payment/verify', {
            razorpayOrderId: rzpData.orderId,
            razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            razorpaySignature: 'mock_signature_approved',
            orderId: localOrderRes.data._id
          }, getAuthHeaders());

          createdOrder = { ...localOrderRes.data, paymentStatus: 'Paid' };
        } else {
          // Offline Sandbox mock
          createdOrder = {
            _id: 'ord_' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            user,
            products: cart,
            shippingAddress,
            paymentMethod: 'Razorpay',
            paymentStatus: 'Paid',
            orderStatus: 'Pending',
            totalAmount: grandTotal,
            createdAt: new Date()
          };
        }

        setShowSimulatorModal(false);
        triggerOrderSuccess(createdOrder);
      } catch (err) {
        showToast('Simulated payment checkout failed', 'error');
        setShowSimulatorModal(false);
      }
    }, 2000);
  };

  const triggerOrderSuccess = (orderDetails) => {
    setPlacedOrderDetails(orderDetails);
    setOrderSuccess(true);
    sessionStorage.removeItem('activeCoupon');
    fetchData(); // reload catalog stock levels!

    // Fire Confetti!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (orderSuccess && placedOrderDetails) {
    return (
      <div className="pt-28 max-w-xl mx-auto px-4 text-center flex flex-col items-center gap-6 pb-20 bg-slate-50/20">
        <div className="w-20 h-20 bg-emerald-50 rounded-full text-emerald-500 border border-emerald-100 flex items-center justify-center animate-bounce shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 font-sans">Woohoo! Order Placed! 🎉</h1>
        <p className="text-xs font-semibold text-slate-400 max-w-md leading-relaxed">
          Your order has been recorded successfully. Our packaging elves are preparing the toys for immediate delivery.
        </p>

        {/* Order Details box */}
        <div className="w-full bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.02)] flex flex-col gap-3.5 text-left text-xs font-semibold text-slate-500">
          <div className="flex justify-between pb-2.5 border-b border-slate-50">
            <span>Order Reference</span>
            <span className="font-extrabold text-slate-800">#{placedOrderDetails._id.toString().toUpperCase()}</span>
          </div>
          <div className="flex justify-between pb-2.5 border-b border-slate-50">
            <span>Payment Method</span>
            <span className="font-extrabold text-slate-800">{placedOrderDetails.paymentMethod}</span>
          </div>
          <div className="flex justify-between pb-2.5 border-b border-slate-50">
            <span>Status</span>
            <span className="font-extrabold text-emerald-600 uppercase tracking-wider">{placedOrderDetails.paymentStatus === 'Paid' ? 'Paid Secure' : 'Pending COD'}</span>
          </div>
          <div className="flex justify-between pb-2.5 border-b border-slate-50">
            <span>Shipping Address</span>
            <span className="font-extrabold text-slate-800 text-right max-w-xs line-clamp-1">{placedOrderDetails.shippingAddress.street}, {placedOrderDetails.shippingAddress.city}</span>
          </div>
          <div className="flex justify-between pt-1 font-bold text-slate-800 text-sm">
            <span>Total Paid</span>
            <span className="font-black text-toy-coral text-base">INR {placedOrderDetails.totalAmount}</span>
          </div>
        </div>

        <div className="flex gap-4 w-full mt-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl flex-1 shadow-md transition-all active:scale-95"
          >
            Track My Orders
          </button>
          <button 
            onClick={() => navigate('/shop')}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-100 font-extrabold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl flex-1 shadow-sm transition-all active:scale-95"
          >
            Keep Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left bg-slate-50/20 pb-20">
      
      {/* Breadcrumb path */}
      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 mb-8 tracking-wider">
        <Link to="/cart" className="hover:text-toy-coral">Cart</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-toy-coral">Checkout Payment</span>
      </div>

      <h1 className="text-3xl font-black text-slate-850 mb-8 font-sans">Order Checkout</h1>

      {/* Progress stepper visualizer */}
      <div className="grid grid-cols-3 gap-4 mb-8 bg-white border border-slate-100 p-4 rounded-3xl shadow-[0_8px_30px_rgba(15,23,42,0.01)] text-center text-xs font-extrabold text-slate-400 select-none">
        <div className="text-toy-teal flex flex-col sm:flex-row items-center justify-center gap-1">
          <span className="w-5 h-5 rounded-full bg-toy-teal/10 flex items-center justify-center text-[10px] text-toy-teal">1</span>
          <span>Shipping Address</span>
        </div>
        <div className="text-toy-purple flex flex-col sm:flex-row items-center justify-center gap-1">
          <span className="w-5 h-5 rounded-full bg-toy-purple/10 flex items-center justify-center text-[10px] text-toy-purple">2</span>
          <span>Settlement Option</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">3</span>
          <span>Place Order</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Address and Payment */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* 1. SHIPPING ADDRESS */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.01)]">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-toy-coral" /> Shipping Destination Address
              </h3>
              <button 
                onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                className="text-[10px] font-black uppercase text-toy-teal hover:underline outline-none"
              >
                {isAddingNewAddress ? 'Select Existing' : '+ Add Address'}
              </button>
            </div>

            {isAddingNewAddress ? (
              <form onSubmit={handleAddNewAddressSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                <div className="sm:col-span-2">
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Street & Area</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Flat 104, Admin Towers"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">City</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Noida"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">State</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Uttar Pradesh"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Postal Pin Code</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. 201301"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                  />
                </div>
                <div className="sm:col-span-2 pt-2 flex gap-3">
                  <button type="submit" className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl active:scale-95 transition-all shadow-sm">
                    Save Address
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingNewAddress(false)}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-100 font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl active:scale-95 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : user.addresses && user.addresses.length > 0 ? (
              <div className="flex flex-col gap-3">
                {user.addresses.map((addr, idx) => (
                  <label 
                    key={addr._id || idx} 
                    className={`flex items-start gap-4 p-4 border rounded-3xl cursor-pointer hover:bg-slate-50/50 transition-all ${
                      selectedAddressIdx === idx ? 'border-toy-teal bg-teal-50/10' : 'border-slate-100 bg-white shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressIdx === idx}
                      onChange={() => setSelectedAddressIdx(idx)}
                      className="mt-1 accent-toy-teal shrink-0"
                    />
                    <div className="text-xs font-semibold text-slate-500 text-left flex-1">
                      <p className="font-extrabold text-slate-800 text-sm mb-1">{user.name}</p>
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mt-1">{addr.country}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-semibold text-slate-400 flex flex-col items-center gap-3">
                <MapPin className="w-8 h-8 text-slate-300 animate-bounce" />
                <span>No shipping addresses added to this account yet.</span>
                <button 
                  onClick={() => setIsAddingNewAddress(true)}
                  className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-xs py-3 px-6 rounded-xl uppercase tracking-widest mt-2"
                >
                  Create Shipping Address
                </button>
              </div>
            )}
          </div>

          {/* 2. PAYMENT METHODS */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-[0_8px_30px_rgba(15,23,42,0.01)]">
            <h3 className="font-extrabold text-slate-850 text-sm border-b border-slate-50 pb-4 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <CreditCard className="w-4.5 h-4.5 text-toy-purple" /> Secure Settlement Gateway
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
              
              {/* COD */}
              <label 
                className={`flex-1 flex items-start gap-4 p-4 border rounded-3xl cursor-pointer hover:bg-slate-50/50 transition-all ${
                  paymentMethod === 'COD' ? 'border-toy-teal bg-teal-50/10' : 'border-slate-100 bg-white shadow-sm'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-toy-teal shrink-0"
                />
                <div className="text-left">
                  <p className="font-extrabold text-slate-800 text-sm">Cash on Delivery (COD)</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Settle with physical cash or UPI scan on final delivery</p>
                </div>
              </label>

              {/* Razorpay */}
              <label 
                className={`flex-1 flex items-start gap-4 p-4 border rounded-3xl cursor-pointer hover:bg-slate-50/50 transition-all ${
                  paymentMethod === 'Razorpay' ? 'border-toy-teal bg-teal-50/10' : 'border-slate-100 bg-white shadow-sm'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'Razorpay'}
                  onChange={() => setPaymentMethod('Razorpay')}
                  className="mt-1 accent-toy-teal shrink-0"
                />
                <div className="text-left">
                  <p className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    Razorpay Secure <ShieldCheck className="w-4.5 h-4.5 text-toy-coral fill-rose-100 shrink-0" />
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">Pay instantly with Credit Card, UPI, wallets or Netbanking</p>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:col-span-1 flex flex-col gap-6 text-left">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider pb-3 border-b border-slate-55">
              Order Basket
            </h3>

            {/* Items list scroll */}
            <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-4">
              {cart.map(item => {
                const displayPrice = item.product.discountPrice && item.product.discountPrice > 0 
                  ? item.product.discountPrice 
                  : item.product.price;
                return (
                  <div key={item.product._id} className="flex gap-3 items-center">
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'}
                      alt={item.product.name}
                      className="w-11 h-11 bg-slate-50 border border-slate-100 p-1 rounded-lg object-contain shrink-0"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-bold text-slate-850 text-xs line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400 mt-0.5">Qty: {item.quantity} • INR {displayPrice}</p>
                    </div>
                    <span className="font-black text-slate-850 text-xs shrink-0">INR {displayPrice * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Pricing breakdown */}
            <div className="border-t border-slate-50 pt-4 flex flex-col gap-3.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-700">INR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-700">{shippingCharges > 0 ? `INR ${shippingCharges}` : 'FREE EXPRESS'}</span>
              </div>
              {activeCoupon && (
                <div className="flex justify-between text-emerald-600">
                  <span>Voucher ({activeCoupon.code})</span>
                  <span className="font-extrabold">- INR {discountAmount}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-50 pt-4 flex justify-between items-baseline">
              <span className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Estimated Total</span>
              <span className="text-xl font-black text-toy-coral font-sans">INR {grandTotal}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={checkoutLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl w-full mt-4 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              {checkoutLoading ? 'Processing Checkout...' : `Confirm & Place Order`}
            </button>
          </div>
        </div>

      </div>

      {/* RAZORPAY SIMULATOR POPUP MODAL */}
      <AnimatePresence>
        {showSimulatorModal && simulatedOrderPayload && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200/80 rounded-[32px] max-w-md w-full shadow-[0_20px_50px_rgba(15,23,42,0.22)] overflow-hidden text-left flex flex-col z-10"
            >
              {simulatedStep === 'select' ? (
                <>
                  {/* Gate header */}
                  <div className="bg-[#1A253C] p-6 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#2A3756] flex items-center justify-center text-toy-teal font-extrabold text-sm">
                        💳
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider">Razorpay Checkout</h3>
                        <p className="text-[9px] text-[#A5B4FC] font-extrabold">SANDBOX TEST SIMULATOR</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                      Test API
                    </span>
                  </div>

                  {/* Merchant Details bar */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 block">MERCHANT NAME</span>
                      <span className="text-slate-800">ToyBox Premium Store</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-slate-400 block">AMOUNT CHARGED</span>
                      <span className="text-toy-coral font-black text-sm">INR {grandTotal}</span>
                    </div>
                  </div>

                  {/* Simulator Options Tab */}
                  <div className="flex border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <button 
                      onClick={() => setActivePaymentTab('card')}
                      className={`flex-1 py-3 text-center transition-colors border-b-2 ${activePaymentTab === 'card' ? 'border-[#3399FF] text-[#3399FF]' : 'border-transparent'}`}
                    >
                      Cards
                    </button>
                    <button 
                      onClick={() => setActivePaymentTab('upi')}
                      className={`flex-1 py-3 text-center transition-colors border-b-2 ${activePaymentTab === 'upi' ? 'border-[#3399FF] text-[#3399FF]' : 'border-transparent'}`}
                    >
                      UPI / QR
                    </button>
                    <button 
                      onClick={() => setActivePaymentTab('net')}
                      className={`flex-1 py-3 text-center transition-colors border-b-2 ${activePaymentTab === 'net' ? 'border-[#3399FF] text-[#3399FF]' : 'border-transparent'}`}
                    >
                      Netbanking
                    </button>
                  </div>

                  {/* Tabs contents */}
                  <div className="p-6 min-h-[160px] flex flex-col gap-4 text-xs">
                    {activePaymentTab === 'card' && (
                      <div className="flex flex-col gap-3 font-semibold text-slate-500">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Simulated Cardholder Name</label>
                          <input type="text" readOnly value={user.name} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-bold text-slate-800" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="text-[10px] text-slate-400 block mb-1">Simulated Test Card Number</label>
                            <input type="text" readOnly value="4111 1111 1111 1111" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-mono text-slate-800" />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Test CVV</label>
                            <input type="password" readOnly value="123" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 outline-none font-mono text-slate-850" />
                          </div>
                        </div>
                      </div>
                    )}
                    {activePaymentTab === 'upi' && (
                      <div className="flex flex-col gap-2 font-semibold text-slate-500">
                        <label className="text-[10px] text-slate-400 block mb-1">UPI Address prefill</label>
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                          <span className="font-extrabold text-slate-800">{user.email.split('@')[0]}@okhdfcbank</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-black">Verified</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal mt-1">Simply clicks on "Pay Successfully" below. No secondary UPI PIN confirmation or phone scans are needed inside mock sandbox.</p>
                      </div>
                    )}
                    {activePaymentTab === 'net' && (
                      <div className="grid grid-cols-2 gap-2 font-bold text-slate-600">
                        {['SBI', 'HDFC', 'ICICI', 'Axis'].map(bank => (
                          <div key={bank} className="border border-slate-100 rounded-xl p-2.5 bg-slate-50 text-center text-xs shadow-sm hover:border-[#3399FF] cursor-pointer">
                            🏦 {bank} Bank
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button
                      onClick={handleSimulatedPaymentSuccess}
                      className="flex-1 bg-[#3399FF] hover:bg-[#287ece] text-white font-extrabold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Lock className="w-3.5 h-3.5 fill-current" /> Pay successfully
                    </button>
                    <button
                      onClick={() => {
                        setShowSimulatorModal(false);
                        showToast('Simulated payment transaction was cancelled.', 'error');
                      }}
                      className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 font-extrabold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
                  <div className="animate-spin w-10 h-10 border-4 border-[#3399FF] border-t-transparent rounded-full mb-2"></div>
                  <h3 className="font-extrabold text-slate-800 text-base font-sans">Processing Payment Securely...</h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                    Razorpay is securing your online payment with 256-bit SSL encryption. Please do not close or reload this window.
                  </p>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
