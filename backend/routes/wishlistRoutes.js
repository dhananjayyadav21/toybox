import express from 'express';
import { 
  getWishlist, 
  addToWishlist, 
  removeFromWishlist 
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getWishlist);

router.route('/add')
  .post(protect, addToWishlist);

router.route('/remove/:productId')
  .delete(protect, removeFromWishlist);

export default router;
