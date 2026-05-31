import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Footer() {
  const { categories } = useAppContext();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧸</span>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                ToyBox
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              We deliver premium, safe, and highly educational toys to spark infinite imagination and joy in every child's developmental years.
            </p>
            <div className="flex flex-col gap-2.5 text-sm font-semibold text-slate-400 mt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-toy-teal" /> Sector 62, Noida, UP, India
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4.5 h-4.5 text-toy-coral" /> +91 99999 88888
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4.5 h-4.5 text-toy-yellow" /> hello@toybox.com
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-white font-bold text-base mb-5 uppercase tracking-widest text-xs">
              Shop Categories
            </h4>
            <div className="grid grid-cols-1 gap-2.5 text-sm font-semibold text-slate-400">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat._id} to={`/shop?category=${cat.slug}`} className="hover:text-toy-teal transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-bold text-base mb-5 uppercase tracking-widest text-xs">
              Customer Support
            </h4>
            <div className="flex flex-col gap-2.5 text-sm font-semibold text-slate-400">
              <Link to="/shop" className="hover:text-toy-coral transition-colors">Browse Products</Link>
              <Link to="/cart" className="hover:text-toy-coral transition-colors">My Basket</Link>
              <Link to="/wishlist" className="hover:text-toy-coral transition-colors">My Wishlist</Link>
              <Link to="/dashboard" className="hover:text-toy-coral transition-colors">Order Tracking</Link>
              <span className="hover:text-toy-coral transition-colors cursor-pointer">Return & Exchange Policies</span>
              <span className="hover:text-toy-coral transition-colors cursor-pointer">Privacy Safeguards</span>
            </div>
          </div>

          {/* Secure Badges */}
          <div>
            <h4 className="text-white font-bold text-base mb-5 uppercase tracking-widest text-xs">
              Secure Checkout
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium mb-4">
              Integrated with Razorpay API, supporting secure instant cards, UPI, and Netbanking.
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
                Razorpay
              </span>
              <span className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
                UPI Secure
              </span>
              <span className="px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-300">
                COD Approved
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-bold gap-4">
          <p>© {new Date().getFullYear()} ToyBox Inc. All Rights Reserved.</p>
          <p className="flex items-center gap-1.5">
            Designed with <Heart className="w-3.5 h-3.5 text-toy-coral fill-current animate-pulse" /> for kids' imaginations.
          </p>
        </div>

      </div>
    </footer>
  );
}
