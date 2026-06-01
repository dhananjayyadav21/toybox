import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import {
  ArrowRight, ShieldCheck, Truck, RotateCcw, Star,
  ChevronLeft, ChevronRight, Sparkles, Gift, Zap
} from 'lucide-react';

const HERO_SLIDES = [
  {
    title: 'Spark Curiosity with STEM Toys',
    subtitle: 'Up to 40% off on Educational Toys',
    description: 'Certified non-toxic wooden puzzles and blocks that build spatial reasoning and motor skills from day one.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=900',
    link: '/shop?category=educational-toys',
    badge: 'Deal of the Day',
    badgeColor: 'bg-amber-400 text-amber-900',
    gradient: 'from-violet-900 via-purple-800 to-indigo-900',
    accent: 'bg-violet-700'
  },
  {
    title: 'High-Speed RC Adventure',
    subtitle: 'Monster trucks built for real terrain',
    description: 'All-terrain RC cars with superior shock absorption. Engineered with 100% kid-safe high-impact polymers.',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=900',
    link: '/shop?category=remote-control-toys',
    badge: 'Best Seller',
    badgeColor: 'bg-rose-500 text-white',
    gradient: 'from-slate-900 via-slate-800 to-gray-900',
    accent: 'bg-slate-700'
  },
  {
    title: 'Organic Handcrafted Dolls',
    subtitle: 'Chemical-free soft playmates',
    description: 'Premium organic Egyptian threads. Completely anti-allergic and perfectly safe for delicate toddler skin.',
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=900',
    link: '/shop?category=dolls',
    badge: 'New Arrivals',
    badgeColor: 'bg-emerald-400 text-emerald-900',
    gradient: 'from-rose-900 via-pink-800 to-fuchsia-900',
    accent: 'bg-rose-700'
  }
];

const REVIEWS = [
  { id: 1, name: 'Aarav Sharma', role: 'Parent of 5-year-old', comment: 'The magnetic block sets are incredible! Strong connections, vibrant colors, and completely safe. My son plays for hours.', rating: 5, avatar: 'A' },
  { id: 2, name: 'Priya Patel', role: 'Mother of 3-year-old', comment: 'Love the crochet dolls — so soft, no chemicals, and arrived beautifully packaged. Worth every rupee.', rating: 5, avatar: 'P' },
  { id: 3, name: 'Sanjay Verma', role: 'Parent of 8-year-old', comment: 'The RC buggy works amazingly on gravel and grass. The shock absorption is real, and my son is obsessed.', rating: 5, avatar: 'S' }
];

