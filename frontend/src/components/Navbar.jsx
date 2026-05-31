import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, cart, wishlist, logout, categories, products } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const navigate = useNavigate();
  const suggestionRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions
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
    <header className="sticky top-0 z-50 bg-[#2874F0] text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      
      {/* Top Banner (Flipkart Style info alert) */}
      <div className="bg-[#172337] text-[11px] font-medium py-1.5 px-4 text-center hidden md:block text-slate-300 select-none">
        🇮🇳 India's Premium Store for Educational Toys & Games. Get Free Express Shipping on orders above ₹999!
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Logo (Flipkart-inspired italic sub-brand) */}
          <Link to="/" className="flex flex-col items-start leading-none select-none shrink-0 group">
            <span className="font-extrabold text-lg md:text-xl tracking-tight italic text-white flex items-center gap-1.5 font-sans">
              ToyBox
            </span>
            <span className="text-[9px] text-[#FF9F00] font-bold italic tracking-wide mt-0.5 flex items-center gap-0.5 hover:text-white transition-colors">
              Explore <span className="text-white font-extrabold">Plus</span> ✨
            </span>
          </Link>

          {/* Centered Production Search Bar (Amazon/Flipkart layout) */}
          <div ref={suggestionRef} className="flex-1 max-w-2xl relative text-slate-800">
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-[6px] overflow-hidden shadow-sm border border-transparent focus-within:ring-2 focus-within:ring-sky-200 focus-within:border-[#172337] transition-all duration-150">
              <input
                type="text"
                placeholder="Search for toys, brands, age groups and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full px-4 py-2 text-xs font-normal outline-none text-slate-800 placeholder-slate-400"
              />
              <button 
                type="submit" 
                className="px-5 bg-white text-[#2874F0] hover:bg-slate-50 transition-colors py-2 flex items-center justify-center shrink-0 border-l border-slate-100"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Suggestions Panel */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden z-50 text-left">
                <div className="px-3 py-1.5 text-[9px] text-slate-400 font-bold uppercase border-b border-slate-100 bg-slate-50">
                  Trending Suggestions
                </div>
                {suggestions.map((prod) => {
                  const price = prod.discountPrice && prod.discountPrice > 0 ? prod.discountPrice : prod.price;
                  return (
                    <button
                      key={prod._id}
                      onClick={() => handleSuggestionClick(prod._id)}
                      className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-left w-full border-b border-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={prod.images?.[0]} 
                          alt="preview" 
                          className="w-7 h-7 object-contain bg-slate-50 border border-slate-100" 
                        />
                        <span className="text-[12px] font-medium text-slate-850 line-clamp-1">{prod.name}</span>
                      </div>
                      <span className="text-[12px] font-bold text-slate-900">₹{price}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions & Profiles Row */}
          <div className="flex items-center gap-6 md:gap-8 text-xs font-semibold select-none">
            
            {/* Direct Categories Menu Hover Trigger */}
            <div className="relative hidden lg:block">
              <button 
                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
                className="flex items-center gap-1 py-2 hover:text-slate-200 text-white font-semibold transition-colors"
              >
                Categories <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {categoriesDropdownOpen && (
                <div 
                  onMouseEnter={() => setCategoriesDropdownOpen(true)}
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                  className="absolute top-full left-0 w-48 bg-white text-slate-800 rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200 py-1 z-50 text-left font-semibold"
                >
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/shop?category=${cat.slug}`}
                      className="block px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Shop All Link */}
            <Link to="/shop" className="hover:text-slate-200 py-2 hidden sm:block font-semibold transition-colors">Shop All</Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="flex items-center gap-1 hover:text-slate-200 py-2 relative transition-colors">
              <Heart className="w-4.5 h-4.5" />
              <span className="hidden md:inline font-semibold">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-[#FB641B] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart with numerical summary */}
            <Link to="/cart" className="flex items-center gap-1.5 hover:text-slate-200 py-2 relative transition-colors">
              <ShoppingCart className="w-4.5 h-4.5" />
              <span className="font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#FB641B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account Account Dropdown */}
            <div ref={profileRef} className="relative">
              {user ? (
                <>
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 py-2 outline-none font-bold hover:text-slate-200 text-white transition-colors"
                  >
                    <User className="w-4.5 h-4.5" />
                    <span className="hidden md:inline text-xs font-semibold">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white text-slate-800 rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-slate-200 py-1 z-50 text-left font-semibold">
                      <div className="px-4 py-1.5 text-[10px] text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider">
                        My Account
                      </div>
                      {user.role !== 'admin' ? (
                        <Link 
                          to="/dashboard" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                        >
                          My Profile
                        </Link>
                      ) : (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 hover:bg-slate-50 text-xs text-slate-700 transition-colors"
                        >
                          Seller Central
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-650 text-xs border-t border-slate-100 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-white text-[#2874F0] hover:bg-slate-50 font-bold text-xs px-4 py-1.5 rounded-[6px] shadow-sm transition-all"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Drawer menu action */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 text-white outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 text-slate-800 p-4 flex flex-col gap-3 shadow-md">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold hover:text-[#2874F0]">Home</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-xs font-semibold hover:text-[#2874F0]">Shop All</Link>
          
          <div className="border-t border-slate-100 pt-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Categories</span>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-slate-50 rounded text-xs font-medium text-slate-700 truncate"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
