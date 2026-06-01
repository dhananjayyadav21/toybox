import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import axios from 'axios';
import { 
  Heart, 
  ShoppingCart, 
  ChevronRight, 
  Star, 
  ShieldAlert,
  MessageSquare,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    user, 
    products, 
    addToCart, 
    toggleWishlist, 
    wishlist, 
    showToast,
    isOfflineMode,
    getAuthHeaders
  } = useAppContext();

  // Component States
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('story');
  
  // Simulated Pincode Checker State
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  // Submit Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Bulletproof state management for direct link fetches
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(null);

  // Find product from static or API
  useEffect(() => {
    const found = products.find(p => p._id === id);

    const fetchReviews = (prodId) => {
      if (!isOfflineMode) {
        axios.get(`/api/reviews/product/${prodId}`)
          .then(res => setReviews(res.data))
          .catch(err => console.log('Reviews fetch failed'));
      } else {
        setReviews([
          { _id: 'r1', user: { name: 'Sanjay Kumar' }, rating: 5, comment: 'Exceptional build quality, very safe for toddlers, wood is organic and smooth.', createdAt: new Date() },
          { _id: 'r2', user: { name: 'Sneha Rao' }, rating: 4, comment: 'Fun to play with, kept them engaged for hours. Highly recommended!', createdAt: new Date() }
        ]);
      }
    };

    if (found) {
      setProduct(found);
      setActiveImageIdx(0);
      setQty(1);
      setPincode('');
      setPincodeResult(null);
      fetchReviews(id);
      setProductError(null);
      setProductLoading(false);
    } else {
      if (!isOfflineMode) {
        setProductLoading(true);
        axios.get(`/api/products/${id}`)
          .then(res => {
            setProduct(res.data);
            setActiveImageIdx(0);
            setQty(1);
            setPincode('');
            setPincodeResult(null);
            fetchReviews(id);
            setProductError(null);
          })
          .catch(err => {
            console.log('Deep product fetch failed', err);
            setProductError("This product could not be found. It might have been deleted, or you re-seeded the database recently (which regenerates random IDs).");
          })
          .finally(() => {
            setProductLoading(false);
          });
      } else {
        setProductError("Offline sandbox catalog does not contain this product ID.");
        setProductLoading(false);
      }
    }
  }, [id, products, isOfflineMode]);

  const isInWishlist = wishlist.some(item => (item._id || item) === product?._id);

  // Filter Related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p._id !== product._id && (p.category?.slug === product.category?.slug || p.category === product.category))
      .slice(0, 4);
  }, [product, products]);

  // ─── ALL derived values MUST be computed here (before any early returns) ───
  // React Rules of Hooks: hooks and values depending on hooks must not be
  // placed after conditional return statements.

  // Safe reviews array guard
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  // Real computed average rating from live reviews
  const averageRating = useMemo(() => {
    if (safeReviews.length === 0) return product?.rating ? Number(product.rating).toFixed(1) : '0.0';
    const sum = safeReviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return (sum / safeReviews.length).toFixed(1);
  }, [safeReviews, product?.rating]);

  // Rating breakdown weights
  const ratingsWeight = useMemo(() => {
    const w = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    safeReviews.forEach(r => {
      if (w[r.rating] !== undefined) w[r.rating]++;
    });
    return w;
  }, [safeReviews]);

  const totalReviewsCount = safeReviews.length || 1;

  // Pricing helpers (null-safe)
  const discountPercent = product?.discountPrice && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const finalPrice = product?.discountPrice && product.discountPrice > 0
    ? product.discountPrice
    : (product?.price || 0);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to write product reviews!', 'error');
      return;
    }
    if (!comment.trim()) {
      showToast('Please type a feedback comment first!', 'error');
      return;
    }

    setSubmitLoading(true);
    try {
      if (!isOfflineMode) {
        const res = await axios.post('/api/reviews', { productId: product._id, rating, comment }, getAuthHeaders());
        setReviews(prev => [res.data.review, ...prev]);
        showToast('Review submitted successfully!');
      } else {
        const newMockReview = {
          _id: 'rev_' + Math.random().toString(36).substring(2, 9),
          user: { name: user.name },
          rating: Number(rating),
          comment,
          createdAt: new Date()
        };
        setReviews(prev => [newMockReview, ...prev]);
        showToast('Review posted successfully to Sandbox!');
      }
      setComment('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product._id, qty);
      navigate('/checkout');
    }
  };

  // Simulated Pincode Delivery Check
  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode)) {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 2);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedDate = `${days[deliveryDate.getDay()]}, ${deliveryDate.getDate()} ${months[deliveryDate.getMonth()]}`;

      setPincodeResult({
        success: true,
        message: `Delivery by ${formattedDate} | Free Shipping`
      });
    } else {
      setPincodeResult({
        success: false,
        message: 'Please enter a valid 6-digit Pincode'
      });
    }
  };

  if (productLoading) {
    return (
      <div className="pt-28 text-center max-w-lg mx-auto min-h-[60vh] flex flex-col justify-center items-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#2874F0] border-t-transparent rounded-full mb-4"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Scanning Toy Shelves...</p>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="pt-28 text-center max-w-2xl mx-auto px-4 min-h-[70vh] flex flex-col justify-center items-center select-none">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-6 animate-bounce">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-extrabold text-[#212121] mb-2">Toy Not Found! 🧸</h2>
        <p className="text-xs text-slate-500 font-semibold max-w-md mb-6 leading-relaxed">
          {productError || "We couldn't locate this item. The database might have been cleared or re-seeded recently, assigning brand new IDs to all active toys."}
        </p>
        <div className="flex gap-4">
          <Link to="/shop" className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-6 py-3 rounded-[6px] transition-colors shadow-sm">
            Browse Toy Shop
          </Link>
          <Link to="/" className="border border-slate-350 hover:bg-slate-50 text-[#212121] font-bold text-xs uppercase px-6 py-3 rounded-[6px] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // (All derived values moved above early returns — see useMemo blocks above)

  return (
    <div className="bg-[#F1F3F6] min-h-screen pt-4 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 text-[11px] font-normal text-slate-500 mb-4 select-none">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/shop" className="hover:underline">Shop</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Core Product Layout Panel */}
        <div className="bg-white border border-slate-200 rounded-[8px] p-4 md:p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* LEFT COLUMN: Gallery with Thumbnails */}
            <div className="flex flex-col gap-4">
              
              {/* Active Image container */}
              <div className="border border-slate-250 rounded-[8px] bg-white aspect-square overflow-hidden flex items-center justify-center p-4 relative select-none">
                <img
                  src={product.images?.[activeImageIdx] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'}
                  alt={product.name}
                  className="w-full h-full object-contain p-1"
                />
                
                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-[#388E3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails list */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-[6px] bg-white border overflow-hidden shrink-0 p-1 transition-all ${
                        activeImageIdx === idx ? 'border-[#2874F0] ring-2 ring-sky-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Specifications and Sticky buy blocks */}
            <div className="flex flex-col gap-5 text-left">
              
              {/* Category, Brand, Age labels */}
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase select-none">
                <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-[4px] border border-slate-200">
                  {product.category?.name || 'Toy'}
                </span>
                <span className="bg-slate-50 text-slate-550 px-2 py-0.5 rounded-[4px] border border-slate-200">
                  Age: {product.ageGroup}
                </span>
                <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-[4px] border border-slate-200">
                  Brand: {product.brand || 'ToyBox'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-lg md:text-xl font-bold text-[#212121] leading-snug">
                {product.name}
              </h1>

              {/* Ratings Summary */}
              <div className="flex items-center gap-2 select-none border-b border-slate-100 pb-3">
                <span className="inline-flex items-center gap-0.5 bg-[#388E3C] text-white text-[11px] font-bold px-2 py-0.5 rounded-lg">
                  {averageRating} <Star className="w-3 h-3 fill-current" />
                </span>
                <span className="text-xs font-semibold text-[#878787]">
                  ({safeReviews.length} Ratings & Verified Reviews)
                </span>
              </div>

              {/* Pricing section */}
              <div className="bg-slate-50 border border-slate-200 rounded-[8px] p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Special Price</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl md:text-2xl font-bold text-[#212121]">₹{finalPrice}</span>
                    {discountPercent > 0 && (
                      <>
                        <span className="text-xs text-slate-400 line-through font-normal">₹{product.price}</span>
                        <span className="text-xs text-[#388E3C] font-semibold">{discountPercent}% off</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Availability</span>
                  {product.stock > 0 ? (
                    <span className="inline-block mt-1 bg-[#388E3C]/10 text-[#388E3C] text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">
                      In Stock ({product.stock} left)
                    </span>
                  ) : (
                    <span className="inline-block mt-1 bg-red-50 text-red-650 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery Checker */}
              <div className="border border-slate-200 rounded-[8px] p-3.5 bg-white text-xs select-none">
                <h4 className="font-bold text-[#212121] mb-2 uppercase flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#2874F0]" /> Delivery Options
                </h4>
                <form onSubmit={handlePincodeCheck} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="border border-slate-300 rounded-[6px] px-3 py-1.5 outline-none text-xs w-full focus:border-slate-450 placeholder-slate-400"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold rounded-[6px] uppercase text-[11px] h-9 transition-colors"
                  >
                    Check
                  </button>
                </form>
                {pincodeResult && (
                  <p className={`mt-2 font-semibold text-[11px] ${pincodeResult.success ? 'text-[#388E3C]' : 'text-red-550'}`}>
                    {pincodeResult.message}
                  </p>
                )}
              </div>

              {/* Tabs Selector (Story / Specs / Safety) */}
              <div className="border-b border-slate-200 flex gap-2 sm:gap-4 text-xs font-bold uppercase select-none overflow-x-auto scrollbar-none">
                <button 
                  onClick={() => setActiveTab('story')}
                  className={`pb-2.5 ${activeTab === 'story' ? 'text-[#2874F0] border-b-2 border-[#2874F0]' : 'text-slate-400'}`}
                >
                  Product Description
                </button>
                <button 
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2.5 ${activeTab === 'specs' ? 'text-[#2874F0] border-b-2 border-[#2874F0]' : 'text-slate-400'}`}
                >
                  Specifications
                </button>
                <button 
                  onClick={() => setActiveTab('safety')}
                  className={`pb-2.5 ${activeTab === 'safety' ? 'text-[#2874F0] border-b-2 border-[#2874F0]' : 'text-slate-400'}`}
                >
                  Safety Standard
                </button>
              </div>

              {/* Tabs Content */}
              <div className="text-[#212121] text-xs md:text-sm leading-relaxed min-h-[80px]">
                {activeTab === 'story' && (
                  <p className="font-medium text-slate-600">{product.description}</p>
                )}
                {activeTab === 'specs' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs font-medium">
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-400">SKU Reference</span>
                      <span className="font-bold text-[#212121]">{product.sku || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Manufacture Brand</span>
                      <span className="font-bold text-[#212121]">{product.brand || 'ToyBox Plus'}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Material Type</span>
                      <span className="font-bold text-[#212121]">Certified Organic, BPA-free Wood</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-slate-100">
                      <span className="text-slate-400">Safe Age Guide</span>
                      <span className="font-bold text-[#212121]">{product.ageGroup}</span>
                    </div>
                  </div>
                )}
                {activeTab === 'safety' && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-[6px] text-xs font-medium text-amber-850">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      Safety Tested. Spun from natural wood composites and GOTS certified organic fibers. Please supervise children under 3 years due to small puzzle elements.
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity Select & Sticky Purchase Options */}
              {product.stock > 0 && (
                <div className="border-t border-slate-100 pt-4 flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3">
                  
                  {/* Quantity Dropdown */}
                  <div className="flex items-center gap-2 text-xs font-semibold select-none">
                    <span className="text-slate-500 hidden sm:inline">Qty:</span>
                    <select 
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-[6px] p-1 px-1.5 sm:px-2.5 font-bold outline-none text-slate-800 h-10 md:h-11 cursor-pointer"
                    >
                      {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  {/* Actions buttons (height 44px desktop, 40px mobile) */}
                  <div className="flex-1 flex gap-2 min-w-0">
                    <button 
                      onClick={() => addToCart(product._id, qty)}
                      className="h-10 md:h-11 bg-[#FF9F00] hover:bg-[#e68e00] text-[#212121] font-bold text-[10px] md:text-xs uppercase rounded-[6px] shadow-sm flex items-center justify-center gap-1 md:gap-1.5 flex-1 transition-colors outline-none whitespace-nowrap px-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> Add to Cart
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      className="h-10 md:h-11 bg-[#FB641B] hover:bg-[#e15610] text-white font-bold text-[10px] md:text-xs uppercase rounded-[6px] shadow-sm flex items-center justify-center gap-1 md:gap-1.5 flex-1 transition-colors outline-none whitespace-nowrap px-1"
                    >
                      <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> Buy Now
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product._id)}
                      className={`p-2 md:p-3 border rounded-[6px] shadow-sm transition-all h-10 md:h-11 shrink-0 flex items-center justify-center ${
                        isInWishlist ? 'border-red-250 bg-rose-50 text-red-500 hover:bg-rose-100' : 'border-slate-300 hover:bg-slate-50 text-slate-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 md:w-4.5 md:h-4.5 ${isInWishlist ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>

        {/* CUSTOMER REVIEWS GRID */}
        <section className="bg-white border border-slate-200 rounded-[8px] p-4 md:p-6 shadow-sm mb-6 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Reviews summary bar charts */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold text-[#212121] uppercase tracking-wide">Customer Feedback</h3>
                <p className="text-xs text-slate-400 mt-1">Real ratings shared by parents and teachers across India.</p>
              </div>

              {/* Progress bars */}
              <div className="bg-slate-50 border border-slate-200 rounded-[8px] p-4 flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = ratingsWeight[stars] || 0;
                  const percentage = Math.round((count / totalReviewsCount) * 100);
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="w-6 shrink-0">{stars} ★</span>
                      <div className="flex-1 h-2 bg-slate-250 rounded-lg overflow-hidden">
                        <div className="h-full bg-[#388E3C] rounded-lg" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="w-12 text-right text-slate-400">{count} reviews</span>
                    </div>
                  );
                })}
              </div>

              {/* Review submit forms */}
              <form onSubmit={handleReviewSubmit} className="border border-slate-200 rounded-[8px] p-4 flex flex-col gap-3">
                <h4 className="font-bold text-[#212121] text-xs uppercase mb-1">Add a verified review</h4>
                
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Rating Score</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-white border border-slate-300 rounded-[6px] p-1.5 text-xs font-bold outline-none h-9 w-full"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★</option>
                    <option value={3}>3 Stars ★★★</option>
                    <option value={2}>2 Stars ★★</option>
                    <option value={1}>1 Star ★</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Your Feedback</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you liked about this toy..."
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-slate-300 rounded-[6px] p-2.5 text-xs outline-none focus:border-slate-500 placeholder-slate-400"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-[11px] uppercase py-2.5 rounded-[6px] h-10 transition-colors"
                >
                  {submitLoading ? 'Posting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>

            {/* Verified Reviews list */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[#212121] uppercase border-b border-slate-100 pb-2">
                Parent Experiences ({safeReviews.length})
              </h3>
              
              {safeReviews.length > 0 ? (
                <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-2">
                  {safeReviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-white border border-slate-200 rounded-[8px] text-left hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-shadow duration-[180ms] ease-in-out">
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                        <span className="font-bold text-[#212121]">{rev.user?.name || 'Verified Buyer'}</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="inline-flex items-center gap-0.5 bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg mb-2">
                        {rev.rating} <Star className="w-2.5 h-2.5 fill-current" />
                      </div>

                      <p className="text-xs font-medium text-slate-600 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-150 p-12 text-center rounded-[8px]">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto block mb-2" />
                  <h4 className="font-bold text-slate-800 text-xs uppercase">No Feedback Posted Yet</h4>
                  <p className="text-xs text-slate-400 mt-1">Be the first parent to share purchase feedback!</p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-[8px] p-4 md:p-6 shadow-sm select-none">
            <h3 className="text-sm font-bold text-[#212121] uppercase mb-4 border-b border-slate-100 pb-2.5">
              Related Magical Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map(prod => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
