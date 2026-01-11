import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Mail, ShoppingBag, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, authenticateUser } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check URL params for successful registration redirect
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, [searchParams]);

  // Handle login form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    // Processing delay to enhance user feedback and UI transition
    setTimeout(() => {
      // Check for demo admin credentials
      if (email === 'admin@neonmarket.com' && password === 'asadullah@5858') {
        login('admin', 'Admin');
        navigate('/vendor');
        return;
      }

      // Attempt to authenticate registered user from database
      const result = authenticateUser(email, password);
      
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'admin') {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid email or password');
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
          <h1 className="mb-3 text-4xl font-black text-white uppercase italic tracking-tighter">Log <span className="text-accent-cyan">In</span></h1>
          <p className="text-sm font-black text-gray-500 uppercase tracking-[0.4em] opacity-60">Log in to your account</p>
        </div>

        {successMessage && (
          <div className="mb-8 rounded-2xl bg-green-500/10 border border-green-500/20 p-5 text-xs font-black uppercase tracking-widest text-green-400">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            required
            className="h-16 rounded-2xl bg-white/[0.03] border-white/10 px-6 font-bold text-base"
            icon={<Mail className="h-5 w-5" />}
          />
          
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
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

          {error && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 text-xs font-black uppercase tracking-widest text-red-400">
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
                LOGGING IN...
              </span>
            ) : (
              'SIGN IN'
            )}
          </Button>
        </form>
{/* 
        <div className="mt-8 space-y-3 rounded-lg bg-bg-900/50 p-4 text-xs">
          <p className="font-medium text-gray-400">Demo Admin Access:</p>
          <div className="text-gray-500">
            <code className="text-accent-purple">admin@neonmarket.com / admin123</code>
          </div>
        </div> */}

        <div className="mt-10 pt-8 border-t border-white/5 text-center space-y-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
            No Credentials?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-accent-cyan hover:text-white transition-colors"
            >
              CREATE ACCOUNT
            </button>
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] hover:text-accent-cyan transition-all"
          >
            CONTINUE AS GUEST
          </button>
        </div>
      </Card>
    </div>
  );
}
