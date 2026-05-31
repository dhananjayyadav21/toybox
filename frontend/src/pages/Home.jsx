import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star,
  Quote,
  Sparkle
} from 'lucide-react';

const HERO_SLIDES = [
  {
    title: 'Unlock Your Child’s Infinite Imagination',
    subtitle: 'EXPLORE OUR EDUCATIONAL COLLECTION',
    description: 'STEM developmental toys engineered to fuel logical reasoning, fine motor skills, and creative spatial structures.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800',
    color: 'from-rose-500/90 via-purple-600/95 to-indigo-700/90',
    link: '/shop?category=educational-toys',
    accentText: 'Premium Safe Woods'
  },
  {
    title: 'Extreme Fast & Furious Remote Controls',
    subtitle: 'RC DESERT BUGGIES & MONSTER TRUCKS',
    description: 'Extreme speed all-terrain monster vehicles and heavy-duty RC flyers for ultimate outdoor racing adventure.',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800',
    color: 'from-teal-500/90 via-emerald-600/95 to-slate-900/90',
    link: '/shop?category=remote-control-toys',
    accentText: 'High-Impact Polycarbonate'
  },
  {
    title: 'Delicate Organic Handcrafted Crochet Dolls',
    subtitle: '100% GOTS CERTIFIED SOFT THREADS',
    description: 'Beautifully detailed handcrafted dolls spun from soft Egyptian threads, completely chemical-free and anti-allergenic.',
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=800',
    color: 'from-fuchsia-500/90 via-pink-600/95 to-rose-600/90',
    link: '/shop?category=dolls',
    accentText: '100% Cotton & Safe Filler'
  }
];

const MOCK_REVIEWS = [
  { id: 1, name: 'Aarav Sharma', role: 'Father of 5yo', comment: 'The magnetic tile blocks are absolutely fantastic! The magnets are strong and my daughter builds skyscrapers for hours. Superior quality!', rating: 5, avatarBg: 'from-orange-400 to-rose-400' },
  { id: 2, name: 'Priya Patel', role: 'Mother of 3yo', comment: 'So happy to buy the organic crochet doll. It is extremely soft, beautiful, and safe for my baby’s sensitive skin. Recommend 100%!', rating: 5, avatarBg: 'from-teal-400 to-emerald-400' },
  { id: 3, name: 'Sanjay Verma', role: 'Father of 8yo & 10yo', comment: 'The remote control desert buggy is a beast. We raced it on grass, gravel, and dirt—it is super fast and shock absorption is brilliant.', rating: 5, avatarBg: 'from-indigo-400 to-purple-400' }
];

