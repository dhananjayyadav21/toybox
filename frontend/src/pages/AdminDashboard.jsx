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
  Search
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
      showToast(`Order status updated successfully!`);
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
          <span className="text-[10px] bg-[#388E3C] text-white px-2 py-0.5 rounded-sm font-bold uppercase select-none">
            Admin Mode
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          
          {/* LEFT SIDEBAR: Professional Dark blue/slate Sidebar */}
          <aside className="lg:col-span-1 bg-[#172337] text-white border border-[#2a3a54] rounded-sm p-4 shadow-sm flex flex-col gap-1 select-none font-medium">
            <button
              onClick={() => setAdminTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left text-xs uppercase transition-colors ${
                adminTab === 'overview' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" /> Overview
            </button>
            
            <button
              onClick={() => setAdminTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left text-xs uppercase transition-colors ${
                adminTab === 'products' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <ToyBrick className="w-4 h-4 shrink-0" /> Toy Catalog
            </button>

            <button
              onClick={() => setAdminTab('categories')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left text-xs uppercase transition-colors ${
                adminTab === 'categories' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0" /> Categories
            </button>

            <button
              onClick={() => setAdminTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left text-xs uppercase transition-colors ${
                adminTab === 'orders' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" /> Orders ({orders.length})
            </button>

            <button
              onClick={() => setAdminTab('coupons')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left text-xs uppercase transition-colors ${
                adminTab === 'coupons' ? 'bg-[#2874F0] text-white font-bold' : 'hover:bg-[#202e43] text-slate-300'
              }`}
            >
              <Tag className="w-4 h-4 shrink-0" /> Coupons
            </button>
          </aside>

          {/* RIGHT AREA: Operations workspace */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* TAB 1: OVERVIEW METRICS */}
            {adminTab === 'overview' && (
              <div className="flex flex-col gap-6">
                
                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Store Revenue</span>
                    <span className="text-lg font-bold text-[#212121]">₹{stats.sales}</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Total Sales</span>
                    <span className="text-lg font-bold text-[#212121]">{stats.ordersCount} orders</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Toys Cataloged</span>
                    <span className="text-lg font-bold text-[#212121]">{stats.productsCount} items</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Pending Dispatches</span>
                    <span className="text-lg font-bold text-[#FB641B]">{stats.pendingOrders} jobs</span>
                  </div>
                </div>

                {/* SVG Visualizations Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Sales trendline */}
                  <div className="bg-white border border-slate-200 rounded-sm p-4 md:p-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4 select-none flex justify-between items-center text-xs font-bold">
                      <span className="text-[#212121] uppercase">Sales Timelines</span>
                      <span className="text-slate-400">Interactive Line Graph</span>
                    </div>

                    <div className="aspect-[16/9] w-full bg-slate-50 border border-slate-150 rounded-sm p-3 flex items-center justify-center">
                      <svg viewBox="0 0 100 50" className="w-full h-full text-[#2874F0] overflow-visible">
                        <line x1="0" y1="10" x2="100" y2="10" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                        <line x1="0" y1="25" x2="100" y2="25" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                        <line x1="0" y1="40" x2="100" y2="40" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                        
                        <path d="M 0 45 L 20 30 L 40 38 L 60 15 L 80 25 L 100 5 L 100 45 Z" fill="rgba(40,116,240,0.08)" />
                        <path d="M 0 45 L 20 30 L 40 38 L 60 15 L 80 25 L 100 5" fill="none" stroke="#2874F0" strokeWidth="1.5" strokeLinecap="round" />
                        
                        <circle cx="20" cy="30" r="1" fill="#2874F0" />
                        <circle cx="40" cy="38" r="1" fill="#2874F0" />
                        <circle cx="60" cy="15" r="1" fill="#2874F0" />
                        <circle cx="80" cy="25" r="1" fill="#2874F0" />
                        <circle cx="100" cy="5" r="1.5" fill="#2874F0" stroke="#FFFFFF" strokeWidth="0.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Proportions Donut Chart */}
                  <div className="bg-white border border-slate-200 rounded-sm p-4 md:p-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-3 mb-4 select-none flex justify-between items-center text-xs font-bold">
                      <span className="text-[#212121] uppercase">Category Proportions</span>
                      <span className="text-slate-400">Distribution Donut</span>
                    </div>

                    <div className="aspect-[16/9] w-full bg-slate-50 border border-slate-150 rounded-sm p-3 flex items-center justify-center">
                      <svg viewBox="0 0 50 50" className="w-1/3 h-1/3 overflow-visible">
                        <circle cx="25" cy="25" r="15" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                        <circle cx="25" cy="25" r="15" fill="transparent" stroke="#2874F0" strokeWidth="6" strokeDasharray="40 100" strokeDashoffset="0" />
                        <circle cx="25" cy="25" r="15" fill="transparent" stroke="#FB641B" strokeWidth="6" strokeDasharray="30 100" strokeDashoffset="-40" />
                        <circle cx="25" cy="25" r="15" fill="transparent" stroke="#FF9F00" strokeWidth="6" strokeDasharray="30 100" strokeDashoffset="-70" />
                      </svg>
                    </div>
                  </div>

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
                        className="bg-white border border-slate-300 rounded-sm pl-8 pr-3 py-1 text-xs w-48 focus:border-slate-450 outline-none"
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
                      className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-sm flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Toy
                    </button>
                  </div>
                </div>

                {/* Add/Edit Product form overlay */}
                {newProductForm && (
                  <form onSubmit={handleProductSubmit} className="bg-slate-50 border border-slate-200 rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-600 text-left">
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
                      <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-sm shadow-sm">
                        {editingProduct ? 'Update Specifications' : 'Save Entry'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setNewProductForm(false); setEditingProduct(null); }}
                        className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-sm shadow-sm hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {/* Tabular Lists Products */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden select-none">
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
                              <img src={prod.images?.[0]} alt="toy" className="w-8 h-8 rounded-sm object-contain border border-slate-100 bg-white" />
                              <div className="min-w-0">
                                <h4 className="font-bold text-[#212121] text-xs line-clamp-1">{prod.name}</h4>
                                <span className="text-[10px] text-[#2874F0] font-bold">{prod.category?.name || 'Category'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-[#212121]">{prod.sku}</td>
                            <td className="px-4 py-3 font-bold text-[#212121]">₹{prod.discountPrice || prod.price}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
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
                                  className="p-1.5 border border-slate-200 rounded-sm hover:text-[#2874F0]"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteProductItem(prod._id)}
                                  className="p-1.5 border border-slate-200 rounded-sm hover:text-red-500"
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
                    className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-sm flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>

                {newCategoryForm && (
                  <form onSubmit={handleCategorySubmit} className="bg-slate-50 border border-slate-200 rounded-sm p-4 grid grid-cols-1 gap-3 text-xs font-semibold text-slate-600 text-left">
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
                      <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-sm shadow-sm">
                        Save Category
                      </button>
                      <button type="button" onClick={() => { setNewCategoryForm(false); setEditingCategory(null); }} className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-sm shadow-sm hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {/* Categories Grid lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                  {categories.map((cat) => (
                    <div key={cat._id} className="bg-white border border-slate-200 rounded-sm p-4 flex items-center justify-between gap-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img src={cat.image} alt="category" className="w-10 h-10 rounded-sm object-cover border border-slate-100" />
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
                        className="p-1.5 border border-slate-200 rounded-sm hover:text-[#2874F0]"
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
                      className="bg-white border border-slate-300 rounded-sm pl-8 pr-3 py-1 text-xs w-48 focus:border-slate-450 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {filteredOrders.map((ord) => (
                    <div key={ord._id} className="bg-white border border-slate-200 rounded-sm p-4 flex flex-col gap-4 text-left shadow-sm">
                      
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
                              onChange={(e) => updateStatus(ord._id, e.target.value, null)}
                              className="bg-white border border-slate-350 rounded-sm py-1 px-2.5 font-bold outline-none text-slate-800 text-[11px]"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Packed">Packed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1.5 select-none">
                            <span className="text-[11px] text-slate-400 font-bold uppercase">Settlement:</span>
                            <select
                              value={ord.paymentStatus}
                              onChange={(e) => updateStatus(ord._id, null, e.target.value)}
                              className="bg-white border border-slate-350 rounded-sm py-1 px-2.5 font-bold outline-none text-slate-800 text-[11px]"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                              <option value="Failed">Failed</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownloadInvoice(ord._id)}
                          className="h-8 px-3.5 bg-white border border-slate-350 hover:bg-slate-50 text-slate-800 font-bold text-[10px] uppercase rounded-sm flex items-center gap-1 shadow-sm transition-colors outline-none"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#FB641B]" /> Print Invoice PDF
                        </button>

                      </div>

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
                    className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-sm flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Coupon
                  </button>
                </div>

                {newCouponForm && (
                  <form onSubmit={handleCouponSubmit} className="bg-slate-50 border border-slate-200 rounded-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-650 text-left">
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
                      <button type="submit" className="h-9 px-4 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase rounded-sm shadow-sm">
                        Create Promo Code
                      </button>
                      <button type="button" onClick={() => setNewCouponForm(false)} className="h-9 px-4 bg-white border border-slate-300 text-slate-650 font-bold text-xs uppercase rounded-sm shadow-sm hover:bg-slate-50">
                        Cancel
                      </button>
                    </div>

                  </form>
                )}

                {/* Coupons Tabular Sheet */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden select-none">
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
                                onClick={() => deleteCouponItem(cp._id)}
                                className="p-1.5 border border-slate-200 rounded-sm hover:text-red-500"
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

          </div>

        </div>
      </div>

    </div>
  );
}
