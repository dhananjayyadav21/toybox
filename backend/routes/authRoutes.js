import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  forgotPassword, 
  resetPassword,
  addAddress,
  deleteAddress
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getUserProfile);
router.post('/address', protect, addAddress);
router.delete('/address/:id', protect, deleteAddress);

export default router;
