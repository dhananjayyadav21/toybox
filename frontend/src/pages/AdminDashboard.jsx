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
  Users, 
  Star,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';

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

  // Tab State: 'overview', 'products', 'categories', 'orders', 'coupons', 'users'
  const [adminTab, setAdminTab] = useState('overview');

  // Dynamic states populated from API
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

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

  // Fetch admin logs
  const fetchAdminData = async () => {
    if (isOfflineMode) {
      // Mock logs for Sandbox
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

      // Simulating user listing / reviews since backend has general models
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

  // Compute key administrative summaries
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
      fetchData(); // reload catalog products
    } catch (err) {
      showToast('Product submission failed', 'error');
    }
  };

  const deleteProductItem = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
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
    if (!window.confirm('Delete coupon?')) return;
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
    try {
      if (!isOfflineMode) {
        await axios.put(`/api/orders/${orderId}/status`, { orderStatus, paymentStatus }, getAuthHeaders());
      }
      setOrders(prev => prev.map(o => 
        o._id === orderId 
          ? { ...o, orderStatus: orderStatus || o.orderStatus, paymentStatus: paymentStatus || o.paymentStatus }
          : o
      ));
      showToast(`Order status updated to ${orderStatus || paymentStatus}!`);
    } catch (err) {
      showToast('Failed to update status', 'error');
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

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left pb-20">
      
      <h1 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-2">
        Admin Control Dashboard <LayoutDashboard className="w-8 h-8 text-toy-purple" />
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-premium flex flex-col gap-1 text-sm font-bold text-slate-600 shrink-0">
          <button
            onClick={() => setAdminTab('overview')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left transition-all ${
              adminTab === 'overview' ? 'bg-toy-purple/10 text-toy-purple' : 'hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" /> Overview
          </button>
          
          <button
            onClick={() => setAdminTab('products')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left transition-all ${
              adminTab === 'products' ? 'bg-toy-coral/10 text-toy-coral' : 'hover:bg-slate-50'
            }`}
          >
            <ToyBrick className="w-4.5 h-4.5" /> Toy Catalog
          </button>

          <button
            onClick={() => setAdminTab('categories')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left transition-all ${
              adminTab === 'categories' ? 'bg-toy-teal/10 text-toy-teal' : 'hover:bg-slate-50'
            }`}
          >
            <Grid className="w-4.5 h-4.5" /> Categories
          </button>

          <button
            onClick={() => setAdminTab('orders')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left transition-all ${
              adminTab === 'orders' ? 'bg-toy-purple/10 text-toy-purple font-extrabold' : 'hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" /> Orders ({orders.length})
          </button>

          <button
            onClick={() => setAdminTab('coupons')}
            className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left transition-all ${
              adminTab === 'coupons' ? 'bg-toy-yellow/30 text-slate-800' : 'hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4.5 h-4.5" /> Coupons
          </button>

        </aside>

        {/* Tab contents */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* TAB 1: OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="flex flex-col gap-8">
              
              {/* Stats Card Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Total Revenue</span>
                  <span className="text-xl md:text-2xl font-black text-toy-coral">INR {stats.sales}</span>
                </div>
                <div className="glass-card p-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Total Orders</span>
                  <span className="text-xl md:text-2xl font-black text-toy-teal">{stats.ordersCount}</span>
                </div>
                <div className="glass-card p-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Total Toys</span>
                  <span className="text-xl md:text-2xl font-black text-toy-purple">{stats.productsCount}</span>
                </div>
                <div className="glass-card p-5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">Pending Orders</span>
                  <span className="text-xl md:text-2xl font-black text-amber-500">{stats.pendingOrders}</span>
                </div>
              </div>

              {/* Analytical SVG Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart 1: Revenue timelines */}
                <div className="glass-card p-6 flex flex-col gap-4 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-toy-coral animate-pulse" /> Revenue Timelines</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Interactive SVG</span>
                  </div>
                  
                  {/* Embedded high fidelity responsive SVG line graph */}
                  <div className="aspect-[16/9] w-full bg-slate-50 rounded-2xl flex items-center justify-center p-4">
                    <svg viewBox="0 0 100 50" className="w-full h-full text-toy-coral overflow-visible">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="10" x2="100" y2="10" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                      
                      {/* Area beneath chart */}
                      <path d="M 0 45 L 20 30 L 40 38 L 60 15 L 80 25 L 100 5 L 100 45 Z" fill="url(#chartGradient)" />
                      
                      {/* Trendline path */}
                      <path d="M 0 45 L 20 30 L 40 38 L 60 15 L 80 25 L 100 5" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
                      
                      {/* Circles markers */}
                      <circle cx="20" cy="30" r="1.5" fill="#FF6B6B" />
                      <circle cx="40" cy="38" r="1.5" fill="#FF6B6B" />
                      <circle cx="60" cy="15" r="1.5" fill="#FF6B6B" />
                      <circle cx="80" cy="25" r="1.5" fill="#FF6B6B" />
                      <circle cx="100" cy="5" r="2.0" fill="#FF6B6B" stroke="#FFFFFF" strokeWidth="0.5" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 px-2">
                    <span>JAN</span>
                    <span>FEB</span>
                    <span>MAR</span>
                    <span>APR</span>
                    <span>MAY</span>
                    <span>TODAY</span>
                  </div>
                </div>

                {/* Chart 2: Category proportions */}
                <div className="glass-card p-6 flex flex-col gap-4 text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <h3 className="font-extrabold text-slate-800 text-sm">Category Share Proportion</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Donut SVG</span>
                  </div>
                  
                  {/* Donut SVG Pie Graph */}
                  <div className="aspect-[16/9] w-full bg-slate-50 rounded-2xl flex items-center justify-center p-4">
                    <svg viewBox="0 0 50 50" className="w-1/2 h-1/2 overflow-visible">
                      <circle cx="25" cy="25" r="15" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                      {/* Educational */}
                      <circle cx="25" cy="25" r="15" fill="transparent" stroke="#FF6B6B" strokeWidth="6.2" strokeDasharray="30 100" strokeDashoffset="0" />
                      {/* Puzzle */}
                      <circle cx="25" cy="25" r="15" fill="transparent" stroke="#4ECDC4" strokeWidth="6.2" strokeDasharray="25 100" strokeDashoffset="-30" />
                      {/* Blocks */}
                      <circle cx="25" cy="25" r="15" fill="transparent" stroke="#6C63FF" strokeWidth="6.2" strokeDasharray="20 100" strokeDashoffset="-55" />
                      {/* Dolls/RC */}
                      <circle cx="25" cy="25" r="15" fill="transparent" stroke="#FFE66D" strokeWidth="6.2" strokeDasharray="25 100" strokeDashoffset="-75" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 text-[10px] font-black text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-toy-coral shrink-0"></span> Educational</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-toy-teal shrink-0"></span> Puzzles</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-toy-purple shrink-0"></span> Blocks</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-toy-yellow shrink-0"></span> Dolls & RC</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD LISTING */}
          {adminTab === 'products' && (
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-slate-800 text-lg">Product Database Catalog</h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductFormData({
                      name: '', description: '', category: categories[0]?._id || '', brand: 'ToyBox', ageGroup: '3-5 Years', price: '', discountPrice: '', stock: '', sku: ''
                    });
                    setNewProductForm(!newProductForm);
                  }}
                  className="btn-toy-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
                >
                  <Plus className="w-4.5 h-4.5" /> Add Product
                </button>
              </div>

              {/* PRODUCT CRUD FORM */}
              {newProductForm && (
                <form onSubmit={handleProductSubmit} className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                  <h3 className="sm:col-span-2 font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2 mb-2">
                    {editingProduct ? 'Modify Catalog Product' : 'Add New Toy Entry'}
                  </h3>
                  
                  <div>
                    <label className="mb-1 text-slate-400 block">Product Title Name</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Magnetic World Map Puzzle"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Category Nodes</label>
                    <select
                      value={productFormData.category}
                      required
                      onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 text-slate-400 block">Story/Description</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Details regarding materials, build, safety warnings..."
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none focus:bg-white focus:border-toy-teal"
                    ></textarea>
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Brand name</label>
                    <input
                      type="text"
                      value={productFormData.brand}
                      onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Age recommendation</label>
                    <select
                      value={productFormData.ageGroup}
                      onChange={(e) => setProductFormData({ ...productFormData, ageGroup: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option>0-2 Years</option>
                      <option>3-5 Years</option>
                      <option>6-8 Years</option>
                      <option>9+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Unit Price (INR)</label>
                    <input
                      type="number"
                      required
                      value={productFormData.price}
                      onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Discounted Price (INR, Optional)</label>
                    <input
                      type="number"
                      value={productFormData.discountPrice}
                      onChange={(e) => setProductFormData({ ...productFormData, discountPrice: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">SKU Code</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. BL-MAG-102"
                      value={productFormData.sku}
                      onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-toy-teal"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Stock inventory count</label>
                    <input
                      type="number"
                      required
                      value={productFormData.stock}
                      onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="btn-toy-teal text-xs py-3 px-6">
                      {editingProduct ? 'Save Modifications' : 'Create Product Entry'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setNewProductForm(false); setEditingProduct(null); }} 
                      className="btn-toy-outline text-xs py-3 px-6"
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              )}

              {/* Products Table lists */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold text-slate-500 text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase border-b border-slate-100">
                        <th className="px-6 py-4">Toy Detail</th>
                        <th className="px-6 py-4">SKU</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <img src={prod.images?.[0]} alt="toy" className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0" />
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-sm line-clamp-1">{prod.name}</h4>
                              <span className="text-[10px] text-toy-teal font-extrabold">{prod.category?.name || 'Category'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-800">{prod.sku}</td>
                          <td className="px-6 py-4 font-extrabold text-slate-800">INR {prod.discountPrice || prod.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              prod.stock > 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              Qty: {prod.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
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
                                className="p-2 bg-slate-50 hover:bg-toy-purple/10 text-slate-400 hover:text-toy-purple rounded-xl transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProductItem(prod._id)}
                                className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-toy-coral rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
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

          {/* TAB 3: CATEGORIES CRUD */}
          {adminTab === 'categories' && (
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-slate-800 text-lg">Toy Categories Nodes</h2>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryFormData({ name: '', image: '', description: '' });
                    setNewCategoryForm(!newCategoryForm);
                  }}
                  className="btn-toy-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
                >
                  <Plus className="w-4.5 h-4.5" /> Add Category
                </button>
              </div>

              {newCategoryForm && (
                <form onSubmit={handleCategorySubmit} className="glass-card p-6 grid grid-cols-1 gap-4 text-xs font-bold text-slate-600">
                  <h3 className="font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2 mb-2">
                    {editingCategory ? 'Modify Category Node' : 'Create Category Node'}
                  </h3>

                  <div>
                    <label className="mb-1 text-slate-400 block">Category Label Title</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Puzzle Games"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Unsplash Image URL</label>
                    <input
                      type="url"
                      required
                      placeholder="E.g. https://images.unsplash.com/photo-..."
                      value={categoryFormData.image}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Brief Node Description</label>
                    <textarea
                      rows={2}
                      placeholder="Educational targets of this category..."
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 outline-none"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="submit" className="btn-toy-teal text-xs py-3 px-6">
                      {editingCategory ? 'Save Node' : 'Create Node'}
                    </button>
                    <button type="button" onClick={() => { setNewCategoryForm(false); setEditingCategory(null); }} className="btn-toy-outline text-xs py-3 px-6">
                      Cancel
                    </button>
                  </div>

                </form>
              )}

              {/* Categories lists grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat._id} className="glass-card p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={cat.image} alt="cat" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">{cat.name}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{cat.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
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
                        className="p-2 bg-slate-50 hover:bg-toy-teal/10 text-slate-400 hover:text-toy-teal rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: ORDERS CONTROL PANEL */}
          {adminTab === 'orders' && (
            <div className="flex flex-col gap-6">
              <h2 className="font-extrabold text-slate-800 text-lg">Dispatch Control Room</h2>

              <div className="flex flex-col gap-4">
                {orders.map((ord) => (
                  <div key={ord._id} className="glass-card p-5 flex flex-col gap-4">
                    
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-50 text-xs font-bold text-slate-400">
                      <div>
                        <span>Ref: <b className="text-slate-700">#{ord._id.toString().toUpperCase()}</b></span>
                        <span className="mx-2">•</span>
                        <span>Customer: <b className="text-slate-700">{ord.user?.name} ({ord.user?.email})</b></span>
                      </div>
                      <span className="font-black text-toy-coral text-sm">INR {ord.totalAmount}</span>
                    </div>

                    {/* Dropdown status update */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      
                      {/* Status selectors */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-400">Shipment Stage:</span>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => updateStatus(ord._id, e.target.value, null)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-700 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-400">Settlement:</span>
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) => updateStatus(ord._id, null, e.target.value)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-700 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleDownloadInvoice(ord._id)}
                        className="btn-toy-outline px-3 py-1.5 text-xs flex items-center gap-1 shadow-premium font-extrabold"
                      >
                        <FileText className="w-4 h-4 text-toy-coral" /> Print Invoice
                      </button>

                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: COUPONS CRUD */}
          {adminTab === 'coupons' && (
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-slate-800 text-lg">Active Store Coupons</h2>
                <button
                  onClick={() => setNewCouponForm(!newCouponForm)}
                  className="btn-toy-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
                >
                  <Plus className="w-4.5 h-4.5" /> Create Coupon
                </button>
              </div>

              {newCouponForm && (
                <form onSubmit={handleCouponSubmit} className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
                  <h3 className="sm:col-span-2 font-extrabold text-sm text-slate-800 border-b border-slate-50 pb-2 mb-2">
                    Create New Discount Code
                  </h3>
                  
                  <div>
                    <label className="mb-1 text-slate-400 block">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. TOYBOX50"
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Discount Type</label>
                    <select
                      value={couponFormData.discountType}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Flat Amount (INR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Discount Value</label>
                    <input
                      type="number"
                      required
                      placeholder="E.g. 20 for percentage, 500 for fixed"
                      value={couponFormData.discountValue}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={couponFormData.expiryDate}
                      onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 text-slate-400 block">Usage Limit</label>
                    <input
                      type="number"
                      required
                      placeholder="E.g. 100"
                      value={couponFormData.usageLimit}
                      onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="btn-toy-teal text-xs py-3 px-6">
                      Create Coupon Code
                    </button>
                    <button type="button" onClick={() => setNewCouponForm(false)} className="btn-toy-outline text-xs py-3 px-6">
                      Cancel
                    </button>
                  </div>

                </form>
              )}

              {/* Coupons lists table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-premium overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-semibold text-slate-500 text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-extrabold uppercase border-b border-slate-100">
                        <th className="px-6 py-4">Coupon Code</th>
                        <th className="px-6 py-4">Discount Value</th>
                        <th className="px-6 py-4">Expiry Date</th>
                        <th className="px-6 py-4">Uses Count</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {coupons.map((cp) => (
                        <tr key={cp._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono font-black text-slate-800 uppercase tracking-widest">{cp.code}</td>
                          <td className="px-6 py-4">
                            {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `INR ${cp.discountValue} FLAT`}
                          </td>
                          <td className="px-6 py-4">{new Date(cp.expiryDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className="font-extrabold text-slate-700">{cp.usedCount || 0}</span> / {cp.usageLimit} limit
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => deleteCouponItem(cp._id)}
                                className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-toy-coral rounded-xl transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
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

        </div>

      </div>

    </div>
  );
}
