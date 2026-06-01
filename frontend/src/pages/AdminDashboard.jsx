import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { 
  LayoutDashboard, 
  ToyBrick, 
  Grid, 
  ShoppingBag, 
  Tag, 
  Plus,
  Trash2,
  Edit3,
  FileText,
  Search,
  Users,
  Star
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AdminDashboard() {
  const { 
    user, 
    products, 
    categories, 
    isOfflineMode, 
    getAuthHeaders, 
    showToast,
    fetchData
  } = useAppContext();

  const navigate = useNavigate();

  // Protect Admin Route
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      showToast('Not authorized to access the Admin Dashboard!', 'error');
      navigate('/');
    }
  }, [user]);

  // Tab State: 'overview', 'products', 'categories', 'orders', 'coupons'
  const [adminTab, setAdminTab] = useState('overview');

  // Dynamic states populated from API
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

  // Search Filter States
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Delivery OTP System States
  const [otpInput, setOtpInput] = useState({});
  const [activeOtpOrders, setActiveOtpOrders] = useState({});
  const [simulatedOtps, setSimulatedOtps] = useState({});

  // Data Edit Modal States
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProductForm, setNewProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '', description: '', category: '', brand: 'ToyBox', ageGroup: '3-5 Years', price: '', discountPrice: '', stock: '', sku: ''
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryForm, setNewCategoryForm] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '', image: '', description: ''
  });

  const [newCouponForm, setNewCouponForm] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: '', discountType: 'percentage', discountValue: '', expiryDate: '', usageLimit: ''
  });

  const [productToDelete, setProductToDelete] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);

  // Fetch admin logs
  const fetchAdminData = async () => {
    if (isOfflineMode) {
      setOrders([
        { _id: 'ord_1', user: { name: 'Dhananjay Kumar', email: 'user@toybox.com' }, products: [{ product: { name: 'Smart Wooden Shape Matcher' }, quantity: 1, price: 999 }], shippingAddress: { street: 'Vasant Kunj', city: 'Delhi' }, paymentMethod: 'COD', paymentStatus: 'Pending', orderStatus: 'Pending', totalAmount: 999, createdAt: new Date() },
        { _id: 'ord_2', user: { name: 'Sneha Rao', email: 'sneha@gmail.com' }, products: [{ product: { name: 'RC High-Speed Desert Buggy 4x4' }, quantity: 1, price: 2999 }], shippingAddress: { street: 'Sector 62', city: 'Noida' }, paymentMethod: 'Razorpay', paymentStatus: 'Paid', orderStatus: 'Delivered', totalAmount: 2999, createdAt: new Date() }
      ]);
      setCoupons([
        { _id: 'cp_1', code: 'TOYBOX20', discountType: 'percentage', discountValue: 20, expiryDate: new Date('2028-12-31'), usageLimit: 500, usedCount: 14 },
        { _id: 'cp_2', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, expiryDate: new Date('2028-12-31'), usageLimit: 1000, usedCount: 8 }
      ]);
      setUsersList([
        { _id: 'u_1', name: 'ToyBox System Administrator', email: 'admin@toybox.com', mobile: '9999988888', role: 'admin', status: 'active' },
        { _id: 'u_2', name: 'Dhananjay Kumar', email: 'user@toybox.com', mobile: '9876543210', role: 'user', status: 'active' }
      ]);
      setReviewsList([
        { _id: 'rev_1', user: { name: 'Sneha Rao' }, product: { name: 'Organic Cotton Soft Rattle Set' }, rating: 5, comment: 'Extremely soft build quality!', createdAt: new Date() }
      ]);
      return;
    }

    try {
      const [ordRes, cpRes] = await Promise.all([
        axios.get('/api/orders', getAuthHeaders()),
        axios.get('/api/coupons', getAuthHeaders())
      ]);
      setOrders(ordRes.data);
      setCoupons(cpRes.data);

      setUsersList([
        { _id: 'u_1', name: 'ToyBox System Administrator', email: 'admin@toybox.com', mobile: '9999988888', role: 'admin', status: 'active' },
        { _id: 'u_2', name: 'Dhananjay Kumar', email: 'user@toybox.com', mobile: '9876543210', role: 'user', status: 'active' }
      ]);
      setReviewsList([
        { _id: 'rev_1', user: { name: 'Sneha Rao' }, product: { name: 'Organic Cotton Soft Rattle Set' }, rating: 5, comment: 'Extremely soft build quality!', createdAt: new Date() }
      ]);
    } catch (err) {
      console.log('Failed to fetch admin dashboard components');
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user, isOfflineMode]);

  // Compute key metrics
  const stats = useMemo(() => {
    const totalSales = orders.filter(o => o.paymentStatus === 'Paid' || o.paymentMethod === 'COD').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const pendingOrdersCount = orders.filter(o => o.orderStatus === 'Pending').length;
    return {
      sales: totalSales,
      ordersCount: orders.length,
      usersCount: usersList.length,
      productsCount: products.length,
      pendingOrders: pendingOrdersCount
    };
  }, [orders, usersList, products]);

  // Prepare Graph Data
  const { salesData, categoryData } = useMemo(() => {
    // Sales Timeline (Last 7 Days)
    const salesTimeline = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      salesTimeline.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount: 0 });
    }

    orders.forEach(o => {
      if (o.paymentStatus === 'Paid' || o.paymentMethod === 'COD') {
        const orderDate = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayMatch = salesTimeline.find(s => s.date === orderDate);
        if (dayMatch) {
          dayMatch.amount += o.totalAmount;
        }
      }
    });

    // Category Proportions
    const catMap = {};
    products.forEach(p => {
      const catName = p.category?.name || 'Uncategorized';
      catMap[catName] = (catMap[catName] || 0) + 1;
    });
    
    const catData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));

    return { salesData: salesTimeline, categoryData: catData };
  }, [orders, products]);

  const COLORS = ['#2874F0', '#FB641B', '#FF9F00', '#388E3C', '#878787'];

  // CRUD API: PRODUCTS
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productFormData.category) {
      showToast('Please select a valid category first!', 'error');
      return;
    }

    try {
      if (!isOfflineMode) {
        if (editingProduct) {
          await axios.put(`/api/products/${editingProduct._id}`, productFormData, getAuthHeaders());
          showToast('Product updated successfully!');
        } else {
          await axios.post('/api/products', productFormData, getAuthHeaders());
          showToast('New Product added to DB catalog!');
        }
      } else {
        showToast('Sandbox Mock Product updated successfully!');
      }
      setNewProductForm(false);
      setEditingProduct(null);
      setProductFormData({
        name: '', description: '', category: '', brand: 'ToyBox', ageGroup: '3-5 Years', price: '', discountPrice: '', stock: '', sku: ''
      });
      fetchData(); 
    } catch (err) {
      showToast('Product submission failed', 'error');
    }
  };

  const deleteProductItem = async (id) => {
    try {
      if (!isOfflineMode) {
        await axios.delete(`/api/products/${id}`, getAuthHeaders());
      }
      showToast('Product removed!');
      fetchData();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // CRUD API: CATEGORIES
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isOfflineMode) {
        if (editingCategory) {
          await axios.put(`/api/categories/${editingCategory._id}`, categoryFormData, getAuthHeaders());
          showToast('Category updated!');
        } else {
          await axios.post('/api/categories', categoryFormData, getAuthHeaders());
          showToast('Category added!');
        }
      } else {
        showToast('Sandbox Mock Category created successfully!');
      }
      setNewCategoryForm(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', image: '', description: '' });
      fetchData();
    } catch (err) {
      showToast('Category update failed', 'error');
    }
  };

  // CRUD API: COUPONS
  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isOfflineMode) {
        const res = await axios.post('/api/coupons', couponFormData, getAuthHeaders());
        setCoupons(prev => [res.data, ...prev]);
      } else {
        const newMockCp = {
          _id: 'cp_' + Math.random().toString(36).substring(2, 9),
          ...couponFormData,
          usedCount: 0
        };
        setCoupons(prev => [newMockCp, ...prev]);
      }
      showToast('New coupon code created successfully!');
      setNewCouponForm(false);
      setCouponFormData({ code: '', discountType: 'percentage', discountValue: '', expiryDate: '', usageLimit: '' });
    } catch (err) {
      showToast('Failed to add coupon', 'error');
    }
  };

  const deleteCouponItem = async (id) => {
    try {
      if (!isOfflineMode) {
        await axios.delete(`/api/coupons/${id}`, getAuthHeaders());
      }
      setCoupons(prev => prev.filter(c => c._id !== id));
      showToast('Coupon removed!');
    } catch (err) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  // Update order status
  const updateStatus = async (orderId, orderStatus, paymentStatus) => {
    if (orderStatus === 'Delivered') {
      showToast('To mark order as Delivered, please use the secure Doorstep OTP Verification panel!', 'error');
      return;
    }
    try {
      if (!isOfflineMode) {
        await axios.put(`/api/orders/${orderId}/status`, { orderStatus, paymentStatus }, getAuthHeaders());
      }
      setOrders(prev => prev.map(o => 
        o._id === orderId 
          ? { ...o, orderStatus: orderStatus || o.orderStatus, paymentStatus: paymentStatus || o.paymentStatus }
          : o
      ));
      showToast(`Order status updated successfully!`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update status';
      showToast(errMsg, 'error');
    }
  };

  const handleSendDeliveryOtp = async (orderId) => {
    try {
      showToast('Generating delivery verification OTP...', 'warning');
      let otp = '';
      if (!isOfflineMode) {
        const res = await axios.post(`/api/orders/${orderId}/send-otp`, {}, getAuthHeaders());
        otp = res.data.deliveryOtp;
        showToast(res.data.message);
      } else {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
        showToast('Sandbox Mock: Delivery verification OTP sent to user email! 📬');
      }
      setActiveOtpOrders(prev => ({ ...prev, [orderId]: true }));
      setSimulatedOtps(prev => ({ ...prev, [orderId]: otp }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate delivery OTP', 'error');
    }
  };

  const handleVerifyDeliveryOtp = async (orderId) => {
    const otp = otpInput[orderId]?.trim();
    if (!otp || otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP code', 'error');
      return;
    }
    try {
      showToast('Verifying OTP code...');
      if (!isOfflineMode) {
        const res = await axios.post(`/api/orders/${orderId}/verify-otp`, { otp }, getAuthHeaders());
        showToast(res.data.message);
      } else {
        showToast('Sandbox Mock: OTP verified successfully!');
      }

      setOrders(prev => prev.map(o => 
        o._id === orderId 
          ? { ...o, orderStatus: 'Delivered', paymentStatus: 'Paid', isDeliveryOtpVerified: true }
          : o
      ));

      setActiveOtpOrders(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      setOtpInput(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      setSimulatedOtps(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or expired delivery OTP', 'error');
    }
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

  // Client side search matching lists
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.sku.toLowerCase().includes(q) || 
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  }, [products, productSearch]);

  const filteredOrders = useMemo(() => {
    if (!orderSearch.trim()) return orders;
    const q = orderSearch.toLowerCase();
    return orders.filter(o => 
      o._id.toLowerCase().includes(q) || 
      (o.user && o.user.name.toLowerCase().includes(q)) || 
      (o.user && o.user.email.toLowerCase().includes(q))
    );
  }, [orders, orderSearch]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="bg-[#F1F3F6] min-h-screen text-left">
      
      {/* Top Admin navigation brand */}
      <header className="bg-[#172337] text-white px-6 py-4 flex items-center justify-between border-b border-[#2a3a54] select-none">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-wider">ToyBox Control Room</h1>
            <p className="text-[10px] text-slate-400">Shopify & Amazon Merchant Central console</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-[#388E3C] text-white px-2 py-0.5 rounded-lg font-bold uppercase select-none">
            Admin Mode
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* LEFT SIDEBAR: Professional Dark blue/slate Sidebar */}
          <aside className="lg:col-span-1 bg-[#172337] text-white border border-[#2a3a54] rounded-lg p-4 shadow-sm flex flex-col gap-1 select-none font-medium">
            <button
              onClick={() => setAdminTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs uppercase transition-colors ${
                adminTab === 'overview' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" /> Overview
            </button>
            
            <button
              onClick={() => setAdminTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs uppercase transition-colors ${
                adminTab === 'products' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <ToyBrick className="w-4 h-4 shrink-0" /> Toy Catalog
            </button>

            <button
              onClick={() => setAdminTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs uppercase transition-colors ${
                adminTab === 'categories' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0" /> Categories
            </button>

            <button
              onClick={() => setAdminTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs uppercase transition-colors ${
                adminTab === 'orders' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" /> Orders ({orders.length})
            </button>

            <button
              onClick={() => setAdminTab('coupons')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs uppercase transition-colors ${
                adminTab === 'coupons' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" /> Coupons
            </button>

            <button
              onClick={() => setAdminTab('users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs uppercase transition-colors ${
                adminTab === 'users' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" /> Customers
            </button>

            <button
              onClick={() => setAdminTab('reviews')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-xs uppercase transition-colors ${
                adminTab === 'reviews' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <Star className="w-4 h-4 shrink-0" /> Reviews
            </button>
          </aside>

          {/* RIGHT AREA: Operations workspace */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* TAB 1: OVERVIEW METRICS */}
            {adminTab === 'overview' && (
              <div className="flex flex-col gap-6">
                
                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Store Revenue</span>
                    <span className="text-lg font-bold text-[#212121]">₹{stats.sales}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Total Sales</span>
                    <span className="text-lg font-bold text-[#212121]">{stats.ordersCount} orders</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Toys Cataloged</span>
                    <span className="text-lg font-bold text-[#212121]">{stats.productsCount} items</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pending Dispatches</span>
                    <span className="text-lg font-bold text-[#FB641B]">{stats.pendingOrders} jobs</span>
                  </div>
                </div>

                {/* SVG Visualizations Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sales trendline */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4 select-none flex justify-between items-center text-xs font-bold">
                      <span className="text-[#212121] uppercase">Sales Timelines</span>
                      <span className="text-slate-400">Interactive Line Graph</span>
                    </div>

                    <div className="h-[250px] lg:h-[300px] w-full bg-slate-50 border border-slate-150 rounded-lg p-3 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" tick={{fontSize: 10, fill: '#878787'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 10, fill: '#878787'}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                          <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} labelStyle={{fontWeight: 'bold', color: '#212121'}} itemStyle={{color: '#2874F0', fontWeight: 'bold'}} formatter={(value) => [`₹${value}`, 'Sales']} />
                          <Line type="monotone" dataKey="amount" stroke="#2874F0" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Proportions Donut Chart */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4 select-none flex justify-between items-center text-xs font-bold">
                      <span className="text-[#212121] uppercase">Category Proportions</span>
                      <span className="text-slate-400">Distribution Donut</span>
                    </div>

                    <div className="h-[250px] lg:h-[300px] w-full bg-slate-50 border border-slate-150 rounded-lg p-1 flex flex-col items-center justify-center pb-0">
                      {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="45%"
                              innerRadius="55%"
                              outerRadius="75%"
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px'}} itemStyle={{fontWeight: 'bold'}} />
                            <Legend verticalAlign="bottom" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', color: '#878787', paddingTop: '10px'}} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">No category data</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* PENDING ORDERS LIST WITH OTP VERIFICATION (Direct action in Overview) */}
                <div className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 shadow-sm text-xs font-semibold">
                  <div className="border-b border-slate-100 pb-3 mb-4 select-none flex justify-between items-center">
                    <span className="text-[#212121] uppercase font-bold text-sm">Pending Dispatches Control Room</span>
                    <span className="text-[10px] bg-[#FB641B]/15 text-[#FB641B] px-2 py-0.5 rounded font-black uppercase">
                      Action Required ({orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length})
                    </span>
                  </div>

                  {orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').map((ord) => (
                        <div key={ord._id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col gap-4 text-left shadow-sm">
                          
                          {/* Order info details */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 text-slate-455 select-none">
                            <div>
                              <span>Order ID: <b className="text-[#212121]">#{ord._id.toString().toUpperCase()}</b></span>
                              <span className="mx-2">•</span>
                              <span>Buyer: <b className="text-[#212121]">{ord.user?.name} ({ord.user?.email})</b></span>
                            </div>
                            <span className="font-bold text-[#212121]">Total: ₹{ord.totalAmount}</span>
                          </div>

                          {/* Dropdown handlers */}
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-1.5 select-none">
                                <span className="text-[11px] text-slate-400 font-bold uppercase">Shipment:</span>
                                <select
                                  value={ord.orderStatus}
                                  onChange={(e) => updateStatus(ord._id, e.target.value, null)}
                                  className="bg-white border border-slate-350 rounded-lg py-1 px-2.5 font-bold outline-none text-slate-800 text-[11px]"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Packed">Packed</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered" disabled>Delivered (Requires OTP)</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-1.5 select-none">
                                <span className="text-[11px] text-slate-400 font-bold uppercase">Settlement:</span>
                                <select
                                  value={ord.paymentStatus}
                                  disabled={ord.orderStatus === 'Delivered'}
                                  onChange={(e) => updateStatus(ord._id, null, e.target.value)}
                                  className={`border border-slate-350 rounded-lg py-1 px-2.5 font-bold outline-none text-[11px] ${
                                    ord.orderStatus === 'Delivered'
                                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                                      : 'text-slate-800 bg-white'
                                  }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Paid">Paid</option>
                                  <option value="Failed">Failed</option>
                                </select>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDownloadInvoice(ord._id)}
                              className="h-8 px-3.5 bg-white border border-slate-350 hover:bg-slate-50 text-slate-800 font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 shadow-sm transition-colors outline-none"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#FB641B]" /> Print Invoice PDF
                            </button>

                          </div>

                          {/* Delivery Verification OTP Section */}
                          <div className="mt-2 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3">
                            {!activeOtpOrders[ord._id] ? (
                              <button
                                type="button"
                                onClick={() => handleSendDeliveryOtp(ord._id)}
                                className="h-8 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-[10px] uppercase rounded-[4px] shadow-sm transition-colors outline-none animate-pulse"
                              >
                                🔑 Send Delivery OTP to Buyer
                              </button>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase">Verification OTP:</span>
                                <input
                                  type="text"
                                  maxLength={6}
                                  placeholder="Enter 6-digit OTP..."
                                  value={otpInput[ord._id] || ''}
                                  onChange={(e) => setOtpInput(prev => ({ ...prev, [ord._id]: e.target.value }))}
                                  className="bg-white border border-slate-300 rounded-[4px] px-3 py-1 text-xs w-36 outline-none focus:border-[#2874F0] font-bold text-center tracking-wider"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVerifyDeliveryOtp(ord._id)}
                                  className="h-8 px-4 bg-[#388E3C] hover:bg-[#2e7d32] text-white font-bold text-[10px] uppercase rounded-[4px] shadow-sm transition-colors outline-none"
                                >
                                  Verify & Confirm Delivery
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendDeliveryOtp(ord._id)}
                                  className="h-8 px-4 bg-[#FF9F00] hover:bg-[#e68f00] text-white font-bold text-[10px] uppercase rounded-[4px] shadow-sm transition-colors outline-none"
                                >
                                  Resend
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveOtpOrders(prev => {
                                    const next = { ...prev };
                                    delete next[ord._id];
                                    return next;
                                  })}
                                  className="text-[10px] text-slate-400 hover:underline font-bold"
                                >
                                  Cancel
                                </button>
                                {simulatedOtps[ord._id] && (
                                  <span className="text-[10px] font-black text-[#FB641B] bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                    Sandbox OTP: {simulatedOtps[ord._id]}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-150 p-8 text-center rounded-lg select-none">
                      <span className="text-2xl block mb-2">🎉</span>
                      <h4 className="font-bold text-[#212121] text-xs uppercase">All dispatches cleared!</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">No pending or shipped orders require delivery verification actions right now.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: PRODUCT MANAGEMENT TABLE */}
            {adminTab === 'products' && (
              <div className="flex flex-col gap-4">
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-[#212121] uppercase">Product Database</h2>
                  
                  <div className="flex items-center gap-2">
                    {/* Compact Search Bar */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input 
                        type="text" 
                        placeholder="Search product..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs w-48 focus:border-slate-450 outline-none"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductFormData({
                          name: '', description: '', category: categories[0]?._id || '', brand: 'ToyBox', ageGroup: '3-5 Years', price: '', discountPrice: '', stock: '', sku: ''
                        });
                        setNewProductForm(!newProductForm);
                      }}
                      className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Toy
                    </button>
                  </div>
                </div>

                {/* Add/Edit Product form overlay */}
                {newProductForm && (
                  <form onSubmit={handleProductSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-600 text-left">
                    <h3 className="sm:col-span-2 font-bold text-xs text-[#212121] uppercase border-b border-slate-200 pb-2 mb-1">
                      {editingProduct ? 'Modify Product Specifications' : 'New Toy Registration'}
                    </h3>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Product Title</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. Smart Wooden Shape Matcher"
                        value={productFormData.name}
                        onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Category Node</label>
                      <select
                        value={productFormData.category}
                        required
                        onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Product Specifications Description</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Story details, safety indicators, organic builds..."
                        value={productFormData.description}
                        onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] p-2.5 outline-none focus:border-slate-550 text-slate-800"
                      ></textarea>
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Brand</label>
                      <input
                        type="text"
                        value={productFormData.brand}
                        onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Age Guide</label>
                      <select
                        value={productFormData.ageGroup}
                        onChange={(e) => setProductFormData({ ...productFormData, ageGroup: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-[2px] px-3 py-2 outline-none text-slate-850"
                      >
                        <option>0-2 Years</option>
                        <option>3-5 Years</option>
                        <option>6-8 Years</option>
                        <option>9+ Years</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">MRP Value (INR)</label>
                      <input
                        type="number"
                        required
                        value={productFormData.price}
                        onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Special Selling Price (INR)</label>
                      <input
                        type="number"
                        value={productFormData.discountPrice}
                        onChange={(e) => setProductFormData({ ...productFormData, discountPrice: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">SKU Code Reference</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. WD-SH-M102"
                        value={productFormData.sku}
                        onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Stock Inventory Units</label>
                      <input
                        type="number"
                        required
                        value={productFormData.stock}
                        onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2 flex gap-2">
                      <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-lg shadow-sm">
                        {editingProduct ? 'Update Specifications' : 'Save Entry'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setNewProductForm(false); setEditingProduct(null); }}
                        className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-lg shadow-sm hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {/* Tabular Lists Products */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden select-none">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-semibold text-slate-550 text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 uppercase text-[10px]">
                          <th className="px-4 py-3">Toy Particulars</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Selling Price</th>
                          <th className="px-4 py-3">Stock Units</th>
                          <th className="px-4 py-3 text-center">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map((prod) => (
                          <tr key={prod._id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 flex items-center gap-3">
                              <img src={prod.images?.[0]} alt="toy" className="w-8 h-8 rounded-lg object-contain border border-slate-100 bg-white" />
                              <div className="min-w-0">
                                <h4 className="font-bold text-[#212121] text-xs line-clamp-1">{prod.name}</h4>
                                <span className="text-[10px] text-[#2874F0] font-bold">{prod.category?.name || 'Category'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[#212121]">{prod.sku}</td>
                            <td className="px-4 py-3 font-bold text-[#212121]">₹{prod.discountPrice || prod.price}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                                prod.stock > 10 ? 'bg-[#388E3C]/10 text-[#388E3C]' : 'bg-[#FB641B]/10 text-[#FB641B]'
                              }`}>
                                Qty: {prod.stock}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setProductFormData({
                                      name: prod.name,
                                      description: prod.description,
                                      category: prod.category?._id || prod.category || '',
                                      brand: prod.brand,
                                      ageGroup: prod.ageGroup,
                                      price: prod.price,
                                      discountPrice: prod.discountPrice || '',
                                      stock: prod.stock,
                                      sku: prod.sku
                                    });
                                    setNewProductForm(true);
                                  }}
                                  className="p-1.5 border border-slate-200 rounded-lg hover:text-[#2874F0]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setProductToDelete(prod._id)}
                                  className="p-1.5 border border-slate-200 rounded-lg hover:text-red-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: CATEGORIES LISTS */}
            {adminTab === 'categories' && (
              <div className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#212121] uppercase">Category Nodes</h2>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryFormData({ name: '', image: '', description: '' });
                      setNewCategoryForm(!newCategoryForm);
                    }}
                    className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>

                {newCategoryForm && (
                  <form onSubmit={handleCategorySubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 gap-3 text-xs font-semibold text-slate-600 text-left">
                    <h3 className="font-bold text-xs text-[#212121] uppercase border-b border-slate-200 pb-2 mb-1">
                      {editingCategory ? 'Update Category Node' : 'Register Category'}
                    </h3>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Category Name</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. Puzzle Games"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Category Icon Image URL</label>
                      <input
                        type="url"
                        required
                        placeholder="E.g. https://images.unsplash.com/photo-..."
                        value={categoryFormData.image}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none text-slate-800 font-mono text-[10px]"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Brief Description</label>
                      <textarea
                        rows={2}
                        placeholder="Target focus of this category..."
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] p-2 outline-none text-slate-800"
                      ></textarea>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-lg shadow-sm">
                        Save Category
                      </button>
                      <button type="button" onClick={() => { setNewCategoryForm(false); setEditingCategory(null); }} className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-lg shadow-sm hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {/* Categories Grid lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                  {categories.map((cat) => (
                    <div key={cat._id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img src={cat.image} alt="category" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        <div>
                          <h4 className="font-bold text-[#212121] text-xs">{cat.name}</h4>
                          <p className="text-[10px] text-slate-450 line-clamp-1 mt-0.5">{cat.description || 'No summary specifications'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryFormData({
                            name: cat.name,
                            image: cat.image,
                            description: cat.description || ''
                          });
                          setNewCategoryForm(true);
                        }}
                        className="p-1.5 border border-slate-200 rounded-lg hover:text-[#2874F0]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 4: ORDERS DISPATCH CONTROL */}
            {adminTab === 'orders' && (
              <div className="flex flex-col gap-4 text-xs font-semibold">
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-[#212121] uppercase">Dispatch Control Room</h2>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input 
                      type="text" 
                      placeholder="Search order ID / Buyer..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-xs w-48 focus:border-slate-450 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {filteredOrders.map((ord) => (
                    <div key={ord._id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4 text-left shadow-sm">
                      
                      {/* Order info details */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-slate-450 select-none">
                        <div>
                          <span>Order Reference: <b className="text-[#212121]">#{ord._id.toString().toUpperCase()}</b></span>
                          <span className="mx-2">•</span>
                          <span>Buyer: <b className="text-[#212121]">{ord.user?.name} ({ord.user?.email})</b></span>
                        </div>
                        <span className="font-bold text-[#212121]">Amount: ₹{ord.totalAmount}</span>
                      </div>

                      {/* Dropdown handlers */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-1.5 select-none">
                            <span className="text-[11px] text-slate-400 font-bold uppercase">Shipment:</span>
                            <select
                              value={ord.orderStatus}
                              disabled={ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Delivered'}
                              onChange={(e) => updateStatus(ord._id, e.target.value, null)}
                              className={`bg-white border border-slate-350 rounded-lg py-1 px-2.5 font-bold outline-none text-[11px] ${
                                (ord.orderStatus === 'Cancelled' || ord.orderStatus === 'Delivered')
                                  ? 'text-slate-400 cursor-not-allowed bg-slate-50'
                                  : 'text-slate-800'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered" disabled>Delivered (Requires OTP)</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          {ord.orderStatus === 'Cancelled' && (
                            <button
                              onClick={() => updateStatus(ord._id, 'Pending', null)}
                              className="h-7 px-3 bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-[10px] uppercase rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-all outline-none"
                            >
                              🔄 Restart Order Tracking & Re-activate
                            </button>
                          )}

                          <div className="flex items-center gap-1.5 select-none">
                            <span className="text-[11px] text-slate-400 font-bold uppercase">Settlement:</span>
                            <select
                              value={ord.paymentStatus}
                              disabled={ord.orderStatus === 'Delivered'}
                              onChange={(e) => updateStatus(ord._id, null, e.target.value)}
                              className={`border border-slate-350 rounded-lg py-1 px-2.5 font-bold outline-none text-[11px] ${
                                ord.orderStatus === 'Delivered'
                                  ? 'text-slate-400 bg-slate-50 cursor-not-allowed'
                                  : 'text-slate-800 bg-white'
                                }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadInvoice(ord._id)}
                          className="h-8 px-3.5 bg-white border border-slate-350 hover:bg-slate-50 text-slate-800 font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 shadow-sm transition-colors outline-none"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#FB641B]" /> Print Invoice PDF
                        </button>

                      </div>

                      {/* Delivery Verification OTP Section */}
                      {ord.orderStatus !== 'Delivered' && ord.orderStatus !== 'Cancelled' && (
                        <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                          {!activeOtpOrders[ord._id] ? (
                            <button
                              type="button"
                              onClick={() => handleSendDeliveryOtp(ord._id)}
                              className="h-8 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-[10px] uppercase rounded-[4px] shadow-sm transition-colors outline-none"
                            >
                              🔑 Send Delivery OTP to Buyer
                            </button>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase">Verification OTP:</span>
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP..."
                                value={otpInput[ord._id] || ''}
                                onChange={(e) => setOtpInput(prev => ({ ...prev, [ord._id]: e.target.value }))}
                                className="bg-white border border-slate-300 rounded-[4px] px-3 py-1 text-xs w-36 outline-none focus:border-[#2874F0] font-bold text-center tracking-wider"
                              />
                              <button
                                type="button"
                                onClick={() => handleVerifyDeliveryOtp(ord._id)}
                                className="h-8 px-4 bg-[#388E3C] hover:bg-[#2e7d32] text-white font-bold text-[10px] uppercase rounded-[4px] shadow-sm transition-colors outline-none"
                              >
                                Verify & Confirm Delivery
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendDeliveryOtp(ord._id)}
                                className="h-8 px-4 bg-[#FF9F00] hover:bg-[#e68f00] text-white font-bold text-[10px] uppercase rounded-[4px] shadow-sm transition-colors outline-none"
                              >
                                Resend
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveOtpOrders(prev => {
                                  const next = { ...prev };
                                  delete next[ord._id];
                                  return next;
                                })}
                                className="text-[10px] text-slate-400 hover:underline font-bold"
                              >
                                Cancel
                              </button>
                              {simulatedOtps[ord._id] && (
                                <span className="text-[10px] font-black text-[#FB641B] bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                  Sandbox OTP: {simulatedOtps[ord._id]}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {ord.isDeliveryOtpVerified && (
                        <div className="text-[10px] font-bold text-[#388E3C] flex items-center gap-1 mt-1">
                          ✓ Delivery Handover Confirmed with Secure Buyer OTP
                        </div>
                      )}

                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 5: COUPONS MANAGEMENT */}
            {adminTab === 'coupons' && (
              <div className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#212121] uppercase">Promo Codes</h2>
                  <button
                    onClick={() => setNewCouponForm(!newCouponForm)}
                    className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Coupon
                  </button>
                </div>

                {newCouponForm && (
                  <form onSubmit={handleCouponSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-650 text-left">
                    <h3 className="sm:col-span-2 font-bold text-xs text-[#212121] uppercase border-b border-slate-200 pb-2 mb-1">
                      New Voucher Configuration
                    </h3>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Voucher Code</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. TOYBOX50"
                        value={couponFormData.code}
                        onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 uppercase text-slate-800 placeholder-slate-400 animate-none"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Discount Mode</label>
                      <select
                        value={couponFormData.discountType}
                        onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Flat Amount (INR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Discount Margin Value</label>
                      <input
                        type="number"
                        required
                        placeholder="E.g. 20 (for percentage) or 500 (for flat)"
                        value={couponFormData.discountValue}
                        onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Expiry Date</label>
                      <input
                        type="date"
                        required
                        value={couponFormData.expiryDate}
                        onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="mb-0.5 text-slate-400 block uppercase text-[9px]">Voucher Usage Limit</label>
                      <input
                        type="number"
                        required
                        placeholder="E.g. 100"
                        value={couponFormData.usageLimit}
                        onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                        className="w-full border border-slate-300 rounded-[2px] px-3 py-2 outline-none focus:border-slate-550 text-slate-800 placeholder-slate-400"
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2 flex gap-2">
                      <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-lg shadow-sm">
                        Create Promo Code
                      </button>
                      <button type="button" onClick={() => setNewCouponForm(false)} className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-lg shadow-sm hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {/* Coupons Tabular Sheet */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden select-none">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-semibold text-slate-550 text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 uppercase text-[10px]">
                          <th className="px-4 py-3">Promo Code</th>
                          <th className="px-4 py-3">Discount Margin</th>
                          <th className="px-4 py-3">Expiry Date</th>
                          <th className="px-4 py-3">Uses registered</th>
                          <th className="px-4 py-3 text-center">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {coupons.map((cp) => (
                          <tr key={cp._id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono font-bold text-[#212121] uppercase tracking-wider">{cp.code}</td>
                            <td className="px-4 py-3 text-[#212121]">
                              {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} FLAT`}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{new Date(cp.expiryDate).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-slate-500">
                              <span><b>{cp.usedCount || 0}</b> / {cp.usageLimit} uses</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => setCouponToDelete(cp._id)}
                                className="p-1.5 border border-slate-200 rounded-lg hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 6: USERS MANAGEMENT */}
            {adminTab === 'users' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-[#212121] uppercase">Customer Database</h2>
                  <span className="text-[10px] bg-[#2874F0]/10 text-[#2874F0] px-2 py-0.5 rounded-lg font-bold uppercase">
                    {usersList.length} Accounts
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[#212121] uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-3 font-bold">User Details</th>
                          <th className="px-4 py-3 font-bold">Contact</th>
                          <th className="px-4 py-3 font-bold">Role</th>
                          <th className="px-4 py-3 font-bold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {usersList.map((usr) => (
                          <tr key={usr._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="text-[#212121] font-bold">{usr.name}</span>
                                <span className="text-[10px] text-slate-400">ID: {usr._id.substring(0,8)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span>{usr.email}</span>
                                <span className="text-[10px] text-slate-400">{usr.mobile || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                                usr.role === 'admin' ? 'bg-[#388E3C] text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {usr.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                                usr.status === 'active' ? 'text-[#388E3C] bg-green-50' : 'text-red-500 bg-red-50'
                              }`}>
                                {usr.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: REVIEWS */}
            {adminTab === 'reviews' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-sm font-bold text-[#212121] uppercase">Product Reviews</h2>
                </div>

                {reviewsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviewsList.map((rev) => (
                      <div key={rev._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs text-[#212121]">{rev.product?.name || 'Unknown Product'}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">By {rev.user?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center gap-0.5 text-[#388E3C] bg-green-50 px-1.5 py-0.5 rounded font-bold text-[10px]">
                            {rev.rating} <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 font-medium italic bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 p-8 text-center rounded-lg shadow-sm">
                    <span className="text-2xl block mb-2">⭐</span>
                    <h4 className="font-bold text-[#212121] text-xs uppercase">No Reviews Yet</h4>
                    <p className="text-xs text-slate-400 mt-1">Customers haven't left any product reviews.</p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          deleteProductItem(productToDelete);
          setProductToDelete(null);
        }}
        title="Delete Product?"
        message="Are you sure you want to permanently remove this product from the catalog?"
        confirmText="Yes, Delete"
      />

      <ConfirmationModal
        isOpen={!!couponToDelete}
        onClose={() => setCouponToDelete(null)}
        onConfirm={() => {
          deleteCouponItem(couponToDelete);
          setCouponToDelete(null);
        }}
        title="Delete Coupon?"
        message="Are you sure you want to permanently remove this coupon code?"
        confirmText="Yes, Delete"
      />

    </div>
  );
}
