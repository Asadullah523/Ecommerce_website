import { X, ShoppingCart, Star } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-bg-800 shadow-2xl ring-1 ring-white/10 animate-fade-in-up flex flex-col md:flex-row max-h-[90vh] md:max-h-[800px]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Image Section */}
        <div className="relative h-64 w-full bg-bg-900 md:h-auto md:w-1/2 flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover"
          />
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute left-4 top-4">
              <Badge variant="accent" className="bg-accent-pink text-white border-none shadow-lg font-bold text-lg px-3 py-1">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Badge>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col p-6 md:p-8 md:w-1/2 overflow-y-auto custom-scrollbar">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="border-accent-cyan/30 text-accent-cyan">
                {product.category}
              </Badge>
              <div className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                <Star className="h-4 w-4 fill-yellow-400" />
                {product.rating} ({product.reviews} reviews)
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>

            <div className="prose prose-invert max-w-none text-gray-300 mb-8">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="mt-auto border-t border-gray-700 pt-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Price</p>
                {product.originalPrice && product.originalPrice > product.price ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-white">${product.price.toFixed(2)}</span>
                    <span className="text-xl text-gray-500 line-through decoration-red-500/50">${product.originalPrice.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-white">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
               <Button 
                variant="accent" 
                size="lg" 
                className="flex-1 text-lg"
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
