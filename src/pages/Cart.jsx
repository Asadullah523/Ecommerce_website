import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

/**
 * Shopping Cart Page Component
 * Allows users to manage items, adjust quantities, and view order summary before checkout.
 */
export default function Cart() {
  const { cart, removeFromCart, updateQuantity, formatPrice, clearCart } = useStore();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-accent-purple/20 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-bg-800 p-8 rounded-2xl border border-gray-700 shadow-2xl transform transition-transform group-hover:scale-105 duration-500">
            <ShoppingBag className="h-16 w-16 text-gray-600 group-hover:text-accent-cyan transition-colors duration-500" />
            <div className="absolute -top-2 -right-2 bg-bg-900 rounded-full p-2 border border-gray-700">
               <span className="block w-3 h-3 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
          YOUR CART IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">EMPTY</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm text-lg leading-relaxed">
          Browse our products and find what you need today.
        </p>
        
        <Link to="/">
          <Button variant="accent" size="lg" className="shadow-lg shadow-accent-cyan/20">
            START SHOPPING
          </Button>
        </Link>
      </div>
    );
  }

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-12 lg:px-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Shopping <span className="text-accent-cyan">Cart</span></h1>
        <button 
          onClick={() => { if (confirm('Are you sure you want to duplicate empty your cart?')) clearCart(); }}
          className="bg-bg-800 border-2 border-dashed border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 text-gray-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Clear Cart
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="divide-y divide-gray-800 bg-bg-800">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-8 p-8 items-center">
                <img 
                  src={item.image || item.images?.[0]} 
                  alt={item.name} 
                  className="h-32 w-32 rounded-2xl object-cover bg-bg-900 border border-white/5 shadow-xl"
                />
                <div className="flex flex-1 flex-col justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{item.name}</h3>
                    <p className="text-2xl font-black text-accent-cyan tracking-tighter">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-2xl border border-white/5 bg-bg-900 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-5 py-2 text-xl text-gray-400 hover:text-white transition-colors"
                      >-</button>
                      <span className="min-w-[3rem] text-center text-lg font-black text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-5 py-2 text-xl text-gray-400 hover:text-white transition-colors"
                      >+</button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 rounded-xl bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-32 bg-bg-800/40 p-10 space-y-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl shadow-2xl">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Order Summary</h3>
            <div className="space-y-6 text-base font-bold uppercase tracking-widest">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-xs text-accent-cyan">FREE DELIVERY</span>
              </div>
              <div className="border-t border-white/10 pt-6 flex justify-between text-2xl font-black text-white italic tracking-tighter">
                <span>Grand Total</span>
                <span className="text-accent-cyan">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <Button 
              className="w-full py-8 text-sm font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-accent-cyan/20 flex items-center justify-center gap-4" 
              variant="accent" 
              size="lg"
              onClick={() => navigate('/checkout')}
            >
              PROCEED TO CHECKOUT <ArrowRight className="h-5 w-5" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
