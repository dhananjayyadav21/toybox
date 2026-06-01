import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Footer() {
  const { categories } = useAppContext();

  return (
    <footer className="bg-violet-950 text-violet-200 border-t border-violet-900 pt-14 pb-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-8 sm:pb-12 border-b border-violet-900">

          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-3xl leading-none">🧸</span>
              <span className="font-black text-2xl tracking-tight text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ToyBox
              </span>
            </div>
            <p className="text-sm text-violet-300/80 leading-relaxed">
              Premium, safe &amp; educational toys to spark infinite imagination and joy in every child's developmental years.
            </p>

            {/* Contact */}
            <div className="flex flex-col gap-2.5 text-sm text-violet-300/70 mt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-violet-300" />
                </div>
                Sector 62, Noida, UP, India
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-800 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-violet-300" />
                </div>
                +91 99999 88888
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-800 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-violet-300" />
                </div>
                hello@toybox.com
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-widest mb-5">
              Shop Categories
            </h4>
            <div className="flex flex-col gap-2.5">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat.slug}`}
                  className="flex items-center gap-1.5 text-sm text-violet-300/70 hover:text-white hover:translate-x-0.5 transition-all group"
                >
                  <ArrowRight className="w-3 h-3 text-violet-600 group-hover:text-violet-400 transition-colors" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-widest mb-5">
              Customer Support
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Browse Products', to: '/shop' },
                { label: 'My Cart', to: '/cart' },
                { label: 'My Wishlist', to: '/wishlist' },
                { label: 'Order Tracking', to: '/dashboard' },
                { label: 'Return & Exchange', to: '#' },
                { label: 'Privacy Policy', to: '#' },
              ].map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-1.5 text-sm text-violet-300/70 hover:text-white hover:translate-x-0.5 transition-all group"
                >
                  <ArrowRight className="w-3 h-3 text-violet-600 group-hover:text-violet-400 transition-colors" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Secure Checkout */}
          <div>
            <h4 className="text-white font-bold text-[11px] uppercase tracking-widest mb-5">
              Secure Checkout
            </h4>
            <p className="text-sm text-violet-300/70 leading-relaxed mb-5">
              Powered by Razorpay API — supporting instant cards, UPI &amp; Netbanking.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Razorpay', 'UPI Secure', 'COD Approved'].map(badge => (
                <span
                  key={badge}
                  className="px-3 py-1.5 bg-violet-900 rounded-xl border border-violet-700 text-xs font-bold text-violet-300"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Safety badge */}
            <div className="mt-5 flex items-center gap-2 text-sm text-violet-300/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              100% Genuine &amp; Safety Certified
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-violet-400/60 gap-3">
          <p>© {new Date().getFullYear()} ToyBox Inc. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-rose-400 fill-current animate-pulse" /> for kids' imaginations.
          </p>
        </div>

      </div>
    </footer>
  );
}
