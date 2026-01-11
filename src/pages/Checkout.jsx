import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShoppingCart, CheckCircle2, Package, ArrowRight, User, Mail, MapPin, CreditCard, ShieldCheck, Clock, Store, Tag, X, Lock, ShoppingBag } from 'lucide-react';
import { sendOrderConfirmation } from '../services/emailService';

/**
 * Checkout Component
 * Handles the order placement process, payment selection, and confirmation.
 */
export default function Checkout() {
  const { cart, placeOrder, applyCoupon, user, formatPrice, currency, EXCHANGE_RATES } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedCoupon?.discount || 0;
  const finalTotal = appliedCoupon?.finalTotal || grandTotal;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    // Validation delay for coupon verification
    setTimeout(() => {
      const result = applyCoupon(couponCode, grandTotal);
      
      if (result.valid) {
        setAppliedCoupon(result);
        setCouponCode('');
        setCouponError('');
      } else {
        setCouponError(result.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
      setCouponLoading(false);
    }, 500);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const [emailStatus, setEmailStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailStatus('sending');
    const formData = new FormData(e.target);
    const orderData = {
      items: cart,
      total: finalTotal, // Use final total with discount
      originalTotal: grandTotal,
      discount,
      customer: {
        name: formData.get('fullName'),
        email: formData.get('email'),
        address: formData.get('address'),
        city: formData.get('city'),
        zip: formData.get('zip'),
      },
      paymentMethod,
      currency,
      exchangeRate: EXCHANGE_RATES[currency] || 1,
    };

    // Process order with safety checks and email notifications
    setTimeout(async () => {
      try {
        const order = await placeOrder(orderData);
        setLastOrder(order);
        
        // Safety Valve: Force a result if email takes too long (15s)
        const emailPromise = sendOrderConfirmation(order);
        const safetyTimeout = new Promise(resolve => setTimeout(() => resolve({ success: false, error: { message: 'Wait limit reached' } }), 15000));
        
        // Race the actual email vs our local safety timer
        const emailResult = await Promise.race([emailPromise, safetyTimeout]);
        
        // CRITICAL UPDATE: Always show success tick if order places, even if email fails (Soft Fail)
        if (emailResult.success) {
          setEmailStatus('success');
          setErrorMessage(''); 
        } else {
          console.warn("Email warning:", emailResult.error);
          // Still show success, but maybe with a note in component (implemented below)
          setEmailStatus('success'); 
          setErrorMessage('Email confirmation could not be sent. Please save your Order ID.');
        }

        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500); 

      } catch (err) {
        // Catch critical code execution errors only
        console.error("Critical Checkout Error:", err);
        setErrorMessage('System Processing Error');
        setEmailStatus('error');
        setLoading(false);
      }
    }, 2000);
  };

  useEffect(() => {
    // Only redirect if cart is empty, we are on form step, loading is false, AND we aren't in the middle of sending an email
    if (cart.length === 0 && step === 1 && !loading && emailStatus === 'idle') {
      navigate('/cart');
    }
  }, [cart, step, navigate, loading, emailStatus]);

  // Only show "Empty Cart" if we aren't in the middle of a checkout process
  if (!cart.length && step !== 2 && emailStatus === 'idle') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <ShoppingCart className="h-16 w-16 text-gray-700 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Cart is Empty</h2>
        <p className="text-gray-400 mb-8 text-center max-w-xs">Add products to your cart before you checkout.</p>
        <Button onClick={() => navigate('/')} variant="accent">Continue Shopping</Button>
      </div>
    );
  }

  if (user && user.role === 'admin' && step !== 2) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-6 rounded-full bg-accent-purple/10 p-6 border border-accent-purple/20">
           <Store className="h-12 w-12 text-accent-purple" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-white uppercase italic">Restricted Access</h1>
        <p className="mb-8 max-w-md text-gray-400">Administrators cannot make purchases. Please use the admin dashboard to manage orders.</p>
        <div className="flex gap-4">
          <Button variant="accent" onClick={() => navigate('/vendor')}>Go to Dashboard</Button>
          <Button variant="ghost" onClick={() => navigate('/')} className="underline">Back to Shop</Button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8 bg-bg-800 border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan to-accent-purple" />
          
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          
          <h2 className="mb-2 text-3xl font-black text-white italic tracking-tighter uppercase">Order Confirmed!</h2>
          <p className="mb-8 text-sm text-gray-400 font-medium px-4">
            Thank you for your purchase. We have sent a confirmation email to <span className="text-white">{lastOrder?.customer?.email}</span>.
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left flex gap-3 items-start animate-fade-in">
              <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-400 mb-1">Email Delivery Failed</p>
                <p className="text-xs text-red-400/80 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          <div className="mb-8 p-6 rounded-2xl bg-bg-900/50 border border-white/5 text-left space-y-4">
             <div>
               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
               <p className="text-lg font-mono font-black text-accent-cyan">#{lastOrder?.id}</p>
             </div>
             <div className="p-3 rounded-xl bg-accent-cyan/5 border border-accent-cyan/10">
               <p className="text-[9px] font-bold text-accent-cyan/80 leading-relaxed">
                 Save this ID! You'll need it along with your email to track this order as a guest.
               </p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => navigate(`/track?id=${lastOrder?.id}`)} className="font-bold uppercase tracking-widest text-[10px]">
              Track Order
            </Button>
            <Button variant="accent" onClick={() => navigate('/')} className="font-bold uppercase tracking-widest text-[10px]">
              Shop More
            </Button>
          </div>
        </Card>
      </div>
    );
  }



  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Checkout</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Checkout Form */}
        <form id="checkoutForm" onSubmit={handlePlaceOrder} className="space-y-6">
          <Card className="bg-bg-800 p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan text-xs text-black">1</span>
              Shipping Details
            </h3>
            <div className="grid gap-4">
              <Input name="fullName" label="Full Name" placeholder="John Doe" required />
              <Input name="email" type="email" label="Email Address" placeholder="john@example.com" required />
              <Input name="address" label="Shipping Address" placeholder="123 Neon St, Cyber City" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="city" label="City" placeholder="Night City" required />
                <Input name="zip" label="ZIP Code" placeholder="10101" required />
              </div>
            </div>
          </Card>

          <Card className="bg-bg-800 p-6 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan text-xs text-black">2</span>
              Payment Method
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <label className={`cursor-pointer rounded-lg border p-4 transition-all ${paymentMethod === 'card' ? 'border-accent-cyan bg-accent-cyan/10' : 'border-gray-700 bg-bg-900 hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="card" 
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')}
                  className="hidden" 
                />
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-accent-cyan' : 'text-gray-400'}`} />
                  <span className={`font-bold ${paymentMethod === 'card' ? 'text-white' : 'text-gray-300'}`}>Card</span>
                </div>
                <p className="text-xs text-gray-500">Secure transfer</p>
              </label>

              <label className={`cursor-pointer rounded-lg border p-4 transition-all ${paymentMethod === 'cod' ? 'border-accent-cyan bg-accent-cyan/10' : 'border-gray-700 bg-bg-900 hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')}
                  className="hidden" 
                />
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className={`h-5 w-5 ${paymentMethod === 'cod' ? 'text-accent-cyan' : 'text-gray-400'}`} />
                  <span className={`font-bold ${paymentMethod === 'cod' ? 'text-white' : 'text-gray-300'}`}>Cash on Delivery</span>
                </div>
                <p className="text-xs text-gray-500">Pay when arrived</p>
              </label>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-4 animate-fade-in">
                 <div className="rounded-lg border border-accent-cyan/20 bg-accent-cyan/5 p-4 flex items-center gap-3">
                  <Lock className="h-5 w-5 text-accent-cyan" />
                  <p className="text-sm text-gray-300">Payments are secure and encrypted.</p>
                </div>
                <Input name="cardName" label="Name on Card" placeholder="John Doe" required />
                <Input name="cardNumber" label="Card Number" placeholder="0000 0000 0000 0000" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="expiry" label="Expiry" placeholder="MM/YY" required />
                  <Input name="cvc" label="CVC" placeholder="123" required />
                </div>
              </div>
            ) : (
               <div className="rounded-lg border border-gray-700 bg-bg-900 p-4 animate-fade-in text-sm text-gray-400">
                 You will pay <span className="text-white font-bold">{formatPrice(grandTotal)}</span> in cash to the courier upon delivery.
               </div>
            )}
          </Card>

          <Button type="submit" variant="accent" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full"></span>
                Processing...
              </span>
            ) : (
              paymentMethod === 'card' ? `Pay ${formatPrice(grandTotal)}` : 'Place Order'
            )}
          </Button>
        </form>

        {/* Order Review */}
        <div className="md:col-span-1">
          <Card className="bg-bg-800 p-6 sticky top-24">
            <h3 className="font-bold text-white mb-4">Order Summary</h3>
            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="h-12 w-12 flex-shrink-0 rounded bg-bg-900">
                    <img src={item.image} className="h-full w-full object-cover rounded" />
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="text-white line-clamp-1">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-white">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 space-y-2">
              {/* Coupon Section */}
              <div className="mb-4 pb-4 border-b border-gray-700">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Have a coupon code?</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500 font-medium">{appliedCoupon.coupon.code}</span>
                      <span className="text-xs text-gray-400">
                        -{appliedCoupon.coupon.type === 'percentage' ? `${appliedCoupon.coupon.discount}%` : formatPrice(appliedCoupon.coupon.discount)}
                      </span>
                    </div>
                    <button onClick={removeCoupon} className="text-gray-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 rounded-lg border border-gray-800 bg-bg-900 px-3 py-2 text-sm text-white focus:border-accent-cyan outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      variant="ghost"
                      size="sm"
                      className="border border-gray-700"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-2 text-xs text-red-400">{couponError}</p>
                )}
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-500">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Discount ({appliedCoupon.coupon.code})
                  </span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                 <span>Taxes (Estimated)</span>
                 <span>{formatPrice(0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Status Overlay Component */}
      {emailStatus !== 'idle' && step === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm text-white">
           <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg w-full animate-fade-in">
              {emailStatus === 'sending' && (
                 <>
                    <div className="h-20 w-20 rounded-full border-4 border-accent-cyan/30 border-t-accent-cyan animate-spin mb-6" />
                    <h2 className="text-3xl font-bold uppercase tracking-widest animate-pulse mb-2">Placing Order...</h2>
                    <p className="text-accent-cyan font-medium">Please wait while we confirm your purchase.</p>
                 </>
              )}
              
              {emailStatus === 'success' && (
                 <>
                    <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500 mb-6 animate-scale-in">
                       <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold uppercase tracking-widest mb-2">Order Confirmed!</h2>
                    <p className="text-gray-400">Redirecting to receipt...</p>
                 </>
              )}

              {emailStatus === 'error' && (
                 <>
                    <div className="h-24 w-24 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 mb-6 animate-shake">
                       <X className="h-12 w-12 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold uppercase tracking-widest mb-4">Email Failed</h2>
                    <p className="text-red-400 font-medium mb-8 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      Error: {errorMessage || 'Connection interrupted'}
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => { setEmailStatus('idle'); setStep(2); }} variant="outline">
                           Continue Anyway
                        </Button>
                    </div>
                 </>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
