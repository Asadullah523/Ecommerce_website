import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package, Star, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Wishlist Page Component
 * Displays the user's saved products and allows them to move items to the cart.
 */
export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, user, formatPrice } = useStore();
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-red-500/10 blur-[60px] rounded-full animate-pulse" />
           <div className="relative z-10 p-8 rounded-[2rem] bg-bg-800 border border-white/5 ring-4 ring-white/5">
              <Heart className="h-16 w-16 text-gray-500" />
           </div>
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">Your Wishlist is Empty</h2>
        <p className="text-gray-400 max-w-sm font-medium leading-relaxed mb-8 uppercase text-[10px] tracking-widest">You haven't saved any items yet. Add products to your favorites to see them here.</p>
        <Link to="/">
          <Button variant="accent" size="lg" className="px-10 font-black italic tracking-tighter uppercase">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-bg-900 pb-20">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic mb-2">My Favorites</h1>
            <p className="text-[10px] text-red-500/80 font-black uppercase tracking-[0.3em] pl-1 animate-pulse">Track your absolute favorite products</p>
          </div>
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            {wishlist.length} Items Saved
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map((item) => (
            <Card 
              key={item.id} 
              className="group overflow-hidden bg-bg-800/40 border border-white/5 hover:border-red-500/30 transition-all duration-500 rounded-[2.5rem] relative max-w-sm mx-auto w-full"
              onClick={() => navigate(`/product/${item.id}`)}
            >
              <div className="relative aspect-[16/11] overflow-hidden bg-bg-900/30">
                <img
                  src={item.images?.[0] || item.image}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       toggleWishlist(item);
                     }}
                     className="p-2.5 rounded-xl bg-red-500 text-white shadow-xl shadow-red-500/20 active:scale-90 transition-transform"
                   >
                     <Trash2 className="h-4 w-4" />
                   </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[9px] text-accent-cyan font-black uppercase tracking-[0.2em]">
                      {item.categories?.[0] || 'Uncategorized'}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white/60 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                      {item.rating} <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-red-400 transition-colors truncate tracking-tight">{item.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed font-semibold">{item.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Price</span>
                     <span className="text-xl font-black text-white">{formatPrice(item.price)}</span>
                  </div>
                  
                  <button 
                    disabled={user?.role === 'admin'}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user?.role !== 'admin') {
                        addToCart(item);
                        toggleWishlist(item);
                      }
                    }}
                    className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                      user?.role === 'admin' 
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                        : 'bg-accent-cyan/10 hover:bg-accent-cyan text-accent-cyan hover:text-bg-900 border border-accent-cyan/20 hover:shadow-accent-cyan/20 active:scale-95'
                    }`}
                    title={user?.role === 'admin' ? 'Admin View Only' : 'Add to Cart'}
                  >
                    {user?.role === 'admin' ? <ShieldAlert className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
