import express from 'express';
import { 
  getProductReviews, 
  createProductReview, 
  getAllReviews, 
  deleteReview 
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createProductReview)
  .get(protect, admin, getAllReviews);

router.get('/product/:productId', getProductReviews);
router.delete('/:id', protect, deleteReview);

export default router;
