import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Store, LogOut, Package, Search, Heart, ChevronDown, Bell, Coins } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const { user, cart, logout, wishlist, searchQuery, setSearchQuery, currency, setCurrency } = useStore();
  const navigate = useNavigate();
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-bg-900/60 backdrop-blur-xl transition-all duration-500">
      <div className="mx-auto flex h-24 max-w-screen-2xl items-center justify-between px-6 sm:px-10 lg:px-12">
        
        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-4 group shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-white/10 group-hover:border-accent-cyan/50 transition-all duration-500 shadow-xl shadow-black/20">
            <Package className="h-6 w-6 text-accent-cyan group-hover:scale-110 transition-transform duration-500" />
          </div>
          <span className="hidden md:block text-2xl font-black tracking-tighter text-white group-hover:text-accent-cyan transition-colors uppercase italic">
            Neon<span className="text-accent-cyan">Market</span>
          </span>
        </Link>

        {/* GLOBAL SEARCH */}
        <div className="flex-1 max-w-xl mx-12 hidden sm:block">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-white/[0.03] border border-white/5 hover:border-white/10 focus:border-accent-cyan/40 text-sm font-bold uppercase tracking-widest text-white px-14 py-4 rounded-2xl outline-none transition-all placeholder:text-gray-600 focus:bg-white/[0.05]"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-accent-cyan transition-colors" />
          </div>
        </div>

        {/* ACTION ICONS */}
        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-1 sm:gap-4 mr-2 sm:mr-0">
            
            {/* Currency Toggler */}
            <button 
              onClick={() => {
                const next = currency === 'USD' ? 'PKR' : currency === 'PKR' ? 'AED' : 'USD';
                setCurrency(next);
              }}
              className="relative p-3 text-gray-500 hover:text-white transition-all group mr-2" 
              title="Switch Currency"
            >
              <div className="flex items-center gap-1">
                <Coins className="h-5 w-5 group-hover:text-accent-cyan transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-widest">{currency}</span>
              </div>
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-3 text-gray-500 hover:text-red-400 transition-all group" title="Saved Items">
              <Heart className={`h-6 w-6 ${wishlist.length > 0 ? 'fill-red-500 text-red-500 shadow-xl' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-3 text-gray-500 hover:text-accent-cyan transition-all group" title="Shopping Cart">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent-cyan text-[10px] font-black text-bg-900 shadow-[0_0_12px_rgba(34,211,238,0.4)] transition-transform group-hover:scale-110">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="h-4 w-[1px] bg-white/5 hidden sm:block" />

          {/* USER SECTION */}
          {user.role === 'guest' ? (
            <div className="flex items-center gap-4 md:gap-8">
              <Link 
                to="/track"
                className="hidden md:flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-accent-cyan transition-all border border-transparent hover:border-white/5 rounded-2xl"
              >
                Track Order
              </Link>
              <Link 
                to="/login"
                className="flex items-center gap-3 rounded-2xl bg-accent-cyan px-8 py-4 text-xs font-black uppercase tracking-widest text-bg-900 hover:bg-white transition-all shadow-xl shadow-accent-cyan/10 active:scale-95"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <Link 
                  to="/vendor"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-accent-purple bg-accent-purple/10 border border-accent-purple/20 rounded-xl hover:bg-accent-purple hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] active:scale-95"
                >
                  <Store className="h-4 w-4" />
                  Dashboard
                </Link>
              )}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 border border-white/5 flex items-center justify-center text-accent-purple font-black text-sm uppercase shadow-inner">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-black text-white uppercase tracking-tighter leading-none">{user.name}</div>
                    <div className="text-[10px] text-accent-purple font-black uppercase tracking-widest mt-1.5 opacity-60 italic">{user.role}</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

              {/* DROPDOWN MENU */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-4 w-56 origin-top-right rounded-[1.5rem] bg-bg-800 border border-white/10 p-2 shadow-2xl backdrop-blur-xl z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                       <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Account</p>
                       <p className="text-[11px] font-bold text-white truncate">{user.email || 'Registered User'}</p>
                    </div>
                    
                    <Link to="/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-accent-cyan/10 hover:text-accent-cyan transition-all">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    
                    <Link to="/wishlist" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                      <Heart className="h-4 w-4" /> My Favorites
                    </Link>

                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-accent-purple/10 hover:text-accent-purple transition-all">
                      <User className="h-4 w-4" /> My Profile
                    </Link>


                    <div className="h-[1px] bg-white/5 my-2 mx-2" />
                    
                    <button 
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
      
      {/* MOBILE SEARCH (Visible only on small screens) */}
      <div className="sm:hidden px-4 pb-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={handleSearch}
            className="w-full bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white px-9 py-2 rounded-full outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" />
        </div>
      </div>
    </nav>
  );
}

