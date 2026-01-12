import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Package, Clock, ShoppingBag, DollarSign, X, CheckCircle2, Truck, Box, ShieldAlert } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';

/**
 * Orders Page Component
 * Allows customers to view their order history and track real-time delivery progress.
 */
export default function Orders() {
  const { orders, user, updateOrderStatus, formatPrice } = useStore();
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm'
  });

  // Filter orders for the current user
  const myOrders = (orders || []).filter(o => 
    (o.customer?.email && user?.email && o.customer.email === user.email) || 
    (o.customerName && user?.name && o.customerName === user.name)
  ).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const getStatusSteps = (status) => {
    const steps = [
      { id: 'pending', label: 'Pending', icon: Clock },
      { id: 'processing', label: 'Processing', icon: Package },
      { id: 'shipped', label: 'Shipped', icon: Truck },
      { id: 'delivered', label: 'Delivered', icon: CheckCircle2 }
    ];
    
    if (status.startsWith('cancelled')) {
      return [{ id: status, label: status === 'cancelled_by_customer' ? 'Cancelled by You' : 'Cancelled', icon: ShieldAlert, color: 'text-red-500' }];
    }
    
    return steps;
  };

  const getActiveStepIndex = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  if (myOrders.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent-cyan/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative z-10 p-8 rounded-full bg-bg-800 border border-white/5 ring-4 ring-white/5">
            <ShoppingBag className="h-16 w-16 text-gray-500" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase italic">No Orders Yet</h2>
        <p className="text-gray-400 max-w-sm font-medium leading-relaxed mb-8">You haven't placed any orders yet. Start shopping to see your orders here.</p>
        <Link to="/">
          <Button variant="accent" size="lg" className="px-10 font-black italic tracking-tighter uppercase">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-900 pb-20 overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-screen-2xl px-6 py-20 lg:px-12">
        <div className="mb-14">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-3">Order <span className="text-accent-cyan">History</span></h1>
          <p className="text-xs text-gray-500 font-black uppercase tracking-[0.4em] pl-1 opacity-50">Track your recent purchases and delivery status</p>
        </div>
        
        <div className="space-y-10">
          {myOrders.map((order) => {
            const status = order.status || 'pending';
            const steps = getStatusSteps(status);
            const activeIdx = getActiveStepIndex(status);
            const isCancelled = status.startsWith('cancelled');
            const canCancel = status === 'pending' || status === 'processing';

            return (
              <Card key={order.id} className="overflow-hidden bg-bg-800/40 border border-white/5 backdrop-blur-xl group hover:border-white/10 transition-all duration-500 rounded-[2.5rem] shadow-2xl">
                {/* Header Section */}
                <div className="p-8 pb-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                       <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Order ID</span>
                       <Badge variant="outline" className="font-mono text-sm bg-white/5 border-white/10 text-accent-cyan py-1.5 px-4 rounded-xl">
                         #{typeof order.id === 'string' && order.id.includes('-') ? order.id.split('-')[1] : (String(order.id).slice(-6).toUpperCase())}
                       </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-black text-gray-400 uppercase tracking-widest pt-2">
                       <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> {order.date}</div>
                       <div className="w-[1px] h-4 bg-white/10" />
                       <div className="flex items-center gap-2"><DollarSign className="text-accent-cyan h-4 w-4" /> <span className="text-white text-lg">{formatPrice(order.total)}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {canCancel && (
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Cancel Order',
                            message: `Are you sure you want to cancel order #${order.id.split('-')[1] || order.id}? This action is irreversible.`,
                            onConfirm: () => updateOrderStatus(order.id, 'cancelled_by_customer'),
                            confirmText: 'Yes, Cancel'
                          });
                        }}
                        className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/20"
                      >
                        <X className="h-4 w-4" /> Cancel Order
                      </button>
                    )}
                    <Badge 
                      className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        isCancelled ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30'
                      }`}
                    >
                      {order.status === 'cancelled_by_customer' ? 'CANCELLED' : order.status}
                    </Badge>
                  </div>
                </div>

                {/* Progress Tracker (Timeline) */}
                {!isCancelled && (
                  <div className="px-10 py-10 bg-bg-900/30">
                     <div className="relative flex justify-between items-center max-w-3xl mx-auto">
                        {/* Progress Line */}
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple transition-all duration-1000" 
                             style={{ width: `${(Math.max(0, activeIdx) / 3) * 100}%` }}
                           />
                        </div>
                        
                        {/* Steps */}
                        {steps.map((step, idx) => {
                          const Icon = step.icon;
                          const isActive = idx <= activeIdx;
                          const isCurrent = idx === activeIdx;

                          return (
                            <div key={step.id} className="relative flex flex-col items-center group">
                               <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center border-2 transition-all duration-700 relative z-10 ${
                                 isActive ? 'bg-bg-800 border-accent-cyan text-accent-cyan shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'bg-bg-900 border-white/5 text-gray-700'
                               }`}>
                                 <Icon className={`h-7 w-7 ${isCurrent ? 'animate-pulse' : ''}`} />
                                 {isCurrent && <div className="absolute inset-0 rounded-[1.25rem] bg-accent-cyan/20 animate-ping opacity-30" />}
                               </div>
                               <span className={`absolute -bottom-10 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                 {step.label}
                               </span>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}

                {/* Items Section */}
                <div className="p-8 pt-12">
                   <div className="grid gap-6">
                     {order.items.map((item, idx) => (
                       <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                         <div className="h-28 w-28 flex-shrink-0 rounded-3xl bg-bg-900 border border-white/5 p-4 group-hover:scale-105 transition-transform duration-500">
                           <img src={item.image || item.images?.[0]} className="h-full w-full object-contain" />
                         </div>
                         <div className="flex-1">
                           <h4 className="font-black text-white text-2xl tracking-tighter mb-2 uppercase italic leading-none">{item.name}</h4>
                           <div className="flex items-center gap-4">
                             <div className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border border-white/5">Product ID: {item.id}</div>
                             <div className="text-xs font-black text-accent-cyan/60 uppercase tracking-widest">Quantity: {item.quantity}</div>
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-3xl font-black text-white tracking-tighter italic uppercase underline decoration-accent-cyan/20 underline-offset-4">{formatPrice(item.price)}</div>
                           <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-2">Price per unit</div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Footer / Meta */}
                <div className="px-8 py-5 bg-white/[0.03] border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1 opacity-60">Payment Method</span>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
                      </div>
                      <div className="w-[1px] h-6 bg-white/5" />
                      <div className="text-[10px] font-black text-accent-purple/60 uppercase tracking-widest italic flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Secure Delivery Guaranteed
                      </div>
                   </div>
                   <Link to={`/track?id=${order.id}`}>
                     <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">
                       View Details
                     </Button>
                   </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
      />
    </div>
  );
}

