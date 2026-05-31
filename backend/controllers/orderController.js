import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../utils/invoiceGenerator.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getOrderInvoiceEmailHtml, getOtpEmailHtml } from '../utils/emailTemplate.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { 
    products, 
    shippingAddress, 
    paymentMethod, 
    paymentStatus, 
    totalAmount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: 'No products in order' });
  }

  try {
    // Check and deduct stock for each product
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      user: req.user._id,
      products,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : paymentStatus || 'Pending',
      totalAmount,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      statusHistory: [{
        status: 'Pending',
        comment: 'Order placed successfully',
        createdAt: new Date()
      }]
    });

    const createdOrder = await order.save();

    // Clear user's cart
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    // Fetch details to send email
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name price'
      });

    if (populatedOrder && populatedOrder.user) {
      const itemsList = populatedOrder.products.map(item => 
        `• ${item.product?.name || 'Toy'} x ${item.quantity} (₹${item.price})`
      ).join('\n');

      const itemsHtml = populatedOrder.products.map(item => `
        <tr style="border-bottom: 1px solid #edf2f7;">
          <td style="padding: 12px; font-size: 13px; color: #2d3748;">${item.product?.name || 'Toy'}</td>
          <td style="padding: 12px; font-size: 13px; color: #2d3748; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; font-size: 13px; color: #2d3748; text-align: right;">₹${item.price}</td>
        </tr>
      `).join('');

      await sendEmail({
        email: populatedOrder.user.email,
        subject: `ToyBox Order Confirmed! Order #${populatedOrder._id}`,
        text: `Dear ${populatedOrder.user.name},\n\nThank you for shopping at ToyBox! Your order has been placed successfully.\n\nOrder Details:\nOrder ID: ${populatedOrder._id}\nTotal Amount: ₹${populatedOrder.totalAmount}\nPayment Method: ${populatedOrder.paymentMethod}\n\nItems:\n${itemsList}\n\nWe will ship your developmental toys shortly!\n\nBest regards,\nTeam ToyBox`,
        html: getOrderInvoiceEmailHtml({
          order: populatedOrder,
          userName: populatedOrder.user.name,
          itemsHtml
        })
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: 'products.product',
        select: 'name images price'
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate({
        path: 'products.product',
        select: 'name images price'
      });

    if (order) {
      // Check authorization (must be order owner or admin)
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Validate payment for online orders before confirming/packing/shipping
      if (orderStatus && orderStatus !== 'Pending' && orderStatus !== 'Cancelled') {
        const currentPaymentStatus = paymentStatus || order.paymentStatus;
        if (currentPaymentStatus === 'Pending' && order.paymentMethod !== 'COD') {
          return res.status(400).json({ 
            message: 'Unpaid online orders cannot be confirmed, packed, or shipped before payment is successful!' 
          });
        }
      }

      // Log status transition inside statusHistory
      if (orderStatus && orderStatus !== order.orderStatus) {
        if (!order.statusHistory) {
          order.statusHistory = [];
        }
        let historyStatus = orderStatus;
        let commentText = `Status updated to ${orderStatus}`;
        if (order.orderStatus === 'Cancelled' && orderStatus === 'Pending') {
          historyStatus = 'Re-activated';
          commentText = 'Order tracking restarted & re-activated by seller';
        }
        order.statusHistory.push({
          status: historyStatus,
          comment: commentText,
          createdAt: new Date()
        });
      }

      order.orderStatus = orderStatus || order.orderStatus;
      if (paymentStatus) {
        // Block manual paymentStatus update for online Razorpay orders
        if (order.paymentMethod === 'Razorpay' && paymentStatus !== order.paymentStatus) {
          return res.status(400).json({ 
            message: 'Settlement for online Razorpay orders is handled automatically by the gateway and cannot be modified manually!' 
          });
        }
        order.paymentStatus = paymentStatus;
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name price images'
      })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download order invoice as PDF
// @route   GET /api/orders/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        select: 'name price'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to download this invoice' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

    generateInvoicePDF(order, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send delivery verification OTP to buyer
// @route   POST /api/orders/:id/send-otp
// @access  Private
export const sendDeliveryOtp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email mobile');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate 6-digit OTP code for delivery
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    order.deliveryOtp = otp;
    order.deliveryOtpExpires = Date.now() + 3600000; // 1 hour expiration
    await order.save();

    // Send email with OTP code to buyer
    await sendEmail({
      email: order.user.email,
      subject: `ToyBox Order Delivery OTP - #${order._id}`,
      text: `Dear ${order.user.name},\n\nYour package is arriving! To verify and confirm the delivery of your ToyBox order #${order._id}, please share the following OTP code with the agent:\n\n⭐ Delivery Verification OTP: ${otp}\n\nBest regards,\nTeam ToyBox`,
      html: getOtpEmailHtml({
        userName: order.user.name,
        title: 'Delivery Handover OTP Code',
        description: `Your package has arrived! To verify and confirm the delivery of your ToyBox order #${order._id}, please share the 6-digit OTP code below with our delivery partner:`,
        code: otp,
        actionLabel: 'Secure Delivery OTP',
        codeColor: '#388E3C'
      })
    });

    res.json({ 
      success: true, 
      message: 'Delivery OTP sent to customer email successfully!',
      deliveryOtp: otp // Send back for sandbox testing convenience!
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm delivery with OTP verification
// @route   POST /api/orders/:id/verify-otp
// @access  Private
export const confirmDeliveryWithOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.deliveryOtp) {
      return res.status(400).json({ message: 'No OTP generated for this order yet. Please generate OTP first.' });
    }

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ message: 'Invalid delivery OTP code.' });
    }

    if (order.deliveryOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Delivery OTP code has expired. Please request a new OTP.' });
    }

    order.orderStatus = 'Delivered';
    order.paymentStatus = 'Paid'; // Verified delivery clears COD payments
    order.isDeliveryOtpVerified = true;
    order.deliveryOtp = undefined;
    order.deliveryOtpExpires = undefined;

    // Log Delivered status inside statusHistory
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: 'Delivered',
      comment: 'Delivery verified via secure doorstep OTP matching',
      createdAt: new Date()
    });
    
    const updatedOrder = await order.save();
    res.json({ 
      success: true, 
      order: updatedOrder, 
      message: 'OTP verified successfully! Order marked as Delivered.' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
