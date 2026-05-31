import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { Search, SlidersHorizontal, ChevronRight, X, Star, Filter } from 'lucide-react';

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

  // Perform client-side filtering
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
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [products, searchQuery, selectedCategory, priceRange, selectedAge, minRating, sortBy]);

  // Pagination Logic
  const itemsPerPage = 9;
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
    <div className="bg-[#F1F3F6] min-h-screen pt-4 pb-12 text-left">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1 text-[11px] font-normal text-slate-500 mb-3 select-none">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Toy Box Catalog</span>
        </div>

        {/* Catalog Main Row */}
        <div className="flex gap-4 items-start">
          
          {/* SIDEBAR FILTER PANEL (Flipkart/Myntra Clean Layout) */}
          <aside className="hidden lg:block w-[240px] shrink-0 bg-white border border-slate-200 rounded-sm shadow-sm select-none">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-[#212121] text-sm uppercase tracking-wider flex items-center gap-1.5">
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearAllFilters} 
                  className="text-[11px] font-bold text-[#2874F0] hover:underline"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-[#212121] text-xs uppercase mb-3">Categories</h4>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2 text-[12px] font-medium text-slate-850 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sidebarCategory"
                    checked={selectedCategory === 'all'} 
                    onChange={() => handleCategorySelect('all')}
                    className="accent-[#2874F0]" 
                  />
                  <span>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-2 text-[12px] font-medium text-slate-850 cursor-pointer">
                    <input 
                      type="radio" 
                      name="sidebarCategory"
                      checked={selectedCategory === cat.slug} 
                      onChange={() => handleCategorySelect(cat.slug)}
                      className="accent-[#2874F0]" 
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-[#212121] text-xs uppercase mb-3">Price Range</h4>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2874F0]"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-2">
                <span>Min: ₹500</span>
                <span className="text-[#2874F0]">Max: ₹{priceRange}</span>
              </div>
            </div>

            {/* Age Recommend Filter */}
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-[#212121] text-xs uppercase mb-3">Age Groups</h4>
              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2 text-[12px] font-medium text-slate-850 cursor-pointer">
                  <input 
                    type="radio" 
                    name="sidebarAge"
                    checked={selectedAge === 'all'} 
                    onChange={() => setSelectedAge('all')}
                    className="accent-[#2874F0]" 
                  />
                  <span>All Ages</span>
                </label>
                {AGE_GROUPS.map((age) => (
                  <label key={age} className="flex items-center gap-2 text-[12px] font-medium text-slate-850 cursor-pointer">
                    <input 
                      type="radio" 
                      name="sidebarAge"
                      checked={selectedAge === age} 
                      onChange={() => setSelectedAge(age)}
                      className="accent-[#2874F0]" 
                    />
                    <span>{age}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Rating Filter */}
            <div className="p-4">
              <h4 className="font-bold text-[#212121] text-xs uppercase mb-3">Ratings</h4>
              <div className="flex flex-col gap-2">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setMinRating(stars)}
                    className={`flex items-center gap-1.5 text-xs text-left py-1 px-2 rounded-sm ${minRating === stars ? 'bg-slate-100 font-bold' : ''}`}
                  >
                    <span className="bg-[#388E3C] text-white text-[10px] font-bold px-1 rounded-sm flex items-center gap-0.5 shrink-0">
                      {stars} <Star className="w-2.5 h-2.5 fill-current" />
                    </span>
                    <span className="text-slate-500 font-normal">& Above</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Catalog Listings View */}
          <div className="flex-1">
            
            {/* Top Sort Header Block (Flipkart Style) */}
            <div className="bg-white border border-slate-200 rounded-sm p-3.5 flex flex-wrap items-center justify-between gap-4 mb-4 select-none">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#212121]">Browse Products</h2>
                <span className="text-xs font-normal text-slate-400">({filteredProducts.length} items found)</span>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                {/* Search query tag */}
                {searchQuery.trim() && (
                  <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-sm flex items-center gap-1 font-normal">
                    Search: "{searchQuery}"
                    <button onClick={() => { setSearchQuery(''); updateFilters('search', ''); }} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-normal">Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-slate-250 rounded-sm px-3 py-1.5 text-[12px] font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="latest">Latest Arrivals</option>
                    <option value="popular">Popularity</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Pills Bar */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4 text-left">
                {selectedCategory !== 'all' && (
                  <span className="bg-white border border-slate-200 text-slate-800 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    Category: {selectedCategory}
                    <button onClick={() => handleCategorySelect('all')} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedAge !== 'all' && (
                  <span className="bg-white border border-slate-200 text-slate-800 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    Age: {selectedAge}
                    <button onClick={() => setSelectedAge('all')} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {priceRange < 5000 && (
                  <span className="bg-white border border-slate-200 text-slate-800 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    Price: Under ₹{priceRange}
                    <button onClick={() => setPriceRange(5000)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="bg-white border border-slate-200 text-slate-800 text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    Rating: {minRating}+ <Star className="w-3 h-3 text-[#FF9F00] fill-current" />
                    <button onClick={() => setMinRating(0)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button 
                  onClick={clearAllFilters} 
                  className="text-xs font-bold text-[#FB641B] hover:underline px-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid Area */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {paginatedProducts.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>

                {/* Compact Pagination Row */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-10">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-[2px] text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
                    >
                      PREV
                    </button>
                    {Array(totalPages).fill(0).map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 text-xs font-bold rounded-[2px] ${
                            currentPage === page 
                              ? 'bg-[#2874F0] text-white' 
                              : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-[2px] text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
                    >
                      NEXT
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-slate-200 rounded-sm p-12 text-center max-w-md mx-auto mt-8">
                <span className="text-3xl block mb-2">🔍</span>
                <h3 className="font-bold text-slate-800 text-sm uppercase">No Products Found</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Try adjusting filters or checking spelling in search field.
                </p>
                <button onClick={clearAllFilters} className="mt-4 px-5 py-2 bg-[#2874F0] text-white font-bold text-xs uppercase rounded-sm shadow-sm">
                  Reset Filters
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
