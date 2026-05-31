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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-[#388E3C] text-[10px] font-bold uppercase rounded-sm border border-emerald-100">
            Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#2874F0] text-[10px] font-bold uppercase rounded-sm border border-blue-100">
            Shipped
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-red-650 text-[10px] font-bold uppercase rounded-sm border border-rose-100">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-[#FB641B] text-[10px] font-bold uppercase rounded-sm border border-amber-100">
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
          <aside className="lg:col-span-1 bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col gap-2 select-none">
            
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
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-left uppercase text-[11px] transition-colors ${
                  activeTab === 'orders' ? 'bg-[#2874F0]/10 text-[#2874F0] font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" /> My Orders
              </button>
              
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-left uppercase text-[11px] transition-colors ${
                  activeTab === 'addresses' ? 'bg-[#2874F0]/10 text-[#2874F0] font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" /> Saved Addresses
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-left uppercase text-[11px] transition-colors ${
                  activeTab === 'profile' ? 'bg-[#2874F0]/10 text-[#2874F0] font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 shrink-0" /> Profile Details
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-left uppercase text-[11px] hover:bg-red-50 text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" /> Log Out
              </button>
            </div>

          </aside>

          {/* RIGHT AREA: Information Windows */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            
            {/* Flat Statistics Grid */}
            <div className="grid grid-cols-3 gap-3 select-none">
              <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders</span>
                <span className="text-lg font-bold text-[#212121] mt-0.5 block">{orders.length}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wishlisted</span>
                <span className="text-lg font-bold text-[#212121] mt-0.5 block">{wishlist.length}</span>
              </div>
              <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Addresses</span>
                <span className="text-lg font-bold text-[#212121] mt-0.5 block">{user?.addresses?.length || 0}</span>
              </div>
            </div>

            {/* Tab content panel */}
            <div className="bg-white border border-slate-200 rounded-sm p-4 md:p-6 shadow-sm">
              
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
                        <div key={ord._id} className="border border-slate-200 rounded-sm p-4 flex flex-col gap-4 text-xs">
                          
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
                                    className="w-10 h-10 border border-slate-200 p-0.5 rounded-sm object-contain shrink-0 bg-white"
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

                          {/* Order Details footer */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 select-none">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              Mode: <b>{ord.paymentMethod}</b> ({ord.paymentStatus})
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-[#212121]">Total Paid: <b className="text-sm text-[#FB641B]">₹{ord.totalAmount}</b></span>
                              <button
                                onClick={() => handleDownloadInvoice(ord._id)}
                                className="h-8 px-3 bg-white border border-slate-350 hover:bg-slate-50 text-slate-800 font-bold text-[10px] uppercase rounded-sm flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#FB641B]" /> Invoice PDF
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-150 p-12 text-center rounded-sm select-none">
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
                      className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-[10px] uppercase py-2 px-3 rounded-sm flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Location
                    </button>
                  </div>

                  {isAddingAddr && (
                    <form onSubmit={handleAddressSubmit} className="border border-slate-200 rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-650 mb-4 text-left">
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
                        <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-sm shadow-sm">
                          Save Location
                        </button>
                        <button type="button" onClick={() => setIsAddingAddr(false)} className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-sm shadow-sm hover:bg-slate-50">
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {user.addresses && user.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.addresses.map((addr) => (
                        <div key={addr._id} className="border border-slate-200 rounded-sm p-4 flex flex-col justify-between items-start text-left text-xs font-semibold text-slate-550 bg-slate-50 shadow-sm">
                          <div>
                            <span className="font-bold text-[#212121] block mb-1.5">{user.name}</span>
                            <span>{addr.street}, {addr.city}, {addr.state} - {addr.postalCode}</span>
                            <span className="text-[9px] text-slate-400 block mt-1 uppercase font-bold">{addr.country}</span>
                          </div>
                          <button
                            onClick={() => deleteAddress(addr._id)}
                            className="text-[10px] font-bold uppercase text-red-500 hover:underline mt-4 outline-none"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-150 p-12 text-center rounded-sm select-none">
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
                        className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase h-10 px-6 rounded-sm shadow-sm transition-colors outline-none"
                      >
                        {profileLoading ? 'Saving...' : 'Save Profile Details'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
