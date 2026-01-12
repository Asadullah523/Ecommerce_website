import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Star, ShoppingCart, ChevronLeft, Heart, CheckCircle2, User, ShieldAlert } from 'lucide-react';

/**
 * Product Detail Page Component
 * Renders comprehensive product information, image gallery, reviews, and related items.
 */
export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, user, addReview, categories, wishlist, toggleWishlist, formatPrice, addToast } = useStore();
  
  const product = products.find(p => String(p.id) === String(productId));
  const isWishlisted = (wishlist || []).some(item => item && item.id === product?.id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <Button onClick={() => navigate('/')} variant="accent">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image];
  const relatedProducts = products.filter(p => 
    p.categories?.some(cat => product.categories?.includes(cat)) && p.id !== product.id
  ).slice(0, 4);

  const handleAddToCart = () => {
    setIsAdded(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    // Show premium functionality
    addToast(`Added ${quantity} x ${product.name} to cart`, 'success');
    
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is logged in (not guest or admin)
    if (!user || user.role === 'guest') {
      addToast('Please login to submit a review', 'error');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      addToast('Admins cannot submit reviews', 'error');
      return;
    }

    if (!reviewText.trim()) {
      alert('Please write a review');
      return;
    }



    try {
      addReview(product.id, {
        userId: user.email || user.name,
        userName: user.name,
        rating: reviewRating,
        comment: reviewText.trim(),
        verified: true
      });

      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const renderStars = (rating, interactive = false, onSelect = null) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onSelect && onSelect(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-bg-900 pb-20 overflow-hidden">
       {/* Animated Background Mesh */}
       <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[100px] animate-pulse delay-700" />
       </div>

      <div className="mx-auto max-w-screen-2xl px-6 pt-10 pb-6 lg:px-12">
      {/* Breadcrumb */}
      <div className="mb-14 flex items-center gap-3 text-xs font-black text-gray-500 tracking-[0.3em] opacity-60">
        <Link to="/" className="hover:text-accent-cyan transition-colors">HOME</Link>
        <span className="text-gray-800">/</span>
        <span className="uppercase">{product.categories?.[0] || product.category}</span>
        <span className="text-gray-800">/</span>
        <span className="text-white truncate">{product.name}</span>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 mb-24">
        {/* Column 1: Image Gallery */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-6">
          <div className="relative aspect-[4/4.5] bg-bg-800/10 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-bg-900/60 via-transparent to-transparent pointer-events-none" />
            
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-8 right-8 z-20">
                <div className="bg-accent-pink text-white font-black text-sm px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% DISCOUNT
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 px-2 overflow-x-auto pb-4 scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    selectedImage === idx
                      ? 'border-accent-cyan ring-4 ring-accent-cyan/10'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Product Info */}
        <div className="lg:col-span-7 xl:col-span-4 space-y-8">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {(product.categories || [product.category]).map((catSlug, idx) => (
                <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/5 border border-accent-cyan/10">
                   <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                   <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-[0.2em]">
                     {categories.find(c => c.slug === catSlug)?.name || catSlug}
                   </span>
                </div>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1] uppercase italic">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-10 pb-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                 {renderStars(Math.round(product.rating))}
                 <span className="text-white font-black text-lg">{product.rating}</span>
              </div>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">{product.reviewCount} Customer Reviews</div>
            </div>

            {/* Description UI Improvements */}
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <h3 className="text-base font-black text-white uppercase tracking-[0.3em]">Item Details</h3>
                 <div className="h-[1px] flex-1 bg-white/5" />
               </div>
               
               <div className="relative">
                 <div className={`space-y-8 text-gray-400 text-lg leading-relaxed overflow-hidden transition-all duration-700 font-medium ${isExpanded ? 'max-h-full' : 'max-h-[500px]'}`}>
                  {product.description.split('\n').map((line, idx) => {
                    if (line.trim() === '---') return <hr key={idx} className="border-white/5 my-10" />;
                    if (line.trim().startsWith('###')) return <h4 key={idx} className="text-2xl font-black text-white mt-16 mb-6 tracking-tight uppercase italic">{line.replace(/^###\s*/, '')}</h4>;
                    if (line.trim().startsWith('* ')) return (
                      <div key={idx} className="flex items-start gap-5 group/item py-1">
                        <div className="w-2 h-2 rounded-full bg-accent-cyan/30 mt-2.5 flex-shrink-0 transition-colors group-hover/item:bg-accent-cyan" />
                        <span className="flex-1" dangerouslySetInnerHTML={{ __html: line.replace(/^\*\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>') }} />
                      </div>
                    );
                    if (line.trim()) return <p key={idx} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>') }} />;
                    return <br key={idx} />;
                  })}
                </div>
                
                {!isExpanded && (
                   <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-900 via-bg-900/80 to-transparent pointer-events-none" />
                )}
               </div>
              
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-6 py-3 bg-white/5 border border-white/5 hover:border-accent-cyan/40 text-[10px] font-black text-accent-cyan uppercase tracking-widest transition-all rounded-xl flex items-center gap-3 group/btn"
              >
                {isExpanded ? 'See Less' : 'View Details'} 
                <span className={`transform transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>↓</span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: The Optimized Wide Buy Box */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-32">
             <div className="bg-bg-800/40 p-8 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Decorative Background Accent */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-cyan/10 rounded-full blur-[80px]" />
                
                <div className="relative z-10">
                  <div className="mb-8 pb-8 border-b border-white/5">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] block mb-4 opacity-70">Price</span>
                    <div className="flex items-baseline gap-5">
                       <span className="text-5xl font-black text-white tracking-tighter italic uppercase underline decoration-accent-cyan/20 underline-offset-8">{formatPrice(product.price)}</span>
                       {product.originalPrice && product.originalPrice > product.price && (
                         <span className="text-2xl text-gray-600 line-through font-bold opacity-40">{formatPrice(product.originalPrice)}</span>
                       )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 transition-colors hover:bg-white/[0.08]">
                      <span className="text-xs font-bold text-gray-400 ml-2 uppercase tracking-widest">Quantity</span>
                      <div className="flex items-center gap-5">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-12 w-12 rounded-2xl bg-bg-900 text-white hover:bg-accent-cyan hover:text-bg-900 transition-all flex items-center justify-center font-bold border border-white/5 shadow-inner"
                        >
                          -
                        </button>
                        <span className="text-white font-black text-lg w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-12 w-12 rounded-2xl bg-bg-900 text-white hover:bg-accent-cyan hover:text-bg-900 transition-all flex items-center justify-center font-bold border border-white/5 shadow-inner"
                        >
                          +
                        </button>
                      </div>
                    </div>

                     <Button
                      variant={isAdded ? "success" : (user?.role === 'admin' ? 'ghost' : "accent")}
                      size="lg"
                      className={`w-full font-black py-10 text-sm uppercase tracking-[0.4em] rounded-3xl transition-all transform border-none shadow-2xl ${
                        isAdded 
                          ? 'bg-green-500' 
                          : user?.role === 'admin' 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50' 
                            : 'bg-gradient-to-r from-accent-cyan to-accent-cyan/80 text-bg-900 hover:shadow-accent-cyan/40 hover:shadow-[0_25px_50px_-12px] active:scale-95'
                      }`}
                      onClick={handleAddToCart}
                      disabled={isAdded || user?.role === 'admin'}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5" /> Added to Cart</span>
                      ) : user?.role === 'admin' ? (
                         <span className="flex items-center gap-3"><ShieldAlert className="h-5 w-5" /> Admin View Only</span>
                      ) : (
                        <span className="flex items-center gap-3"><ShoppingCart className="h-5 w-5" /> Add to Cart</span>
                      )}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-black text-green-500 flex items-center gap-2 uppercase">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                           In Stock
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleWishlist(product)}
                        className={`px-6 rounded-2xl border transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest ${
                          isWishlisted 
                            ? 'bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20' 
                            : 'bg-white/5 border-white/5 text-gray-500 hover:border-red-500/50 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        {isWishlisted ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-8 border-t border-white/5 flex items-center justify-between px-2">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1 opacity-60">Seller</span>
                       <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider">{product.provider || 'Core Systems'}</span>
                    </div>
                    <div className="flex -space-x-2">
                       {[...Array(3)].map((_, i) => (
                         <div key={i} className="w-8 h-8 rounded-full border-2 border-bg-800 bg-bg-700 flex items-center justify-center text-[8px] font-bold text-gray-400">
                           {String.fromCharCode(65 + i)}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Filling the empty void */}
      <div className="mt-32 pt-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none uppercase italic">Customer Feedback</h2>
            <p className="text-xs text-gray-500 font-black uppercase tracking-[0.4em] opacity-50">Customer Reviews</p>
          </div>
          {user.role !== 'guest' && user.role !== 'admin' && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-8 py-4 bg-white/5 hover:bg-accent-cyan/10 hover:text-accent-cyan text-[10px] font-black text-white uppercase tracking-widest rounded-2xl border border-white/10 transition-all shadow-xl"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Guest Login - Redesigned to be more impactfully filled */}
        {user.role === 'guest' && (
          <div className="mb-16 p-8 rounded-[2.5rem] bg-gradient-to-br from-bg-800/20 to-bg-800/5 border border-white/5 text-center backdrop-blur-sm relative overflow-hidden group">
             <div className="absolute inset-0 bg-accent-cyan/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
               <h3 className="text-lg font-black text-white mb-2 tracking-tight">Post a Review</h3>
               <p className="text-gray-500 mb-6 text-xs font-medium">Please sign in to share your experience with this product.</p>
               <Link to="/login">
                 <button className="px-10 py-3 bg-white text-bg-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-accent-cyan transition-all shadow-xl">Sign In</button>
               </Link>
             </div>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-16 bg-bg-800/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl relative shadow-3xl">
            <button onClick={() => setShowReviewForm(false)} className="absolute top-8 right-10 text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">✕</button>
            <h3 className="text-2xl font-black text-white mb-10 tracking-tight">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="grid md:grid-cols-12 gap-12">
              <div className="md:col-span-4 space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 border-l-2 border-accent-cyan pl-4">Your Rating</label>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5 inline-block">
                    {renderStars(reviewRating, true, setReviewRating)}
                  </div>
                </div>
                <div className="p-6 rounded-3xl bg-bg-900/50 border border-white/5">
                  <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-wider">Your review will be checked to make sure it's genuine.</p>
                </div>
              </div>

              <div className="md:col-span-8 flex flex-col gap-6">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest border-l-2 border-accent-purple pl-4">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full flex-1 rounded-[2rem] border border-white/5 bg-bg-900/50 px-8 py-6 text-white focus:border-accent-cyan/50 outline-none resize-none min-h-[160px] transition-all text-base font-medium"
                  placeholder="Write your review..."
                  required
                />
                <div className="flex justify-end gap-6 pt-4">
                  <button type="button" className="px-8 py-3 text-[11px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors" onClick={() => setShowReviewForm(false)}>Cancel</button>
                  <button type="submit" className="px-10 py-4 bg-accent-cyan text-bg-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-xl shadow-accent-cyan/20">
                    Submit Review
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="grid gap-8 lg:grid-cols-2">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review.id} className="bg-bg-800/30 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm group hover:bg-bg-800/40 transition-all duration-500">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 border border-white/5 flex items-center justify-center text-accent-cyan font-black text-xl shadow-inner uppercase">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-black text-white uppercase tracking-tight mb-2 italic">{review.userName}</div>
                      <div className="flex items-center gap-4">
                        {renderStars(review.rating)}
                        <span className="text-xs font-black text-accent-cyan bg-accent-cyan/5 px-3 py-1 rounded-lg border border-accent-cyan/10 font-mono tracking-tighter">{review.rating}.0 RATIO</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest mt-2">{review.date}</span>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed font-medium mb-10 pl-1">{review.comment}</p>
                {review.verified && (
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-green-500/60 uppercase tracking-widest">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Purchase
                    </div>
                    <div className="flex gap-1">
                      {[1,2].map(n => <div key={n} className="w-1 h-1 rounded-full bg-white/10" />)}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 py-20 bg-bg-800/10 rounded-[3rem] border border-dashed border-white/10 text-center group border-spacing-4 hover:border-white/20 transition-all">
               <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 text-gray-700 group-hover:text-accent-cyan transition-colors">
                  <Star className="h-6 w-6 opacity-20" />
               </div>
               <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-3">No reviews yet.</h3>
               <p className="text-[10px] font-medium text-gray-600 uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">This product hasn't been reviewed yet. Be the first to share your thoughts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products - Matching Home Grid Style */}
      {relatedProducts.length > 0 && (
        <div className="mt-40 pt-20 border-t border-white/5">
          <div className="mb-16 flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none">Related Products</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] opacity-40">You Might Also Like</p>
            </div>
            <div className="hidden md:flex gap-4">
               {[1,2,3].map(n => <div key={n} className="w-1.5 h-1.5 rounded-full bg-white/10" />)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="group cursor-pointer overflow-hidden bg-bg-800/40 border border-white/5 transition-all duration-700 hover:shadow-2xl hover:shadow-accent-cyan/10 hover:-translate-y-2 backdrop-blur-sm rounded-[2.5rem] relative"
                onClick={() => {
                  setSelectedImage(0);
                  navigate(`/product/${relatedProduct.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                <div className="aspect-[1.2/1] overflow-hidden bg-bg-900/30">
                  <img
                    src={relatedProduct.images?.[0] || relatedProduct.image}
                    alt={relatedProduct.name}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-white mb-6 group-hover:text-accent-cyan transition-colors truncate tracking-tight">{relatedProduct.name}</h3>
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-2xl font-black text-white tracking-tighter">{formatPrice(relatedProduct.price)}</span>
                    <div className="flex items-center gap-2 text-white text-[11px] font-black bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                      {relatedProduct.rating} <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
