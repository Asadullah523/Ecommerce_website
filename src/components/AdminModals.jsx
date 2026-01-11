import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

/**
 * Modal for creating new discount coupons
 */
function AddCouponModal({ onClose, onAdd }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    onAdd({
      code: formData.get('code').toUpperCase(),
      discount: Number(formData.get('discount')),
      type: formData.get('type'),
    });
    
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-bg-900 border-gray-700 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create Coupon Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            name="code" 
            label="Coupon Code" 
            placeholder="e.g. SAVE20" 
            required 
            style={{ textTransform: 'uppercase' }}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              name="discount" 
              type="number" 
              step="0.01" 
              label="Discount Amount" 
              placeholder="10" 
              required 
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Type</label>
              <select 
                name="type" 
                className="w-full rounded-lg border border-gray-800 bg-bg-800 px-3 py-2 text-sm text-gray-100 focus:border-accent-cyan outline-none"
                required
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/**
 * Modal for adding new product categories
 */
function AddCategoryModal({ onClose, onAdd }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    onAdd(formData.get('name'));
    
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-bg-900 border-gray-700 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create Category</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              name="name" 
              label="Category Name" 
              placeholder="e.g. Smart Watches" 
              required 
            />
            <p className="mt-1 text-xs text-gray-500">
              Slug will be auto-generated (e.g., "smart-watches")
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

/**
 * Modal for registering new administrative or customer accounts
 */
function AddUserModal({ onClose, onAdd }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    onAdd({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role')
    });
    
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-bg-900 border-gray-700 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Register Operative</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            name="name" 
            label="Full Name" 
            placeholder="Agent Zero" 
            required 
          />
          <Input 
            name="email" 
            type="email"
            label="Comms Frequency (Email)" 
            placeholder="agent@neon.tech" 
            required 
          />
          <Input 
            name="password" 
            type="password"
            label="Access Code (Password)" 
            required 
          />
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Clearance Level</label>
            <select 
              name="role" 
              className="w-full rounded-lg border border-gray-800 bg-bg-800 px-3 py-2 text-sm text-gray-100 focus:border-accent-cyan outline-none"
              required
            >
              <option value="customer">Customer (Standard)</option>
              <option value="admin">Admin (High Command)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? 'Registering...' : 'Register User'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export { AddCouponModal, AddCategoryModal, AddUserModal };
