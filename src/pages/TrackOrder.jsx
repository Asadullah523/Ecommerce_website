import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Package, Search, Clock, Truck, CheckCircle2, ShieldAlert, ShoppingBag, DollarSign, Mail, Hash, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function TrackOrder() {
  const { orders, user, updateOrderStatus, formatPrice } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchData, setSearchData] = useState({ orderId: '', email: '' });
  const [foundOrder, setFoundOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Persistence & URL Auto-Load: Load last search or URL param on mount
  useEffect(() => {
    // Access Guard: Admins should use their own dashboard
    if (user && user.role === 'admin') {
      navigate('/vendor');
      return;
    }

    const urlOrderId = searchParams.get('id');
    const savedSearch = localStorage.getItem('lastOrderSearch');

    if (urlOrderId) {
      setSearchData(prev => ({ ...prev, orderId: urlOrderId }));
      performSearch(urlOrderId, ''); // Try search by ID only first
    } else if (savedSearch) {
      const { orderId, email } = JSON.parse(savedSearch);
      setSearchData({ orderId, email });
      performSearch(orderId, email);
    }
  }, [searchParams]);

  const performSearch = (orderId, email) => {
    if (!orderId) return;
    
    setLoading(true);
    setError('');
    const orderIdInput = orderId.trim().toUpperCase();
    const emailInput = email ? email.trim().toLowerCase() : '';

    // Simulate search delay for UX
    setTimeout(() => {
      const order = orders.find(o => {
        const idMatch = o.id.toUpperCase().includes(orderIdInput) || o.id.toUpperCase() === orderIdInput;
        // If email is provided, it must match. If not (URL search), we allow ID-only for simplicity/UX
        const emailMatch = !emailInput || (o.customer?.email?.toLowerCase() === emailInput);
        return idMatch && emailMatch;
      });

      if (order) {
        setFoundOrder(order);
        // Save only if email was provided (complete search)
        if (emailInput) {
          localStorage.setItem('lastOrderSearch', JSON.stringify({ orderId, email: emailInput }));
        }
      } else {
        setError(emailInput 
          ? 'Order not found. Please check your ID and Email.' 
          : 'Order not found. Please verify the ID or enter your email for a detailed search.'
        );
        setFoundOrder(null);
      }
      setLoading(false);
    }, 800);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchData.orderId, searchData.email);
  };

  const getStatusSteps = (status) => {
    const steps = [
      { id: 'pending', label: 'Pending', icon: Clock },
      { id: 'processing', label: 'Processing', icon: Package },
      { id: 'shipped', label: 'Shipped', icon: Truck },
      { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
    ];
    
    if (status.startsWith('cancelled')) {
      const label = status === 'cancelled_by_customer' ? 'Cancelled by You' : 'Order Cancelled';
      return [{ id: status, label, icon: ShieldAlert }];
    }
    return steps;
  };

  const getActiveStepIndex = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const handleCancelOrder = () => {
    if (foundOrder) {
      updateOrderStatus(foundOrder.id, 'cancelled_by_customer');
      // Update local state to reflect change immediately without re-search
      setFoundOrder(prev => ({ ...prev, status: 'cancelled_by_customer' }));
    }
  };

  const formatStatus = (status) => {
    if (status === 'cancelled_by_customer') return 'Cancelled by You';
    if (status.startsWith('cancelled')) return 'Order Cancelled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="relative min-h-screen bg-bg-900 pb-20 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic mb-4">Track Your Order</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] max-w-md mx-auto leading-relaxed">
            Enter your order details to track your delivery
          </p>
        </div>

        {/* Search For Order */}
        <Card className="bg-bg-800/40 border-white/5 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl mb-12 shadow-2xl">
          <form onSubmit={handleSearch} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Order ID</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    required
                    placeholder="ORD-12345678"
                    value={searchData.orderId}
                    onChange={(e) => setSearchData({...searchData, orderId: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 text-sm font-bold text-white px-6 py-5 rounded-[1.5rem] outline-none focus:border-accent-cyan/40 focus:bg-white/[0.05] transition-all duration-300"
                  />
                  <Hash className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-accent-cyan transition-colors" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                <div className="relative group">
                  <input 
                    type="email" 
                    required
                    placeholder="your@email.com"
                    value={searchData.email}
                    onChange={(e) => setSearchData({...searchData, email: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 text-sm font-bold text-white px-6 py-5 rounded-[1.5rem] outline-none focus:border-accent-cyan/40 focus:bg-white/[0.05] transition-all duration-300"
                  />
                  <Mail className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-accent-cyan transition-colors" />
                </div>
              </div>
            </div>

            <Button type="submit" variant="accent" className="w-full h-16 font-black italic tracking-tighter uppercase text-lg shadow-2xl shadow-accent-cyan/20 group rounded-[1.5rem]" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" /> Searching...
                </span>
              ) : (
                <>
                  <Search className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" /> Track Order
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center animate-in fade-in slide-in-from-top-2">
                <p className="text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> {error}
                </p>
              </div>
            )}
          </form>
        </Card>

        {/* Order Results */}
        {foundOrder && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="overflow-hidden bg-bg-800/40 border border-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
              {/* Order Header */}
              <div className="p-8 md:p-10 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Order Details</span>
                     <Badge variant="outline" className="font-mono text-[11px] bg-white/5 border-white/10 text-accent-cyan py-1 px-4 rounded-lg">
                       #{foundOrder.id.split('-')[1] || foundOrder.id}
                     </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest pt-1">
                     <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Ordered: {foundOrder.date}</div>
                     <div className="w-[1px] h-3 bg-white/10" />
                     <div className="flex items-center gap-2 text-white"><DollarSign className="h-3.5 w-3.5 text-accent-cyan" /> {formatPrice(foundOrder.total)}</div>
                  </div>
                </div>
                <Badge 
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    foundOrder.status.startsWith('cancelled') ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    foundOrder.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30'
                  }`}
                >
                  {formatStatus(foundOrder.status)}
                </Badge>
              </div>

              {/* Delivery Timeline */}
              {!foundOrder.status.startsWith('cancelled') && (
                <div className="px-8 py-12 bg-bg-900/40 border-b border-white/5">
                  <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple transition-all duration-1000" 
                         style={{ width: `${(Math.max(0, getActiveStepIndex(foundOrder.status)) / 3) * 100}%` }}
                       />
                    </div>
                    {getStatusSteps(foundOrder.status).map((step, idx) => {
                      const Icon = step.icon;
                      const isActive = idx <= getActiveStepIndex(foundOrder.status);
                      const isCurrent = idx === getActiveStepIndex(foundOrder.status);
                      return (
                        <div key={step.id} className="relative flex flex-col items-center">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 relative z-10 ${
                             isActive ? 'bg-bg-800 border-accent-cyan text-accent-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-bg-900 border-white/10 text-gray-700'
                           }`}>
                             <Icon className={`h-5 w-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                           </div>
                           <span className={`absolute -bottom-8 whitespace-nowrap text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-700'}`}>
                             {step.label}
                           </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="p-8 md:p-10 space-y-6">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 pl-1">Items Ordered</h4>
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-5 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                    <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-bg-900 border border-white/5 p-2 overflow-hidden">
                      <img src={item.image || item.images?.[0]} className="h-full w-full object-contain transition-transform group-hover:scale-110" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-black text-white text-base tracking-tight mb-1">{item.name}</h5>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Quantity: {item.quantity}</span>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-white">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Details */}
              <div className="p-8 bg-white/[0.03] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1 opacity-60">Payment Method</span>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">
                        {foundOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                      </span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10 hidden md:block" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1 opacity-60">Delivery Location</span>
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">{foundOrder.customer?.city || 'New York'}, {foundOrder.customer?.zip || '10001'}</span>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-accent-cyan text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                    <CheckCircle2 className="h-4 w-4" /> Tracking Enabled
                 </div>
              </div>

              {/* Order Actions */}
              {(foundOrder.status === 'pending' || foundOrder.status === 'processing') && (
                 <div className="px-8 pb-8 pt-6 flex justify-end">
                    <Button 
                      onClick={() => setIsCancelDialogOpen(true)}
                      variant="outline" 
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-black uppercase tracking-widest text-xs py-3 px-6"
                    >
                      Cancel Order
                    </Button>
                 </div>
              )}
            </Card>
          </div>
        )}

        {/* Global Confirm Dialog */}
        <ConfirmDialog 
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          onConfirm={handleCancelOrder}
          title="Cancel Order"
          message="Are you sure you want to cancel this order? This action cannot be undone."
          confirmVariant="destructive"
          confirmText="Yes, Cancel Order"
        />

        {/* Help Link */}
        {!foundOrder && (
          <div className="mt-12 text-center">
             <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
               Can't find your order? <Link to="/login" className="text-accent-cyan hover:underline ml-1">Sign in to your account</Link>
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
