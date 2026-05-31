import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  updateOrderStatus, 
  getAllOrders,
  downloadInvoice
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.route('/myorders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, admin, updateOrderStatus);

router.route('/:id/invoice')
  .get(protect, downloadInvoice);

export default router;
