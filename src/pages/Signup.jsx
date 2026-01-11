import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Lock, ShoppingBag, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const { registerUser, users } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate email format using regex pattern
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle user registration with comprehensive validation
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const name = formData.get('name');

    // Check email format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Enforce minimum password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Verify passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Prevent duplicate accounts
    if (users.find(u => u.email === email)) {
      setError('An account with this email already exists');
      setLoading(false);
      return;
    }

    // Register new user and redirect to login
    setTimeout(() => {
      const result = registerUser({
        name,
        email,
        password
      });

      if (result.success) {
        navigate('/login?registered=true');
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-900 px-6 py-16">
      <Card className="w-full max-w-xl bg-bg-800/40 p-12 border border-white/5 backdrop-blur-2xl rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-cyan/10 rounded-full blur-[80px]" />
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 shadow-2xl shadow-accent-cyan/10">
            <ShoppingBag className="h-10 w-10 text-accent-cyan" />
          </div>
          <h1 className="mb-3 text-4xl font-black text-white uppercase italic tracking-tighter">Create <span className="text-accent-cyan">Account</span></h1>
          <p className="text-sm font-black text-gray-500 uppercase tracking-[0.4em] opacity-60">Enter your details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="name"
            label="Full Name"
            placeholder="John Doe"
            required
            className="h-16 rounded-2xl bg-white/[0.03] border-white/10 px-6 font-bold text-base"
            icon={<User className="h-5 w-5" />}
          />

          <Input
            name="email"
            type="email"
            label="Email Address"
            placeholder="john@example.com"
            required
            className="h-16 rounded-2xl bg-white/[0.03] border-white/10 px-6 font-bold text-base"
            icon={<Mail className="h-5 w-5" />}
          />
          
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="At least 6 characters"
              required
              className="h-16 rounded-2xl bg-white/[0.03] border-white/10 px-6 pr-14 font-bold text-base"
              icon={<Lock className="h-5 w-5" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[52px] text-gray-400 hover:text-accent-cyan transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              placeholder="Re-enter password"
              required
              className="h-16 rounded-2xl bg-white/[0.03] border-white/10 px-6 pr-14 font-bold text-base"
              icon={<Lock className="h-5 w-5" />}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[52px] text-gray-400 hover:text-accent-cyan transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full h-16 text-sm font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl shadow-accent-cyan/20 active:scale-95"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span>
                CREATING ACCOUNT...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <CheckCircle2 className="h-5 w-5" />
                CREATE ACCOUNT
              </span>
            )}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            Already Registered?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-accent-cyan hover:text-white transition-colors"
            >
              SIGN IN
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
