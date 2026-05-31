import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// Initialize Razorpay conditionally with a warning if keys are missing
const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

const razorpay = hasRazorpayKeys 
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

if (!hasRazorpayKeys) {
  console.warn('⚠️ Razorpay API keys are missing in .env. Payment controller will run in SIMULATOR mode.');
}

// @desc    Create Razorpay order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  const { amount } = req.body; // amount is already in INR

  try {
    const options = {
      amount: Math.round(amount * 100), // amount in paisa
      currency: 'INR',
      receipt: `receipt_order_${Math.random().toString(36).substring(2, 9)}`,
    };

    if (razorpay) {
      // Real Razorpay Order
      const rzpOrder = await razorpay.orders.create(options);
      return res.json({
        success: true,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        mode: 'live'
      });
    } else {
      // Simulated Razorpay Order
      const mockOrderId = `order_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: options.amount,
        currency: options.currency,
        key: 'rzp_test_mock_key_123',
        mode: 'simulator',
        message: 'Running in Razorpay Simulator Mode'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  const { 
    razorpayOrderId, 
    razorpayPaymentId, 
    razorpaySignature,
    orderId // Local database Order ID
  } = req.body;

  try {
    let isValid = false;

    if (razorpay) {
      // Real Signature Verification
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');

      isValid = generatedSignature === razorpaySignature;
    } else {
      // Simulator Signature Verification (Accepts all simulator requests)
      isValid = razorpaySignature === 'mock_signature_approved';
    }

    if (isValid) {
      // Update order in database
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'Paid';
        order.razorpayOrderId = razorpayOrderId;
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        await order.save();
        
        return res.json({ success: true, message: 'Payment verified and saved successfully!' });
      } else {
        return res.status(404).json({ message: 'Order record not found' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature validation failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
