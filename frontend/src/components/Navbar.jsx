import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, cart, wishlist, logout, categories, products } = useAppContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const navigate = useNavigate();
  const suggestionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen for clicks outside search suggestion panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Suggestion filter
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const query = searchQuery.toLowerCase();
      const filtered = (products || []).filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.category && p.category.name && p.category.name.toLowerCase().includes(query))
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, products]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (prodId) => {
    navigate(`/product/${prodId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 text-left ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-b border-slate-100/60 py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-3xl hover:rotate-12 transition-transform duration-300">🧸</span>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-toy-coral via-toy-purple to-toy-teal bg-clip-text text-transparent font-sans">
              ToyBox
            </span>
          </Link>

          {/* Desktop Search Experience with suggestions dropdown */}
          <div ref={suggestionRef} className="hidden md:block flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center relative">
              <input
                type="text"
                placeholder="Search magic toys, educational puzzles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full px-5 py-2.5 pl-12 rounded-2xl bg-slate-105/80 border border-transparent focus:bg-white focus:border-toy-teal/60 focus:ring-4 focus:ring-toy-teal/5 outline-none text-xs font-semibold text-slate-700 transition-all duration-300 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            </form>

            {/* Instant suggestions box */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden p-2 z-50 flex flex-col gap-1"
                >
                  <div className="px-4 py-2 text-[10px] text-slate-400 font-extrabold uppercase border-b border-slate-50 tracking-wider">
                    Instant Search Suggestions
                  </div>
                  {suggestions.map((prod) => {
                    const price = prod.discountPrice || prod.price;
                    return (
                      <button
                        key={prod._id}
                        onClick={() => handleSuggestionClick(prod._id)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-2xl text-left w-full transition-all group"
                      >
                        <img 
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'} 
                          alt="preview" 
                          className="w-9 h-9 object-cover rounded-xl bg-slate-100 border border-slate-100/50" 
                        />
                        <div className="flex-1">
                          <h5 className="text-xs font-extrabold text-slate-800 line-clamp-1 group-hover:text-toy-coral transition-colors">
                            {prod.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{prod.brand}</span>
                        </div>
                        <span className="text-xs font-black text-toy-coral shrink-0">INR {price}</span>
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={handleSearchSubmit}
                    className="py-2.5 px-4 text-[10px] font-black text-center text-toy-teal hover:bg-teal-50/50 rounded-2xl border-t border-slate-50 flex items-center justify-center gap-1 mt-1 transition-colors w-full uppercase"
                  >
                    View All Matching Results <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Links with Mega Menu */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-500">
            <Link to="/" className="hover:text-toy-coral transition-colors py-2">Home</Link>
            <Link to="/shop" className="hover:text-toy-coral transition-colors py-2">Shop All</Link>
            
            {/* Categories Mega Dropdown */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 hover:text-toy-coral transition-colors outline-none font-black uppercase tracking-wider">
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[480px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out p-6 grid grid-cols-2 gap-4 z-50">
                <div className="col-span-2 text-[10px] text-slate-400 font-black uppercase border-b border-slate-50 pb-2 mb-1 tracking-widest flex items-center gap-1">
                  Browse Magical Collections <Sparkles className="w-3 h-3 text-toy-coral" />
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/shop?category=${cat.slug}`}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl text-left transition-all group"
                  >
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-10 h-10 object-cover rounded-xl bg-slate-100 shrink-0" 
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-toy-teal transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold lowercase line-clamp-1">explore toys</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-3">
            
            {/* Wishlist Icon */}
            <Link to="/wishlist" className="p-2.5 bg-white border border-slate-100/80 rounded-2xl hover:bg-rose-50 text-slate-500 hover:text-toy-coral shadow-sm hover:shadow transition-all relative">
              <Heart className="w-4.5 h-4.5" />
              <AnimatePresence>
                {wishlistCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-toy-coral to-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="p-2.5 bg-white border border-slate-100/80 rounded-2xl hover:bg-teal-50 text-slate-500 hover:text-toy-teal shadow-sm hover:shadow transition-all relative">
              <ShoppingBag className="w-4.5 h-4.5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-toy-teal to-emerald-400 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* User Account Account Dropdown */}
            <div className="relative">
              {user ? (
                <>
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 bg-white border border-slate-100/80 rounded-2xl shadow-sm hover:border-slate-200 transition-all outline-none"
                  >
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-toy-coral to-toy-yellow flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="hidden md:inline text-[10px] uppercase tracking-wider font-extrabold text-slate-600 px-1">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100 p-2 flex flex-col gap-1 z-50"
                      >
                        <div className="px-3.5 py-2 text-[9px] text-slate-400 font-black border-b border-slate-50 uppercase tracking-widest">
                          Sandbox Club
                        </div>
                        <Link 
                          to="/dashboard" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2.5 hover:bg-slate-50 hover:text-toy-coral rounded-2xl text-left text-xs font-bold text-slate-600 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" /> Account Dashboard
                        </Link>
                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-3.5 py-2.5 hover:bg-slate-50 hover:text-toy-purple rounded-2xl text-left text-xs font-bold text-slate-600 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" /> Admin Dashboard
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 px-3.5 py-2.5 hover:bg-rose-50 hover:text-toy-coral rounded-2xl text-left text-xs font-bold text-rose-600 transition-colors w-full border-t border-slate-50/50 mt-1"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 bg-slate-900 text-white font-extrabold text-[10px] rounded-2xl flex items-center gap-1 uppercase tracking-wider hover:bg-slate-800 hover:shadow-md transition-all">
                  <User className="w-3.5 h-3.5" /> Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Icon */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 bg-white border border-slate-100/80 rounded-2xl text-slate-500 hover:bg-slate-50 shadow-sm transition-all outline-none"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed inset-x-0 top-[68px] bg-white border-b border-slate-100 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] p-6 flex flex-col gap-6 z-40"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center relative">
              <input
                type="text"
                placeholder="Search magic toys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 rounded-2xl bg-slate-100 border border-transparent outline-none text-xs font-semibold transition-all"
              />
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4" />
            </form>

            <div className="flex flex-col gap-4 text-xs font-black uppercase tracking-wider text-slate-600">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-toy-coral py-1">Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-toy-coral py-1">Shop All</Link>
              
              <div className="border-t border-slate-100 pt-4 text-left">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Categories</span>
                <div className="grid grid-cols-2 gap-2 mt-3 font-bold normal-case text-slate-500">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 bg-slate-50 hover:bg-teal-50/50 hover:text-toy-teal text-xs font-semibold rounded-xl text-left truncate transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
