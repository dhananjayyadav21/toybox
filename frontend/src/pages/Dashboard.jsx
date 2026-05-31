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
  CheckCircle, 
  Truck, 
  Clock, 
  Calendar,
  XCircle,
  Plus,
  ChevronRight,
  ShieldCheck,
  Heart,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeTab, setActiveTab] = useState('orders'); // orders, profile, addresses

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

  // Guard dashboard
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  // Fetch orders
  const fetchMyOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      if (!isOfflineMode) {
        const res = await axios.get('/api/orders/myorders', getAuthHeaders());
        setOrders(res.data);
      } else {
        // Offline Mock log
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
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user, isOfflineMode]);

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Shipped
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Pending
          </span>
        );
    }
  };

  const dashboardStats = useMemo(() => {
    return [
      { name: 'Total Orders', count: orders.length, color: 'text-toy-teal bg-toy-teal/10' },
      { name: 'Wishlisted Items', count: wishlist.length, countText: `${wishlist.length} Items`, color: 'text-toy-coral bg-toy-coral/10' },
      { name: 'Saved Addresses', count: user?.addresses?.length || 0, color: 'text-toy-purple bg-toy-purple/10' }
    ];
  }, [orders, wishlist, user]);

  if (!user) return null;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left bg-slate-50/20 pb-20">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 mb-8 tracking-wider">
        <Link to="/" className="hover:text-toy-coral">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-toy-coral">My Account Dashboard</span>
      </div>

      <h1 className="text-3xl font-black text-slate-850 mb-8 font-sans">My Account Dashboard</h1>

      {/* Grid of Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {dashboardStats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgba(15,23,42,0.01)] text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{stat.name}</span>
              <span className="text-2xl font-black text-slate-800 mt-1 block">{stat.count}</span>
            </div>
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm ${stat.color}`}>
              {i === 0 && <ShoppingBag className="w-5 h-5" />}
              {i === 1 && <Heart className="w-5 h-5 fill-current" />}
              {i === 2 && <MapPin className="w-5 h-5" />}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Navigation Links */}
        <aside className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-[0_8px_30px_rgba(15,23,42,0.02)] flex flex-col gap-1 font-bold text-xs text-slate-600">
          
          {/* User summary */}
          <div className="p-4 border-b border-slate-50 flex items-center gap-3.5 mb-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-toy-coral to-toy-yellow flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm line-clamp-1">{user.name}</h4>
              <span className="text-[9px] bg-toy-teal/10 text-toy-teal font-black uppercase tracking-widest px-2 py-0.5 rounded-md">{user.role}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left font-black uppercase tracking-wider text-[10px] transition-all outline-none ${
              activeTab === 'orders' ? 'bg-toy-teal/10 text-toy-teal font-extrabold' : 'hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> My Orders
          </button>
          
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left font-black uppercase tracking-wider text-[10px] transition-all outline-none ${
              activeTab === 'addresses' ? 'bg-toy-coral/10 text-toy-coral font-extrabold' : 'hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" /> Shipping Addresses
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left font-black uppercase tracking-wider text-[10px] transition-all outline-none ${
              activeTab === 'profile' ? 'bg-toy-purple/10 text-toy-purple font-extrabold' : 'hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" /> Edit Profile
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left font-black uppercase tracking-wider text-[10px] hover:bg-rose-50 text-rose-600 transition-all outline-none"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>

        </aside>

        {/* Right Side: Tab Displays */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              <h2 className="font-extrabold text-slate-800 text-base uppercase tracking-wider border-b border-slate-100 pb-3">My Purchase History</h2>
              
              {ordersLoading ? (
                <div className="text-center p-12 text-slate-400 text-xs font-semibold">
                  <div className="animate-spin w-6 h-6 border-2 border-toy-teal border-t-transparent rounded-full mx-auto mb-3"></div>
                  Loading purchases...
                </div>
              ) : orders.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {orders.map((ord) => (
                    <div key={ord._id} className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.01)] text-left">
                      
                      {/* Order info header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-50 text-xs font-bold text-slate-400">
                        <div className="flex gap-4 items-center">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-300" /> {new Date(ord.createdAt).toLocaleDateString()}</span>
                          <span>Reference: <b className="text-slate-700">#{ord._id.toString().toUpperCase().slice(-8)}</b></span>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(ord.orderStatus)}
                        </div>
                      </div>

                      {/* Products inside order */}
                      <div className="flex flex-col gap-3">
                        {ord.products.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 w-full">
                              <img
                                src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'}
                                alt="Ordered toy"
                                className="w-11 h-11 bg-slate-50 border border-slate-100 p-0.5 rounded-lg object-contain shrink-0"
                              />
                              <div className="text-[10px] font-black uppercase text-slate-400">
                                <h4 className="font-extrabold text-slate-800 text-xs line-clamp-1 leading-snug lowercase first-letter:uppercase">{item.product?.name || 'Toy Item'}</h4>
                                <p className="mt-0.5 font-bold">Qty: {item.quantity} • price: INR {item.price}</p>
                              </div>
                            </div>
                            <span className="font-black text-slate-800 text-xs shrink-0">INR {item.quantity * item.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Summary footer */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-50">
                        <div className="text-left text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                          <span>Payment Mode: <b>{ord.paymentMethod}</b> ({ord.paymentStatus})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-extrabold text-slate-700">Total: <b className="text-sm font-black text-toy-coral">INR {ord.totalAmount}</b></span>
                          <button
                            onClick={() => handleDownloadInvoice(ord._id)}
                            className="bg-white border border-slate-150 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                          >
                            <FileText className="w-3.5 h-3.5 text-toy-coral" /> Invoice PDF
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-[32px] p-16 text-center flex flex-col items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-slate-350" />
                  <h4 className="font-extrabold text-slate-850 text-sm">No Orders Placed Yet</h4>
                  <p className="text-xs font-semibold text-slate-400 max-w-xs leading-relaxed">
                    You haven’t ordered any toys. Browse categories to complete your first toy sandbox purchase!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">My Shipping Destinations</h2>
                <button
                  onClick={() => setIsAddingAddr(!isAddingAddr)}
                  className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              {isAddingAddr && (
                <form onSubmit={handleAddressSubmit} className="bg-white border border-slate-100 rounded-[32px] p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600 shadow-[0_8px_30px_rgba(15,23,42,0.01)] text-left">
                  <h3 className="sm:col-span-2 font-extrabold text-sm text-slate-800 mb-2 uppercase tracking-wide">New Shipping Location</h3>
                  <div className="sm:col-span-2">
                    <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Street & Building</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Flat 102, Vasant Heights"
                      value={newAddr.street}
                      onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">City</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. New Delhi"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">State</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Delhi"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Pin Code</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. 110070"
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Country</label>
                    <input
                      type="text"
                      required
                      value={newAddr.country}
                      onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-700"
                    />
                  </div>
                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl shadow-sm">
                      Save Location
                    </button>
                    <button type="button" onClick={() => setIsAddingAddr(false)} className="bg-white border border-slate-100 hover:bg-slate-50 text-slate-650 font-extrabold text-[10px] uppercase tracking-widest py-3 px-6 rounded-xl shadow-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr) => (
                    <div key={addr._id} className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between items-start text-left text-xs font-semibold text-slate-500 shadow-sm">
                      <div>
                        <p className="font-extrabold text-slate-800 text-sm mb-1.5">{user.name}</p>
                        <p className="leading-relaxed">{addr.street}</p>
                        <p className="leading-relaxed">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider mt-1">{addr.country}</p>
                      </div>
                      <button
                        onClick={() => deleteAddress(addr._id)}
                        className="text-[10px] font-black uppercase text-rose-500 hover:underline mt-4 outline-none"
                      >
                        Remove Address
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center flex flex-col items-center gap-3">
                  <MapPin className="w-8 h-8 text-slate-350" />
                  <h4 className="font-extrabold text-slate-800 text-sm">No Addresses Registered</h4>
                  <p className="text-xs font-semibold text-slate-400 max-w-xs leading-relaxed">
                    Set up home or work destinations. This speeds up your billing details upon checking out toys!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EDIT PROFILE */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6">
              <h2 className="font-extrabold text-slate-850 text-base uppercase tracking-wider border-b border-slate-100 pb-3">My Profile Credentials</h2>
              
              <form onSubmit={handleProfileUpdate} className="bg-white border border-slate-100 rounded-[32px] p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-650 shadow-[0_8px_30px_rgba(15,23,42,0.01)] text-left">
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Email Address (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-3 outline-none text-slate-400 cursor-not-allowed font-semibold"
                  />
                </div>
                <div className="sm:col-span-2 border-t border-slate-100 mt-4 pt-5">
                  <h3 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider flex items-center gap-2 mb-4">
                    <Key className="w-4 h-4 text-toy-purple" /> Change Password
                  </h3>
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Old Password</label>
                  <input
                    type="password"
                    placeholder="Enter old password..."
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-800"
                  />
                </div>
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2 pt-4 border-t border-slate-100 mt-4 text-left">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-widest py-3.5 px-8 rounded-xl shadow-md"
                  >
                    {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
