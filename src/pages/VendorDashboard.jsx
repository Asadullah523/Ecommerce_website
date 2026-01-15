import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Package, DollarSign, TrendingUp, Trash2, ShoppingBag, User, Clock, Tag, X, Edit2, Image as ImageIcon, ChevronDown, Mail, Search, ChevronLeft, ChevronRight, Activity, Zap, Waves, Target, Check, ShieldAlert, Calendar } from 'lucide-react';
import { AddCouponModal, AddCategoryModal, AddUserModal } from '../components/AdminModals';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import SalesChart from '../components/SalesChart';
import PerformanceMetrics from '../components/PerformanceMetrics';

/**
 * Vendor Dashboard Component
 * Manages administrative tasks including analytics, products, orders, and user management.
 */
export default function VendorDashboard() {
  const { 
    user, products = [], addProduct, deleteProduct, updateProduct, 
    orders = [], updateOrderStatus, verifyPayment, categories = [], coupons = [], addCoupon, deleteCoupon, addCategory, deleteCategory,
    users = [], deleteUser, updateUserRole, registerUser,
    deleteOrder, deleteCancelledOrders, addToCart,
    revenueGoal, setRevenueGoal, paymentInfo, setPaymentInfo, formatPrice, currency, EXCHANGE_RATES,
    factoryReset, savePaymentSettings
  } = useStore();
  
  // Dashboard UI State
  const [activeTab, setActiveTab] = useState('analytics');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('weekly');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(revenueGoal);
  
  // Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Search and Filtering State
  const [orderFilter, setOrderFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  
  // Interaction and Feedback State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {}, confirmText: 'Confirm' });
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [orderPage, setOrderPage] = useState(1);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStatus, setResetStatus] = useState('idle');
  const [pinInput, setPinInput] = useState('');
  const ordersPerPage = 5;

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  if (!user) return <div className="p-8 text-center text-white">Loading account data...</div>;

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(u => 
    (u?.name || '').toLowerCase().includes(userSearch.toLowerCase()) || 
    (u?.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  // Authorization Check: Only administrators can access this dashboard
  if (user.role !== 'admin') {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-6 rounded-full bg-bg-800 p-6">
           <Package className="h-12 w-12 text-accent-cyan" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white">Access Denied</h1>
        <p className="mb-8 max-w-md text-gray-400">This area is restricted to administrators only.</p>
        <Button size="lg" variant="accent" onClick={() => window.location.href = '/'}>Go to Home</Button>
      </div>
    );
  }

  // Dashboard Metrics Calculation
  const deliveredOrders = orders.filter(o => o.status === 'delivered' || o.status === 'shipped');
  const actualRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalSalesCount = orders.length;
  
  const topProducts = [...products]
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 5);

  const bestRated = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  const safeUsersCount = safeUsers.length;

  const myProducts = products.filter(p => 
    (p?.name || '').toLowerCase().includes(productSearch.toLowerCase()) || 
    (p.categories && p.categories.some(catSlug => 
      categories.find(c => c.slug === catSlug)?.name?.toLowerCase().includes(productSearch.toLowerCase())
    ))
  );

  // Calculate analytics data points based on timeframe
  const generateChartData = () => {
    let days = 7;
    if (analyticsTimeframe === 'daily') days = 1;
    if (analyticsTimeframe === 'monthly') days = 30;
    
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayTotal = orders
        .filter(o => o.date === dateStr && (o.status === 'delivered' || o.status === 'shipped' || o.status === 'processing' || o.status === 'pending'))
        .reduce((sum, o) => sum + (o.total || 0), 0);
      
      result.push({
        label: days > 7 ? `${d.getMonth() + 1}/${d.getDate()}` : d.toLocaleDateString('en-US', { weekday: 'short' }),
        value: dayTotal,
        date: dateStr
      });
    }
    return result;
  };

  const chartData = generateChartData();
  const weekTotal = chartData.reduce((sum, d) => sum + d.value, 0);
  const prevWeekTotal = 1000; // Placeholder for baseline comparison
  const growth = prevWeekTotal === 0 ? 100 : ((weekTotal - prevWeekTotal) / prevWeekTotal) * 100;

  const metrics = {
    averageOrderValue: actualRevenue / (deliveredOrders.length || 1),
    conversionRate: (deliveredOrders.length / (safeUsersCount || 1)) * 100,
    goalProgress: Math.min(100, Math.round((actualRevenue / revenueGoal) * 100)),
    revenueGoal // Pass the raw USD goal
  };

  // --- FINISHING TOUCHES DATA ---
  const recentActivity = [
    ...orders.slice(-5).map(o => ({ type: 'order', date: o.date, label: `New order from ${o.customerName}`, value: formatPrice(o.total), color: 'cyan' })),
    ...users.filter(u => u.createdAt).slice(-3).map(u => ({ type: 'user', date: u.createdAt.split('T')[0], label: `New user: ${u.name}`, value: 'Signup', color: 'purple' }))
  ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const categoryRevenue = categories.map(cat => {
    const revenue = orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'cancelled_customer')
      .reduce((sum, o) => {
        const catTotal = o.items
          .filter(item => {
            const prod = products.find(p => p.id === item.id);
            return prod?.categories?.includes(cat.slug);
          })
          .reduce((s, i) => s + (i.price * i.quantity), 0);
        return sum + catTotal;
      }, 0);
    return { name: cat.name, value: revenue };
  }).sort((a,b) => b.value - a.value);

  const alerts = [
    ...products.filter(p => !p.inStock).map(p => ({ type: 'stock', message: `${p.name} is out of stock`, severity: 'high' })),
    ...products.filter(p => p.rating < 3 && p.reviewCount > 0).map(p => ({ type: 'rating', message: `${p.name} has low rating (${p.rating})`, severity: 'medium' }))
  ].slice(0, 4);

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-10 lg:px-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8">
          <div className="bg-bg-800/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl group hover:border-accent-cyan/20 transition-all">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5">Admin Account</h2>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-lg font-black text-white truncate">{user?.name || 'Admin'}</div>
                <div className="text-xs text-accent-cyan font-black uppercase tracking-widest leading-none mt-1.5">{user?.role}</div>
              </div>
            </div>
            <Button 
              onClick={() => setShowUserModal(true)} 
              variant="accent" 
              size="lg" 
              className="w-full font-black italic tracking-tighter text-base py-4"
            >
              <Plus className="h-5 w-5 mr-2" /> Add New User
            </Button>
            <Button 
              onClick={() => setShowResetModal(true)} 
              variant="ghost" 
              className="w-full mt-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 py-3 text-xs font-black uppercase tracking-widest"
              title="Reset all data to default state"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Factory Reset
            </Button>
          </div>

          <nav className="p-2 bg-bg-800/30 rounded-[2rem] border border-white/5 backdrop-blur-md space-y-2">
            {[
              { id: 'finance', label: 'Finance', icon: DollarSign, count: null },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp, count: null },
              { id: 'products', label: 'Products', icon: Package, count: products.length },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
              { id: 'users', label: 'Users', icon: User, count: safeUsersCount },
              { id: 'coupons', label: 'Coupons', icon: Tag, count: coupons.length },
              { id: 'categories', label: 'Categories', icon: Package, count: categories.length },
              { id: 'settings', label: 'Settings', icon: Zap, count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shadow-[0_0_20px_rgba(0,255,255,0.1)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-accent-cyan' : 'text-gray-400'}`} />
                  {tab.label}
                </div>
                {tab.count !== null && (
                  <Badge variant={activeTab === tab.id ? 'outline' : 'secondary'} className={`ml-2 border-0 ${activeTab === tab.id ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-black/30 text-gray-500'} text-xs font-black min-w-[24px] h-6 flex items-center justify-center rounded-lg`}>
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-8">
          {/* Header */}
          <div className="bg-bg-800/50 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">
                {activeTab === 'finance' ? 'Financial Hub' :
                 activeTab === 'analytics' ? 'Performance Insights' : 
                 activeTab === 'products' ? 'Product Management' : 
                 activeTab === 'orders' ? 'Order Management' : 
                 activeTab === 'users' ? 'User Access' : 
                 activeTab === 'coupons' ? 'Coupon Management' : 'Category Management'}
              </h1>
              <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"/>
                Status: Active | Store Operations
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-end gap-6 w-full md:w-auto">
              {(activeTab === 'products') && (
                <>
                  <div className="px-6 py-3 bg-bg-900/50 rounded-2xl border border-white/5 text-right min-w-[150px]">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Revenue</div>
                    <div className="text-lg font-black text-accent-cyan">{formatPrice(actualRevenue)}</div>
                  </div>
                  <div className="px-6 py-3 bg-bg-900/50 rounded-2xl border border-white/5 text-right min-w-[130px]">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Products</div>
                    <div className="text-lg font-black text-white">{products.length}</div>
                  </div>
                </>
              )}
              {activeTab === 'orders' && (
                <>
                  <div className="px-6 py-3 bg-bg-900/50 rounded-2xl border border-white/5 text-right min-w-[150px]">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Orders</div>
                    <div className="text-lg font-black text-accent-cyan">{(orders || []).length}</div>
                  </div>
                  <div className="px-6 py-3 bg-bg-900/50 rounded-2xl border border-white/5 text-right min-w-[130px]">
                    <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Order Revenue</div>
                    <div className="text-lg font-black text-white">{formatPrice(orders.reduce((s,o) => s + (o.total || 0), 0))}</div>
                  </div>
                </>
              )}
              {activeTab === 'users' && (
                <div className="px-6 py-3 bg-bg-900/50 rounded-2xl border border-white/5 text-right min-w-[150px]">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Users</div>
                  <div className="text-lg font-black text-accent-cyan">{safeUsersCount}</div>
                </div>
              )}
              {activeTab === 'coupons' && (
                <div className="px-6 py-3 bg-bg-900/50 rounded-2xl border border-white/5 text-right min-w-[150px]">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Active Coupons</div>
                  <div className="text-lg font-black text-accent-cyan">{(coupons || []).length}</div>
                </div>
              )}
               {activeTab === 'categories' && (
                <div className="px-6 py-3 bg-bg-900/50 rounded-2xl border border-white/5 text-right min-w-[150px]">
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Categories</div>
                  <div className="text-lg font-black text-accent-cyan">{(categories || []).length}</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Bar (Condensed) - Only for operational tabs */}
          {['products', 'orders', 'users', 'coupons', 'categories'].includes(activeTab) && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <StatsCard icon={DollarSign} label="TOTAL REVENUE" value={formatPrice(actualRevenue)} color="cyan" />
              <StatsCard icon={Package} label="TOTAL PRODUCTS" value={products.length} color="purple" />
              <StatsCard icon={User} label="TOTAL USERS" value={safeUsersCount} color="green" />
              <StatsCard icon={TrendingUp} label="SALES COUNT" value={totalSalesCount} color="pink" />
            </div>
          )}

          <div className="min-h-[400px]">
        {activeTab === 'finance' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             {/* ADVANCED METRICS (High Priority) */}
             <div className="relative group">
               <PerformanceMetrics 
                 metrics={metrics} 
               />
               <button 
                 onClick={() => { 
                   setIsEditingGoal(true); 
                   // Convert USD goal to current currency for editing
                   const rate = EXCHANGE_RATES[currency] || 1;
                   setTempGoal(Math.round(revenueGoal * rate)); 
                 }}
                 className="absolute -top-3 -right-3 p-3 bg-bg-900 rounded-2xl border border-white/10 text-gray-500 hover:text-accent-cyan hover:border-accent-cyan/50 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
                 title="Set Monthly Goal"
               >
                 <Edit2 className="h-4 w-4" />
               </button>
             </div>

             {/* REVENUE TRENDS (Secondary Priority) */}
             <Card className="bg-bg-800/80 border-gray-700 p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none transition-transform group-hover:scale-110 duration-700">
                   <TrendingUp className="h-64 w-64 text-white" />
                </div>
                
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2 flex items-center gap-3">
                         Financial Hub <Activity className="h-6 w-6 text-accent-cyan animate-pulse" />
                      </h3>
                      <p className="text-sm text-gray-400 font-medium">Real-time income tracking and monthly targets.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className={`px-5 py-2.5 rounded-xl border ${growth >= 0 ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                         <div className="text-[10px] font-black uppercase tracking-widest">{growth >= 0 ? '+' : ''}{growth.toFixed(1)}% Growth</div>
                      </div>
                      <div className="flex bg-bg-900 rounded-xl border border-white/5 overflow-hidden">
                         {['daily', 'weekly', 'monthly'].map(t => (
                           <button 
                             key={t}
                             onClick={() => setAnalyticsTimeframe(t)}
                             className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${analyticsTimeframe === t ? 'bg-accent-cyan text-black' : 'text-gray-500 hover:text-white'}`}
                           >
                             {t}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="h-[250px] w-full">
                   <SalesChart data={chartData.map(d => d.value)} labels={chartData.map(d => d.label)} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-12 pt-10 border-t border-white/5">
                   {chartData.map((d, i) => (
                      <div key={i} className="text-center md:text-left">
                         <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{d.label}</div>
                         <div className={`text-lg font-black ${d.value > 0 ? 'text-accent-cyan' : 'text-white/40'}`}>{formatPrice(d.value)}</div>
                      </div>
                   ))}
                </div>
             </Card>

             {/* CATEGORY REVENUE BREAKDOWN */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {categoryRevenue.map((cat, i) => (
                  <Card key={i} className="bg-bg-800 border-gray-700 p-6 rounded-[2rem] flex items-center justify-between group hover:border-accent-cyan/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-black italic">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-xs font-black text-gray-500 uppercase tracking-widest">{cat.name}</div>
                        <div className="text-sm font-bold text-gray-400">Revenue Contribution</div>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-black text-white group-hover:text-accent-cyan transition-colors">{formatPrice(cat.value)}</div>
                       <div className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">
                         {((cat.value / (actualRevenue || 1)) * 100).toFixed(1)}%
                       </div>
                    </div>
                  </Card>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Products */}
                <Card className="bg-bg-800 border-gray-700 p-8 rounded-[2rem]">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-black text-white uppercase tracking-widest italic">Popular Products</h3>
                      <TrendingUp className="h-5 w-5 text-accent-cyan" />
                   </div>
                   <div className="space-y-6">
                      {topProducts.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-5 group">
                           <div className="text-sm font-black text-gray-700 w-6 italic">#{i+1}</div>
                           <img src={p.images?.[0]} className="h-12 w-12 rounded-xl object-cover border border-white/5" alt="" />
                           <div className="flex-1">
                              <div className="text-sm font-bold text-white group-hover:text-accent-cyan transition-colors">{p.name}</div>
                              <div className="text-xs text-gray-400 uppercase font-black tracking-widest mt-1">{p.reviewCount} Reviews</div>
                           </div>
                           <div className="text-right">
                              <div className="text-sm font-black text-accent-cyan">{formatPrice(p.price)}</div>
                              <div className="w-24 h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                 <div className="h-full bg-accent-cyan shadow-[0_0_8px_rgba(0,255,255,0.4)]" style={{ width: `${Math.min(100, (p.reviewCount / (topProducts[0]?.reviewCount || 1)) * 100)}%` }}></div>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>

                {/* Rating Leaders */}
                <Card className="bg-bg-800 border-gray-700 p-8 rounded-[2rem]">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-black text-white uppercase tracking_widest italic">Rating Leaders</h3>
                      <div className="flex text-yellow-400"><Tag className="h-5 w-5 fill-current" /></div>
                   </div>
                   <div className="space-y-6">
                      {bestRated.map((p, i) => (
                        <div key={p.id} className="flex items-center gap-5 group">
                           <div className="text-sm font-black text-gray-700 w-6 italic">#{i+1}</div>
                           <img src={p.images?.[0]} className="h-12 w-12 rounded-xl object-cover border border-white/5" alt="" />
                           <div className="flex-1">
                              <div className="text-sm font-bold text-white group-hover:text-accent-purple transition-colors">{p.name}</div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                 {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`w-2 h-2 rounded-full ${i < Math.round(p.rating) ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]' : 'bg-gray-800'}`} />
                                 ))}
                                 <span className="text-xs font-black text-gray-400 ml-2">{p.rating}</span>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-sm font-black text-accent-purple">{formatPrice(p.price)}</div>
                              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Customer Rating</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
             </div>

             {/* Inventory Status & Alerts */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-bg-800 border-gray-700 p-10 rounded-[2rem]">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex-1">
                         <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-3">Inventory Status</h3>
                         <p className="text-sm text-gray-400 leading-relaxed font-medium">Real-time view of stock levels and categories in your store.</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto">
                         <div className="p-6 bg-bg-900 rounded-3xl border border-white/5 text-center min-w-[120px]">
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">In Stock</div>
                            <div className="text-3xl font-black text-green-400">{products.filter(p => p.inStock).length}</div>
                         </div>
                         <div className="p-6 bg-bg-900 rounded-3xl border border-white/5 text-center min-w-[120px]">
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Depleted</div>
                            <div className="text-3xl font-black text-red-500">{products.filter(p => !p.inStock).length}</div>
                         </div>
                         <div className="p-6 bg-bg-900 rounded-3xl border border-white/5 text-center min-w-[120px]">
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Avg Rating</div>
                            <div className="text-3xl font-black text-accent-cyan">{(products.reduce((s, p) => s + (p.rating || 0), 0) / products.length).toFixed(1)}</div>
                         </div>
                         <div className="p-6 bg-bg-900 rounded-3xl border border-white/5 text-center min-w-[120px]">
                            <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Categories</div>
                            <div className="text-3xl font-black text-accent-purple">{categories.length}</div>
                         </div>
                      </div>
                   </div>
                </Card>

                <div className="space-y-6">
                   {alerts.length > 0 ? alerts.map((alert, i) => (
                      <Card key={i} className="bg-bg-800/50 border-gray-700/50 p-6 rounded-3xl flex items-center gap-4">
                         <div className={`h-10 w-10 rounded-full flex items-center justify-center ${alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                            <Zap className="h-5 w-5" />
                         </div>
                         <div>
                            <div className={`text-xs font-black uppercase tracking-widest ${alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>Attention Needed</div>
                            <div className="text-sm font-bold text-white mt-0.5">{alert.message}</div>
                         </div>
                      </Card>
                   )) : (
                      <Card className="bg-bg-800/50 border-gray-700/50 p-6 rounded-3xl flex items-center gap-4 h-full">
                         <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <Check className="h-5 w-5" />
                         </div>
                         <div>
                            <div className="text-xs font-black uppercase tracking-widest text-green-400">All Good</div>
                            <div className="text-sm font-bold text-white mt-0.5">No immediate alerts.</div>
                         </div>
                      </Card>
                   )}
                </div>
             </div>

             {/* Recent Activity Feed */}
             <div className="grid grid-cols-1">
                <Card className="bg-bg-800 border-gray-700 p-8 rounded-[2rem]">
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-base font-black text-white uppercase tracking-widest italic">Live Activity Feed</h3>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-cyan"></span>
                        </span>
                        <span className="text-xs font-bold text-accent-cyan uppercase tracking-widest">Live Updates</span>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {recentActivity.map((activity, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-bg-900/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${activity.color === 'cyan' ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-accent-purple/10 text-accent-purple'}`}>
                                  {activity.type === 'order' ? <ShoppingBag className="h-5 w-5" /> : <User className="h-5 w-5" />}
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-white">{activity.label}</div>
                                  <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">{activity.date}</div>
                               </div>
                            </div>
                            <div className={`text-sm font-black ${activity.color === 'cyan' ? 'text-accent-cyan' : 'text-accent-purple'}`}>
                               {activity.value}
                            </div>
                         </div>
                      ))}
                   </div>
                </Card>
             </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <Card className="overflow-hidden bg-bg-800 p-0 border-gray-700 rounded-[2rem]">
            <div className="p-8 border-b border-gray-700 bg-bg-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-bg-900 border border-gray-700 rounded-xl pl-12 pr-6 py-4 text-base text-white focus:border-accent-cyan outline-none transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
              </div>
              <Button onClick={() => setIsModalOpen(true)} variant="accent" size="lg" className="shadow-lg shadow-accent-cyan/20 whitespace-nowrap font-black tracking-tighter italic px-8 py-4 text-base">
                <Plus className="h-5 w-5 mr-2" /> ADD NEW PRODUCT
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base text-gray-300">
                <thead className="bg-bg-900/50 text-sm uppercase text-gray-400 font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Product</th>
                    <th className="px-8 py-6">Price</th>
                    <th className="px-8 py-6">Category</th>
                    <th className="px-8 py-6">Stock</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {myProducts.map((product) => (
                    <tr key={product?.id || Math.random()} className="hover:bg-bg-700/30 transition-colors">
                      <td className="px-8 py-6 font-bold text-white flex items-center gap-4">
                        <img 
                          src={product?.images?.[0] || product?.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=100&q=80'} 
                          className={`h-12 w-12 rounded-xl bg-bg-900 object-cover border border-gray-700 shadow-lg ${!product?.inStock ? 'grayscale opacity-50' : ''}`} 
                          alt={product?.name || 'Product'}
                        />
                        <span className={`truncate max-w-[250px] text-base ${!product?.inStock ? 'text-gray-600' : ''}`}>{product?.name || 'Unnamed'}</span>
                      </td>
                      <td className="px-8 py-6 text-accent-cyan font-black text-lg">{formatPrice(product?.price || 0)}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-wrap gap-2">
                          {product.categories?.map(catSlug => (
                            <Badge key={catSlug} variant="outline" className="text-[10px] px-3 py-0.5 border-white/10 text-gray-400 font-black uppercase tracking-widest whitespace-nowrap bg-white/5">
                              {categories.find(c => c.slug === catSlug)?.name || catSlug}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => updateProduct(product.id, { inStock: !product.inStock })}
                          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                            product.inStock 
                              ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                              : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-5">
                          <button onClick={() => setEditingProduct(product)} className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => setConfirmDialog({
                              isOpen: true,
                              title: 'Delete Product',
                              message: `Are you sure you want to delete "${product?.name}"?`,
                              onConfirm: () => product?.id && deleteProduct(product.id),
                              confirmText: 'Delete'
                            })}
                            className="text-gray-400 hover:text-red-400 p-2 bg-white/5 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {myProducts.length === 0 && (
                <div className="p-12 text-center text-gray-500 italic">No products found.</div>
              )}
            </div>
          </Card>
        )}
      
      {activeTab === 'orders' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cancelled_by_customer'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setOrderFilter(status); setOrderPage(1); }}
                  className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    orderFilter === status
                      ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                      : 'bg-bg-800 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={orderSearch}
                onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
                className="w-full bg-bg-800 border border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:border-accent-cyan outline-none transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                <Search className="h-3.5 w-3.5" />
              </div>
              {orderSearch && (
                <button 
                  onClick={() => setOrderSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            
            {orders.some(o => o.status.startsWith('cancelled')) && (
              <button
                onClick={() => setConfirmDialog({
                  isOpen: true,
                  title: 'Delete All Cancelled Orders',
                  message: 'Are you sure you want to permanently delete ALL cancelled orders? This action cannot be undone.',
                  onConfirm: deleteCancelledOrders,
                  confirmText: 'Delete All Cancelled'
                })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
              >
                <Trash2 className="h-3 w-3" />
                Delete All Cancelled
              </button>
            )}
          </div>

          {(() => {
            const filteredOrders = orders
              .filter(o => orderFilter === 'all' || o.status === orderFilter)
              .filter(o => {
                const searchLower = orderSearch.toLowerCase();
                const customerName = (o.customer?.name || o.customerName || '').toLowerCase();
                const orderId = (o.id || '').toLowerCase();
                return customerName.includes(searchLower) || orderId.includes(searchLower);
              })
              .sort((a, b) => {
                 const getTs = (o) => {
                    if (o.createdAt) return new Date(o.createdAt).getTime();
                    const parts = o.id.split('-');
                    if (parts.length > 1 && !isNaN(parts[1])) return Number(parts[1]);
                    return new Date(o.date).getTime();
                 };
                 return getTs(b) - getTs(a);
              });

            const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
            const paginatedOrders = filteredOrders.slice(
              (orderPage - 1) * ordersPerPage,
              orderPage * ordersPerPage
            );

            if (filteredOrders.length === 0) {
              return (
                <Card className="p-12 text-center bg-bg-800 border-gray-800">
                  <ShoppingBag className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No {orderFilter !== 'all' ? orderFilter : ''} Orders Found</h3>
                  <p className="text-gray-400">{orderSearch ? `No orders match "${orderSearch}"` : 'Order status entries will appear here.'}</p>
                </Card>
              );
            }

            return (
              <>
                <div className="space-y-6">
                  {paginatedOrders.map((order) => {
                    // Calculate timestamp and format date
                    const timestamp = order.createdAt 
                      ? new Date(order.createdAt)
                      : (order.id && typeof order.id === 'string' && order.id.length > 10)
                        ? new Date(Number(order.id))
                        : new Date(order.date || Date.now());
                    
                    const formattedDate = timestamp.toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric', 
                      hour: 'numeric', 
                      minute: '2-digit', 
                      hour12: true 
                    });

                    return (
                     <Card key={order.id} className="bg-bg-800 p-0 border-gray-700 shadow-2xl relative group overflow-hidden rounded-[2rem]">
                <div className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleOrder(order.id)}>
                      <div className="flex items-center gap-4 mb-4">
                        <Badge variant="outline" className="font-mono text-sm bg-white/5 border-white/10 text-accent-cyan py-1.5 px-4 rounded-xl">
                         #{order.displayId}
                       </Badge>
                        <User className="h-5 w-5 text-accent-cyan" />
                        <span className="text-base font-black text-white uppercase tracking-widest">{order.customer?.name || order.customerName || 'Guest'}</span>
                        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${expandedOrders.includes(order.id) ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {formattedDate}</div>
                        <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> {formatPrice(order.total)}</div>
                        <div className="text-accent-cyan font-black uppercase tracking-[0.2em] text-[10px] border-b border-accent-cyan/20 pb-0.5">{order.items?.length || 0} Items Ordered</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-6 py-3 rounded-xl border text-xs font-black uppercase tracking-widest outline-none transition-all cursor-pointer shadow-lg ${
                          order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          : order.status === 'processing' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : order.status === 'shipped' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : order.status === 'delivered' ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : order.status === 'cancelled_by_customer' ? 'bg-orange-950/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                          : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                      >
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'cancelled_by_customer'].map(s => (
                          <option key={s} value={s} className="bg-bg-900 py-2" disabled={s === 'cancelled_by_customer' && order.status !== s}>
                            {s === 'cancelled_by_customer' ? 'Cancelled (Customer)' : s.toUpperCase()}
                          </option>
                        ))}
                      </select>
                      
                      {order.status.startsWith('cancelled') && (
                        <button
                          onClick={() => setConfirmDialog({
                            isOpen: true,
                            title: 'Delete Order Record',
                            message: `Are you sure you want to permanently delete order #${order.displayId}?`,
                            onConfirm: () => deleteOrder(order.id || order._id),
                            confirmText: 'Delete'
                          })}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete cancelled order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                   {/* Expandable Order Details */}
                  {expandedOrders.includes(order.id) && (
                    <div className="mt-10 pt-10 border-t border-white/5 space-y-10 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         {/* Items Table */}
                         <div className="space-y-6">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] pl-1">Product List</h4>
                            <div className="space-y-4">
                               {order.items?.map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 group/item hover:border-accent-cyan/20 transition-all">
                                    <div className="h-16 w-16 rounded-xl bg-bg-900 p-2 border border-white/5 shrink-0 shadow-lg">
                                       <img src={item.image || item.images?.[0]} className="h-full w-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <div className="text-sm font-bold text-white truncate">{item.name}</div>
                                       <div className="flex items-center gap-3 flex-wrap">
                                        <div className="text-xs text-gray-500 font-bold">{formatPrice(item.price)} each</div>
                                        <Badge className="bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan text-xs px-3 py-0.5 font-black">
                                          QTY: {item.quantity}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-base font-black text-accent-cyan">{formatPrice(item.price * item.quantity)}</div>
                                 </div>
                               ))}
                            </div>
                         </div>

                         {/* Customer Info */}
                         <div className="space-y-6">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] pl-1">Customer Details</h4>
                            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden">
                               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                 <User className="h-24 w-24 text-white" />
                               </div>
                               <div className="flex items-center gap-4">
                                  <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan shadow-lg"><Mail className="h-5 w-5" /></div>
                                  <div>
                                     <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Email Address</div>
                                     <div className="text-sm font-bold text-white lowercase">{order.customer?.email || 'N/A'}</div>
                                  </div>
                               </div>
                               <div className="flex items-start gap-4">
                                  <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple shadow-lg"><Package className="h-5 w-5" /></div>
                                  <div>
                                     <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Shipping Address</div>
                                     <div className="text-sm font-bold text-white leading-relaxed mt-1">
                                        {order.customer?.address || 'Store Address'}<br/>
                                        {order.customer?.city || 'New York'}, {order.customer?.zip || '10001'}
                                     </div>
                                  </div>
                               </div>
                               <div className="pt-6 border-t border-white/5">
                                   <div className="flex justify-between items-center mb-4">
                                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Method</span>
                                     <div className="flex items-center gap-2">
                                       <Badge variant="outline" className="text-[11px] py-1 px-4 uppercase border-white/10 text-gray-400 font-black tracking-widest bg-white/5">
                                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                                       </Badge>
                                       {order.isPaid ? (
                                         <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-black uppercase tracking-widest">PAID</Badge>
                                       ) : (
                                         <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] font-black uppercase tracking-widest">UNPAID</Badge>
                                       )}
                                     </div>
                                   </div>
                                   
                                   {order.transactionId && (
                                     <div className="p-4 rounded-xl bg-bg-900 border border-white/5 mb-4">
                                       <div className="flex justify-between items-center mb-1">
                                         <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Transaction ID</div>
                                         <button className="text-[10px] text-accent-cyan font-bold hover:underline">Copy</button>
                                       </div>
                                       <div className="font-mono text-white text-lg font-bold tracking-wider">{order.transactionId}</div>
                                     </div>
                                   )}

                                   {/* Manual Payment Verification Action */}
                                   {!order.isPaid && order.transactionId && (
                                      <Button 
                                        size="sm" 
                                        variant="accent" 
                                        className="w-full bg-green-600 hover:bg-green-500 text-white border-none font-black uppercase tracking-widest text-[10px] py-3"
                                        onClick={() => verifyPayment(order.id)}
                                      >
                                        <Check className="h-4 w-4 mr-2" /> Verify & Mark Paid
                                      </Button>
                                   )}
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
                      </div>
                    </Card>
                  );
                })}
              </div>
                
                <Pagination 
                  currentPage={orderPage} 
                  totalPages={totalPages} 
                  onPageChange={setOrderPage} 
                />
              </>
            );
          })()}
        </div>
      )}

        {activeTab === 'users' && (
          <Card className="overflow-hidden bg-bg-800 p-0 border-gray-700 rounded-[2rem]">
            <div className="p-8 border-b border-gray-700 bg-bg-800/50">
              <div className="relative w-full max-w-md">
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-bg-900 border border-gray-700 rounded-xl pl-12 pr-6 py-4 text-base text-white focus:border-accent-cyan outline-none transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base text-gray-300">
                <thead className="bg-bg-900/50 text-sm uppercase text-gray-400 font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-6">User</th>
                    <th className="px-8 py-6">Account Type</th>
                    <th className="px-8 py-6">Joined Date</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-bg-700/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-2xl bg-bg-900 flex items-center justify-center text-accent-cyan font-black border border-gray-700 shadow-lg">
                            {(u?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-black text-white text-base">{u?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{u?.email || 'No Email'}</div>
                          </div>
                        </div>
                      </td>
                       <td className="px-8 py-6">
                        <Badge variant={u.role === 'admin' ? 'accent' : 'outline'} className={`${u.role === 'admin' ? 'bg-accent-purple text-white border-none' : 'text-gray-400 border-gray-700'} text-[10px] px-3 py-0.5 font-black uppercase tracking-widest`}>
                          {(u.role || 'customer').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-sm font-black font-mono text-gray-500 tracking-tighter">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-5">
                          {u.email !== user.email && (
                            <>
                              <button 
                                onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'customer' : 'admin')} 
                                className="text-xs font-black uppercase tracking-[0.2em] text-accent-cyan hover:text-white transition-colors underline decoration-accent-cyan/30 underline-offset-4"
                              >
                                {u.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>
                              <button 
                                onClick={() => setConfirmDialog({
                                  isOpen: true,
                                  title: 'Delete User',
                                  message: `Permanently delete user "${u.name}"? This cannot be undone.`,
                                  onConfirm: () => deleteUser(u.id),
                                  confirmText: 'Delete User'
                                })}
                                className="text-gray-400 hover:text-red-400 p-2 bg-white/5 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {u.email === user.email && <span className="text-xs text-accent-cyan font-black uppercase tracking-widest italic opacity-60">Current Session</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="p-12 text-center text-gray-500">No users found.</div>}
            </div>
          </Card>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center px-2">
              <p className="text-base text-gray-400 font-medium">Active discount codes for orders.</p>
              <Button onClick={() => setShowCouponModal(true)} variant="accent" size="lg" className="font-black italic tracking-tighter text-sm px-6 py-4"><Plus className="h-5 w-5 mr-2" /> Add Coupon</Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="p-8 bg-bg-800 border-gray-700 relative group overflow-hidden rounded-[2.5rem] shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-white bg-bg-900 px-5 py-2 rounded-2xl border border-gray-700 shadow-neon-blue tracking-tighter">{coupon.code}</span>
                    <button onClick={() => deleteCoupon(coupon.id)} className="text-gray-500 hover:text-red-400 p-2 bg-white/5 rounded-lg transition-colors"><Trash2 className="h-5 w-5" /></button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-lg font-black text-accent-cyan flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `${formatPrice(coupon.discount)} OFF`}
                    </div>
                    {coupon.expiryDate && (
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {coupons.length === 0 && <div className="md:col-span-3 p-20 text-center text-gray-500 border border-dashed border-gray-800 rounded-[2.5rem] italic text-base">No coupons created yet.</div>}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center px-2">
              <p className="text-base text-gray-400 font-medium">Organize your store with categories.</p>
              <Button onClick={() => setShowCategoryModal(true)} variant="accent" size="lg" className="font-black italic tracking-tighter text-sm px-6 py-4"><Plus className="h-5 w-5 mr-2" /> Add Category</Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {categories.map((cat) => {
                const count = products.filter(p => p.categories?.includes(cat.slug)).length;
                return (
                  <Card key={cat.id} className="p-8 bg-bg-800 border-gray-700 rounded-[2.5rem] shadow-2xl group hover:border-accent-cyan/30 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-2xl font-black text-white capitalize tracking-tighter italic">{cat.name}</h4>
                      <button onClick={() => {
                        if (count > 0) {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Protected Category',
                            message: `This category contains ${count} products. Reassign them before deleting.`,
                            onConfirm: () => {},
                            confirmText: 'Got it'
                          });
                        } else {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Delete Category',
                            message: `Delete "${cat.name}" category?`,
                            onConfirm: () => deleteCategory(cat.id),
                            confirmText: 'Delete'
                          });
                        }
                      }} className="text-gray-500 hover:text-red-400 p-2 bg-white/5 rounded-lg transition-colors"><Trash2 className="h-5 w-5" /></button>
                    </div>
                    <Badge variant="accent" className="bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30 px-4 py-1 text-xs font-black uppercase tracking-widest">{count} Products</Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
             <Card className="bg-bg-800 border-gray-700 p-10 rounded-[2rem]">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8">Payment Configuration</h3>
                
                <div className="space-y-8 max-w-xl">
                   {/* JazzCash Section */}
                   <div className="space-y-4 p-6 bg-bg-900/50 rounded-2xl border border-red-500/10">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                           <Zap className="h-4 w-4" />
                         </div>
                         <h4 className="text-lg font-black text-white uppercase tracking-wider">JazzCash Settings</h4>
                      </div>
                      <div>
                         <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Account Title</label>
                         <Input 
                           placeholder="e.g. Asad Ullah"
                           value={paymentInfo?.jazzcash?.title || ''}
                           onChange={(e) => setPaymentInfo(prev => ({ 
                             ...prev, 
                             jazzcash: { ...(prev?.jazzcash || {}), title: e.target.value } 
                           }))}
                           className="bg-bg-800 border-gray-700 text-white focus:border-red-500"
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Account Number</label>
                         <Input 
                           placeholder="e.g. 0300-1234567"
                           value={paymentInfo?.jazzcash?.number || ''}
                           onChange={(e) => setPaymentInfo(prev => ({ 
                             ...prev, 
                             jazzcash: { ...(prev?.jazzcash || {}), number: e.target.value } 
                           }))}
                           className="bg-bg-800 border-gray-700 text-white focus:border-red-500 font-mono"
                         />
                      </div>
                   </div>

                   {/* EasyPaisa Section */}
                   <div className="space-y-4 p-6 bg-bg-900/50 rounded-2xl border border-green-500/10">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                           <Zap className="h-4 w-4" />
                         </div>
                         <h4 className="text-lg font-black text-white uppercase tracking-wider">EasyPaisa Settings</h4>
                      </div>
                      <div>
                         <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Account Title</label>
                         <Input 
                           placeholder="e.g. Asad Ullah"
                           value={paymentInfo?.easypaisa?.title || ''}
                           onChange={(e) => setPaymentInfo(prev => ({ 
                             ...prev, 
                             easypaisa: { ...(prev?.easypaisa || {}), title: e.target.value } 
                           }))}
                           className="bg-bg-800 border-gray-700 text-white focus:border-green-500"
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Account Number</label>
                         <Input 
                           placeholder="e.g. 0300-1234567"
                           value={paymentInfo?.easypaisa?.number || ''}
                            onChange={(e) => setPaymentInfo(prev => ({ 
                             ...prev, 
                             easypaisa: { ...(prev?.easypaisa || {}), number: e.target.value } 
                           }))}
                           className="bg-bg-800 border-gray-700 text-white focus:border-green-500 font-mono"
                         />
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5">
                      <Button 
                        onClick={savePaymentSettings}
                        className="w-full bg-accent-cyan hover:bg-cyan-400 text-black font-black uppercase tracking-widest py-4"
                      >
                        Save Settings
                      </Button>
                   </div>
                </div>
             </Card>

             <Card className="bg-bg-800 border-gray-700 p-10 rounded-[2rem] mt-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Email Service Diagnostics</h3>
                    <p className="text-gray-400 text-sm mt-1">Verify your EmailJS connection and template configuration.</p>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-bg-900 border border-white/10">
                        <ShieldCheck className="h-5 w-5 text-accent-cyan" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Automated Health Check</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          This tool will send a test order confirmation to your email (<span className="text-white font-medium">{user.email}</span>). 
                          If it fails, it will provide the specific error message from EmailJS.
                        </p>
                      </div>
                   </div>

                   <Button 
                     onClick={reverifyEmailConfig}
                     variant="outline"
                     className="w-full border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10 font-black uppercase tracking-widest py-4"
                   >
                     Test Email Connection
                   </Button>
                </div>
             </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      {(isModalOpen || editingProduct) && (
        <AddProductModal 
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
          onAdd={editingProduct ? (p) => updateProduct(editingProduct.id, p) : addProduct}
          categories={categories}
          editProduct={editingProduct}
        />
      )}
      
      {showUserModal && <AddUserModal onClose={() => setShowUserModal(false)} onAdd={registerUser} />}
      {showCouponModal && <AddCouponModal onClose={() => setShowCouponModal(false)} onAdd={addCoupon} />}
      {showCategoryModal && <AddCategoryModal onClose={() => setShowCategoryModal(false)} onAdd={addCategory} />}
      

      
      {/* RESET SECURITY MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 transition-all duration-300">
          <Card className={`w-full max-w-sm bg-bg-900 border-2 p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${
            resetStatus === 'error' ? 'border-red-500 shadow-red-500/20' : 
            resetStatus === 'success' ? 'border-green-500 shadow-green-500/20' : 
            'border-red-500/30 shadow-black/50'
          }`}>
            <div className="flex flex-col items-center text-center">
              
              {/* STATUS ICON */}
              <div className={`p-6 rounded-full mb-8 transition-all duration-500 ${
                resetStatus === 'error' ? 'bg-red-500/10 scale-110 animate-shake' : 
                resetStatus === 'success' ? 'bg-green-500/10 scale-125' : 
                'bg-red-500/10'
              }`}>
                {resetStatus === 'error' ? (
                  <X className="h-12 w-12 text-red-500 animate-in zoom-in spin-in-90 duration-300" />
                ) : resetStatus === 'success' ? (
                  <Check className="h-12 w-12 text-green-500 animate-in zoom-in duration-300" />
                ) : (
                  <ShieldAlert className="h-12 w-12 text-red-500 animate-pulse" />
                )}
              </div>

              {/* TEXT CONTENT */}
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-3">
                {resetStatus === 'error' ? 'Access Denied' : 
                 resetStatus === 'success' ? 'Access Granted' : 
                 'Security Check'}
              </h2>
              
              <p className={`text-sm mb-8 font-medium transition-colors ${
                resetStatus === 'error' ? 'text-red-400' : 
                resetStatus === 'success' ? 'text-green-400' : 
                'text-gray-400'
              }`}>
                {resetStatus === 'error' ? 'Incorrect PIN code entered.' : 
                 resetStatus === 'success' ? 'Initiating system reset...' : 
                 'Enter administrator PIN to confirm reset.'}
              </p>
              
              {/* PIN INPUT */}
              {resetStatus !== 'success' && (
                <div className="w-full relative group mb-8">
                   <div className="absolute inset-0 bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-colors rounded-xl" />
                   <Input 
                    type="password" 
                    placeholder="••••" 
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (resetStatus === 'error') setResetStatus('idle');
                    }}
                    className={`text-center text-3xl tracking-[0.5em] font-black h-16 bg-bg-800 focus:bg-bg-900 transition-all ${
                      resetStatus === 'error' ? 'border-red-500 text-red-500' : 'border-red-500/30 text-white focus:border-red-500'
                    }`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (pinInput === '5858') {
                          setResetStatus('success');
                          setTimeout(() => factoryReset(true), 1500);
                        } else {
                          setResetStatus('error');
                          setPinInput('');
                        }
                      }
                    }}
                  />
                </div>
              )}
              
              {/* ACTIONS */}
              {resetStatus !== 'success' && (
                <div className="flex w-full gap-4">
                  <Button variant="ghost" onClick={() => { setShowResetModal(false); setResetStatus('idle'); setPinInput(''); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    variant="accent" 
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20"
                    onClick={() => {
                      if (pinInput === '5858') {
                        setResetStatus('success');
                        setTimeout(() => factoryReset(true), 1500);
                      } else {
                        setResetStatus('error');
                        setPinInput('');
                      }
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* GOAL EDIT MODAL */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <Card className="w-full max-w-md bg-bg-900 border-gray-700 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-6">Set Monthly Goal</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Revenue Target</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input 
                    type="number" 
                    value={tempGoal} 
                    onChange={(e) => setTempGoal(Number(e.target.value))}
                    className="pl-12 bg-bg-800 border-gray-700 text-white focus:border-accent-cyan"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsEditingGoal(false)}>Cancel</Button>
                <Button variant="accent" onClick={() => { 
                  // Convert current currency value BACK to USD for storage
                  const rate = EXCHANGE_RATES[currency] || 1;
                  setRevenueGoal(tempGoal / rate); 
                  setIsEditingGoal(false); 
                }}>Save Target</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
        onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(d => ({ ...d, isOpen: false })); }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
      />
        </div>
      </div>
    </div>
  );
}

/**
 * Helper component for displaying analytics metric cards
 */
function StatsCard({ icon: Icon, label, value, color }) {
  const themes = {
    cyan: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
    purple: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
    pink: 'bg-accent-pink/10 text-accent-pink border-accent-pink/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
  };
  return (
    <Card className={`p-8 border ${themes[color] || themes.cyan} rounded-[2rem]`}>
      <div className="flex items-center gap-6">
        <div className="p-4 rounded-2xl bg-white/5 shadow-xl"><Icon className="h-8 w-8" /></div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-1.5">{label}</div>
          <div className="text-4xl font-black tracking-tight">{value}</div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Modal component for adding or editing products in the catalog
 */
function AddProductModal({ onClose, onAdd, categories, editProduct }) {
  const { currency, EXCHANGE_RATES, addToast } = useStore();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState(
    Array.isArray(editProduct?.images) 
      ? editProduct.images.filter(img => typeof img === 'string' && img.startsWith('http')) 
      : ['']
  );
  const [uploadedImages, setUploadedImages] = useState(
    Array.isArray(editProduct?.images)
      ? editProduct.images.filter(img => typeof img === 'string' && img.startsWith('data:'))
      : []
  );
  const [selectedCategories, setSelectedCategories] = useState(
    editProduct?.categories || (editProduct?.category ? [editProduct.category] : [])
  );

  /**
   * Processes file input and converts images to Base64 for preview and storage
   */
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Limits: Max 5 images total, Max 10MB each
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_IMAGES = 5;
    
    if (uploadedImages.length + files.length > MAX_IMAGES) {
      if (addToast) addToast(`Maximum ${MAX_IMAGES} images allowed per product.`, 'warning');
      e.target.value = null;
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > MAX_SIZE) {
        if (addToast) addToast(`Image "${file.name}" exceeds 10MB limit.`, 'error');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      e.target.value = null;
      return;
    }

    const newBase64s = await Promise.all(
      validFiles.map(file => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      }))
    );
    setUploadedImages(prev => [...prev, ...newBase64s]);
    e.target.value = null; // Clear input to allow re-upload of same file
  };

  /**
   * Validates and submits the product data after currency normalization
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    // Combine manual URLs and uploaded Base64 strings
    const finalImages = [
      ...imageUrls.filter(url => url && url.trim().length > 0),
      ...uploadedImages
    ];

    // Fallback image if none provided
    if (finalImages.length === 0) {
      finalImages.push('https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&q=80');
    }

    // Currency Normalization: Data is stored in USD internally
    const currentRate = (EXCHANGE_RATES && EXCHANGE_RATES[currency]) || 1;
    const priceInput = Number(formData.get('price'));
    const originalPriceInput = formData.get('originalPrice') ? Number(formData.get('originalPrice')) : null;

    // Convert local price BACK to base USD for storage consistency
    const priceInUSD = priceInput / currentRate;
    const originalPriceInUSD = originalPriceInput ? originalPriceInput / currentRate : null;

    try {
      setLoading(true);
      await onAdd({
        name: formData.get('name'),
        price: priceInUSD,
        originalPrice: originalPriceInUSD,
        categories: selectedCategories.length > 0 ? selectedCategories : ['uncategorized'],
        description: formData.get('description'),
        images: finalImages,
        provider: formData.get('provider') || 'Official Store',
        shipping: formData.get('shipping') || 'Neon Direct',
        inStock: formData.get('inStock') === 'true',
        rating: editProduct?.rating || 0,
        reviewCount: editProduct?.reviewCount || 0,
        reviews: editProduct?.reviews || []
      });
      
      if (addToast) addToast(editProduct ? 'Product updated successfully' : 'Product created successfully', 'success');
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
      // Error toast is already handled in StoreContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <Card className="w-full max-w-2xl bg-bg-900 border-gray-700 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input name="name" label="Product Name" defaultValue={editProduct?.name} required placeholder="Gaming Keyboard X" />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    name="price" 
                    label={`Sale Price (${currency})`} 
                    type="number" 
                    step="0.01" 
                    defaultValue={editProduct?.price ? (editProduct.price * ((EXCHANGE_RATES && EXCHANGE_RATES[currency]) || 1)).toFixed(2) : ''} 
                    required 
                  />
                  <Input 
                    name="originalPrice" 
                    label={`List Price (${currency})`} 
                    type="number" 
                    step="0.01" 
                    defaultValue={editProduct?.originalPrice ? (editProduct.originalPrice * ((EXCHANGE_RATES && EXCHANGE_RATES[currency]) || 1)).toFixed(2) : ''} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Categories (Select Multi)</label>
                  <div className="grid grid-cols-2 gap-2 bg-bg-800 border border-gray-700 rounded-lg p-3 max-h-[140px] overflow-y-auto custom-scrollbar">
                    {(categories || []).map(c => (
                      <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(c.slug)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCategories([...selectedCategories, c.slug]);
                            else setSelectedCategories(selectedCategories.filter(s => s !== c.slug));
                          }}
                          className="w-3.5 h-3.5 rounded border-gray-600 bg-bg-900 text-accent-cyan focus:ring-accent-cyan/20"
                        />
                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${selectedCategories.includes(c.slug) ? 'text-accent-cyan' : 'text-gray-500 group-hover:text-gray-300'}`}>
                          {c.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <Input name="provider" label="Seller" defaultValue={editProduct?.provider || 'Official Store'} required />
                   <Input name="shipping" label="Shipping Method" defaultValue={editProduct?.shipping || 'Neon Direct'} required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Stock Availability</label>
                  <select name="inStock" defaultValue={editProduct?.inStock?.toString() || 'true'} className="w-full bg-bg-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent-cyan outline-none transition-all appearance-none" required>
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Product Images</label>
                
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-700">
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-lg hover:border-accent-cyan cursor-pointer transition-colors text-gray-500 hover:text-accent-cyan bg-bg-800/50">
                    <Plus className="h-6 w-6 mb-1" />
                    <span className="text-[9px] font-bold uppercase">Upload</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 italic block">Or link external URLs:</span>
                  {imageUrls.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input 
                        type="url" 
                        value={url} 
                        onChange={(e) => { const n = [...imageUrls]; n[i] = e.target.value; setImageUrls(n); }} 
                        className="flex-1 bg-bg-800 border border-gray-700 rounded px-3 py-1.5 text-xs text-white" 
                        placeholder="https://..." 
                      />
                      {imageUrls.length > 1 && (
                        <button type="button" onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400">✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setImageUrls([...imageUrls, ''])} className="text-[10px] text-accent-cyan hover:underline">+ Add Link</button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Product Description</label>
              <textarea name="description" defaultValue={editProduct?.description} className="w-full h-32 bg-bg-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-accent-cyan outline-none resize-none text-xs" required />
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-gray-800">
              <Button type="button" variant="ghost" onClick={onClose} className="font-bold underline tracking-tighter uppercase">Cancel</Button>
              <Button type="submit" variant="accent" disabled={loading} className="px-12 font-black italic tracking-tighter uppercase">
                {loading ? 'Processing...' : (editProduct ? 'Save Changes' : 'Add Product')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

// Ensure the main VendorDashboard component includes the goal modal


