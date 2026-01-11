import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { useStore } from '../context/StoreContext';
import { ToastContainer } from './ui/Toast';

export default function Layout() {
  const { toasts, removeToast } = useStore();
  return (
    <div className="min-h-screen bg-bg-900 text-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <footer className="border-t border-gray-800 bg-bg-900 py-20">
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-white font-black text-2xl mb-6 flex items-center gap-3 uppercase italic tracking-tighter">
              <span className="text-accent-cyan">Neon</span>Market
            </h3>
            <p className="text-gray-400 text-base leading-relaxed font-medium">
              Your online store for quality tech products and accessories.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Customer Service</h4>
            <ul className="space-y-4 text-base text-gray-400 font-medium">
              <li><Link to="#" className="hover:text-accent-cyan transition-colors">Help Center</Link></li>
              <li><Link to="#" className="hover:text-accent-cyan transition-colors">Track Order</Link></li>
              <li><Link to="#" className="hover:text-accent-cyan transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="#" className="hover:text-accent-cyan transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 text-base text-gray-400 font-medium">
              <li><Link to="#" className="hover:text-accent-cyan transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-accent-cyan transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-accent-cyan transition-colors">Shipping Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6">Stay Connected</h4>
            <div className="flex gap-5 mb-8">
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-accent-cyan hover:text-bg-900 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-accent-cyan hover:text-bg-900 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
            <div className="text-gray-500 text-sm font-bold uppercase tracking-widest opacity-60">
              © 2024 NeonMarket Ops.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
