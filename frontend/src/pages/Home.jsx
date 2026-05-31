import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const HERO_SLIDES = [
  {
    title: 'Up to 40% Off on STEM Toys',
    subtitle: 'DEVELOPMENTAL & LOGIC PUZZLES',
    description: 'Fuel curiosity and creative building with GOTS certified, chemical-free non-toxic wooden blocks.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=educational-toys',
    badge: 'Deal of the Day'
  },
  {
    title: 'Super High Speed RC Monster Trucks',
    subtitle: 'REMOTE CONTROL VEHICLES',
    description: 'Heavy duty all-terrain RC cars with massive shock absorption. 100% kid-safe high-impact polymers.',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=remote-control-toys',
    badge: 'Best Seller'
  },
  {
    title: 'Organic Crochet Handcrafted Dolls',
    subtitle: 'CHEMICAL FREE SOFT PLAYMATES',
    description: 'Spun from premium organic Egyptian threads. Completely anti-allergic and safe for toddler skin.',
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=800',
    link: '/shop?category=dolls',
    badge: 'Trending Collection'
  }
];

const MOCK_REVIEWS = [
  { id: 1, name: 'Aarav Sharma', role: 'Father of 5yo', comment: 'The magnetic block sets are fantastic! Extremely strong magnets and the plastic is durable. High conversion-ready build.', rating: 5 },
  { id: 2, name: 'Priya Patel', role: 'Mother of 3yo', comment: 'We love the crochet dolls. They are extremely soft, chemical-free, and safe for babies. Flipkart-level trust!', rating: 5 },
  { id: 3, name: 'Sanjay Verma', role: 'Father of 8yo', comment: 'Remote control buggy runs beautifully on gravel and grass. Shock absorption is incredible.', rating: 5 }
];

