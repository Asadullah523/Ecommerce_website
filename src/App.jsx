import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Orders = lazy(() => import('./pages/Orders'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

import { useStore } from './context/StoreContext';
import LoadingSplash from './components/ui/LoadingSplash';

// Main Application Component
function App() {
  const { loading } = useStore();

  return (
    <>
      {loading && <LoadingSplash />}
      <Suspense fallback={
        <div className="min-h-screen bg-bg-900 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product/:productId" element={<ProductDetail />} />
          <Route path="vendor" element={
            <ProtectedRoute role="admin">
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
          <Route path="track" element={<TrackOrder />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
      </Routes>
    </Suspense>
    </>
  );
}

export default App;
