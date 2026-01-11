import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Star, ShoppingCart, Filter, Heart, Sparkles, ShieldAlert } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function Home() {
  const { products, addToCart, categories, wishlist, toggleWishlist, searchQuery, setSearchQuery, user, formatPrice } = useStore();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Dynamic categories from context
  const categoryButtons = [
    { id: 'all', name: 'All Products', slug: 'all' },
    ...categories
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || (p.categories && p.categories.includes(selectedCategory));
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'best-seller') return (b.rating * (b.reviews?.length || 0)) - (a.rating * (a.reviews?.length || 0));
    return 0; // default
  });

  return (
    <div className="bg-bg-900 min-h-screen pb-20">

      {/* Premium Hero Banner (Refined) */}
      <div className="mx-auto max-w-screen-2xl px-6 py-6 lg:px-12">
         <div className="relative rounded-[3rem] h-[160px] md:h-[220px] overflow-hidden border border-white/5 bg-bg-800 shadow-2xl group">
            {/* Background Image */}
            <div className="absolute inset-0">
               <img 
                 src="/Users/asadullah/.gemini/antigravity/brain/0ab278f8-ba1e-434c-b824-d1518115b1ca/cyberpunk_hero_tech_1767991413785.png" 
                 alt="Tech Store" 
                 className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[5s]"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-bg-900 via-bg-900/60 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-t from-bg-900 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 p-6 md:p-12 flex flex-col items-start gap-3 max-w-3xl h-full justify-center">
               <div className="space-y-1">
                  <div className="flex items-center gap-3">
                     <span className="h-[2px] w-8 bg-accent-cyan" />
                     <span className="text-[10px] font-black text-accent-cyan uppercase tracking-[0.4em]">Hand-picked Tech</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                     Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan to-accent-purple">Tech Store</span>
                  </h1>
                  <p className="text-gray-400 font-medium text-xs md:text-base leading-relaxed max-w-lg line-clamp-2">
                     High-performance gear and latest technology. Hand-picked for quality and performance.
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* Filter Header (Simplified) */}
      <div className="relative py-8 px-6 lg:px-12 max-w-screen-2xl mx-auto">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Sparkles className="h-5 w-5 text-accent-cyan" />
                <span className="text-xs font-black text-accent-cyan uppercase tracking-[0.4em]">Products List</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              New <span className="text-accent-cyan">Arrivals</span>
            </h2>
          </div>
  
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth font-bold">
              {categoryButtons.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug || cat.id)}
                  className={`shrink-0 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${
                    selectedCategory === (cat.slug || cat.id)
                      ? 'bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all group"
              >
                Sort By: <span className="text-accent-cyan">{sortBy.replace('-', ' ')}</span>
                <Filter className={`h-3 w-3 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-800 border border-white/10 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95">
                  {[
                    { id: 'default', name: 'Default' },
                    { id: 'price-low', name: 'Price: Low to High' },
                    { id: 'price-high', name: 'Price: High to Low' },
                    { id: 'rating', name: 'Top Rated' },
                    { id: 'newest', name: 'Newest Arrivals' },
                    { id: 'best-seller', name: 'Best Sellers' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        sortBy === option.id ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  
      {/* Product Grid */}
      <div className="mx-auto max-w-screen-2xl px-6 pb-20 lg:px-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const isWishlisted = (wishlist || []).some(item => item && item.id === product.id);
            
            return (
              <Card 
                key={product.id} 
                className={`group overflow-hidden bg-bg-800/20 border-2 transition-all duration-500 hover:-translate-y-2 backdrop-blur-md rounded-[2rem] relative cursor-pointer ${
                  !product.inStock 
                    ? 'opacity-75 grayscale-[0.5] border-white/5' 
                    : 'border-accent-cyan/20 hover:border-accent-cyan shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]'
                }`}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative aspect-video overflow-hidden bg-bg-900/30">
                  <img
                    src={product.images?.[0] || product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    {!product.inStock && (
                      <div className="bg-red-500 text-white text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-xl">
                        Out of Stock
                      </div>
                    )}
                    {product.isNew && (
                      <div className="bg-accent-cyan text-bg-900 text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-xl">
                        New
                      </div>
                    )}
                  </div>
  
                  <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 items-end">
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         toggleWishlist(product);
                       }}
                       className={`p-3 rounded-2xl border backdrop-blur-md transition-all active:scale-90 ${
                         isWishlisted 
                          ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                          : 'bg-bg-900/40 border-white/10 text-white hover:border-red-500/50 hover:text-red-400'
                       }`}
                     >
                       <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                     </button>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                       <div className="text-[10px] text-accent-cyan font-black uppercase tracking-[0.2em] font-mono">
                         {product.categories?.[0] || 'Uncategorized'}
                       </div>
                       <div className="flex items-center gap-1 text-[10px] font-black text-white/70 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                         {product.rating} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                       </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-white mb-1 group-hover:text-accent-cyan transition-colors truncate tracking-tighter uppercase italic">{product.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-semibold">{product.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                       <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white tracking-tighter">{formatPrice(product.price)}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] text-gray-600 line-through decoration-red-500/30 font-bold">{formatPrice(product.originalPrice)}</span>
                          )}
                       </div>
                    </div>
                    
                    <button 
                      disabled={!product.inStock || user?.role === 'admin'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.inStock && user?.role !== 'admin') addToCart(product);
                      }}
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                        !product.inStock || user?.role === 'admin'
                          ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
                          : 'bg-accent-cyan/10 hover:bg-accent-cyan text-accent-cyan hover:text-bg-900 border border-accent-cyan/20 hover:shadow-accent-cyan/40'
                      }`}
                      title={user?.role === 'admin' ? 'Admin View Only' : 'Add to Cart'}
                    >
                      {user?.role === 'admin' ? <ShieldAlert className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {filteredProducts.length === 0 && (
           <div className="text-center py-32 animate-in fade-in slide-in-from-bottom-4">
             <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="h-8 w-8 text-gray-600" />
             </div>
             <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">No Results Found</h3>
             <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Try different filters</p>
           </div>
        )}
      </div>
    </div>
  );
}