export default function Home() {
  const { products, categories, loading } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto scroll banner carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const trendingProducts = products.slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.rating - a.rating).slice(4, 8);
  const featuredProducts = products.slice(2, 6);

  return (
    <div className="bg-[#F1F3F6] pb-12 text-left">
      
      {/* 1. Flipkart-style Circular Category Menu Bar */}
      <div className="bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] py-4 select-none mb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 overflow-x-auto flex justify-start md:justify-center items-center gap-8 md:gap-14 scrollbar-none">
          {categories.map((cat) => (
            <Link 
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center shrink-0 group text-center"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-50 border border-slate-150 flex items-center justify-center p-1 group-hover:scale-105 group-hover:border-slate-300 transition-all duration-[180ms] ease-in-out">
                <img 
                  src={cat.image || 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=200'} 
                  alt={cat.name} 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-bold text-[#212121] mt-1.5 group-hover:text-[#2874F0] tracking-wide transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Hero Promotional Carousel Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <div className="relative bg-white rounded-[8px] border border-slate-200 shadow-sm overflow-hidden h-[260px] md:h-[340px] group">
          
          {/* Banner items */}
          <div className="absolute inset-0 flex items-center justify-between">
            {/* Left Column: Text description */}
            <div className="p-6 md:p-12 max-w-lg md:max-w-xl z-10 text-left flex flex-col justify-center h-full">
              <span className="text-[10px] font-extrabold text-white bg-[#FB641B] px-2 py-0.5 rounded-[4px] uppercase tracking-wide w-max mb-3">
                {HERO_SLIDES[currentSlide].badge}
              </span>
              <h1 className="text-xl md:text-[34px] font-bold text-[#212121] leading-tight mb-2 font-sans">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="text-slate-500 text-xs md:text-sm font-normal mb-5 leading-snug hidden sm:block">
                {HERO_SLIDES[currentSlide].description}
              </p>
              <Link 
                to={HERO_SLIDES[currentSlide].link} 
                className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase px-6 py-[12px] rounded-[6px] w-max shadow-sm transition-colors text-center"
              >
                Shop Now
              </Link>
            </div>

            {/* Right Column: Promotional Image */}
            <div className="hidden md:block w-1/2 h-full select-none relative overflow-hidden">
              <img 
                src={HERO_SLIDES[currentSlide].image} 
                alt="Promo Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent"></div>
            </div>
          </div>

          {/* Slider Controllers */}
          <button 
            onClick={handlePrevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/95 hover:bg-white text-slate-700 border border-slate-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity outline-none"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <button 
            onClick={handleNextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/95 hover:bg-white text-slate-700 border border-slate-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity outline-none"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* 3. Core Flipkart Value Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-[8px] p-4 flex items-center gap-3.5 shadow-sm">
          <Truck className="w-8 h-8 text-[#2874F0] shrink-0" />
          <div>
            <h4 className="font-bold text-[#212121] text-xs uppercase tracking-wide">Free Express Shipping</h4>
            <p className="text-[11px] text-[#878787] font-medium">Get complimentary express delivery on orders over ₹999</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-[8px] p-4 flex items-center gap-3.5 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-[#388E3C] shrink-0" />
          <div>
            <h4 className="font-bold text-[#212121] text-xs uppercase tracking-wide">100% Safe Materials</h4>
            <p className="text-[11px] text-[#878787] font-medium">BPA-Free, non-toxic, child-safe developmental toys only</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[8px] p-4 flex items-center gap-3.5 shadow-sm">
          <RotateCcw className="w-8 h-8 text-[#FB641B] shrink-0" />
          <div>
            <h4 className="font-bold text-[#212121] text-xs uppercase tracking-wide">7 Days Easy Return</h4>
            <p className="text-[11px] text-[#878787] font-medium">No hassle refund or product replacement sandbox setup</p>
          </div>
        </div>
      </div>

      {/* 4. Trending Toys Section (Flipkart grid style) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-[8px] p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#212121]">Trending Products</h2>
              <p className="text-[11px] text-[#878787] font-normal">Toys bought recently by happy families across India</p>
            </div>
            <Link 
              to="/shop" 
              className="bg-[#2874F0] text-white hover:bg-[#1a5ebf] text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-[6px] shadow-sm transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              trendingProducts.map((prod) => <ProductCard key={prod._id} product={prod} />)
            )}
          </div>
        </div>
      </section>

      {/* 5. Featured Brand Spotlight */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-[8px] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl text-left flex flex-col justify-center">
            <span className="text-[10px] font-bold text-[#2874F0] bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-wide w-max mb-2">
              Featured Spotlights
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#212121] leading-tight mb-3 font-sans">
              MagConstruct Geometric Magnetic Building Blocks
            </h2>
            <p className="text-slate-500 text-xs md:text-sm font-normal mb-6 leading-relaxed">
              Explore STEM-approved modular magnetic tiles. Clinically designed to foster spatial reasoning, creative thinking, and structural geometry in growing toddlers. Features heavy-duty copper rivets and non-toxic safe ABS structure.
            </p>
            <Link 
              to="/shop?category=building-blocks" 
              className="bg-[#FB641B] hover:bg-[#e15610] text-white font-bold text-xs uppercase px-6 py-[12px] rounded-[6px] w-max shadow-sm transition-colors"
            >
              Shop Magnetic Kits
            </Link>
          </div>

          <div className="w-full md:w-1/2 aspect-video md:aspect-[16/10] rounded-[8px] overflow-hidden border border-slate-100 bg-slate-50">
            <img 
              src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=600" 
              alt="Building spotlight" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 6. Best Sellers Catalog Compartment */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-[8px] p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#212121]">Best Sellers</h2>
              <p className="text-[11px] text-[#878787] font-normal">Highly rated and approved by parents and educators</p>
            </div>
            <Link 
              to="/shop" 
              className="bg-[#2874F0] text-white hover:bg-[#1a5ebf] text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-[6px] shadow-sm transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              bestSellers.map((prod) => <ProductCard key={prod._id} product={prod} />)
            )}
          </div>
        </div>
      </section>

      {/* 7. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-[8px] p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#212121]">Featured Products</h2>
              <p className="text-[11px] text-[#878787] font-normal">Handpicked premium toys curated for cognitive milestones</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              featuredProducts.map((prod) => <ProductCard key={prod._id} product={prod} />)
            )}
          </div>
        </div>
      </section>

      {/* 8. Top Brands Strip */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 select-none text-slate-800">
        <div className="bg-white border border-slate-200 rounded-[8px] p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">OUR TRUSTED MANUFACTURER BRANDS</span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 font-extrabold text-sm uppercase text-slate-400">
            <span>LEGO</span>
            <span>HAMLEYS</span>
            <span>DISNEY STORE</span>
            <span>MELISSA & DOUG</span>
            <span>FISHER-PRICE</span>
          </div>
        </div>
      </div>

      {/* 9. Parent Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-base md:text-lg font-bold text-[#212121]">What Parents Say</h2>
          <p className="text-[11px] text-[#878787] font-normal">Authentic reviews from families who shopped on ToyBox</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_REVIEWS.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-200 rounded-[8px] p-5 text-left shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-shadow duration-[180ms] ease-in-out">
              <div>
                <div className="flex gap-0.5 text-[#FF9F00] mb-2 fill-current">
                  {Array(rev.rating).fill(0).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-2 flex justify-between items-center text-[11px] font-bold text-slate-500">
                <span>{rev.name}</span>
                <span className="text-[#878787] font-normal">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Corporate Standard E-Commerce Footer */}
      <footer className="bg-[#172337] text-white pt-12 pb-6 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-left text-xs font-normal pb-8 border-b border-slate-800">
          <div>
            <h5 className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mb-3">ABOUT TOYBOX</h5>
            <ul className="flex flex-col gap-2 text-slate-400">
              <li><Link to="/about" className="hover:underline">Who We Are</Link></li>
              <li><Link to="/careers" className="hover:underline">Careers</Link></li>
              <li><Link to="/press" className="hover:underline">Press Releases</Link></li>
              <li><Link to="/corporate" className="hover:underline">Corporate Information</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mb-3">HELP & SUPPORT</h5>
            <ul className="flex flex-col gap-2 text-slate-400">
              <li><Link to="/payments" className="hover:underline">Payments</Link></li>
              <li><Link to="/shipping" className="hover:underline">Shipping & Logistics</Link></li>
              <li><Link to="/cancellation" className="hover:underline">Cancellation & Returns</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mb-3">CONSUMER POLICY</h5>
            <ul className="flex flex-col gap-2 text-slate-400">
              <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:underline">Terms of Use</Link></li>
              <li><Link to="/safety" className="hover:underline">Safety Certification</Link></li>
              <li><Link to="/sitemap" className="hover:underline">Sitemap</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] text-slate-450 uppercase font-bold tracking-wider mb-3">GET IN TOUCH</h5>
            <ul className="flex flex-col gap-2 text-slate-400">
              <li><span>Email: support@toybox.com</span></li>
              <li><span>Mobile: 1800-TOY-BOX-CORP</span></li>
              <li><span>Vasant Kunj Center, New Delhi, India</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 ToyBox Plus Premium. All Rights Reserved. Sandbox Simulation Mode.</span>
          <span className="mt-2 md:mt-0 flex gap-4">
            <span className="hover:underline cursor-pointer">PCI-DSS Secured Payments</span>
            <span className="hover:underline cursor-pointer">100% Genuine Toys guarantee</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
