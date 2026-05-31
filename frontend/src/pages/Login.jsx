import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Key, Mail, Phone, User, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { 
    user, 
    login, 
    register, 
    verifyOtp, 
    resendOtp, 
    resetPassword, 
    showToast, 
    isOfflineMode 
  } = useAppContext();
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  // Auth Modes: 'login', 'register', 'forgot', 'verify', 'reset'
  const [authMode, setAuthMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        const res = await login(email, password);
        if (res && res.isVerified === false) {
          showToast('Please check your mail for verification OTP.', 'warning');
          setAuthMode('verify');
        }
      } else if (authMode === 'register') {
        const res = await register(name, email, mobile, password);
        if (res && res.isVerified === false) {
          setAuthMode('verify');
        }
      } else if (authMode === 'forgot') {
        if (!isOfflineMode) {
          const res = await axios.post('/api/auth/forgot-password', { email });
          showToast('Password reset code simulated/sent successfully! Check your inbox.', 'success');
          // If in sandbox mode, preset the token for ease
          if (res.data?.resetToken) {
            setOtpCode(res.data.resetToken);
          }
        } else {
          showToast('Sandbox simulation: A password reset OTP has been dispatched to your mailbox! 📬');
        }
        setAuthMode('reset');
      } else if (authMode === 'verify') {
        await verifyOtp(email, otpCode);
      } else if (authMode === 'reset') {
        if (password !== confirmPassword) {
          showToast('Passwords do not match!', 'error');
          setLoading(false);
          return;
        }
        await resetPassword(email, otpCode, password);
        setAuthMode('login');
      }
    } catch (err) {
      // If server returns status 403 (unverified user)
      if (err.response?.status === 403 && err.response?.data?.email) {
        setEmail(err.response.data.email);
        setAuthMode('verify');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp(email);
    } catch (err) {
      // Handled in Context
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
        className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.05)] relative text-left"
      >
        
        {/* Sparkles decoration */}
        <Sparkles className="w-8 h-8 text-[#FB641B] absolute -top-4 -left-4 animate-pulse" />
        <Sparkles className="w-6 h-6 text-[#2874F0] absolute -bottom-3 -right-3" />

        {/* Heading */}
        <div className="text-center mb-6">
          <span className="text-3xl">🧸</span>
          <h2 className="text-xl font-bold text-[#212121] mt-2 font-sans">
            {authMode === 'login' && 'Welcome to ToyBox'}
            {authMode === 'register' && 'Join the ToyBox Club'}
            {authMode === 'forgot' && 'Reset My Password'}
            {authMode === 'verify' && 'Verify Your Email'}
            {authMode === 'reset' && 'Create New Password'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
            {authMode === 'login' && 'Log in to manage carts, checkout toys, and track orders.'}
            {authMode === 'register' && 'Create an account to accumulate reward points.'}
            {authMode === 'forgot' && 'Enter your email address to receive a 6-digit Reset OTP.'}
            {authMode === 'verify' && `We've sent a 6-digit verification code to ${email}`}
            {authMode === 'reset' && 'Complete the password reset using the 6-digit OTP code.'}
          </p>
        </div>

        {/* Preset accounts highlights */}
        {authMode === 'login' && (
          <div className="bg-slate-50 border border-slate-200 rounded-[6px] p-4 mb-6 text-xs text-slate-500 font-semibold flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-extrabold mb-0.5">
              <AlertCircle className="w-4 h-4 text-[#2874F0] shrink-0" /> Fast Sandbox Access Presets:
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => loadPreset('user')}
                className="flex-1 py-2 bg-white border border-slate-250 hover:bg-slate-100 rounded-[6px] font-bold transition-all text-slate-700 text-[10px] uppercase tracking-wider shadow-sm outline-none"
              >
                Test Customer
              </button>
              <button 
                type="button"
                onClick={() => loadPreset('admin')}
                className="flex-1 py-2 bg-white border border-slate-250 hover:bg-slate-100 rounded-[6px] font-bold transition-all text-slate-700 text-[10px] uppercase tracking-wider shadow-sm outline-none"
              >
                Test Admin
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center font-bold">Password is `password123` for presets.</p>
          </div>
        )}

        {/* Main form handler */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-bold text-slate-600">
          
          <AnimatePresence mode="wait">
            {authMode === 'register' && (
              <motion.div
                key="register-fields"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-[6px] py-3 pl-10 pr-4 outline-none focus:bg-white focus:border-[#2874F0] transition-all text-slate-800"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-[6px] py-3 pl-10 pr-4 outline-none focus:bg-white focus:border-[#2874F0] transition-all text-slate-800"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email input (used in all modes except OTP verification if email is preset) */}
          {authMode !== 'verify' && (
            <div>
              <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="E.g. user@toybox.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[6px] py-3 pl-10 pr-4 outline-none focus:bg-white focus:border-[#2874F0] transition-all text-slate-800"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          {/* OTP Code input field for Verification or Reset */}
          {(authMode === 'verify' || authMode === 'reset') && (
            <div>
              <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">6-Digit OTP Code</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP code..."
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[6px] py-3 pl-10 pr-4 outline-none focus:bg-white focus:border-[#2874F0] tracking-[4px] font-extrabold text-center text-sm transition-all text-slate-850 placeholder:tracking-normal placeholder:font-semibold"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
              {authMode === 'verify' && (
                <div className="flex justify-end mt-1 select-none">
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    className="text-[10px] text-[#2874F0] hover:underline"
                  >
                    Resend Verification OTP?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Password fields (Login, Register, Reset) */}
          {(authMode === 'login' || authMode === 'register' || authMode === 'reset') && (
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <label className="text-slate-400 uppercase tracking-wider text-[9px] font-black">
                  {authMode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {authMode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setAuthMode('forgot')}
                    className="text-[10px] text-[#FB641B] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[6px] py-3 pl-10 pr-10 outline-none focus:bg-white focus:border-[#2874F0] transition-all text-slate-800"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-450 hover:text-slate-600 outline-none"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password (Reset Password Mode) */}
          {authMode === 'reset' && (
            <div>
              <label className="mb-1 text-slate-400 block uppercase tracking-wider text-[9px] font-black">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[6px] py-3 pl-10 pr-10 outline-none focus:bg-white focus:border-[#2874F0] transition-all text-slate-800"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-455 hover:text-slate-600 outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#2874F0] hover:bg-[#1a5ebf] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-[6px] w-full mt-2 flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all outline-none"
          >
            {loading ? 'Processing...' : (
              <>
                {authMode === 'login' && 'Sign In'}
                {authMode === 'register' && 'Register Account'}
                {authMode === 'forgot' && 'Send Reset OTP'}
                {authMode === 'verify' && 'Verify Account'}
                {authMode === 'reset' && 'Update Password'}
              </>
            )}
          </button>

        </form>

        {/* Footer toggles */}
        <div className="border-t border-slate-100 mt-6 pt-4 text-center text-[11px] text-slate-450 font-bold">
          {authMode === 'login' && (
            <p>
              New to ToyBox?{' '}
              <button onClick={() => setAuthMode('register')} className="text-[#2874F0] hover:underline font-extrabold outline-none">
                Register Club Account
              </button>
            </p>
          )}
          {authMode === 'register' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => setAuthMode('login')} className="text-[#2874F0] hover:underline font-extrabold outline-none">
                Sign In Instead
              </button>
            </p>
          )}
          {(authMode === 'forgot' || authMode === 'verify' || authMode === 'reset') && (
            <button onClick={() => setAuthMode('login')} className="text-[#2874F0] hover:underline font-extrabold outline-none">
              Back to Sign In
            </button>
          )}
        </div>

      </motion.div>

    </div>
  );
}
