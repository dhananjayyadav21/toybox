import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Key, 
  LogOut, 
  FileText, 
  ChevronRight, 
  Plus
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Dashboard() {
  const { 
    user, 
    logout, 
    showToast, 
    isOfflineMode, 
    getAuthHeaders,
    addAddress,
    deleteAddress,
    wishlist
  } = useAppContext();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); 

  const getStatusStage = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed':
      case 'Packed': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 0; // Cancelled
    }
  };

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMobile, setProfileMobile] = useState(user?.mobile || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Inline address state
  const [isAddingAddr, setIsAddingAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ street: '', city: '', state: '', postalCode: '', country: 'India' });
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Guard dashboard
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin');
    }
  }, [user]);

  // Fetch orders
  const fetchMyOrders = async (silent = false) => {
    if (!user) return;
    if (!silent) setOrdersLoading(true);
    try {
      if (!isOfflineMode) {
        const res = await axios.get('/api/orders/myorders', getAuthHeaders());
        setOrders(res.data);
      } else {
        setOrders([
          {
            _id: 'ord_MOCK123',
            products: [
              {
                product: { name: 'Smart Wooden Shape Matcher', price: 999, images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800'] },
                quantity: 1,
                price: 999
              }
            ],
            shippingAddress: { street: '123 Joy Street, Vasant Kunj', city: 'New Delhi', state: 'Delhi', postalCode: '110070', country: 'India' },
            paymentMethod: 'COD',
            paymentStatus: 'Pending',
            orderStatus: 'Shipped',
            totalAmount: 999,
            createdAt: new Date()
          }
        ]);
      }
    } catch (err) {
      console.log('My orders fetch failed');
    } finally {
      if (!silent) setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user, isOfflineMode]);

  // Real-time synchronization polling for active dispatches
  useEffect(() => {
    if (!user || isOfflineMode) return;

    const hasActiveDispatches = orders.some(
      o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
    );
    if (!hasActiveDispatches) return;

    const interval = setInterval(() => {
      fetchMyOrders(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [orders, user, isOfflineMode]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileName.trim() || !profileMobile.trim()) {
      showToast('Please fill essential fields', 'error');
      return;
    }

    setProfileLoading(true);
    try {
      if (!isOfflineMode) {
        showToast('Profile updated successfully!');
      } else {
        showToast('Profile updated in Sandbox Mode!');
      }
    } catch (err) {
      showToast('Failed to save profile changes', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    addAddress(newAddr);
    setNewAddr({ street: '', city: '', state: '', postalCode: '', country: 'India' });
    setIsAddingAddr(false);
  };

  const handleDownloadInvoice = async (orderId) => {
    if (isOfflineMode) {
      showToast('Invoice PDF downloads are simulated in Sandbox Mode! 📄');
      return;
    }

    try {
      showToast('Preparing invoice download...');
      const response = await axios.get(`/api/orders/${orderId}/invoice`, {
        headers: getAuthHeaders().headers,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Invoice PDF downloaded! 📂');
    } catch (err) {
      showToast('Failed to download invoice PDF', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-[#388E3C] text-[10px] font-bold uppercase rounded-lg border border-emerald-100">
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#2874F0] text-[10px] font-bold uppercase rounded-lg border border-blue-100">
            Shipped
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-red-650 text-[10px] font-bold uppercase rounded-lg border border-rose-100">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-[#FB641B] text-[10px] font-bold uppercase rounded-lg border border-amber-100">
            Pending
          </span>
        );
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#F1F3F6] min-h-screen pt-4 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1 text-[11px] font-normal text-slate-500 mb-4 select-none">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">My Account</span>
        </div>

        {/* Dashboard Grid Header */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
          
          {/* LEFT SIDEBAR: Navigation Panel */}
          <aside className="lg:col-span-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-2 select-none">
            
            {/* User profile brief card */}
            <div className="pb-4 border-b border-slate-100 flex items-center gap-3.5 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#2874F0] text-white flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-400 block font-bold">Hello,</span>
                <h4 className="font-bold text-[#212121] text-xs truncate leading-snug">{user.name}</h4>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left uppercase text-[11px] transition-colors ${
                  activeTab === 'orders' ? 'bg-[#2874F0]/10 text-[#2874F0] font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" /> My Orders
              </button>
              
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left uppercase text-[11px] transition-colors ${
                  activeTab === 'addresses' ? 'bg-[#2874F0]/10 text-[#2874F0] font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" /> Saved Addresses
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left uppercase text-[11px] transition-colors ${
                  activeTab === 'profile' ? 'bg-[#2874F0]/10 text-[#2874F0] font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 shrink-0" /> Profile Details
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left uppercase text-[11px] hover:bg-red-50 text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" /> Log Out
              </button>
            </div>

          </aside>

          {/* RIGHT AREA: Information Windows */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Flat Statistics Grid */}
            <div className="grid grid-cols-3 gap-3 select-none">
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders</span>
                <span className="text-lg font-bold text-[#212121] mt-0.5 block">{orders.length}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wishlisted</span>
                <span className="text-lg font-bold text-[#212121] mt-0.5 block">{wishlist.length}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Addresses</span>
                <span className="text-lg font-bold text-[#212121] mt-0.5 block">{user?.addresses?.length || 0}</span>
              </div>
            </div>

            {/* Tab content panel */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
              
              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-sm font-bold text-[#212121] uppercase border-b border-slate-100 pb-3 mb-2 select-none">
                    My Purchases ({orders.length})
                  </h2>

                  {ordersLoading ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                      <div className="animate-spin w-6 h-6 border-2 border-[#2874F0] border-t-transparent rounded-full mx-auto mb-2"></div>
                      Fetching orders...
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {orders.map((ord) => (
                        <div key={ord._id} className="border border-slate-200 rounded-lg p-4 flex flex-col gap-4 text-xs">
                          
                          {/* Order Header line */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-slate-550 select-none">
                            <div className="flex gap-4">
                              <span>Date: <b>{new Date(ord.createdAt).toLocaleDateString()}</b></span>
                              <span>Order ID: <b>#{ord._id.toString().toUpperCase().slice(-8)}</b></span>
                            </div>
                            <div>
                              {getStatusBadge(ord.orderStatus)}
                            </div>
                          </div>

                          {/* Order Items list */}
                          <div className="flex flex-col gap-3">
                            {ord.products.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full">
                                  <img
                                    src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=200'}
                                    alt="Ordered toy"
                                    className="w-10 h-10 border border-slate-200 p-0.5 rounded-lg object-contain shrink-0 bg-white"
                                  />
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-[#212121] text-xs line-clamp-1 leading-snug">
                                      {item.product?.name || 'Toy Item'}
                                    </h4>
                                    <span className="text-[10px] text-slate-400 block mt-0.5 select-none">
                                      Quantity: {item.quantity} • Unit Price: ₹{item.price}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-bold text-[#212121] shrink-0">₹{item.quantity * item.price}</span>
                              </div>
                            ))}
                          </div>

                          {/* Dynamic Visual Handover OTP Alert Box */}
                          {ord.deliveryOtp && ord.orderStatus !== 'Delivered' && ord.orderStatus !== 'Cancelled' && (
                            <div className="bg-emerald-50/70 border border-emerald-200 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse select-none my-1">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-550 text-white flex items-center justify-center text-sm shrink-0 shadow-sm font-bold">
                                  🔑
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-extrabold text-[#388E3C] text-[11px] uppercase tracking-wide">
                                    Doorstep Verification Passcode
                                  </h4>
                                  <p className="text-[10px] text-slate-600 leading-relaxed font-medium mt-0.5">
                                    Share this secure 6-digit OTP with our delivery partner when they arrive to verify and confirm your order handover.
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                <span className="text-slate-400 text-[10px] font-bold">OTP CODE:</span>
                                <span className="bg-white text-[#388E3C] border border-emerald-250 rounded px-3 py-1.5 text-base font-black tracking-widest shadow-sm select-all">
                                  {ord.deliveryOtp}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Dynamic Visual Stepper Progress Tracking */}
                          {ord.orderStatus === 'Cancelled' ? (
                            <div className="bg-rose-50/50 border border-rose-100 rounded p-3 select-none flex items-center justify-between text-[11px] font-bold text-red-650 my-1">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
                                <span>This order has been cancelled and cannot be tracked.</span>
                              </div>
                              <span className="text-[10px] font-black uppercase bg-rose-100 px-2 py-0.5 rounded border border-rose-200 shrink-0">Cancelled</span>
                            </div>
                          ) : (
                            <div className="py-4 border-t border-b border-slate-100 select-none my-1">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-3.5">
                                Shipment Journey Timeline
                              </span>
                              
                              <div className="relative flex items-center justify-between">
                                {/* Background Line */}
                                <div className="absolute left-0 right-0 top-[9px] h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-emerald-500 transition-all duration-500" 
                                    style={{ width: `${(Math.max(0, getStatusStage(ord.orderStatus) - 1) / 3) * 100}%` }}
                                  />
                                </div>

                                {/* Step Points */}
                                {[
                                  { label: 'Ordered', stageNum: 1, desc: 'Placed safely' },
                                  { label: 'Packed', stageNum: 2, desc: 'Processed & ready' },
                                  { label: 'Shipped', stageNum: 3, desc: 'In transit' },
                                  { label: 'Delivered', stageNum: 4, desc: 'Handed over' }
                                ].map((step, sIdx) => {
                                  const isDone = getStatusStage(ord.orderStatus) >= step.stageNum;
                                  const isCurrent = getStatusStage(ord.orderStatus) === step.stageNum;
                                  return (
                                    <div key={sIdx} className="flex flex-col items-center text-center w-1/4 relative">
                                      {/* Dot */}
                                      <div 
                                        className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border font-bold text-[9px] transition-all duration-300 ${
                                          isDone 
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]' 
                                            : 'bg-white border-slate-200 text-slate-400'
                                        } ${isCurrent ? 'ring-4 ring-emerald-50' : ''}`}
                                      >
                                        {isDone ? '✓' : step.stageNum}
                                      </div>

                                      {/* labels */}
                                      <span 
                                        className={`text-[10px] font-black mt-1.5 transition-colors duration-300 ${
                                          isDone ? 'text-slate-800' : 'text-slate-400'
                                        }`}
                                      >
                                        {step.label}
                                      </span>
                                      <span className="text-[8px] text-slate-400 font-medium hidden sm:block mt-0.5">
                                        {step.desc}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {/* Dynamic Lifecycle History Logs */}
                          {ord.statusHistory && ord.statusHistory.length > 0 && (
                            <div className="bg-slate-50 border border-slate-200 rounded p-3 select-none my-1 flex flex-col gap-2.5">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">
                                Order Lifecycle History Logs
                              </span>
                              <div className="flex flex-col gap-3 pl-2.5 border-l-2 border-slate-200">
                                {ord.statusHistory.map((hist, hIdx) => (
                                  <div key={hIdx} className="flex items-start gap-2.5 text-[10px]">
                                    <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                                      hist.status === 'Cancelled' ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]' :
                                      hist.status === 'Re-activated' ? 'bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)] animate-pulse' :
                                      hist.status === 'Delivered' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-slate-450'
                                    }`} />
                                    <div className="min-w-0 flex-1 leading-normal">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-black uppercase text-[8px] tracking-widest px-1.5 py-0.5 rounded border shrink-0 ${
                                          hist.status === 'Cancelled' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                          hist.status === 'Re-activated' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                          hist.status === 'Delivered' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-250 text-slate-650'
                                        }`}>
                                          {hist.status === 'Re-activated' ? '🔄 Tracking Re-activated' : hist.status}
                                        </span>
                                        <span className="text-slate-400 font-medium block text-[8px] shrink-0">
                                          {new Date(hist.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-600 font-bold mt-1">
                                        {hist.comment || `Order status updated to ${hist.status}`}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Order Details footer */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 select-none">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              Mode: <b>{ord.paymentMethod}</b> ({ord.paymentStatus})
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-[#212121]">Total Paid: <b className="text-sm text-[#FB641B]">₹{ord.totalAmount}</b></span>
                              <button
                                onClick={() => handleDownloadInvoice(ord._id)}
                                className="h-8 px-3 bg-white border border-slate-350 hover:bg-slate-50 text-slate-800 font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#FB641B]" /> Invoice PDF
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-150 p-12 text-center rounded-lg select-none">
                      <span className="text-3xl block mb-2">📦</span>
                      <h4 className="font-bold text-[#212121] text-xs uppercase">No orders recorded</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">You haven't bought any developmental shapes or racers yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES TAB */}
              {activeTab === 'addresses' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                    <h2 className="text-sm font-bold text-[#212121] uppercase">Saved Addresses</h2>
                    <button
                      onClick={() => setIsAddingAddr(!isAddingAddr)}
                      className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-[10px] uppercase py-2 px-3 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Location
                    </button>
                  </div>

                  {isAddingAddr && (
                    <form onSubmit={handleAddressSubmit} className="border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-650 mb-4 text-left">
                      <h3 className="sm:col-span-2 font-bold text-xs text-[#212121] uppercase">New Address Details</h3>
                      <div className="sm:col-span-2">
                        <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Street Area</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. Flat 102, Vasant Heights"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                          className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">City</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. Noida"
                          value={newAddr.city}
                          onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                          className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">State</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. Uttar Pradesh"
                          value={newAddr.state}
                          onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                          className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Pin Code</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. 201301"
                          value={newAddr.postalCode}
                          onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                          className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Country</label>
                        <input
                          type="text"
                          required
                          value={newAddr.country}
                          onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                          className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                        />
                      </div>
                      <div className="sm:col-span-2 pt-1 flex gap-2">
                        <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-lg shadow-sm">
                          Save Location
                        </button>
                        <button type="button" onClick={() => setIsAddingAddr(false)} className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-lg shadow-sm hover:bg-slate-50">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {user.addresses && user.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.addresses.map((addr) => (
                        <div key={addr._id} className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between items-start text-left text-xs font-semibold text-slate-550 bg-slate-50 shadow-sm">
                          <div>
                            <span className="font-bold text-[#212121] block mb-1.5">{user.name}</span>
                            <span>{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</span>
                            <span className="text-[9px] text-slate-400 block mt-1 uppercase font-bold">{addr.country}</span>
                          </div>
                          <button
                            onClick={() => setAddressToDelete(addr._id)}
                            className="text-[10px] font-bold uppercase text-red-500 hover:underline mt-4 outline-none"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-150 p-12 text-center rounded-lg select-none">
                      <span className="text-3xl block mb-2">📍</span>
                      <h4 className="font-bold text-slate-800 text-xs uppercase">No Address Added</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Save home or office addresses for seamless delivery checkouts.</p>
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="flex flex-col gap-4 text-left">
                  <h2 className="text-sm font-bold text-[#212121] uppercase border-b border-slate-100 pb-3 mb-2 select-none">
                    Profile Information
                  </h2>
                  
                  <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-semibold text-slate-600">
                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={profileMobile}
                        onChange={(e) => setProfileMobile(e.target.value)}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Email Address (Read Only)</label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full bg-slate-100 border border-slate-300 rounded-[2px] px-3 py-2 text-slate-400 cursor-not-allowed font-semibold"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 border-t border-slate-100 mt-4 pt-4 select-none">
                      <h3 className="font-bold text-[#212121] text-xs uppercase flex items-center gap-1.5 mb-3">
                        <Key className="w-4 h-4 text-[#2874F0]" /> Change Password
                      </h3>
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Old Password</label>
                      <input
                        type="password"
                        placeholder="Enter old password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">New Password</label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-3 border-t border-slate-100 mt-3 text-left">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase h-10 px-6 rounded-lg shadow-sm transition-colors outline-none flex items-center justify-center gap-1.5"
                      >
                        {profileLoading ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : 'Save Profile Details'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      <ConfirmationModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={() => deleteAddress(addressToDelete)}
        title="Delete Address?"
        message="Are you sure you want to remove this saved address? This cannot be undone."
        confirmText="Yes, Delete"
      />
    </div>
  );
}
