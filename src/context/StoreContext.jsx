import { createContext, useContext, useState, useEffect } from 'react';
import { sendStatusNotification } from '../services/emailService';

// Constants
const EXCHANGE_RATES = {
  USD: 1,
  PKR: 278.50, // Current approx rate
  AED: 3.67
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  PKR: 'Rs ',
  AED: 'AED '
};

const StoreContext = createContext();

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Cyberpunk Headphones",
    price: 199.99,
    categories: ["audio", "wearable", "gaming"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&q=80",
      "https://images.unsplash.com/photo-1545127398-14699f92334b?w=500&q=80"
    ],
    rating: 4.8,
    reviewCount: 12,
    reviews: [
      {
        id: 1,
        userId: 'user_1',
        userName: 'Alex Chen',
        rating: 5,
        comment: 'Amazing sound quality! Best headphones I\'ve owned.',
        date: '2024-01-15',
        verified: true
      }
    ],
    provider: "Neon Tech Official",
    description: "Premium wireless headphones with active noise cancellation and immersive 3D audio.",
    inStock: true,
  },
  {
    id: 2,
    name: "Neon Gaming Mouse",
    price: 79.99,
    categories: ["gaming", "accessories"],
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80"
    ],
    rating: 4.9,
    reviewCount: 8,
    reviews: [],
    provider: "Neon Tech Official",
    description: "Ultra-responsive gaming mouse with customizable RGB lighting.",
    inStock: true,
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    price: 149.99,
    categories: ["gaming", "accessories"],
    images: [
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80"
    ],
    rating: 4.7,
    reviewCount: 5,
    reviews: [],
    provider: "Neon Tech Official",
    description: "Premium mechanical keyboard with hot-swappable switches.",
    inStock: true,
  }
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Gaming', slug: 'gaming' },
  { id: 2, name: 'Audio', slug: 'audio' },
  { id: 3, name: 'Wearables', slug: 'wearable' },
  { id: 4, name: 'Accessories', slug: 'accessories' },
];

const DEFAULT_COUPONS = [
  { id: 1, code: 'WELCOME10', discount: 10, type: 'percentage', active: true },
  { id: 2, code: 'SAVE20', discount: 20, type: 'fixed', active: true },
];

const sanitizeProducts = (prods) => {
  if (!Array.isArray(prods)) return DEFAULT_PRODUCTS;
  // If array is empty, keep it empty (user deleted all products)
  if (prods.length === 0) return [];
  
  return prods.map(product => {
    const { category, ...p } = product; // Remove legacy category string
    return {
      ...p,
      id: p.id || Date.now() + Math.random(),
      name: p.name || 'Unnamed Product',
      price: typeof p.price === 'number' ? p.price : 0,
      categories: Array.isArray(p.categories) ? p.categories : (category ? [category] : ['uncategorized']),
      images: Array.isArray(p.images) ? p.images : [p.image].filter(Boolean),
      reviews: Array.isArray(p.reviews) ? p.reviews.map(r => ({
        ...r,
        id: r.id || Date.now() + Math.random(),
        rating: typeof r.rating === 'number' ? r.rating : 5,
        comment: r.comment || '',
        userName: r.userName || 'Anonymous'
      })) : [],
      rating: typeof p.rating === 'number' ? p.rating : 0,
      reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0,
      provider: p.provider || 'Neon Tech Official',
      description: p.description || '',
      inStock: p.inStock !== undefined ? p.inStock : true
    };
  });
};

const DEFAULT_ORDERS = [
  {
    id: 'ORD-1704812000000',
    customerName: 'Alex Chen',
    total: 199.99,
    status: 'delivered',
    date: '2024-01-10',
    items: [{ id: 1, name: 'Cyberpunk Headphones', price: 199.99, quantity: 1 }]
  },
  {
    id: 'ORD-1704813000000',
    customerName: 'Sarah Jenkins',
    total: 79.99,
    status: 'shipped',
    date: '2024-01-12',
    items: [{ id: 2, name: 'Neon Gaming Mouse', price: 79.99, quantity: 1 }]
  },
  {
    id: 'ORD-1704814000000',
    customerName: 'Marcus Vane',
    total: 349.98,
    status: 'delivered',
    date: '2026-01-09',
    items: [
      { id: 1, name: 'Cyberpunk Headphones', price: 199.99, quantity: 1 },
      { id: 3, name: 'Mechanical Keyboard', price: 149.99, quantity: 1 }
    ]
  },
  {
    id: 'ORD-1704815000000',
    customerName: 'Marcus Vane',
    total: 79.99,
    status: 'pending',
    date: '2026-01-10',
    items: [{ id: 2, name: 'Neon Gaming Mouse', price: 79.99, quantity: 1 }]
  },
  {
    id: 'ORD-1704816000000',
    customerName: 'Sarah Jenkins',
    total: 199.99,
    status: 'processing',
    date: '2026-01-08',
    items: [{ id: 1, name: 'Cyberpunk Headphones', price: 199.99, quantity: 1 }]
  },
  {
    id: 'ORD-1704817000000',
    customerName: 'Alex Chen',
    total: 149.99,
    status: 'shipped',
    date: '2026-01-07',
    items: [{ id: 3, name: 'Mechanical Keyboard', price: 149.99, quantity: 1 }]
  }
];

