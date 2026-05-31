import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';

dotenv.config();

const categoriesData = [
  {
    name: 'Educational Toys',
    slug: 'educational-toys',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=800',
    description: 'STEM development toys, chemistry kits, smart boards, and wooden shape matches.'
  },
  {
    name: 'Action Figures',
    slug: 'action-figures',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&q=80&w=800',
    description: 'Superheroes, robot commandos, sci-fi collectibles, and poseable warriors.'
  },
  {
    name: 'Remote Control Toys',
    slug: 'remote-control-toys',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800',
    description: 'High-speed RC cars, quadcopter drones, robotic spiders, and RC speedboats.'
  },
  {
    name: 'Dolls',
    slug: 'dolls',
    image: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=800',
    description: 'Fashion dolls, miniature playhouses, plush baby dolls, and hand-knitted cotton toys.'
  },
  {
    name: 'Building Blocks',
    slug: 'building-blocks',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800',
    description: 'Magnetic tiles, architectural wooden blocks, plastic brick gears, and creative builds.'
  },
  {
    name: 'Outdoor Toys',
    slug: 'outdoor-toys',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
    description: 'Kick-scooters, folding tents, water guns, climbing frames, and sports sets.'
  },
  {
    name: 'Baby Toys',
    slug: 'baby-toys',
    image: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=800',
    description: 'Rattles, soft teethers, musical crib mobiles, activity carpets, and tactile stackers.'
  },
  {
    name: 'Puzzle Games',
    slug: 'puzzle-games',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800',
    description: 'Wooden jigsaw puzzle maps, 3D mechanical models, brain teaser locks, and logic boards.'
  }
];

