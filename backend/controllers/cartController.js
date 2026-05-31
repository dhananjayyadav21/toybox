import User from '../models/User.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price discountPrice images stock status'
    });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    
    // Return populated cart
    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price discountPrice images stock status'
    });
    
    res.json(populatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      if (Number(quantity) <= 0) {
        user.cart.splice(cartItemIndex, 1);
      } else {
        user.cart[cartItemIndex].quantity = Number(quantity);
      }
      await user.save();
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price discountPrice images stock status'
    });

    res.json(populatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cart = user.cart.filter(
      item => item.product.toString() !== req.params.productId
    );

    await user.save();

    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name price discountPrice images stock status'
    });

    res.json(populatedUser.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
