import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { generateInvoicePDF } from '../utils/invoiceGenerator.js';

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
      razorpaySignature
    });

    const createdOrder = await order.save();

    // Clear user's cart
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

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
      order.orderStatus = orderStatus || order.orderStatus;
      if (paymentStatus) {
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