const productsData = [
  {
    name: 'Smart Wooden Shape Matcher',
    description: 'A beautifully polished shape-sorting clock and board. Helps develop fine-motor skills, spatial reasoning, and color identification for toddlers using completely non-toxic organic paint.',
    brand: 'EduLearn',
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
    reviewsCount: 14
  },
  {
    name: 'Iron Guard Mecha Robot',
    description: 'A fully articulated mecha defender action figure. Comes with interchangeable power-shields, LED glowing chest core, and voice modules saying protective commands.',
    brand: 'CyberForce',
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
    reviewsCount: 22
  },
  {
    name: 'RC High-Speed Desert Buggy 4x4',
    description: 'An all-terrain extreme speed buggy. Featuring heavy-duty shock absorbers, dual-power engines reaching speeds up to 25 km/h, and an ergonomic 2.4GHz remote controller.',
    brand: 'TurboTracks',
    ageGroup: '9+ Years',
    price: 3499,
    discountPrice: 2999,
    stock: 12,
    sku: 'RC-BUG-003',
    images: [
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537462715879-360eeb61a0bc?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    reviewsCount: 31
  },
  {
    name: 'Handcrafted Cotton Crochet Doll',
    description: 'A highly delicate organic doll lovingly hand-knitted from GOTS certified pure Egyptian cotton thread. Soft, safe for skin, and comes with two dress outfits.',
    brand: 'EcoDolls',
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
    reviewsCount: 19
  },
  {
    name: 'Mega Magnetic Building Tiles (100pcs)',
    description: 'Unleash brilliant architectural designs with 100 vibrant colorful magnetic triangles, windows, and squares. Engineered with strong premium magnets and rivet-protected seams.',
    brand: 'MagConstruct',
    ageGroup: '3-5 Years',
    price: 2499,
    discountPrice: 1999,
    stock: 50,
    sku: 'BL-MAG-005',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.9,
    reviewsCount: 45
  },
  {
    name: 'AeroGlide Folding Kick-Scooter',
    description: 'A light-weight aluminum folding scooter with bright light-up polyurethane wheels, rear brake safety guard, and 3-level adjustable handlebars. Perfect for outdoor fun.',
    brand: 'AeroSports',
    ageGroup: '6-8 Years',
    price: 2999,
    discountPrice: 2499,
    stock: 15,
    sku: 'OD-SCT-006',
    images: [
      'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.6,
    reviewsCount: 9
  },
  {
    name: 'Organic Cotton Soft Rattle Set',
    description: 'A set of three lovely sensory rattles (Bunny, Bear, and Ring). Features soft organic bells inside to stimulate baby hearing, and comfortable grip circles made from smooth beechwood.',
    brand: 'BabyLuxe',
    ageGroup: '0-2 Years',
    price: 899,
    discountPrice: 699,
    stock: 30,
    sku: 'BB-RTL-007',
    images: [
      'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.8,
    reviewsCount: 17
  },
  {
    name: 'Wooden World Map Jigsaw Puzzle',
    description: 'Learn continental borders, major oceans, and global animal habitats. Crafted from high-density eco-wood, precision laser cut to ensure easy snaps without splits.',
    brand: 'PuzzleMasters',
    ageGroup: '9+ Years',
    price: 1199,
    discountPrice: 899,
    stock: 22,
    sku: 'PZ-MAP-008',
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800'
    ],
    rating: 4.4,
    reviewsCount: 11
  }
];

const couponsData = [
  {
    code: 'TOYBOX20',
    discountType: 'percentage',
    discountValue: 20,
    expiryDate: new Date('2028-12-31'),
    usageLimit: 500,
    status: 'active'
  },
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    expiryDate: new Date('2028-12-31'),
    usageLimit: 1000,
    status: 'active'
  },
  {
    code: 'FLAT500',
    discountType: 'fixed',
    discountValue: 500,
    expiryDate: new Date('2028-12-31'),
    usageLimit: 200,
    status: 'active'
  }
];

const seedDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/toybox';
  console.log(`Connecting to database at ${mongoURI}...`);

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB. Starting database seeding...');

    // Clear old data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('Cleared existing collections (Users, Categories, Products, Coupons).');

    // Create users
    const adminUser = await User.create({
      name: 'ToyBox System Administrator',
      email: 'admin@toybox.com',
      mobile: '9999988888',
      password: 'password123',
      role: 'admin',
      addresses: [{
        street: 'Admin Towers, Sector 62',
        city: 'Noida',
        state: 'Uttar Pradesh',
        postalCode: '201301',
        country: 'India',
        isDefault: true
      }]
    });

    const testUser = await User.create({
      name: 'Dhananjay Kumar',
      email: 'user@toybox.com',
      mobile: '9876543210',
      password: 'password123',
      role: 'user',
      addresses: [{
        street: '123 Joy Street, Vasant Kunj',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110070',
        country: 'India',
        isDefault: true
      }]
    });

    console.log('Seeded Users: admin@toybox.com / user@toybox.com (password: password123)');

    // Create Categories
    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // Map categories to products
    const getCategoryIdByName = (name) => {
      const cat = seededCategories.find(c => c.name === name);
      return cat ? cat._id : null;
    };

    const formattedProducts = productsData.map(p => {
      let categoryName = '';
      if (p.sku.startsWith('ED')) categoryName = 'Educational Toys';
      else if (p.sku.startsWith('AC')) categoryName = 'Action Figures';
      else if (p.sku.startsWith('RC')) categoryName = 'Remote Control Toys';
      else if (p.sku.startsWith('DL')) categoryName = 'Dolls';
      else if (p.sku.startsWith('BL')) categoryName = 'Building Blocks';
      else if (p.sku.startsWith('OD')) categoryName = 'Outdoor Toys';
      else if (p.sku.startsWith('BB')) categoryName = 'Baby Toys';
      else if (p.sku.startsWith('PZ')) categoryName = 'Puzzle Games';

      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      return {
        ...p,
        slug,
        category: getCategoryIdByName(categoryName)
      };
    });

    // Create Products
    const seededProducts = await Product.insertMany(formattedProducts);
    console.log(`Seeded ${seededProducts.length} products.`);

    // Create Coupons
    const seededCoupons = await Coupon.insertMany(couponsData);
    console.log(`Seeded ${seededCoupons.length} discount coupons.`);

    console.log('Database seeding successfully finished!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
};

seedDB();