const TRUST_BADGES = [
  { icon: Truck, title: 'Free Express Shipping', desc: 'On all orders above ₹999 across India', color: 'text-violet-600', bg: 'bg-violet-50' },
  { icon: ShieldCheck, title: '100% Safe Materials', desc: 'BPA-free, non-toxic & child-safety certified', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: RotateCcw, title: '7-Day Easy Returns', desc: 'Hassle-free refund or product replacement', color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function Home() {
  const { products, categories, loading, showToast } = useAppContext();
  const [slide, setSlide] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5500);
    return () => clearInterval(t);
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    // Check if already subscribed (localStorage)
    const subs = JSON.parse(localStorage.getItem('toybox_subscribers') || '[]');
    if (subs.includes(email)) {
      showToast('You are already subscribed! 🎉', 'warning');
      return;
    }

    setNewsletterLoading(true);
    // Simulate API call (replace with real endpoint when ready)
    setTimeout(() => {
      localStorage.setItem('toybox_subscribers', JSON.stringify([...subs, email]));
      setNewsletterLoading(false);
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      showToast('Successfully subscribed! Welcome to ToyBox deals 🎁', 'success');
    }, 1200);
  };

  const trending = products.slice(0, 4);
  const bestSellers = [...products].sort((a, b) => b.rating - a.rating).slice(4, 8);
  const featured = products.slice(2, 6);
  const current = HERO_SLIDES[slide];

  return (
    <div className="min-h-screen" style={{ background: 'var(--brand-bg)' }}>

      {/* ── Category Pill Bar ── */}
      <div className="bg-white border-b border-violet-100 py-3 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-6 overflow-x-auto flex items-center gap-2 md:gap-3 scrollbar-none flex-nowrap pb-0.5">
          <Link to="/shop" className="shrink-0 px-4 py-1.5 bg-violet-700 text-white text-xs font-bold rounded-full hover:bg-violet-800 transition-colors whitespace-nowrap">
            All Toys
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat.slug}`}
              className="shrink-0 px-4 py-1.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full hover:bg-violet-100 transition-colors border border-violet-100 whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-4 sm:pt-6 mb-6 sm:mb-8">
        <div className="relative rounded-2xl overflow-hidden h-[220px] sm:h-[260px] md:h-[360px] bg-white border border-violet-100 shadow-lg shadow-violet-100 group">

          <div className="absolute inset-0 flex h-full">

            {/* LEFT: Text panel */}
            <div className={`relative w-full md:w-1/2 h-full bg-gradient-to-br ${current.gradient} flex flex-col justify-center px-5 sm:px-8 md:px-12 py-6 sm:py-8 z-10`}>
              {/* subtle circle decoration */}
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

              <span className={`inline-block ${current.badgeColor} text-[10px] font-black px-3 py-1 rounded-full mb-4 uppercase tracking-widest w-max`}>
                {current.badge}
              </span>
              <h1 className="text-lg sm:text-xl md:text-3xl font-black text-white leading-tight mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {current.title}
              </h1>
              <p className="text-white/70 text-xs md:text-sm font-medium mb-1">{current.subtitle}</p>
              <p className="text-white/50 text-xs hidden md:block mb-6 leading-relaxed max-w-xs">{current.description}</p>
              <Link
                to={current.link}
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-xs md:text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-md w-max mt-2 md:mt-0"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* RIGHT: Full visible image */}
            <div className="hidden md:block md:w-1/2 h-full relative overflow-hidden">
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
              />
              {/* fade blend on left edge */}
              <div className={`absolute inset-y-0 left-0 w-16 bg-gradient-to-r ${current.gradient} to-transparent`} />
            </div>
          </div>

          {/* Slide dots */}
          <div className="absolute bottom-4 left-1/2 md:left-1/4 -translate-x-1/2 flex gap-2 z-20">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all ${i === slide ? 'bg-white w-6' : 'bg-white/40 w-1.5'}`}
              />
            ))}
          </div>

          {/* Nav arrows */}
          <button onClick={() => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 border border-slate-200 rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-20">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setSlide(s => (s + 1) % HERO_SLIDES.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white text-gray-700 border border-slate-200 rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 z-20">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Trust Badges ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mb-6 sm:mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {TRUST_BADGES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-white rounded-2xl border border-violet-100 p-5 flex items-center gap-4 hover:shadow-md hover:shadow-violet-50 transition-all">
              <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trending Products ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mb-6 sm:mb-10">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-violet-100 p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-indigo-950" style={{ fontFamily: 'Poppins, sans-serif' }}>
                🔥 Trending Right Now
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Toys families are loving across India</p>
            </div>
            <Link to="/shop" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shrink-0 whitespace-nowrap">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) :
              trending.map(prod => <ProductCard key={prod._id} product={prod} />)}
          </div>
        </div>
      </section>

      {/* ── Feature Spotlight ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mb-6 sm:mb-10">
        <div className="bg-gradient-to-br from-violet-700 to-purple-800 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-12 flex flex-col md:flex-row items-center gap-5 sm:gap-8 shadow-xl shadow-violet-200 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative z-10 max-w-md text-white">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">
              ✨ Featured Collection
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              MagConstruct Magnetic Building Tiles
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              STEM-approved modular magnetic tiles that foster spatial reasoning, creative thinking, and structural geometry. Non-toxic ABS with heavy-duty copper rivets.
            </p>
            <Link
              to="/shop?category=building-blocks"
              className="inline-flex items-center gap-2 bg-white text-violet-800 font-bold text-sm px-6 py-3 rounded-2xl hover:bg-violet-50 transition-colors shadow-lg"
            >
              Explore Kits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative z-10 w-full md:w-80 aspect-[16/10] sm:aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl shrink-0">
            <img
              src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=600"
              alt="Feature"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ── Best Sellers ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mb-6 sm:mb-10">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-violet-100 p-4 sm:p-6 md:p-8 shadow-sm">
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-indigo-950" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ⭐ Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Top-rated by parents and educators</p>
            </div>
            <Link to="/shop" className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-violet-700 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shrink-0 whitespace-nowrap">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) :
              bestSellers.map(prod => <ProductCard key={prod._id} product={prod} />)}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mb-8 sm:mb-12">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-indigo-950" style={{ fontFamily: 'Poppins, sans-serif' }}>
            💬 What Parents Say
          </h2>
          <p className="text-sm text-gray-500 mt-1">Real reviews from families who shop with ToyBox</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {REVIEWS.map(rev => (
            <div key={rev.id} className="bg-white rounded-2xl border border-violet-100 p-6 hover:shadow-md hover:shadow-violet-50 transition-all flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array(rev.rating).fill(0).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">"{rev.comment}"</p>
              <div className="flex items-center gap-3 border-t border-violet-50 pt-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {rev.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{rev.name}</p>
                  <p className="text-xs text-gray-400">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 mb-8 sm:mb-12">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-12 text-center shadow-xl shadow-amber-100">
          <Sparkles className="w-10 h-10 text-amber-900/50 mx-auto mb-3" />
          <h2 className="text-xl sm:text-2xl font-black text-amber-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Exclusive Deals, Just for You
          </h2>
          <p className="text-amber-800/70 text-sm mb-6">Join 50,000+ parents getting weekly toy deals, parenting tips &amp; early sale access.</p>

          {newsletterSuccess ? (
            <div className="flex flex-col items-center gap-3 bg-white/30 backdrop-blur-sm rounded-2xl px-8 py-5 max-w-md mx-auto">
              <span className="text-4xl">🎉</span>
              <p className="text-amber-900 font-bold text-base">You're on the list!</p>
              <p className="text-amber-800/70 text-sm">Check your inbox for exclusive deals &amp; early sale alerts.</p>
              <button
                onClick={() => setNewsletterSuccess(false)}
                className="text-xs text-amber-900/60 hover:text-amber-900 underline mt-1"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
                className="flex-1 px-5 py-3 rounded-2xl outline-none text-sm bg-white/90 placeholder-amber-700/50 font-medium text-amber-900 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="px-6 py-3 bg-amber-900 hover:bg-amber-950 disabled:opacity-70 text-white font-bold text-sm rounded-2xl transition-colors whitespace-nowrap flex items-center justify-center gap-2 min-w-[140px]"
              >
                {newsletterLoading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Subscribing...</>
                ) : (
                  'Subscribe Free 🎁'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

    </div>
  );
}
