import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import confetti from 'canvas-confetti';
import axios from 'axios';
import { 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  Lock,
  MapIcon
} from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState('COD'); 
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  // Simulator Modal State
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [simulatedOrderPayload, setSimulatedOrderPayload] = useState(null);
  const [simulatedStep, setSimulatedStep] = useState('select'); 
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

  // Protect path
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
    setSelectedAddressIdx(user.addresses.length);
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
          setSimulatedOrderPayload({
            rzpData,
            shippingAddress,
            orderItems
          });
          setSimulatedStep('select');
          setShowSimulatorModal(true);
          setCheckoutLoading(false);
        } else {
          const options = {
            key: rzpData.key,
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: 'ToyBox Plus Store',
            description: 'Order Payment Checkout',
            image: 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=200',
            order_id: rzpData.orderId,
            handler: async function (response) {
              try {
                const localOrderRes = await axios.post('/api/orders', {
                  products: orderItems,
                  shippingAddress,
                  paymentMethod: 'Razorpay',
                  totalAmount: grandTotal,
                  razorpayOrderId: rzpData.orderId
                }, getAuthHeaders());

                const localOrderId = localOrderRes.data._id;

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
                showToast('Failed to verify Razorpay order transaction.', 'error');
              }
            },
            prefill: {
              name: user.name,
              email: user.email,
              contact: user.mobile
            },
            theme: {
              color: '#2874F0'
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

  const handleSimulatedPaymentSuccess = async () => {
    setSimulatedStep('processing');
    
    setTimeout(async () => {
      const { rzpData, shippingAddress, orderItems } = simulatedOrderPayload;

      try {
        let createdOrder;
        if (!isOfflineMode) {
          const localOrderRes = await axios.post('/api/orders', {
            products: orderItems,
            shippingAddress,
            paymentMethod: 'Razorpay',
            totalAmount: grandTotal,
            razorpayOrderId: rzpData.orderId
          }, getAuthHeaders());

          await axios.post('/api/payment/verify', {
            razorpayOrderId: rzpData.orderId,
            razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            razorpaySignature: 'mock_signature_approved',
            orderId: localOrderRes.data._id
          }, getAuthHeaders());

          createdOrder = { ...localOrderRes.data, paymentStatus: 'Paid' };
        } else {
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
    fetchData();

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (orderSuccess && placedOrderDetails) {
    return (
      <div className="bg-[#F1F3F6] min-h-screen pt-8 pb-20 text-center select-none">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center gap-5">
          <div className="w-16 h-16 bg-[#388E3C]/10 text-[#388E3C] rounded-full flex items-center justify-center border border-[#388E3C]/20 shadow-sm mb-2">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-[#212121]">Order Placed Successfully! 🎉</h1>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Your toy delivery request has been registered in the system. Check details below or track it in your Dashboard.
          </p>

          <div className="w-full bg-white border border-slate-200 rounded-sm p-5 text-left text-xs font-semibold text-slate-600 flex flex-col gap-3">
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span>Order Reference ID</span>
              <span className="font-bold text-[#212121]">#{placedOrderDetails._id.toString().toUpperCase()}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span>Settlement Choice</span>
              <span className="font-bold text-[#212121]">{placedOrderDetails.paymentMethod}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span>Payment Status</span>
              <span className={`font-bold uppercase ${placedOrderDetails.paymentStatus === 'Paid' ? 'text-[#388E3C]' : 'text-[#FB641B]'}`}>
                {placedOrderDetails.paymentStatus === 'Paid' ? 'PAID SECURE' : 'PENDING'}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span>Shipping Destination</span>
              <span className="font-bold text-[#212121] truncate max-w-xs">{placedOrderDetails.shippingAddress.street}, {placedOrderDetails.shippingAddress.city}</span>
            </div>
            <div className="flex justify-between pt-2 text-sm font-bold text-[#212121]">
              <span>Final Paid Amount</span>
              <span className="text-[#FB641B] font-bold">₹{placedOrderDetails.totalAmount}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase h-11 rounded-sm flex-1 shadow-sm transition-colors"
            >
              Go to Account
            </button>
            <button 
              onClick={() => navigate('/shop')}
              className="bg-white border border-slate-300 text-slate-800 font-bold text-xs uppercase h-11 rounded-sm flex-1 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F3F6] min-h-screen pt-4 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1 text-[11px] font-normal text-slate-500 mb-4 select-none">
          <Link to="/cart" className="hover:underline">Cart</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Payment & Review</span>
        </div>

        {/* Stepper indicators */}
        <div className="grid grid-cols-3 gap-2 mb-6 bg-white border border-slate-200 rounded-sm p-3 text-center text-xs font-bold text-slate-400 select-none shadow-sm">
          <div className="text-[#2874F0]">1. Shipping Address</div>
          <div className="text-[#2874F0]">2. Secure Settlement</div>
          <div className="text-slate-700">3. Review Order</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          {/* LEFT SIDE: Address & Payment options */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* 1. SHIPPING ADDRESS */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 md:p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                <h3 className="font-bold text-[#212121] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FB641B]" /> 1. Shipping Address
                </h3>
                <button 
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-[11px] font-bold text-[#2874F0] hover:underline"
                >
                  {isAddingNewAddress ? 'Select Saved Address' : '+ Add Address'}
                </button>
              </div>

              {isAddingNewAddress ? (
                <form onSubmit={handleAddNewAddressSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                  <div className="sm:col-span-2">
                    <label className="mb-1 text-slate-400 block uppercase text-[10px]">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Flat 104, Admin Towers"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-500 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase text-[10px]">City</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. New Delhi"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-500 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase text-[10px]">State</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Delhi"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-500 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase text-[10px]">Pin Code</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. 110070"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-500 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase text-[10px]">Country</label>
                    <input
                      type="text"
                      required
                      placeholder="India"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-500 text-slate-700 placeholder-slate-400"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-[2px]">
                      Save Address
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingNewAddress(false)}
                      className="h-9 px-4 bg-white border border-slate-300 text-slate-700 font-bold text-xs uppercase rounded-[2px] hover:bg-slate-50"
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
                      className={`flex items-start gap-3 p-3 border rounded-sm cursor-pointer ${
                        selectedAddressIdx === idx ? 'border-[#2874F0] bg-blue-50/10' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedAddress"
                        checked={selectedAddressIdx === idx}
                        onChange={() => setSelectedAddressIdx(idx)}
                        className="mt-0.5 accent-[#2874F0] shrink-0"
                      />
                      <div className="text-xs text-slate-600 flex-1">
                        <span className="font-bold text-[#212121] block mb-1">{user.name}</span>
                        <span>{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</span>
                        <span className="text-[10px] text-slate-400 block mt-1 uppercase font-bold">{addr.country}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <span>No shipping address saved on this account.</span>
                  <button 
                    onClick={() => setIsAddingNewAddress(true)}
                    className="mt-2 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs px-4 py-2 rounded-sm"
                  >
                    Add Shipping Address
                  </button>
                </div>
              )}
            </div>

            {/* 2. SECURE PAYMENT */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 md:p-6 shadow-sm">
              <h3 className="font-bold text-[#212121] text-xs uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5 select-none">
                <CreditCard className="w-4 h-4 text-[#2874F0]" /> 2. Secure Settlement Options
              </h3>

              <div className="flex flex-col sm:flex-row gap-3 select-none">
                
                {/* COD Option */}
                <label 
                  className={`flex-1 flex items-start gap-3 p-4 border rounded-sm cursor-pointer ${
                    paymentMethod === 'COD' ? 'border-[#2874F0] bg-blue-50/10' : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="mt-0.5 accent-[#2874F0] shrink-0"
                  />
                  <div>
                    <span className="font-bold text-[#212121] text-xs block">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-slate-400 font-normal block mt-1">Settle using cash or UPI at delivery time</span>
                  </div>
                </label>

                {/* Razorpay Option */}
                <label 
                  className={`flex-1 flex items-start gap-3 p-4 border rounded-sm cursor-pointer ${
                    paymentMethod === 'Razorpay' ? 'border-[#2874F0] bg-blue-50/10' : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={() => setPaymentMethod('Razorpay')}
                    className="mt-0.5 accent-[#2874F0] shrink-0"
                  />
                  <div>
                    <span className="font-bold text-[#212121] text-xs block flex items-center gap-1">
                      Razorpay Online Payment <ShieldCheck className="w-3.5 h-3.5 text-[#388E3C] fill-[#388E3C]/10" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal block mt-1">Pay with Credit Cards, UPI, Netbanking or Wallet</span>
                  </div>
                </label>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Order Summary & Review */}
          <div className="lg:col-span-1 flex flex-col gap-4 text-left select-none">
            
            {/* Basket items display */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
              <h3 className="font-bold text-[#212121] text-xs uppercase tracking-wider border-b border-slate-100 pb-3 mb-3">
                Order Items ({cart.length})
              </h3>

              <div className="flex flex-col gap-3.5 max-h-[180px] overflow-y-auto pr-1">
                {cart.map(item => {
                  const displayPrice = item.product.discountPrice && item.product.discountPrice > 0 
                    ? item.product.discountPrice 
                    : item.product.price;
                  return (
                    <div key={item.product._id} className="flex gap-2.5 items-center">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="w-10 h-10 border border-slate-200 p-0.5 rounded-sm object-contain bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-[#212121] block truncate">{item.product.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Qty: {item.quantity} • ₹{displayPrice}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#212121] shrink-0">₹{displayPrice * item.quantity}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price Details */}
              <div className="border-t border-slate-100 pt-3 mt-4 flex flex-col gap-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Price ({cart.length} items)</span>
                  <span className="text-[#212121]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={shippingCharges === 0 ? 'text-[#388E3C]' : 'text-[#212121]'}>
                    {shippingCharges > 0 ? `₹${shippingCharges}` : 'FREE'}
                  </span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-[#388E3C]">
                    <span>Coupon Savings</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}

                {/* Total */}
                <div className="border-t border-slate-100 pt-3 mt-1.5 flex justify-between items-baseline text-sm font-bold text-[#212121]">
                  <span>Total Payable</span>
                  <span className="text-lg text-[#FB641B]">₹{grandTotal}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={checkoutLoading}
                className="w-full h-11 bg-[#FB641B] hover:bg-[#e15610] text-white font-bold text-xs uppercase rounded-sm shadow-sm flex items-center justify-center gap-1.5 mt-4 transition-colors outline-none"
              >
                {checkoutLoading ? 'Placing Order...' : 'Confirm & Place Order'}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* RAZORPAY SECURE SIMULATOR MODAL (Flat styling matching standard Razorpay overlay) */}
      {showSimulatorModal && simulatedOrderPayload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-350 rounded-md max-w-sm w-full shadow-lg overflow-hidden text-left flex flex-col">
            
            {simulatedStep === 'select' ? (
              <>
                {/* Header block (Razorpay brand navy) */}
                <div className="bg-[#1A253C] p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider">Razorpay Checkout</h3>
                      <p className="text-[9px] text-[#A5B4FC] font-semibold">SANDBOX INTERACTIVE SIMULATION</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-[#388E3C]/20 text-[#388E3C] font-bold px-1.5 py-0.5 rounded uppercase">
                    Test Mode
                  </span>
                </div>

                {/* Amount strip */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-500">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-normal">MERCHANT NAME</span>
                    <span className="text-slate-800">ToyBox Plus Premium</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block font-normal">PAYABLE AMOUNT</span>
                    <span className="text-[#212121] font-bold text-sm">₹{grandTotal}</span>
                  </div>
                </div>

                {/* Option Tabs */}
                <div className="flex border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">
                  <button 
                    onClick={() => setActivePaymentTab('card')}
                    className={`flex-1 py-2 text-center transition-colors border-b-2 ${activePaymentTab === 'card' ? 'border-[#3399FF] text-[#3399FF]' : 'border-transparent'}`}
                  >
                    Cards
                  </button>
                  <button 
                    onClick={() => setActivePaymentTab('upi')}
                    className={`flex-1 py-2 text-center transition-colors border-b-2 ${activePaymentTab === 'upi' ? 'border-[#3399FF] text-[#3399FF]' : 'border-transparent'}`}
                  >
                    UPI / QR
                  </button>
                  <button 
                    onClick={() => setActivePaymentTab('net')}
                    className={`flex-1 py-2 text-center transition-colors border-b-2 ${activePaymentTab === 'net' ? 'border-[#3399FF] text-[#3399FF]' : 'border-transparent'}`}
                  >
                    Netbanking
                  </button>
                </div>

                {/* Simulated payment detail tabs */}
                <div className="p-4 min-h-[140px] flex flex-col gap-3 text-xs">
                  
                  {activePaymentTab === 'card' && (
                    <div className="flex flex-col gap-2 font-semibold text-slate-500">
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-0.5">Cardholder Name</label>
                        <input type="text" readOnly value={user.name} className="w-full bg-slate-50 border border-slate-200 rounded-[2px] px-3 py-2 outline-none font-bold text-slate-800" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-[9px] text-slate-400 block mb-0.5">Test Card Number</label>
                          <input type="text" readOnly value="4111 1111 1111 1111" className="w-full bg-slate-50 border border-slate-200 rounded-[2px] px-3 py-2 outline-none font-mono text-slate-800" />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block mb-0.5">CVV</label>
                          <input type="password" readOnly value="123" className="w-full bg-slate-50 border border-slate-200 rounded-[2px] px-3 py-2 outline-none font-mono text-slate-800" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activePaymentTab === 'upi' && (
                    <div className="flex flex-col gap-2 font-semibold text-slate-500">
                      <label className="text-[9px] text-slate-400 block mb-0.5">Virtual Private Address (VPA)</label>
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-sm flex items-center justify-between">
                        <span className="font-bold text-slate-850">{user.email.split('@')[0]}@okhdfcbank</span>
                        <span className="text-[9px] bg-emerald-50 text-[#388E3C] px-1.5 py-0.2 rounded font-bold border border-emerald-100">Verified</span>
                      </div>
                      <p className="text-[10px] text-slate-450 leading-relaxed mt-1">
                        Clicks on "Authorize Payment" below. Mock sandbox resolves the transaction without external UPI notifications.
                      </p>
                    </div>
                  )}

                  {activePaymentTab === 'net' && (
                    <div className="grid grid-cols-2 gap-2 font-bold text-slate-600">
                      {['SBI', 'HDFC', 'ICICI', 'Axis'].map(bank => (
                        <div key={bank} className="border border-slate-200 rounded-sm p-2 bg-slate-50 text-center text-xs hover:border-[#3399FF] cursor-pointer">
                          🏦 {bank} Bank
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                  <button
                    onClick={handleSimulatedPaymentSuccess}
                    className="flex-1 bg-[#3399FF] hover:bg-[#287ece] text-white font-bold text-xs uppercase py-3 rounded-sm flex items-center justify-center gap-1.5 shadow-sm outline-none"
                  >
                    <Lock className="w-3.5 h-3.5 fill-current" /> Pay Securely
                  </button>
                  <button
                    onClick={() => {
                      setShowSimulatorModal(false);
                      showToast('Simulated Razorpay transaction was aborted.', 'error');
                    }}
                    className="px-4 py-3 bg-white border border-slate-300 hover:bg-slate-100 text-slate-550 font-bold text-xs uppercase rounded-sm outline-none"
                  >
                    Abort
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3 select-none">
                <div className="animate-spin w-8 h-8 border-3 border-[#3399FF] border-t-transparent rounded-full mb-1"></div>
                <h3 className="font-bold text-slate-800 text-sm">Validating Payment Gateway...</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Razorpay is securing your payment. Please do not close or refresh this view.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
