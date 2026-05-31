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
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  MessageSquare,
  BadgeAlert,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Submit Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Find product from static or API
  useEffect(() => {
    const found = products.find(p => p._id === id);
    if (found) {
      setProduct(found);
      setActiveImageIdx(0);
      setQty(1);

      // Fetch reviews
      if (!isOfflineMode) {
        axios.get(`/api/reviews/product/${id}`)
          .then(res => setReviews(res.data))
          .catch(err => console.log('Reviews fetch failed'));
      } else {
        // Mock reviews for offline mode
        setReviews([
          { _id: 'r1', user: { name: 'Sanjay Kumar' }, rating: 5, comment: 'Purchased this for my child. Exceptionally safe build quality and colorful design!', createdAt: new Date() },
          { _id: 'r2', user: { name: 'Sneha Rao' }, rating: 4, comment: 'Fun to play with, kept them engaged for weeks. Will buy again!', createdAt: new Date() }
        ]);
      }
    }
  }, [id, products, isOfflineMode]);

  const isInWishlist = wishlist.some(item => (item._id || item) === product?._id);

  // Filter Related products (same category)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p._id !== product._id && (p.category?.slug === product.category?.slug || p.category === product.category))
      .slice(0, 4);
  }, [product, products]);

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

  if (!product) {
    return (
      <div className="pt-28 text-center max-w-lg mx-auto min-h-[60vh] flex flex-col justify-center items-center">
        <div className="animate-spin w-8 h-8 border-4 border-toy-teal border-t-transparent rounded-full mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading magic toy profiles...</p>
      </div>
    );
  }

  const discountPercent = product.discountPrice && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const finalPrice = product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price;

  // Rating Distribution Weight
  const ratingsWeight = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (ratingsWeight[r.rating] !== undefined) ratingsWeight[r.rating]++;
  });
  const totalReviewsCount = reviews.length || 1;

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50/20 pb-20">
      
      {/* Breadcrumb path */}
      <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 mb-8 text-left tracking-wider">
        <Link to="/" className="hover:text-toy-coral">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/shop" className="hover:text-toy-coral">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-toy-coral line-clamp-1">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start text-left">
        
        {/* LEFT COLUMN: Gallery with Zoom */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[32px] bg-white aspect-square overflow-hidden shadow-[0_8px_30px_rgba(15,23,42,0.02)] border border-slate-100/80 p-6 flex items-center justify-center relative">
            <motion.img
              key={activeImageIdx}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              src={product.images?.[activeImageIdx] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'}
              alt={product.name}
              className="w-full h-full object-contain rounded-2xl select-none"
            />
            {discountPercent > 0 && (
              <span className="absolute top-6 left-6 bg-gradient-to-r from-toy-coral to-rose-500 text-white text-[9px] font-black uppercase px-3.5 py-1.5 rounded-xl shadow-md tracking-wider">
                Save {discountPercent}% Off
              </span>
            )}
          </div>

          {/* Secondary Thumbnail lists */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-20 rounded-2xl bg-white border overflow-hidden shrink-0 transition-all p-1.5 ${
                    activeImageIdx === idx ? 'border-toy-teal scale-105 shadow-sm' : 'border-slate-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Specifications and Buy triggers */}
        <div className="flex flex-col gap-6">
          
          <div>
            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider mb-4">
              <span className="bg-toy-teal/10 text-toy-teal px-3 py-1 rounded-md border border-toy-teal/5">{product.category?.name || 'Toy'}</span>
              <span className="bg-toy-purple/10 text-toy-purple px-3 py-1 rounded-md border border-toy-purple/5">Age: {product.ageGroup}</span>
              <span className="bg-toy-yellow/20 text-slate-800 px-3 py-1 rounded-md border border-toy-yellow/20">Brand: {product.brand}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-850 leading-tight font-sans text-left">
              {product.name}
            </h1>

            {/* Ratings summary */}
            <div className="flex items-center gap-2.5 mt-3.5">
              <div className="flex text-toy-yellow fill-current">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating || 4.5) ? 'text-toy-yellow fill-current' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs font-black text-slate-700">{product.rating || 4.5}</span>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">({reviews.length} Verified Reviews)</span>
            </div>
          </div>

          {/* Pricing & Stock Box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-100/80 flex items-center justify-between shadow-[0_8px_30px_rgba(15,23,42,0.01)]">
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Pricing Structure</span>
              <div className="flex items-baseline gap-2 mt-1.5">
                {discountPercent > 0 ? (
                  <>
                    <span className="text-2xl font-black text-toy-coral">INR {product.discountPrice}</span>
                    <span className="text-xs text-slate-400 line-through font-bold">INR {product.price}</span>
                  </>
                ) : (
                  <span className="text-2xl font-black text-slate-850">INR {product.price}</span>
                )}
              </div>
            </div>

            {/* Stock Levels */}
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">Inventory status</span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 mt-1.5 text-emerald-600 text-xs font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> {product.stock} Units In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-1.5 text-rose-500 text-xs font-black uppercase tracking-wider">
                  <BadgeAlert className="w-4 h-4" /> Out of stock
                </span>
              )}
            </div>
          </div>

          {/* Tab Selector (Story Spec Safety) */}
          <div className="border-b border-slate-100 flex gap-6 text-xs font-black uppercase tracking-wider mt-2">
            <button 
              onClick={() => setActiveTab('story')}
              className={`pb-3.5 transition-colors relative ${activeTab === 'story' ? 'text-toy-coral' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Toy Story
              {activeTab === 'story' && <motion.div layoutId="detailTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-toy-coral" />}
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`pb-3.5 transition-colors relative ${activeTab === 'specs' ? 'text-toy-coral' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Specifications
              {activeTab === 'specs' && <motion.div layoutId="detailTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-toy-coral" />}
            </button>
            <button 
              onClick={() => setActiveTab('safety')}
              className={`pb-3.5 transition-colors relative ${activeTab === 'safety' ? 'text-toy-coral' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Safety Guide
              {activeTab === 'safety' && <motion.div layoutId="detailTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-toy-coral" />}
            </button>
          </div>

          {/* Tab Content Box */}
          <div className="min-h-[100px] text-slate-500 text-xs md:text-sm leading-relaxed">
            <AnimatePresence mode="wait">
              {activeTab === 'story' && (
                <motion.p 
                  key="story" 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="font-medium"
                >
                  {product.description}
                </motion.p>
              )}
              {activeTab === 'specs' && (
                <motion.div 
                  key="specs"
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs text-slate-500 font-semibold"
                >
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/50">
                    <span className="text-slate-400">SKU Code</span>
                    <span className="font-extrabold text-slate-800">{product.sku}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/50">
                    <span className="text-slate-400">Age Guide</span>
                    <span className="font-extrabold text-slate-800">{product.ageGroup}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/50">
                    <span className="text-slate-400">Brand Maker</span>
                    <span className="font-extrabold text-slate-800">{product.brand}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-slate-100/50">
                    <span className="text-slate-400">Material Type</span>
                    <span className="font-extrabold text-slate-800">Organic wood composites</span>
                  </div>
                </motion.div>
              )}
              {activeTab === 'safety' && (
                <motion.div 
                  key="safety"
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 bg-rose-50/50 border border-rose-100/50 rounded-2xl p-4 text-xs font-semibold text-rose-800"
                >
                  <ShieldAlert className="w-5 h-5 text-toy-coral shrink-0" />
                  <p>
                    Tested in state labs. Features organic food-grade coatings, completely anti-allergenic, lead-free and GOTS certified safe for small kids. Recommended supervising children under 3 years due to tiny mechanical modular items inside.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Qty and Actions bar */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              
              {/* Qty controller */}
              <div className="flex items-center justify-between border border-slate-100 rounded-2xl p-1.5 w-full sm:w-32 bg-white shrink-0 shadow-sm">
                <button 
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl hover:bg-slate-50 text-slate-500 font-extrabold text-lg flex items-center justify-center transition-all outline-none"
                >
                  -
                </button>
                <span className="font-extrabold text-slate-850 text-xs">{qty}</span>
                <button 
                  onClick={() => setQty(prev => Math.min(product.stock, prev + 1))}
                  className="w-8 h-8 rounded-xl hover:bg-slate-50 text-slate-500 font-extrabold text-lg flex items-center justify-center transition-all outline-none"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => addToCart(product._id, qty)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl flex-1 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Basket
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="bg-toy-coral hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl flex-1 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <Zap className="w-4 h-4 text-toy-yellow fill-current" /> Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`p-3.5 border border-slate-200/80 rounded-2xl shadow-sm hover:bg-rose-50 transition-all ${
                    isInWishlist ? 'text-toy-coral border-rose-100 bg-rose-50' : 'text-slate-400 hover:text-toy-coral'
                  }`}
                >
                  <Heart className={`w-4.5 h-4.5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* REVIEWS & DISCUSSIONS SECTION */}
      <section className="mt-28 border-t border-slate-100 pt-16 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Review Stats / Form */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div>
              <span className="text-[10px] font-black uppercase text-toy-coral bg-toy-coral/10 px-3 py-1 rounded-md tracking-wider border border-toy-coral/5">Community Voice</span>
              <h2 className="text-2xl font-black text-slate-800 mt-3 font-sans">Customer Feedback</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
                Post genuine experience, rating, and learning milestones regarding this educational toy.
              </p>
            </div>

            {/* Ratings distribution weights bars */}
            <div className="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-[0_8px_30px_rgba(15,23,42,0.01)] flex flex-col gap-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-50 pb-2 mb-1">Ratings Breakdown</h4>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingsWeight[stars] || 0;
                const percentage = Math.round((count / totalReviewsCount) * 100);
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span className="w-3.5 shrink-0">{stars}★</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-toy-yellow rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <span className="w-7 text-right text-slate-400">{count} reviews</span>
                  </div>
                );
              })}
            </div>

            {/* Review form */}
            <form onSubmit={handleReviewSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
              <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Write a Product Review</h3>
              
              {/* Star selector */}
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">Rating Score</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="p-1 outline-none transition-transform active:scale-95"
                    >
                      <Star className={`w-5 h-5 ${num <= rating ? 'text-toy-yellow fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-1.5">Review Feedback</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you or your kids liked about this toy..."
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-2xl p-4 bg-slate-50 border border-slate-100 focus:bg-white focus:border-toy-teal outline-none text-xs font-semibold leading-relaxed transition-colors"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="bg-toy-teal hover:bg-teal-600 text-white font-extrabold text-[10px] uppercase tracking-widest py-3.5 w-full rounded-xl shadow-md active:scale-95 transition-all"
              >
                {submitLoading ? 'Submitting...' : 'Submit Review'}
              </button>

            </form>
          </div>

          {/* Active Reviews log */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-850 text-sm uppercase tracking-wider mb-2">Verified Reviews ({reviews.length})</h3>
            
            {reviews.length > 0 ? (
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex gap-4 text-left">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-toy-coral to-toy-yellow text-white font-black text-xs shrink-0 flex items-center justify-center uppercase shadow-sm">
                      {rev.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h5 className="font-extrabold text-slate-800 text-xs">{rev.user?.name || 'Anonymous User'}</h5>
                        <span className="text-[9px] font-black uppercase text-slate-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-toy-yellow fill-current gap-0.5 mt-1 mb-2">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-toy-yellow fill-current' : 'text-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center flex flex-col items-center gap-3">
                <MessageSquare className="w-8 h-8 text-slate-300 animate-bounce" />
                <h4 className="font-extrabold text-slate-800 text-sm">No Reviews Yet</h4>
                <p className="text-xs font-semibold text-slate-400 max-w-xs leading-relaxed">
                  Be the first one to share an experience about this educational toy with other parents!
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="mt-28 border-t border-slate-100 pt-16 pb-16">
          <div className="flex items-end justify-between mb-8 text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-toy-teal bg-toy-teal/10 px-3 py-1 rounded-md tracking-wider border border-toy-teal/5">Similar Items</span>
              <h2 className="text-2xl font-black text-slate-850 mt-2 font-sans">Related Magical Products</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
