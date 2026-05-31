import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Premium mock data fallbacks in case backend is loading or unavailable
const MOCK_CATEGORIES = [
  { _id: 'c1', name: 'Educational Toys', slug: 'educational-toys', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800' },
  { _id: 'c2', name: 'Action Figures', slug: 'action-figures', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&q=80&w=800' },
  { _id: 'c3', name: 'Remote Control Toys', slug: 'remote-control-toys', image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800' },
  { _id: 'c4', name: 'Dolls', slug: 'dolls', image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=800' },
  { _id: 'c5', name: 'Building Blocks', slug: 'building-blocks', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800' },
  { _id: 'c6', name: 'Outdoor Toys', slug: 'outdoor-toys', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800' },
  { _id: 'c7', name: 'Baby Toys', slug: 'baby-toys', image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=800' },
  { _id: 'c8', name: 'Puzzle Games', slug: 'puzzle-games', image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800' }
];

const MOCK_PRODUCTS = [
  {
    _id: 'p1',
    name: 'Smart Wooden Shape Matcher',
    slug: 'smart-wooden-shape-matcher',
    description: 'A beautifully polished shape-sorting clock and board. Helps develop fine-motor skills, spatial reasoning, and color identification for toddlers using completely non-toxic organic paint.',
    brand: 'EduLearn',
    category: { _id: 'c1', name: 'Educational Toys', slug: 'educational-toys' },
    ageGroup: '0-2 Years',
    price: 1299,
    discountPrice: 999,
    stock: 25,
    sku: 'ED-SHP-001',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviewsCount: 14,
    status: 'active'
  },
  {
    _id: 'p2',
    name: 'Iron Guard Mecha Robot',
    slug: 'iron-guard-mecha-robot',
    description: 'A fully articulated mecha defender action figure. Comes with interchangeable power-shields, LED glowing chest core, and voice modules saying protective commands.',
    brand: 'CyberForce',
    category: { _id: 'c2', name: 'Action Figures', slug: 'action-figures' },
    ageGroup: '6-8 Years',
    price: 1899,
    discountPrice: 1599,
    stock: 40,
    sku: 'AC-RBT-002',
    images: [
      'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.5,
    reviewsCount: 22,
    status: 'active'
  },
  {
    _id: 'p3',
    name: 'RC High-Speed Desert Buggy 4x4',
    slug: 'rc-high-speed-desert-buggy-4x4',
    description: 'An all-terrain extreme speed buggy. Featuring heavy-duty shock absorbers, dual-power engines reaching speeds up to 25 km/h, and an ergonomic 2.4GHz remote controller.',
    brand: 'TurboTracks',
    category: { _id: 'c3', name: 'Remote Control Toys', slug: 'remote-control-toys' },
    ageGroup: '9+ Years',
    price: 3499,
    discountPrice: 2999,
    stock: 12,
    sku: 'RC-BUG-003',
    images: [
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    reviewsCount: 31,
    status: 'active'
  },
  {
    _id: 'p4',
    name: 'Handcrafted Cotton Crochet Doll',
    slug: 'handcrafted-cotton-crochet-doll',
    description: 'A highly delicate organic doll lovingly hand-knitted from GOTS certified pure Egyptian cotton thread. Soft, safe for skin, and comes with two dress outfits.',
    brand: 'EcoDolls',
    category: { _id: 'c4', name: 'Dolls', slug: 'dolls' },
    ageGroup: '3-5 Years',
    price: 1499,
    discountPrice: 1199,
    stock: 8,
    sku: 'DL-COT-004',
    images: [
      'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.7,
    reviewsCount: 19,
    status: 'active'
  },
  {
    _id: 'p5',
    name: 'Mega Magnetic Building Tiles (100pcs)',
    slug: 'mega-magnetic-building-tiles-100pcs',
    description: 'Unleash brilliant architectural designs with 100 vibrant colorful magnetic triangles, windows, and squares. Engineered with strong premium magnets and rivet-protected seams.',
    brand: 'MagConstruct',
    category: { _id: 'c5', name: 'Building Blocks', slug: 'building-blocks' },
    ageGroup: '3-5 Years',
    price: 2499,
    discountPrice: 1999,
    stock: 50,
    sku: 'BL-MAG-005',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    reviewsCount: 45,
    status: 'active'
  },
  {
    _id: 'p6',
    name: 'AeroGlide Folding Kick-Scooter',
    slug: 'aeroglide-folding-kick-scooter',
    description: 'A light-weight aluminum folding scooter with bright light-up polyurethane wheels, rear brake safety guard, and 3-level adjustable handlebars. Perfect for outdoor fun.',
    brand: 'AeroSports',
    category: { _id: 'c6', name: 'Outdoor Toys', slug: 'outdoor-toys' },
    ageGroup: '6-8 Years',
    price: 2999,
    discountPrice: 2499,
    stock: 15,
    sku: 'OD-SCT-006',
    images: [
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.6,
    reviewsCount: 9,
    status: 'active'
  },
  {
    _id: 'p7',
    name: 'Organic Cotton Soft Rattle Set',
    slug: 'organic-cotton-soft-rattle-set',
    description: 'A set of three lovely sensory rattles (Bunny, Bear, and Ring). Features soft organic bells inside to stimulate baby hearing, and comfortable grip circles made from smooth beechwood.',
    brand: 'BabyLuxe',
    category: { _id: 'c7', name: 'Baby Toys', slug: 'baby-toys' },
    ageGroup: '0-2 Years',
    price: 899,
    discountPrice: 699,
    stock: 30,
    sku: 'BB-RTL-007',
    images: [
      'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviewsCount: 17,
    status: 'active'
  },
  {
    _id: 'p8',
    name: 'Wooden World Map Jigsaw Puzzle',
    slug: 'wooden-world-map-jigsaw-puzzle',
    description: 'Learn continental borders, major oceans, and global animal habitats. Crafted from high-density eco-wood, precision laser cut to ensure easy snaps without splits.',
    brand: 'PuzzleMasters',
    category: { _id: 'c8', name: 'Puzzle Games', slug: 'puzzle-games' },
    ageGroup: '9+ Years',
    price: 1199,
    discountPrice: 899,
    stock: 22,
    sku: 'PZ-MAP-008',
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.4,
    reviewsCount: 11,
    status: 'active'
  }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Set Auth headers
  const getAuthHeaders = () => {
    return {
      headers: {
        Authorization: user?.token ? `Bearer ${user.token}` : '',
      },
    };
  };

  // Toast Engine
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Fetch Catalog
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/categories')
      ]);
      
      if (prodRes.data && prodRes.data.products) {
        setProducts(prodRes.data.products);
      }
      if (catRes.data) {
        setCategories(catRes.data);
      }
      setIsOfflineMode(false);
    } catch (err) {
      console.warn('Backend API is not fully running yet. Initializing premium offline sandbox mode!');
      setIsOfflineMode(true);
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Cart and Wishlist once logged in
  useEffect(() => {
    if (user) {
      if (!isOfflineMode) {
        axios.get('/api/cart', getAuthHeaders())
          .then(res => setCart(res.data))
          .catch(err => console.log('Cart fetch failed'));
        
        axios.get('/api/wishlist', getAuthHeaders())
          .then(res => setWishlist(res.data))
          .catch(err => console.log('Wishlist fetch failed'));
      } else {
        // Load from localstorage in offline mode
        const savedCart = localStorage.getItem(`cart_${user._id}`);
        const savedWishlist = localStorage.getItem(`wishlist_${user._id}`);
        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      }
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user, isOfflineMode]);

  // Save cart/wishlist offline changes
  useEffect(() => {
    if (user && isOfflineMode) {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(cart));
    }
  }, [cart, user, isOfflineMode]);

  useEffect(() => {
    if (user && isOfflineMode) {
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(wishlist));
    }
  }, [wishlist, user, isOfflineMode]);

  // Auth Operations
  const login = async (email, password) => {
    try {
      if (!isOfflineMode) {
        const res = await axios.post('/api/auth/login', { email, password });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        showToast(`Welcome back, ${res.data.name}! 👋`);
        return { success: true };
      } else {
        // Offline Auth Mocking
        const role = email === 'admin@toybox.com' ? 'admin' : 'user';
        const name = email === 'admin@toybox.com' ? 'ToyBox Administrator' : 'Dhananjay Kumar';
        const mockUser = {
          _id: role === 'admin' ? 'u_admin' : 'u_test',
          name,
          email,
          mobile: '9876543210',
          role,
          token: 'mock_jwt_token_for_sandbox',
          addresses: [{
            _id: 'a1',
            street: '123 Joy Street, Vasant Kunj',
            city: 'New Delhi',
            state: 'Delhi',
            postalCode: '110070',
            country: 'India',
            isDefault: true
          }]
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        showToast(`Welcome back to Sandbox, ${name}! 👋`);
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const register = async (name, email, mobile, password) => {
    try {
      if (!isOfflineMode) {
        const res = await axios.post('/api/auth/register', { name, email, mobile, password });
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        showToast('Registration successful! Welcome to ToyBox! 🎈');
        return { success: true };
      } else {
        const mockUser = {
          _id: 'u_' + Math.random().toString(36).substring(2, 9),
          name,
          email,
          mobile,
          role: 'user',
          token: 'mock_jwt_token_for_sandbox',
          addresses: []
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        showToast('Sandbox Registration successful! Welcome to ToyBox! 🎈');
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    showToast('Logged out successfully. See you soon! 😊');
  };

  // Cart Operations
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      showToast('Please log in to add products to your cart!', 'error');
      return;
    }

    try {
      if (!isOfflineMode) {
        const res = await axios.post('/api/cart/add', { productId, quantity }, getAuthHeaders());
        setCart(res.data);
      } else {
        const product = products.find(p => p._id === productId);
        setCart(prev => {
          const exists = prev.find(item => item.product._id === productId);
          if (exists) {
            return prev.map(item => 
              item.product._id === productId 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prev, { product, quantity }];
          }
        });
      }
      showToast('Added to Cart! 🛒');
    } catch (error) {
      showToast('Failed to add item to cart', 'error');
    }
  };

  const updateCartQty = async (productId, quantity) => {
    try {
      if (!isOfflineMode) {
        const res = await axios.put('/api/cart/update', { productId, quantity }, getAuthHeaders());
        setCart(res.data);
      } else {
        setCart(prev => 
          prev.map(item => 
            item.product._id === productId ? { ...item, quantity } : item
          ).filter(item => item.quantity > 0)
        );
      }
      showToast('Cart updated!');
    } catch (error) {
      showToast('Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (!isOfflineMode) {
        const res = await axios.delete(`/api/cart/remove/${productId}`, getAuthHeaders());
        setCart(res.data);
      } else {
        setCart(prev => prev.filter(item => item.product._id !== productId));
      }
      showToast('Removed from Cart! 🗑️');
    } catch (error) {
      showToast('Failed to remove item', 'error');
    }
  };

  // Wishlist Operations
  const toggleWishlist = async (productId) => {
    if (!user) {
      showToast('Please log in to manage your wishlist!', 'error');
      return;
    }

    const isInWishlist = wishlist.some(item => (item._id || item) === productId);

    try {
      if (!isOfflineMode) {
        if (isInWishlist) {
          const res = await axios.delete(`/api/wishlist/remove/${productId}`, getAuthHeaders());
          setWishlist(res.data);
          showToast('Removed from Wishlist! 🤍');
        } else {
          const res = await axios.post('/api/wishlist/add', { productId }, getAuthHeaders());
          setWishlist(res.data);
          showToast('Added to Wishlist! ❤️');
        }
      } else {
        const product = products.find(p => p._id === productId);
        if (isInWishlist) {
          setWishlist(prev => prev.filter(item => item._id !== productId));
          showToast('Removed from Wishlist! 🤍');
        } else {
          setWishlist(prev => [...prev, product]);
          showToast('Added to Wishlist! ❤️');
        }
      }
    } catch (error) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  const addAddress = async (addr) => {
    try {
      if (!isOfflineMode) {
        const res = await axios.post('/api/auth/address', addr, getAuthHeaders());
        setUser(prev => {
          const updated = { ...prev, addresses: res.data };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      } else {
        const newAddress = { ...addr, _id: 'addr_' + Math.random().toString(36).substring(2, 9) };
        setUser(prev => {
          const updated = { ...prev, addresses: [...prev.addresses, newAddress] };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
      showToast('Address added successfully! 🏠');
    } catch (error) {
      showToast('Failed to add address', 'error');
    }
  };

  const deleteAddress = async (id) => {
    try {
      if (!isOfflineMode) {
        const res = await axios.delete(`/api/auth/address/${id}`, getAuthHeaders());
        setUser(prev => {
          const updated = { ...prev, addresses: res.data };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      } else {
        setUser(prev => {
          const updated = { ...prev, addresses: prev.addresses.filter(a => a._id !== id) };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
      showToast('Address removed! 🏠');
    } catch (error) {
      showToast('Failed to remove address', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        categories,
        cart,
        wishlist,
        toasts,
        loading,
        isOfflineMode,
        showToast,
        login,
        register,
        logout,
        addToCart,
        updateCartQty,
        removeFromCart,
        toggleWishlist,
        addAddress,
        deleteAddress,
        fetchData,
        getAuthHeaders
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
