import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Key, Mail, Phone, User, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { user, login, register, showToast, isOfflineMode } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  // Auth Modes: 'login', 'register', 'forgot'
  const [authMode, setAuthMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const [loading, setLoading] = useState(false);

  // If already logged in, redirect away
  useEffect(() => {
    if (user) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else if (authMode === 'register') {
        await register(name, email, mobile, password);
      } else {
        // Forgot Password flow
        if (!isOfflineMode) {
          const res = await axios.post('/api/auth/forgot-password', { email });
          showToast('Password reset link simulated in server console! check backend terminal logs.', 'success');
        } else {
          showToast('Sandbox simulation: A password reset link has been dispatched to your mailbox! 📬');
        }
        setAuthMode('login');
      }
    } catch (err) {
      // Toast message already handled in Context!
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (type) => {
    if (type === 'admin') {
      setEmail('admin@toybox.com');
      setPassword('password123');
    } else {
      setEmail('user@toybox.com');
      setPassword('password123');
    }
    setAuthMode('login');
    showToast(`${type === 'admin' ? 'Administrator' : 'Customer'} preset loaded! Click Sign In.`);
  };

  return (
    <div className="pt-24 min-h-[85vh] flex items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 bg-slate-50/20">
      
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-100 p-8 rounded-[36px] shadow-[0_20px_50px_rgba(15,23,42,0.03)] relative text-left"
      >
        
        {/* Sparkles */}
        <Sparkles className="w-8 h-8 text-toy-coral absolute -top-4 -left-4 animate-bounce-slow" />
        <Sparkles className="w-6 h-6 text-toy-teal absolute -bottom-3 -right-3" />

        {/* Heading */}
        <div className="text-center mb-6">
          <span className="text-3xl">🧸</span>
          <h2 className="text-2xl font-black text-slate-850 mt-2 font-sans">
            {authMode === 'login' && 'Welcome to ToyBox'}
            {authMode === 'register' && 'Join the ToyBox Club'}
            {authMode === 'forgot' && 'Reset My Password'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
            {authMode === 'login' && 'Log in to manage carts, checkout toys, and track orders.'}
            {authMode === 'register' && 'Create an account to accumulate sandbox reward points.'}
            {authMode === 'forgot' && 'We will simulate sending a secret password override key.'}
          </p>
        </div>

        {/* Preset accounts highlights */}
        {authMode === 'login' && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6 text-xs text-slate-500 font-semibold flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-extrabold mb-0.5">
              <AlertCircle className="w-4 h-4 text-toy-purple shrink-0" /> Fast SandBox Access Presets:
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => loadPreset('user')}
                className="flex-1 py-1.5 bg-white border border-slate-150 hover:bg-slate-50 rounded-xl font-bold transition-all text-slate-700 text-[10px] uppercase tracking-wider"
              >
                Test Customer
              </button>
              <button 
                type="button"
                onClick={() => loadPreset('admin')}
                className="flex-1 py-1.5 bg-white border border-slate-150 hover:bg-slate-50 rounded-xl font-bold transition-all text-slate-700 text-[10px] uppercase tracking-wider"
              >
                Test Admin
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-bold">Password is `password123` for presets.</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-bold text-slate-655">
          
          <AnimatePresence mode="wait">
            {authMode === 'register' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="E.g. Dhananjay Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="E.g. 9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="E.g. user@toybox.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            </div>
          </div>

          {authMode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-slate-400 uppercase tracking-wider text-[9px] font-black">Password</label>
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('forgot')}
                    className="text-[10px] text-toy-coral hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter secret password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:bg-white focus:border-toy-teal transition-all text-slate-700"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl w-full mt-2 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            {loading ? 'Processing...' : (
              <>
                {authMode === 'login' && 'Sign In'}
                {authMode === 'register' && 'Register Account'}
                {authMode === 'forgot' && 'Reset My Password'}
              </>
            )}
          </button>

        </form>

        {/* Footer actions */}
        <div className="border-t border-slate-50 mt-6 pt-4 text-center text-[11px] text-slate-450 font-bold">
          {authMode === 'login' && (
            <p>
              New to ToyBox?{' '}
              <button onClick={() => setAuthMode('register')} className="text-toy-teal hover:underline font-extrabold">
                Register Club Account
              </button>
            </p>
          )}
          {authMode === 'register' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')} className="text-toy-teal hover:underline font-extrabold">
                Sign In Instead
              </button>
            </p>
          )}
          {authMode === 'forgot' && (
            <button onClick={() => setAuthMode('login')} className="text-toy-teal hover:underline font-extrabold">
              Back to Sign In
            </button>
          )}
        </div>

      </motion.div>

    </div>
  );
}
