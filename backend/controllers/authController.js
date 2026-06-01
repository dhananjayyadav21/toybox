import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';
import { getOtpEmailHtml } from '../utils/emailTemplate.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6-digit OTP code for verification
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Auto-verify easy sandbox test email, otherwise normal verification flow
    const isTest = email.includes('admin@toybox.com') || email.includes('test@');
    const isVerified = isTest ? true : false;

    const user = await User.create({
      name,
      email,
      mobile,
      password,
      isVerified,
      verificationToken: isVerified ? undefined : verificationToken,
      role: email.includes('admin@toybox.com') ? 'admin' : 'user'
    });

    if (user) {
      if (!isVerified) {
        // Send email verification OTP
        await sendEmail({
          email: user.email,
          subject: 'Welcome to ToyBox - Verify Your Email',
          text: `Dear ${user.name},\n\nThank you for registering at ToyBox. Please verify your email by entering the following 6-digit OTP code:\n\n⭐ Verification Code: ${verificationToken}\n\nHappy Shopping!\n\nBest regards,\nTeam ToyBox`,
          html: getOtpEmailHtml({
            userName: user.name,
            title: 'Verify Your ToyBox Account',
            description: 'Thank you for choosing ToyBox! To verify your email address and activate your premium club account, please use the 6-digit OTP code below:',
            code: verificationToken,
            actionLabel: 'Account Verification OTP',
            codeColor: '#2874F0'
          })
        });
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        message: isVerified ? 'Registration successful.' : 'Verification code sent to your email.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (user.verificationToken !== code) {
      return res.status(400).json({ message: 'Invalid verification OTP code' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isVerified: user.isVerified,
      addresses: user.addresses,
      token: generateToken(user._id),
      message: 'Email successfully verified! Logged in.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = verificationToken;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'ToyBox Account - Resend Verification OTP',
      text: `Dear ${user.name},\n\nYour new ToyBox verification OTP is: ${verificationToken}\n\nBest regards,\nTeam ToyBox`,
      html: getOtpEmailHtml({
        userName: user.name,
        title: 'New Account Verification OTP',
        description: 'Here is your requested 6-digit account verification OTP code to complete your registration:',
        code: verificationToken,
        actionLabel: 'Verification OTP Code',
        codeColor: '#2874F0'
      })
    });

    res.json({ message: 'Verification OTP code resent successfully to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if email verified
      if (!user.isVerified) {
        return res.status(403).json({ 
          isVerified: false, 
          email: user.email,
          message: 'Please verify your email address to log in. Verification code has been sent to your mail.' 
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        addresses: user.addresses,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - send 6-digit OTP code to email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }
    
    // Generate 6-digit numeric reset code/token
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration
    await user.save();
    
    await sendEmail({
      email: user.email,
      subject: 'ToyBox Account - Reset Password Request',
      text: `Dear ${user.name},\n\nYou requested to reset your account password. Please enter the following 6-digit Reset OTP on the reset password screen:\n\n⭐ Reset OTP Code: ${resetCode}\n\nThis OTP is valid for 1 hour.\n\nBest regards,\nTeam ToyBox`,
      html: getOtpEmailHtml({
        userName: user.name,
        title: 'Reset Your ToyBox Password',
        description: 'You requested a password reset for your ToyBox account. Please enter the following 6-digit Reset OTP on the reset screen:',
        code: resetCode,
        actionLabel: 'Reset Password OTP',
        codeColor: '#FB641B'
      })
    });
    
    res.json({ 
      message: 'Password reset OTP simulated/sent successfully! Check your email.',
      resetToken: resetCode // Send for sandbox testing convenience!
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  try {
    const user = await User.findOne({ 
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset OTP code' });
    }
    
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    res.status(400).json({ message: 'Error resetting password' });
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/address
// @access  Private
export const addAddress = async (req, res) => {
  const { street, city, state, postalCode, country } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.addresses.push({ street, city, state, postalCode, country });
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/address/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
