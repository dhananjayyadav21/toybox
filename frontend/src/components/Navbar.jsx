import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  ShoppingCart, Heart, User, Search, Menu, X, LogOut, 
  LayoutDashboard, ChevronDown, Package, Sparkles, ChevronRight
} from 'lucide-react';

export default function Navbar() {
  const { user, cart, wishlist, logout, categories, products } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const sugRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => document.body.classList.remove('mobile-menu-open');
  }, [mobileOpen]);

  useEffect(() => {
    function handleClick(e) {
      if (sugRef.current && !sugRef.current.contains(e.target)) setShowSug(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      const filtered = (products || []).filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSug(true);
    } else {
      setSuggestions([]);
      setShowSug(false);
    }
  }, [searchQuery, products]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSug(false);
      setMobileOpen(false);
    }
  };

  const handleSugClick = (id) => {
    navigate(`/product/${id}`);
    setSearchQuery('');
    setShowSug(false);
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg shadow-violet-100/50' : 'shadow-sm'}`}>

      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-violet-800 text-white text-[10px] sm:text-[11px] font-medium py-1.5 text-center hidden sm:block select-none tracking-wide">
        🎉 Free shipping on orders over ₹999 &nbsp;·&nbsp; 100% safe, BPA-free toys &nbsp;·&nbsp; 7-day easy returns
      </div>

      {/* Main bar */}
      <div className="bg-white border-b border-violet-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4 md:gap-6">

          {/* Mobile menu toggle - LEFT side on mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 text-gray-600 hover:bg-violet-50 rounded-xl transition-all outline-none shrink-0"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 group select-none" onClick={closeMobile}>
            <span className="text-2xl sm:text-3xl leading-none">🧸</span>
            <div className="leading-none">
              <span className="block font-black text-base sm:text-lg text-violet-900 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ToyBox
              </span>
              <span className="block text-[8px] sm:text-[9px] font-semibold text-amber-500 tracking-widest uppercase -mt-0.5">
                Play · Grow · Joy
              </span>
            </div>
          </Link>

          {/* Search bar - desktop only */}
          <div ref={sugRef} className="flex-1 max-w-2xl relative hidden sm:block">
            <form onSubmit={handleSearch} className="flex items-center bg-violet-50 border border-violet-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-violet-400 focus-within:shadow-sm focus-within:shadow-violet-100 transition-all duration-200">
              <input
                type="text"
                placeholder="Search toys, brands, age groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSug(true)}
                className="w-full px-4 py-2 text-sm font-normal outline-none bg-transparent text-gray-800 placeholder-gray-400"
              />
              <button type="submit" className="px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white transition-colors shrink-0">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Search suggestions */}
            {showSug && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-violet-100 border border-violet-100 overflow-hidden z-50">
                <div className="px-4 py-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest border-b border-violet-50 bg-violet-50/50">
                  Suggestions
                </div>
                {suggestions.map((prod) => (
                  <button
                    key={prod._id}
                    onClick={() => handleSugClick(prod._id)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-violet-50 text-left w-full border-b border-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 overflow-hidden shrink-0">
                        <img src={prod.images?.[0]} alt="" className="w-full h-full object-contain p-0.5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 line-clamp-1 group-hover:text-violet-700">{prod.name}</span>
                    </div>
                    <span className="text-sm font-bold text-violet-700 shrink-0 ml-2">
                      ₹{prod.discountPrice || prod.price}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nav actions — pushed right */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 ml-auto">

            {/* Categories dropdown - desktop */}
            <div className="relative hidden lg:block">
              <button
                onMouseEnter={() => setCatOpen(true)}
                onMouseLeave={() => setCatOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-700 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all"
              >
                Shop <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {catOpen && (
                <div
                  onMouseEnter={() => setCatOpen(true)}
                  onMouseLeave={() => setCatOpen(false)}
                  className="absolute top-full left-0 w-52 bg-white rounded-2xl shadow-xl shadow-violet-100 border border-violet-100 py-2 z-50"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-violet-50 text-sm font-medium text-gray-700 hover:text-violet-700 transition-colors"
                    >
                      {cat.name}
                      <ChevronRight className="w-3.5 h-3.5 text-violet-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 text-sm font-semibold text-gray-700 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all">
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg min-w-[20px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-violet-50 transition-all outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline text-sm font-semibold text-gray-700 max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:inline" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-violet-100 border border-violet-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-violet-50">
                        <p className="text-xs font-bold text-gray-800">{user.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>
                      {user.role !== 'admin' ? (
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-violet-50 text-sm font-medium text-gray-700 hover:text-violet-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-violet-400" /> My Dashboard
                        </Link>
                      ) : (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-violet-50 text-sm font-medium text-gray-700 hover:text-violet-700 transition-colors"
                        >
                          <Package className="w-4 h-4 text-violet-400" /> Seller Central
                        </Link>
                      )}
                      <button
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-50 text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors w-full text-left border-t border-violet-50 mt-1"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 bg-violet-700 hover:bg-violet-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-violet-200 transition-all"
                >
                  <User className="w-4 h-4" /> <span className="hidden sm:inline">Login</span><span className="sm:hidden">Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="sm:hidden fixed inset-0 bg-black/20 z-40" 
            onClick={closeMobile}
            style={{ top: 'auto' }}
          />
          
          <div className="sm:hidden bg-white border-t border-violet-100 shadow-xl mobile-drawer-enter relative z-50 max-h-[calc(100vh-60px)] overflow-y-auto">
            {/* Mobile search */}
            <div className="p-3 sm:p-4 border-b border-violet-50">
              <form onSubmit={handleSearch} className="flex items-center bg-violet-50 border border-violet-200 rounded-xl overflow-hidden">
                <input
                  type="text"
                  placeholder="Search toys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
                />
                <button type="submit" className="px-3 sm:px-4 py-2.5 bg-violet-700 text-white shrink-0">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="p-3 sm:p-4 flex flex-col gap-1">
              <Link to="/" onClick={closeMobile} className="px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors">Home</Link>
              <Link to="/shop" onClick={closeMobile} className="px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors">All Products</Link>
              <Link to="/wishlist" onClick={closeMobile} className="px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Wishlist {wishlistCount > 0 && <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" onClick={closeMobile} className="px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-violet-400" /> Cart {cartCount > 0 && <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{cartCount}</span>}
              </Link>

              {/* Mobile user links */}
              {user && (
                <div className="border-t border-violet-50 mt-2 pt-2">
                  {user.role !== 'admin' ? (
                    <Link to="/dashboard" onClick={closeMobile} className="px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-violet-400" /> My Dashboard
                    </Link>
                  ) : (
                    <Link to="/admin" onClick={closeMobile} className="px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-xl transition-colors flex items-center gap-2">
                      <Package className="w-4 h-4 text-violet-400" /> Seller Central
                    </Link>
                  )}
                  <button
                    onClick={() => { closeMobile(); logout(); }}
                    className="w-full px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}

              <div className="border-t border-violet-50 mt-2 pt-2">
                <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Categories</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      onClick={closeMobile}
                      className="px-3 py-2 bg-violet-50 text-violet-800 text-xs font-semibold rounded-xl hover:bg-violet-100 transition-colors truncate"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
