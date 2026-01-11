import { createContext, useContext, useState, useEffect } from 'react';
import { sendStatusNotification } from '../services/emailService';
import { productAPI, authAPI, orderAPI, categoryAPI, couponAPI, settingsAPI, cartAPI, wishlistAPI } from '../services/api';

// Currency exchange rates (USD as base currency)
const EXCHANGE_RATES = {
  USD: 1,
  PKR: 278.50,
  AED: 3.67
};

// Currency display symbols
const CURRENCY_SYMBOLS = {
  USD: '$',
  PKR: 'Rs ',
  AED: 'AED '
};

const StoreContext = createContext();

// Default product catalog for demo purposes
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

// Default product categories
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Gaming', slug: 'gaming' },
  { id: 2, name: 'Audio', slug: 'audio' },
  { id: 3, name: 'Wearables', slug: 'wearable' },
  { id: 4, name: 'Accessories', slug: 'accessories' },
];

// Default discount coupons
const DEFAULT_COUPONS = [
  { id: 1, code: 'WELCOME10', discount: 10, type: 'percentage', active: true },
  { id: 2, code: 'SAVE20', discount: 20, type: 'fixed', active: true },
];

// Sanitize product data for consistency and backward compatibility
const sanitizeProducts = (prods) => {
  if (!Array.isArray(prods)) return DEFAULT_PRODUCTS;
  // Preserve empty arrays (intentional product deletion)
  if (prods.length === 0) return [];
  
  return prods.map(product => {
    const { category, ...p } = product; // Remove legacy single category field
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

/**
 * Store Provider component to manage global state across the application
 */
export function StoreProvider({ children }) {
  // Initialization of state variables with data from LocalStorage for persistence
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
  const [loading, setLoading] = useState(true);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loggedIn = user && user.role !== 'guest';
        const userId = user._id || user.id;

        const [productsRes, ordersRes, categoriesRes, couponsRes, settingsRes, usersRes, cartRes, wishlistRes] = await Promise.all([
          productAPI.getAll(),
          user.role === 'admin' ? orderAPI.getAll() : Promise.resolve({ data: [] }),
          categoryAPI.getAll(),
          couponAPI.getAll(),
          settingsAPI.getAll(),
          user.role === 'admin' ? authAPI.getAllUsers() : Promise.resolve({ data: [] }),
          loggedIn ? cartAPI.get(userId) : Promise.resolve({ data: { items: [] } }),
          loggedIn ? wishlistAPI.get(userId) : Promise.resolve({ data: { products: [] } })
        ]);
        
        if (productsRes.data.length > 0) {
          setProducts(sanitizeProducts(productsRes.data));
        }
        
        if (ordersRes.data.length > 0) {
          setOrders(ordersRes.data);
        }

        if (categoriesRes.data.length > 0) {
          setCategories(categoriesRes.data);
        }

        if (couponsRes.data.length > 0) {
          setCoupons(couponsRes.data);
        }

        if (settingsRes.data && settingsRes.data.revenueGoal) {
          setRevenueGoal(settingsRes.data.revenueGoal);
        }

        if (usersRes.data.length > 0) {
          setUsers(usersRes.data);
        }

        if (cartRes.data && cartRes.data.items && cartRes.data.items.length > 0) {
          setCart(cartRes.data.items);
        }

        if (wishlistRes.data && wishlistRes.data.products) {
          setWishlist(wishlistRes.data.products);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        addToast('Failed to connect to backend. Using local data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.role]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Persistent storage Synchronization
  // Ensures state changes are reflected in LocalStorage for data integrity after page reloads
  // Revenue Goal synchronization with backend
  useEffect(() => {
    const updateGoal = async () => {
      try {
        await settingsAPI.update('revenueGoal', revenueGoal);
        localStorage.setItem('neon_revenue_goal', revenueGoal.toString());
      } catch (error) {
        console.error('Failed to update revenue goal on server:', error);
      }
    };
    if (!loading) updateGoal();
  }, [revenueGoal, loading]);

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
    localStorage.setItem('neon_wishlist', JSON.stringify(Array.isArray(wishlist) ? wishlist : []));
    const syncWishlist = async () => {
      if (user && user.role !== 'guest' && !loading) {
        try {
          await wishlistAPI.update({
            userId: user._id || user.id,
            products: wishlist.map(p => p._id || p.id)
          });
        } catch (error) {
          console.error('Wishlist sync failed:', error);
        }
      }
    };
    syncWishlist();
  }, [wishlist, user, loading]);

  useEffect(() => {
    try {
      localStorage.setItem('neon_cart', JSON.stringify(cart));
      const syncCart = async () => {
        if (user && user.role !== 'guest' && !loading) {
          try {
            await cartAPI.update({
              userId: user._id || user.id,
              items: cart
            });
          } catch (error) {
            console.error('Cart sync failed:', error);
          }
        }
      };
      syncCart();
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cart, user, loading]);

  // Core Business Logic Actions
  
  /**
   * Adds an item to the shopping cart or increases quantity if already present
   */
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

  /**
   * Clears all items from the current shopping cart
   */
  const clearCart = () => setCart([]);

  // Order Processing and Management Functions
  
  /**
   * Finalizes an order and clears the cart
   */
  const placeOrder = async (order) => {
    try {
      const orderData = {
        ...order,
        items: cart,
        total: order.total,
        customerName: order.customer?.name || order.customerName || 'Guest',
        user: user._id || null
      };
      
      const response = await orderAPI.create(orderData);
      const newOrder = response.data;
      
      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    } catch (error) {
      console.error('Order placement failed:', error);
      addToast('Failed to place order. Please try again.', 'error');
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // 1. Update on backend
      const response = await orderAPI.updateStatus(orderId, newStatus);
      const updatedOrder = response.data;
      
      // 2. Trigger side effects (Email) if status is actually changing
      if (updatedOrder && newStatus !== 'pending') {
        sendStatusNotification(updatedOrder, newStatus);
      }

      // 3. Update state purely
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? updatedOrder : order
        )
      );
      addToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Failed to update order status:', error);
      addToast('Failed to update order status.', 'error');
    }
  };

  /**
   * Removes an order from history
   */
  const deleteOrder = async (orderId) => {
    try {
      await orderAPI.delete(orderId);
      setOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
      addToast('Order removed', 'info');
    } catch (error) {
      addToast('Failed to remove order', 'error');
    }
  };

  /**
   * Bulk removal of cancelled orders
   */
  const deleteCancelledOrders = async () => {
    try {
      await orderAPI.clearCancelled();
      setOrders(prev => prev.filter(o => !o.status.startsWith('cancelled')));
      addToast('Cancelled orders cleared', 'success');
    } catch (error) {
      addToast('Failed to clear cancelled orders', 'error');
    }
  };

  // User and Identity Management Logic
  
  /**
   * Registers a new account in the system
   */
  const registerUser = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const newUser = response.data;
      setUsers(prev => [...prev, newUser]);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const deleteUser = async (userId) => {
    if (user && (user._id || user.id) === userId && user.role === 'admin') {
      alert("Self-termination not allowed. Another admin must perform this action.");
      return;
    }
    try {
      await authAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
      addToast('User removed', 'info');
    } catch (error) {
      addToast('Failed to remove user', 'error');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    if (user && (user._id || user.id) === userId && newRole !== 'admin') {
       alert("You cannot demote yourself. Ask another admin.");
       return;
    }
    try {
      const response = await authAPI.updateRole(userId, newRole);
      setUsers(prev => prev.map(u => 
        (u._id || u.id) === userId ? response.data : u
      ));
      addToast(`Role updated to ${newRole}`, 'success');
    } catch (error) {
      addToast('Failed to update role', 'error');
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const response = await authAPI.updateProfile({ ...updates, email: user.email });
      setUser(response.data);
      setUsers(prev => prev.map(u => u.email === user.email ? response.data : u));
      addToast('Profile updated', 'success');
    } catch (error) {
      addToast('Failed to update profile', 'error');
    }
  };

  const updatePassword = async (email, newPassword) => {
    try {
      await authAPI.updateProfile({ email, password: newPassword });
      addToast('Password updated', 'success');
      return { success: true };
    } catch (error) {
      addToast('Failed to update password', 'error');
      return { success: false };
    }
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

  const authenticateUser = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const userData = response.data;
      setUser(userData);
      setCart([]); // Clear cart on login
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
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
  const addCategory = async (name) => {
    try {
      const response = await categoryAPI.create(name);
      setCategories(prev => [...prev, response.data]);
      addToast('Category added', 'success');
    } catch (error) {
      addToast('Failed to add category', 'error');
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryAPI.delete(id);
      setCategories(prev => prev.filter(c => (c._id || c.id) !== id));
      addToast('Category removed', 'info');
    } catch (error) {
      addToast('Failed to remove category', 'error');
    }
  };

  // Product Management
  const addProduct = async (product) => {
    try {
      const response = await productAPI.create(product);
      const newProduct = sanitizeProducts([response.data])[0];
      setProducts(prev => [...prev, newProduct]);
      addToast('Product added successfully', 'success');
    } catch (error) {
      addToast('Failed to add product', 'error');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productAPI.delete(productId);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== productId));
      addToast('Product removed', 'info');
    } catch (error) {
      addToast('Failed to remove product', 'error');
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const response = await productAPI.update(productId, updates);
      const updatedProduct = sanitizeProducts([response.data])[0];
      setProducts(prev => prev.map(p => 
        (p._id || p.id) === productId ? updatedProduct : p
      ));
      addToast('Product updated', 'success');
    } catch (error) {
      addToast('Failed to update product', 'error');
    }
  };

  // Coupon Management
  const addCoupon = async (couponData) => {
    try {
      const response = await couponAPI.create(couponData);
      setCoupons(prev => [...prev, response.data]);
      addToast('Coupon created', 'success');
    } catch (error) {
      addToast('Failed to create coupon', 'error');
    }
  };

  const deleteCoupon = async (id) => {
    try {
      await couponAPI.delete(id);
      setCoupons(prev => prev.filter(c => (c._id || c.id) !== id));
      addToast('Coupon removed', 'info');
    } catch (error) {
      addToast('Failed to remove coupon', 'error');
    }
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

  /**
   * Adds a user review to a specific product
   */
  const addReview = async (productId, review) => {
    try {
      await productAPI.addReview(productId, {
        ...review,
        userId: user._id || user.id
      });
      
      // Refresh products from backend to get updated rating/reviews
      const response = await productAPI.getAll();
      setProducts(sanitizeProducts(response.data));
      addToast('Review added', 'success');
    } catch (error) {
      addToast('Failed to add review', 'error');
    }
  };

  /**
   * Formats a USD price into the currently selected currency with proper symbols
   */
  const formatPrice = (priceInUSD) => {
    const rate = EXCHANGE_RATES[currency];
    const converted = priceInUSD * rate;
    
    // Formatting precision adjustment
    const formattedNumber = converted.toLocaleString(undefined, {
      minimumFractionDigits: currency === 'PKR' ? 0 : 2,
      maximumFractionDigits: currency === 'PKR' ? 0 : 2,
    });

    return `${CURRENCY_SYMBOLS[currency]}${formattedNumber}`;
  };

  /**
   * Resets transactional data (orders, users, cart) while preserving catalog
   */
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
