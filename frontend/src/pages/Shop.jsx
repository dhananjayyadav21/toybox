import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { Search, SlidersHorizontal, ChevronRight, X, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AGE_GROUPS = ['0-2 Years', '3-5 Years', '6-8 Years', '9+ Years'];

export default function Shop() {
  const { products, categories, loading } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [priceRange, setPriceRange] = useState(5000);
  const [selectedAge, setSelectedAge] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL search params
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    const urlCat = searchParams.get('category');
    if (urlQuery !== null) setSearchQuery(urlQuery);
    if (urlCat !== null) setSelectedCategory(urlCat);
  }, [searchParams]);

  // Update query params when searching/filtering
  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== '') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    updateFilters('category', slug);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateFilters('search', val);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange(5000);
    setSelectedAge('all');
    setMinRating(0);
    setSortBy('latest');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Perform client-side filtering on seeded/fetched products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.category?.slug === selectedCategory || p.category === selectedCategory);
    }

    // Price
    result = result.filter((p) => {
      const actualPrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
      return actualPrice <= priceRange;
    });

    // Age Group
    if (selectedAge && selectedAge !== 'all') {
      result = result.filter((p) => p.ageGroup === selectedAge);
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => {
        const pA = a.discountPrice || a.price;
        const pB = b.discountPrice || b.price;
        return pA - pB;
      });
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => {
        const pA = a.discountPrice || a.price;
        const pB = b.discountPrice || b.price;
        return pB - pA;
      });
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Latest/default
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, selectedAge, minRating, sortBy]);

  // Pagination Logic
  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedAge !== 'all') count++;
    if (priceRange < 5000) count++;
    if (minRating > 0) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedAge, priceRange, minRating, searchQuery]);

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50/20 pb-20">
      
      {/* Page Title & Breadcrumb */}
      <div className="text-left mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-toy-coral">Shop All Toys</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mt-2 font-sans">Browse the Toy Box</h1>
        </div>

        {/* Global search */}
        <div className="flex items-center gap-3 w-full md:w-auto max-w-sm">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search specific toys..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-5 py-2.5 pl-12 rounded-2xl bg-white border border-slate-100 focus:border-toy-teal focus:ring-4 focus:ring-toy-teal/5 outline-none text-xs font-semibold text-slate-700 transition-all shadow-[0_8px_30px_rgba(15,23,42,0.02)]"
            />
            <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4.5 top-3" />
          </div>
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden p-3 bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-2xl shadow-sm flex items-center justify-center"
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* SIDEBAR FILTER PANEL (Desktop) */}
        <aside className="hidden lg:block w-72 shrink-0 bg-white p-6 rounded-3xl border border-slate-100/80 shadow-[0_8px_30px_rgba(15,23,42,0.02)] flex flex-col gap-6 text-left">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-850 text-base flex items-center gap-1.5"><Filter className="w-4.5 h-4.5 text-toy-teal" /> Filters</h3>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="text-[10px] font-black uppercase text-toy-coral hover:underline">
                Clear All
              </button>
            )}
          </div>

          {/* 1. Category Filter */}
          <div>
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider mb-3">Category</h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`text-xs font-bold text-left px-3 py-2.5 rounded-xl transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-toy-teal/10 text-toy-teal font-extrabold' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`text-xs font-bold text-left px-3 py-2.5 rounded-xl transition-all ${
                    selectedCategory === cat.slug 
                      ? 'bg-toy-teal/10 text-toy-teal font-extrabold' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Price Filter */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider mb-3">Max Price</h4>
            <div className="flex flex-col gap-2">
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-toy-teal"
              />
              <div className="flex justify-between text-[10px] font-black text-slate-400 mt-1">
                <span>INR 500</span>
                <span className="text-toy-teal font-extrabold">INR {priceRange}</span>
              </div>
            </div>
          </div>

          {/* 3. Age Recommendation Filter */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider mb-3">Age recommendation</h4>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedAge('all')}
                className={`text-xs font-bold text-left px-3 py-2.5 rounded-xl transition-all ${
                  selectedAge === 'all' 
                    ? 'bg-toy-purple/10 text-toy-purple font-extrabold' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                All Ages
              </button>
              {AGE_GROUPS.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`text-xs font-bold text-left px-3 py-2.5 rounded-xl transition-all ${
                    selectedAge === age 
                      ? 'bg-toy-purple/10 text-toy-purple font-extrabold' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Minimum Rating Filter */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-wider mb-3">Minimum Rating</h4>
            <div className="flex flex-col gap-1">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(stars)}
                  className={`flex items-center gap-2 text-xs font-bold p-2.5 rounded-xl transition-all ${
                    minRating === stars
                      ? 'bg-toy-yellow/20 text-slate-800 font-extrabold'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex gap-0.5">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < stars ? 'text-toy-yellow fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-[10px] tracking-wide">{stars}+ Stars</span>
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* PRODUCTS AREA */}
        <div className="flex-1">
          
          {/* Active Filter Tags bar */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-left">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active filters:</span>
              
              {selectedCategory !== 'all' && (
                <span className="flex items-center gap-1 bg-toy-teal/10 text-toy-teal text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-toy-teal/5">
                  Category: {selectedCategory}
                  <button onClick={() => handleCategorySelect('all')} className="hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedAge !== 'all' && (
                <span className="flex items-center gap-1 bg-toy-purple/10 text-toy-purple text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-toy-purple/5">
                  Age: {selectedAge}
                  <button onClick={() => setSelectedAge('all')} className="hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {priceRange < 5000 && (
                <span className="flex items-center gap-1 bg-toy-coral/10 text-toy-coral text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-toy-coral/5">
                  Price Under: INR {priceRange}
                  <button onClick={() => setPriceRange(5000)} className="hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="flex items-center gap-1 bg-toy-yellow/20 text-slate-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-toy-yellow/20">
                  Rating: {minRating}+ Stars
                  <button onClick={() => setMinRating(0)} className="hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  Search: "{searchQuery}"
                  <button onClick={() => { setSearchQuery(''); updateFilters('search', ''); }} className="hover:text-slate-900"><X className="w-3 h-3" /></button>
                </span>
              )}

              <button onClick={clearAllFilters} className="text-[10px] font-black uppercase text-toy-coral hover:underline ml-2">Clear</button>
            </div>
          )}

          {/* Sorting Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.02)] mb-6 text-xs font-bold text-slate-500">
            <span>Showing {filteredProducts.length} magic items</span>
            <div className="flex items-center gap-3">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-slate-700 font-extrabold focus:outline-none"
              >
                <option value="latest">Latest Arrivals</option>
                <option value="popular">Popular Picks</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {paginatedProducts.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2.5 mt-16 font-extrabold">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none text-xs"
                  >
                    Prev
                  </button>
                  {Array(totalPages).fill(0).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl transition-all text-xs font-black ${
                          currentPage === page
                            ? 'bg-toy-teal text-white shadow-premium shadow-neon-teal'
                            : 'bg-white border border-slate-100 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-4 py-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-700 shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none text-xs"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-slate-100 rounded-[32px] p-16 text-center max-w-lg mx-auto mt-12 flex flex-col items-center gap-4 shadow-sm">
              <span className="text-5xl">🔍</span>
              <h3 className="font-extrabold text-slate-800 text-lg">No Magic Toys Found</h3>
              <p className="text-sm font-semibold text-slate-400 max-w-sm leading-relaxed">
                We couldn't find matches matching your active filters. Try resetting search parameters or shifting budget bars.
              </p>
              <button onClick={clearAllFilters} className="btn-toy-outline px-6 text-sm mt-2">
                Reset All Filters
              </button>
            </div>
          )}

        </div>

      </div>

      {/* MOBILE DRAWER FILTERS */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            ></motion.div>
            
            {/* Drawer Body */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '105%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-80 max-w-full h-full bg-white shadow-premium p-6 flex flex-col justify-between overflow-y-auto text-left z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-6">
                  <h3 className="font-extrabold text-slate-800 text-lg">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest mb-3">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { handleCategorySelect('all'); setMobileFiltersOpen(false); }}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                        selectedCategory === 'all' ? 'bg-toy-teal text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => { handleCategorySelect(cat.slug); setMobileFiltersOpen(false); }}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                          selectedCategory === cat.slug ? 'bg-toy-teal text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6 border-t border-slate-50 pt-5">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest mb-3">Max Price</h4>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg cursor-pointer accent-toy-teal"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-1">
                    <span>INR 500</span>
                    <span className="text-toy-teal">INR {priceRange}</span>
                  </div>
                </div>

                {/* Age recommendation */}
                <div className="mb-6 border-t border-slate-50 pt-5">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest mb-3">Age</h4>
                  <div className="flex flex-wrap gap-2">
                    {['all', ...AGE_GROUPS].map((age) => (
                      <button
                        key={age}
                        onClick={() => { setSelectedAge(age); setMobileFiltersOpen(false); }}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                          selectedAge === age ? 'bg-toy-purple text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {age === 'all' ? 'All Ages' : age}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full btn-toy-primary py-3.5 rounded-2xl text-xs uppercase tracking-widest font-black"
              >
                Apply Filters
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