export function StoreProvider({ children }) {
  // --- State ---
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('neon_user');
    return saved ? JSON.parse(saved) : { role: 'guest', name: 'Guest' };
  });
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('neon_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('neon_products');
    const prods = saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    return sanitizeProducts(prods);
  });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('neon_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('neon_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('neon_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('neon_coupons');
    return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('neon_wishlist');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      return [];
    }
  });
  const [revenueGoal, setRevenueGoal] = useState(() => {
    const saved = localStorage.getItem('neon_revenue_goal');
    return saved ? Number(saved) : 5000;
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('neon_currency') || 'PKR';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Data Integrity Persistence ---
  useEffect(() => {
    localStorage.setItem('neon_revenue_goal', revenueGoal.toString());
  }, [revenueGoal]);

  useEffect(() => {
    localStorage.setItem('neon_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('neon_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('neon_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    // Validate products before saving
    const validProducts = products.map(p => ({
      ...p,
      images: Array.isArray(p.images) ? p.images : [p.image].filter(Boolean),
      reviews: Array.isArray(p.reviews) ? p.reviews : [],
      rating: typeof p.rating === 'number' ? p.rating : 0,
      reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0
    }));
    localStorage.setItem('neon_products', JSON.stringify(validProducts));
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('neon_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('neon_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('neon_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('neon_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('neon_wishlist', JSON.stringify(Array.isArray(wishlist) ? wishlist : []));
  }, [wishlist]);

  // --- Actions ---
  const addToCart = (product) => {
    if (user.role === 'admin') {
      alert("Admin accounts cannot make purchases. Please use a customer account to shop.");
      return;
    }
    if (!product || typeof product !== 'object') return;
    
    // Create a safe copy of the product to avoid circular references and ensure image availability
    const safeProduct = {
      ...product,
      image: product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80',
      quantity: 1
    };

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, safeProduct];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  // Order Management
  const placeOrder = (order) => {
    const newOrder = {
      ...order,
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      status: 'pending',
      customerName: order.customer?.name || order.customerName || 'Guest'
    };
    setOrders(prev => [...prev, newOrder]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    // 1. Find the order first to check conditions
    const orderToUpdate = orders.find(o => o.id === orderId);
    
    // 2. Trigger side effects (Email) if status is actually changing
    if (orderToUpdate && orderToUpdate.status !== newStatus && newStatus !== 'pending') {
      sendStatusNotification({ ...orderToUpdate, status: newStatus }, newStatus);
    }

    // 3. Update state purely
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const deleteCancelledOrders = () => {
    setOrders(prev => prev.filter(o => !o.status.startsWith('cancelled')));
  };

  // User Management
  const registerUser = (userData) => {
    if (users.some(u => u.email === userData.email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      createdAt: new Date().toISOString(),
      role: userData.role || 'customer'
    };
    setUsers(prev => [...prev, newUser]);
    return { success: true, user: newUser };
  };

  const deleteUser = (userId) => {
    if (user && user.id === userId && user.role === 'admin') {
      alert("Self-termination not allowed. Another admin must perform this action.");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const updateUserRole = (userId, newRole) => {
    if (user && user.id === userId && newRole !== 'admin') {
       alert("You cannot demote yourself. Ask another admin.");
       return;
    }
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  const updateUserProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    setUsers(prev => prev.map(u => u.email === user.email ? { ...u, ...updates } : u));
  };

  const updatePassword = (email, newPassword) => {
    setUsers(prev => prev.map(u => u.email === email ? { ...u, password: newPassword } : u));
    return { success: true };
  };

  const toggleWishlist = (product) => {
    if (!product || !product.id) return;
    setWishlist(prev => {
      const safePrev = Array.isArray(prev) ? prev.filter(Boolean) : [];
      const isWishlisted = safePrev.find(item => item && item.id === product.id);
      if (isWishlisted) {
        return safePrev.filter(item => item && item.id !== product.id);
      }
      return [...safePrev, product];
    });
  };

  const authenticateUser = (email, password) => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser({ role: foundUser.role, name: foundUser.name, email: foundUser.email });
      setCart([]); // Clear cart on login
      return { success: true, user: foundUser };
    }
    return { success: false };
  };

  const login = (role, name) => {
    setUser({ role, name });
    setCart([]); // Clear cart when role changes
  };
  
  const logout = () => {
    setUser({ role: 'guest', name: 'Guest' });
    setCart([]); // Clear cart on logout
  };

  // Category Management
  const addCategory = (name) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const newCategory = { id: Date.now(), name, slug };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Product Management
  const addProduct = (product) => {
    const newProduct = sanitizeProducts([{
      ...product,
      id: Date.now()
    }])[0];
    setProducts(prev => [...prev, newProduct]);
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateProduct = (productId, updates) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? sanitizeProducts([{ ...p, ...updates }])[0] : p
    ));
  };

  // Coupon Management
  const addCoupon = (couponData) => {
    const newCoupon = { id: Date.now(), ...couponData, active: true };
    setCoupons(prev => [...prev, newCoupon]);
  };

  const deleteCoupon = (id) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const applyCoupon = (code, total) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return { valid: false, error: 'Invalid or expired coupon code' };
    
    const discount = coupon.type === 'percentage' 
      ? (total * coupon.discount / 100)
      : coupon.discount;
    
    return { 
      valid: true, 
      discount, 
      finalTotal: Math.max(0, total - discount),
      coupon 
    };
  };

  // Review Management
  const addReview = (productId, review) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const existingReviews = Array.isArray(p.reviews) ? p.reviews : [];
        const newReview = {
          id: Date.now(),
          ...review,
          date: new Date().toISOString().split('T')[0]
        };
        const newReviews = [...existingReviews, newReview];
        const avgRating = newReviews.reduce((sum, r) => sum + r.rating, 0) / newReviews.length;
        return {
          ...p,
          reviews: newReviews,
          rating: parseFloat(avgRating.toFixed(1)),
          reviewCount: newReviews.length
        };
      }
      return p;
    }));
  };

  // Currency Helpers
  const formatPrice = (priceInUSD) => {
    const rate = EXCHANGE_RATES[currency];
    const converted = priceInUSD * rate;
    
    // Format based on currency for better readability
    const formattedNumber = converted.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'PKR' ? 0 : 2,
      maximumFractionDigits: currency === 'PKR' ? 0 : 2,
    });

    return `${CURRENCY_SYMBOLS[currency]}${formattedNumber}`;
  };

  const factoryReset = (skipConfirm = false) => {
    if (skipConfirm || confirm('Are you sure you want to completely reset the demo data? This will clear all changes.')) {
      console.log('🔄 Factory Reset initiated...');
      console.log('📦 Clearing transactional data (orders, users, metrics)...');
      
      // Clear transactional data by setting to empty arrays (not removing, to avoid fallback to defaults)
      localStorage.setItem('neon_orders', JSON.stringify([])); // Empty orders - no fallback to defaults
      localStorage.setItem('neon_users', JSON.stringify([])); // Empty users
      localStorage.setItem('neon_cart', JSON.stringify([])); // Empty cart
      localStorage.setItem('neon_wishlist', JSON.stringify([])); // Empty wishlist
      localStorage.removeItem('neon_revenue_goal'); // Reset monthly goal to default $5000
      localStorage.removeItem('neon_user'); // Logout current user (will become guest)
      
      // Keep these intact:
      // - neon_products (your product catalog)
      // - neon_categories (your categories)
      // - neon_coupons (your coupons)
      // - neon_currency (currency preference)
      
      console.log('✅ Transactional data cleared to zero');
      console.log('📦 Products, categories, and coupons preserved');
      console.log('🔃 Reloading page...');
      
      // Hard reload to refresh state
      window.location.href = window.location.href.split('?')[0];
    }
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout, users, registerUser, authenticateUser, deleteUser, updateUserRole, updateUserProfile, updatePassword,
      products, addProduct, deleteProduct, updateProduct,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      orders, placeOrder, updateOrderStatus, deleteOrder, deleteCancelledOrders,
      categories, addCategory, deleteCategory,
      coupons, addCoupon, deleteCoupon, applyCoupon,
      wishlist, toggleWishlist,
      searchQuery, setSearchQuery,
      revenueGoal, setRevenueGoal,
      addReview,
      currency, setCurrency, formatPrice, EXCHANGE_RATES,
      toasts, addToast, removeToast, factoryReset
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
