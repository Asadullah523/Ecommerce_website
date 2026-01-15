import { createContext, useContext, useState, useEffect } from 'react';
import { sendStatusNotification, sendOrderConfirmation } from '../services/emailService';
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
  if (!Array.isArray(prods)) return [];
  if (prods.length === 0) return [];
  
  return prods.map(product => {
    const { category, ...p } = product; 
    return {
      ...p,
      id: p._id || p.id || String(Date.now() + Math.random()),
      name: p.name || 'Unnamed Product',
      price: typeof p.price === 'number' ? p.price : 0,
      categories: Array.isArray(p.categories) ? p.categories : (category ? [category] : ['uncategorized']),
      images: (Array.isArray(p.images) && p.images.length > 0) 
        ? p.images.filter(img => img && typeof img === 'string') 
        : [p.image].filter(img => img && typeof img === 'string'),
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

const sanitizeOrders = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.filter(Boolean).map(order => {
    const rawId = order._id || order.id || '';
    // Use the backend-generated numeric orderId if available. 
    // Fallback to a deterministic numeric hash of the MongoDB ID (strictly digits).
    let displayId = order.orderId;
    if (!displayId && rawId) {
      const hexPart = rawId.toString().slice(-8);
      displayId = (parseInt(hexPart, 16) % 90000000 + 10000000).toString();
    }
    
    return {
      ...order,
      id: rawId,
      displayId: displayId || 'PENDING',
      items: (order.items || []).filter(item => item && (item._id || item.id)).map(item => ({
        ...item,
        id: item._id || item.id
      }))
    };
  });
};

const sanitizeCategories = (cats) => {
  if (!Array.isArray(cats)) return [];
  return cats.map(cat => ({
    ...cat,
    id: cat._id || cat.id
  }));
};

const sanitizeCoupons = (coupons) => {
  if (!Array.isArray(coupons)) return [];
  return coupons.map(coupon => ({
    ...coupon,
    id: coupon._id || coupon.id
  }));
};

const DEFAULT_ORDERS = [
  {
    id: '17048120',
    customerName: 'Alex Chen',
    total: 199.99,
    status: 'delivered',
    date: '2024-01-10',
    items: [{ id: 1, name: 'Cyberpunk Headphones', price: 199.99, quantity: 1 }]
  },
  {
    id: '17048130',
    customerName: 'Sarah Jenkins',
    total: 79.99,
    status: 'shipped',
    date: '2024-01-12',
    items: [{ id: 2, name: 'Neon Gaming Mouse', price: 79.99, quantity: 1 }]
  },
  {
    id: '17048140',
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
    id: '17048150',
    customerName: 'Marcus Vane',
    total: 79.99,
    status: 'pending',
    date: '2026-01-10',
    items: [{ id: 2, name: 'Neon Gaming Mouse', price: 79.99, quantity: 1 }]
  },
  {
    id: '17048160',
    customerName: 'Sarah Jenkins',
    total: 199.99,
    status: 'processing',
    date: '2026-01-08',
    items: [{ id: 1, name: 'Cyberpunk Headphones', price: 199.99, quantity: 1 }]
  },
  {
    id: '17048170',
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
    try {
      const saved = localStorage.getItem('neon_products');
      const prods = saved ? JSON.parse(saved) : [];
      return sanitizeProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {
      console.error('Failed to parse local products:', e);
      return [];
    }
  });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('neon_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState(() => {
    // Admin users should NEVER use cached orders - always fetch fresh from backend
    // This prevents localStorage conflicts with real-time backend data
    if (user?.role === 'admin') {
      return [];
    }
    const saved = localStorage.getItem('neon_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('neon_categories');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('neon_coupons');
    return saved ? JSON.parse(saved) : [];
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
    return saved ? Number(saved) : 0;
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('neon_currency') || 'PKR';
  });
  const [paymentInfo, setPaymentInfo] = useState(() => {
     const saved = localStorage.getItem('neon_payment_info');
     return saved ? JSON.parse(saved) : { 
       jazzcash: { title: '', number: '' }, 
       easypaisa: { title: '', number: '' } 
     };
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [toasts, setToasts] = useState([]);

  // Fetch initial data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const loggedIn = user && user.role !== 'guest';
        const userId = user._id || user.id;

      try {
        const [productsRes, ordersRes, categoriesRes, couponsRes, settingsRes, usersRes] = await Promise.all([
          productAPI.getAll().catch(() => null),
          orderAPI.getAll().catch(() => null),
          categoryAPI.getAll().catch(() => null),
          couponAPI.getAll().catch(() => null),
          settingsAPI.getAll().catch(() => null),
          authAPI.getAllUsers().catch(() => null)
        ]);
        
        const [cartRes, wishlistRes] = await Promise.all([
          loggedIn ? cartAPI.get(userId).catch(() => null) : Promise.resolve({ data: { items: [] } }),
          loggedIn ? wishlistAPI.get(userId).catch(() => null) : Promise.resolve({ data: { products: [] } })
        ]);

        // Only update if we got a valid response (not null from catch)
        if (productsRes) setProducts(sanitizeProducts(productsRes.data || []));
        if (ordersRes) {
          console.log('🔍 DEBUG: Raw orders from backend:', ordersRes.data);
          const sanitized = sanitizeOrders(ordersRes.data || []);
          console.log('🔍 DEBUG: Sanitized orders:', sanitized);
          console.log('🔍 DEBUG: Order count:', sanitized.length);
          setOrders(sanitized);
        }
        if (categoriesRes) setCategories(sanitizeCategories(categoriesRes.data || []));
        if (couponsRes) setCoupons(sanitizeCoupons(couponsRes.data || []));
        if (usersRes) setUsers(usersRes.data || []);
        
        if (settingsRes?.data?.revenueGoal) {
          setRevenueGoal(settingsRes.data.revenueGoal);
        }
        if (settingsRes.data && settingsRes.data.paymentInfo) {
          const fetchedInfo = settingsRes.data.paymentInfo;
          // Ensure structure is correct (migration from legacy)
          const migratedInfo = {
            jazzcash: fetchedInfo.jazzcash || { title: fetchedInfo.accountTitle || '', number: fetchedInfo.accountNumber || '' },
            easypaisa: fetchedInfo.easypaisa || { title: '', number: '' }
          };
          setPaymentInfo(migratedInfo);
        }
        setCart(cartRes.data?.items || []);
        if (productsRes) setBackendStatus('online');
        else setBackendStatus('offline');
      } catch (error) {
        console.error("Failed to sync data", error);
        setBackendStatus('offline');
        // Fallback to local if primary fetch is totally broken
      }
      } catch (error) {
        console.error('Error fetching data:', error);
        setBackendStatus('offline');
        addToast('Failed to connect to backend. Using local data.', 'error');
      } finally {
        // Guarantee splash screen stays for at least 1.5s to allow rendering buffer
        const minimumWait = new Promise(resolve => setTimeout(resolve, 1500));
        await minimumWait;
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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
    if (!loading) {
      updateGoal().catch(console.error);
    }
  }, [revenueGoal, loading]);

  // Ensure local storage is always in sync with state for persistence across reloads
  useEffect(() => {
    try {
      localStorage.setItem('neon_payment_info', JSON.stringify(paymentInfo));
    } catch (e) {
      console.error('Failed to save payment info to localStorage:', e);
    }
  }, [paymentInfo]);

  const savePaymentSettings = async () => {
     try {
       await settingsAPI.update('paymentInfo', paymentInfo);
       addToast('Payment settings saved successfully', 'success');
       return true;
     } catch (error) {
       console.error('Failed to save payment settings:', error);
       addToast('Failed to save payment settings', 'error');
       return false;
     }
  };

  useEffect(() => {
    try {
      localStorage.setItem('neon_currency', currency);
    } catch (e) {
      console.error('Failed to save currency to localStorage:', e);
    }
  }, [currency]);

  useEffect(() => {
    try {
      localStorage.setItem('neon_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('neon_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage:', e);
    }
  }, [users]);

  useEffect(() => {
    // Admin users should NEVER cache orders in localStorage
    // This prevents stale data from interfering with backend sync
    if (user?.role === 'admin') return;
    
    try {
      localStorage.setItem('neon_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }, [orders, user?.role]);

  // Products sync: Save metadata and critical images to localStorage.
  useEffect(() => {
    try {
      // Strategy: Try to save the first image of each product.
      // High-res Base64 images are kept unless we hit QuotaExceededError.
      const storageProducts = (products || []).filter(Boolean).map(p => ({
        ...p,
        // Keep the main image and the first entry of the images array
        images: (p.images || []).slice(0, 1),
        image: p.image || p.images?.[0] || null,
      }));
      
      try {
        localStorage.setItem('neon_products', JSON.stringify(storageProducts));
      } catch (innerError) {
        // Only trigger "Lite" mode if we are actually online (to avoid wiping images while offline)
        if (backendStatus === 'online') {
          const liteProducts = storageProducts.map(p => ({
             ...p,
             images: (p.images || []).filter(img => typeof img === 'string' && !img.startsWith('data:')),
             image: typeof p.image === 'string' && !p.image.startsWith('data:') ? p.image : null,
          }));
          localStorage.setItem('neon_products', JSON.stringify(liteProducts));
          console.warn('LocalStorage limit reached - syncing in Lite Mode (metadata only)');
        } else {
          console.warn('LocalStorage full while offline - preserving current cache state.');
        }
      }
    } catch (e) {
      console.warn('LocalStorage sync totally failed:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('neon_wishlist', JSON.stringify(Array.isArray(wishlist) ? wishlist : []));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage:', e);
    }
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

  // Real-time Background Polling for Admins
  // Checks for new orders every 5 seconds without affecting UI loading state
  useEffect(() => {
    let interval;
    if (user && user.role === 'admin') {
      console.log('🔄 Admin polling enabled - checking for new orders every 5 seconds');
      interval = setInterval(async () => {
        try {
          console.log('🔄 Polling backend for orders...');
          const response = await orderAPI.getAll();
          if (!response?.data) {
            console.warn('⚠️ No data in polling response');
            return;
          }

          console.log('✅ Polling successful, raw orders:', response.data.length);
          const syncedOrders = sanitizeOrders(response.data);
          console.log('✅ Sanitized orders:', syncedOrders.length);
          
          setOrders(prev => {
            console.log('📊 Previous order count:', prev.length, 'New order count:', syncedOrders.length);
            // Detect genuinely new orders (higher count than before)
            if (syncedOrders.length > prev.length && prev.length > 0) {
              const diff = syncedOrders.length - prev.length;
              addToast(`${diff} new order${diff > 1 ? 's' : ''} received!`, 'success');
            }
            return syncedOrders;
          });
        } catch (error) {
          console.error('❌ Background admin sync failed:', error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [user?.role, user?._id]); // Depend on role and ID specifically for stability

  // Core Business Logic Actions
  
  /**
   * Adds an item to the shopping cart or increases quantity if already present
   */
  const addToCart = (product) => {
    if (user.role === 'admin') {
      addToast("Admin accounts cannot make purchases. Please use a customer account to shop.", "warning");
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
        // Payload Optimization: Only send the first image URL/metadata for each item.
        // Stripping heavy Base64 strings prevents Vercel 4.5MB payload limit errors.
        items: cart.map(item => ({
          ...item,
          image: typeof item.image === 'string' && item.image.startsWith('data:') ? null : item.image,
          images: (item.images || []).filter(img => typeof img === 'string' && !img.startsWith('data:')).slice(0, 1)
        })),
        total: order.total,
        customer: order.customer,
        customerName: order.customer?.name || order.customerName || 'Guest',
        user: user?._id || null
      };
      
      const response = await orderAPI.create(orderData);
      const newOrder = sanitizeOrders([response.data])[0];
      
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
      const updatedOrder = sanitizeOrders([response.data])[0];
      
      // 2. Trigger side effects (Email) for important status changes
      const emailStatuses = ['shipped', 'cancelled', 'cancelled_by_customer', 'delivered'];
      if (updatedOrder && emailStatuses.includes(newStatus)) {
        sendStatusNotification(updatedOrder, newStatus);
      }

      // 3. Update state purely
      setOrders(prevOrders => 
        prevOrders.map(order => 
          (order._id === orderId || order.id === orderId || order.orderId === orderId) ? updatedOrder : order
        )
      );
      addToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Failed to update order status:', error);
      addToast('Failed to update order status.', 'error');
    }
  };

  const verifyPayment = async (orderId) => {
    try {
      const response = await orderAPI.updateStatus(orderId, { isPaid: true });
      const updatedOrder = sanitizeOrders([response.data])[0];
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          (order._id === orderId || order.id === orderId || order.orderId === orderId) ? updatedOrder : order
        )
      );
      addToast('Payment verified successfully', 'success');
    } catch (error) {
      console.error('Failed to verify payment:', error);
      addToast('Failed to verify payment', 'error');
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
      // Force immediate persistence to prevent race conditions during role-change re-fetches
      localStorage.setItem('neon_user', JSON.stringify(newUser));
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
      addToast("Self-termination not allowed. Another admin must perform this action.", "error");
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
       addToast("You cannot demote yourself. Ask another admin.", "error");
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
      // Force immediate persistence so API interceptor has the token for immediate re-fetches
      localStorage.setItem('neon_user', JSON.stringify(userData));
      
      // Clear stale order cache for admin users to force fresh backend fetch
      if (userData.role === 'admin') {
        localStorage.removeItem('neon_orders');
        setOrders([]); // Clear orders state to force refetch
      }
      
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
    } catch (error) {
      addToast('Failed to add product', 'error');
      throw error;
    }
  };

  const deleteProduct = async (productId) => {
    try {
      if (!productId) {
        addToast('Invalid product ID.', 'error');
        return;
      }
      
      try {
        await productAPI.delete(productId);
      } catch (apiError) {
        // If the product is already gone from backend (404), we should still remove it locally
        if (apiError.response && apiError.response.status === 404) {
          console.warn('Product already deleted from server, removing local reference.');
        } else {
          throw apiError;
        }
      }

      setProducts(prev => prev.filter(p => (p._id || p.id) !== productId));
      addToast('Product removed', 'info');
    } catch (error) {
      console.error('Delete product failed:', error);
      addToast('Failed to remove product. Check connection.', 'error');
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const response = await productAPI.update(productId, updates);
      const updatedProduct = sanitizeProducts([response.data])[0];
      setProducts(prev => prev.map(p => 
        (p._id || p.id) === productId ? updatedProduct : p
      ));
    } catch (error) {
      addToast('Failed to update product', 'error');
      throw error;
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
    const coupon = coupons.find(c => {
      const isMatch = c.code.toUpperCase() === code.toUpperCase() && c.active;
      if (!isMatch) return false;
      
      // Validation check for expiryDate if it exists
      if (c.expiryDate) {
        const expiry = new Date(c.expiryDate);
        expiry.setHours(23, 59, 59, 999); 
        if (new Date() > expiry) return false;
      }
      return true;
    });
    
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
    if (skipConfirm || confirm('Are you sure you want to completely RESET EVERYTHING? This will clear all local data and log you out.')) {
      console.log('🔄 Full System Reset initiated...');
      
      // Clear EVERYTHING from LocalStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('neon_')) {
          localStorage.removeItem(key);
        }
      });

      // Clear states immediately
      setProducts([]);
      setCart([]);
      setOrders([]);
      setCategories([]);
      setCoupons([]);
      setUsers([]);
      setWishlist([]);
      setUser({ role: 'guest', name: 'Guest' });
      
      console.log('✅ Local cache cleared. Redirecting...');
      window.location.href = '/';
    }
  };

  const reverifyEmailConfig = async () => {
    try {
      addToast('Testing EmailJS connection...', 'info');
      const dummyOrder = {
        id: 'TEST-CONFIG',
        total: 100,
        currency: 'USD',
        customer: { name: 'Admin Test', email: user.email }
      };
      const result = await sendOrderConfirmation(dummyOrder);
      if (result.success) {
        addToast('Email connection successful! Check your inbox.', 'success');
      } else {
        addToast(`Email Failed: ${result.error}`, 'error');
      }
    } catch (e) {
      addToast(`System Error: ${e.message}`, 'error');
    }
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout, users, registerUser, authenticateUser, deleteUser, updateUserRole, updateUserProfile, updatePassword,
      products, addProduct, deleteProduct, updateProduct,
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      orders, placeOrder, updateOrderStatus, verifyPayment, deleteOrder, deleteCancelledOrders,
      categories, addCategory, deleteCategory,
      coupons, addCoupon, deleteCoupon, applyCoupon,
      wishlist, toggleWishlist,
      searchQuery, setSearchQuery,
      revenueGoal, setRevenueGoal,
      addReview,
      currency, setCurrency, formatPrice, EXCHANGE_RATES,
      paymentInfo, setPaymentInfo, backendStatus,
      toasts, addToast, removeToast, factoryReset, savePaymentSettings, reverifyEmailConfig
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