export default function Home() {
  const { products, categories, loading } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto Slider Interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Filter products for various categories
  const trendingProducts = products.slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="pt-20 bg-slate-50/50">
      
      {/* 1. Hero Auto-Slider Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.08)] h-[440px] md:h-[520px] bg-slate-900">
          
          {/* Decorative Widgets */}
          <div className="absolute top-10 right-10 z-20 pointer-events-none hidden md:block">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4.5 h-4.5 text-toy-yellow animate-pulse" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Premium Brand Certified</span>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 flex flex-col md:flex-row items-center justify-between"
            >
              {/* Graphic background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[currentSlide].color} z-0`}></div>
              
              {/* Slide text */}
              <div className="relative z-10 p-8 md:p-16 flex-1 text-white flex flex-col justify-center items-start text-left max-w-2xl h-full">
                <span className="bg-white/15 backdrop-blur-sm border border-white/10 text-white font-extrabold text-[9px] px-3.5 py-1 rounded-full uppercase tracking-wider mb-4 flex items-center gap-1">
                  <Sparkle className="w-3 h-3 text-toy-yellow fill-current" /> {HERO_SLIDES[currentSlide].subtitle}
                </span>
                <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 drop-shadow-md text-white font-sans text-left">
                  {HERO_SLIDES[currentSlide].title}
                </h1>
                <p className="text-white/85 text-xs md:text-sm font-medium mb-8 max-w-lg leading-relaxed text-left">
                  {HERO_SLIDES[currentSlide].description}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link to={HERO_SLIDES[currentSlide].link} className="bg-white hover:bg-toy-yellow text-slate-900 font-extrabold text-xs px-8 py-4 rounded-2xl flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_30px_rgba(255,230,109,0.3)]">
                    Shop Collection <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-widest text-white/60">
                    {HERO_SLIDES[currentSlide].accentText}
                  </span>
                </div>
              </div>

              {/* Slide image */}
              <div className="hidden md:block w-5/12 h-full relative z-10">
                <img
                  src={HERO_SLIDES[currentSlide].image}
                  alt="Featured toy"
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-900/10 to-transparent"></div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="absolute bottom-6 left-8 flex gap-2 z-20">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === i ? 'bg-white w-7' : 'bg-white/40 w-2'
                }`}
              ></button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. Premium Features highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-toy-coral/10 text-toy-coral flex items-center justify-center shrink-0">
            <Truck className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-slate-800 text-sm">Free Express Shipping</h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Complimentary shipping on orders over INR 999</p>
          </div>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-toy-teal/10 text-toy-teal flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-slate-800 text-sm">100% Certified Safe Toys</h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Naturally sourced wood, non-toxic BPA-free materials</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.02)]">
          <div className="w-12 h-12 rounded-2xl bg-toy-purple/10 text-toy-purple flex items-center justify-center shrink-0">
            <RotateCcw className="w-5.5 h-5.5" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-slate-800 text-sm">7-Day Easy Returns</h4>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">No questions asked replacement or instant refunds</p>
          </div>
        </div>
      </div>

      {/* 3. Shop By Category Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] font-black uppercase text-toy-teal bg-toy-teal/10 px-3 py-1 rounded-md tracking-wider border border-toy-teal/5">Discover Joy</span>
          <h2 className="text-3xl font-black text-slate-800 mt-3 font-sans">Shop Magical <span className="bg-gradient-to-r from-toy-coral via-toy-purple to-toy-teal bg-clip-text text-transparent">Categories</span></h2>
          <p className="text-xs font-semibold text-slate-400 mt-2">Explore handcrafted and thoughtfully built collections optimized for children's developmental age groups.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center bg-white rounded-3xl border border-slate-100 p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.08)] transition-all duration-300"
              >
                <div className="rounded-2xl bg-slate-50 aspect-[4/3] w-full overflow-hidden relative border border-slate-50">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/95 backdrop-blur-sm text-slate-900 font-extrabold text-[10px] px-4 py-2 rounded-xl shadow-md uppercase tracking-wider flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      Browse Collection <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm mt-3.5 group-hover:text-toy-coral transition-colors">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. Trending Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex items-end justify-between mb-10 text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-toy-coral bg-toy-coral/10 px-3 py-1 rounded-md tracking-wider border border-toy-coral/5 flex items-center gap-1 w-max">
              Trending Now <Sparkles className="w-3.5 h-3.5 text-toy-coral animate-pulse" />
            </span>
            <h2 className="text-3xl font-black text-slate-800 mt-3 font-sans">Popular <span className="bg-gradient-to-r from-toy-coral via-toy-purple to-toy-teal bg-clip-text text-transparent">Toy Box Picks</span></h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1 text-xs font-black uppercase tracking-wider text-toy-teal hover:text-teal-600 transition-colors">
            View All Toys <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            trendingProducts.map((prod) => <ProductCard key={prod._id} product={prod} />)
          )}
        </div>
      </div>

      {/* 5. Promotional Category Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-800 rounded-[36px] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[0_20px_50px_rgba(15,23,42,0.15)] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-toy-teal/5 rounded-full filter blur-3xl"></div>
          
          <div className="max-w-xl relative z-10 text-left">
            <span className="text-[10px] font-black uppercase text-toy-teal bg-toy-teal/10 px-3 py-1 rounded-md tracking-wider border border-toy-teal/10">Featured Brand Spotlight</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mt-4 leading-tight font-sans">
              MagConstruct Modular Magnetic Sets
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-4 leading-relaxed">
              Explore 3D architect building magnetic kits. Clinically tested to improve spatial cognitive abilities and creative geometry in junior schoolers. Secure rivets and rare-earth strong magnets inside.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/shop?category=building-blocks" className="bg-white hover:bg-toy-yellow text-slate-900 font-extrabold text-xs px-6 py-3.5 rounded-2xl flex items-center gap-1.5 active:scale-95 transition-all shadow-md">
                Explore MagConstruct <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="w-full md:w-5/12 aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden relative z-10 border border-white/5 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800"
              alt="Building blocks"
              className="w-full h-full object-cover rounded-3xl"
            />
          </div>

        </div>
      </div>

      {/* 6. Best Sellers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="flex items-end justify-between mb-10 text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-toy-purple bg-toy-purple/10 px-3 py-1 rounded-md tracking-wider border border-toy-purple/5">Top Rated</span>
            <h2 className="text-3xl font-black text-slate-800 mt-3 font-sans">Highly Recommended By Parents</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            bestSellers.map((prod) => <ProductCard key={prod._id} product={prod} />)
          )}
        </div>
      </div>

      {/* 7. Parenting Reviews & Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-28 mb-24">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] font-black uppercase text-toy-yellow bg-toy-yellow/20 px-3 py-1 rounded-md tracking-wider border border-toy-yellow/10">Parent Reviews</span>
          <h2 className="text-3xl font-black text-slate-800 mt-3 font-sans">What Loving Families Say</h2>
          <p className="text-xs font-semibold text-slate-400 mt-2">Real feedback and magical learning experiences shared by parents across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_REVIEWS.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-100/80 rounded-[32px] p-6 flex flex-col justify-between items-start text-left relative shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300">
              <Quote className="w-10 h-10 text-slate-50 absolute top-6 right-6 z-0 pointer-events-none" />
              <div className="relative z-10 w-full">
                <div className="flex items-center gap-1 mb-4">
                  {Array(rev.rating).fill(0).map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 text-toy-yellow fill-current" />
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-500 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${rev.avatarBg} flex items-center justify-center font-extrabold text-xs text-white shadow-sm`}>
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-800 text-xs">{rev.name}</h5>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
