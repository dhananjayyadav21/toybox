import Product from '../models/Product.js';
import Category from '../models/Category.js';

// @desc    Get all products with filters, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice, 
      ageGroup, 
      rating, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    const query = { status: 'active' };

    // Search query (case-insensitive regex)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category slug is not found, return empty set or try by ID
        if (category.match(/^[0-9a-fA-F]{24}$/)) {
          query.category = category;
        } else {
          return res.json({ products: [], page: 1, pages: 0, total: 0 });
        }
      }
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Age group filter
    if (ageGroup) {
      query.ageGroup = ageGroup;
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Sorting
    let sortQuery = { createdAt: -1 }; // default is latest
    if (sort) {
      if (sort === 'priceAsc') sortQuery = { price: 1 };
      else if (sort === 'priceDesc') sortQuery = { price: -1 };
      else if (sort === 'popular') sortQuery = { rating: -1, reviewsCount: -1 };
      else if (sort === 'latest') sortQuery = { createdAt: -1 };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(skip);

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { 
    name, 
    description, 
    category, 
    brand, 
    ageGroup, 
    price, 
    discountPrice, 
    stock, 
    sku, 
    images, 
    status 
  } = req.body;

  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const product = new Product({
      name,
      slug,
      description,
      category,
      brand,
      ageGroup,
      price,
      discountPrice: discountPrice || 0,
      stock,
      sku,
      images: images || ['https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800'],
      status: status || 'active'
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { 
    name, 
    description, 
    category, 
    brand, 
    ageGroup, 
    price, 
    discountPrice, 
    stock, 
    sku, 
    images, 
    status 
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      if (name) {
        product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      product.description = description || product.description;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.ageGroup = ageGroup || product.ageGroup;
      product.price = price !== undefined ? price : product.price;
      product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
      product.stock = stock !== undefined ? stock : product.stock;
      product.sku = sku || product.sku;
      product.images = images || product.images;
      product.status = status || product.status;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk Upload Products (Admin)
// @route   POST /api/products/bulk
// @access  Private/Admin
export const bulkUploadProducts = async (req, res) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ message: 'Invalid product list' });
  }

  try {
    const formattedProducts = products.map(prod => {
      const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return {
        ...prod,
        slug,
        images: prod.images || ['https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?auto=format&fit=crop&q=80&w=800']
      };
    });

    const inserted = await Product.insertMany(formattedProducts);
    res.status(201).json({ message: `${inserted.length} products uploaded successfully`, products: inserted });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
