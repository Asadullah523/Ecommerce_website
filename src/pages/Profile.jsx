import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, ShieldAlert, Package, Heart, LogOut, CheckCircle, Save, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * User Profile Page Component
 * Allows users to view and update their personal information and security settings.
 */
export default function Profile() {
  const { user, updateUserProfile, wishlist, orders, logout } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email || ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdate = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    setIsEditing(false);
    setMessage({ text: 'Profile updated successfully.', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const userInitial = user.name.charAt(0).toUpperCase();

  return (
    <div className="relative min-h-screen bg-bg-900 pb-20 overflow-hidden">
      {/* Background Ambience / Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-screen-2xl px-6 py-20 lg:px-12">
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-3">My <span className="text-accent-cyan">Profile</span></h1>
            <div className="flex items-center gap-3 pl-1">
              <span className="h-0.5 w-10 bg-accent-cyan rounded-full" />
              <p className="text-xs text-gray-500 font-black uppercase tracking-[0.4em]">User ID: {user.id || 'ANONYMOUS'}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
             <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Account Status</p>
                <p className="text-xs font-black text-accent-cyan uppercase tracking-wider">{user.role} Member</p>
             </div>
             <div className="h-10 w-[1px] bg-white/10" />
             <div className="h-12 w-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan border border-accent-cyan/20">
                <Shield className="h-6 w-6" />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: User Summary & Actions */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card className="bg-bg-800/40 border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl border border-white/5 relative overflow-hidden group">
              {/* Subtle background glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent-purple/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              
              <div className="relative z-10 text-center">
                <div className="relative mx-auto w-24 h-24 mb-6">
                   <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan to-accent-purple rounded-[2rem] blur-md opacity-20 animate-pulse" />
                   <div className="relative z-10 w-full h-full rounded-[2rem] bg-bg-900 border border-white/10 flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                      {userInitial}
                   </div>
                </div>
                
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-3 italic leading-none">
                  {user.name.split(' ')[0]} <br /> <span className="text-accent-cyan">{user.name.split(' ').slice(1).join(' ')}</span>
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-10">
                  <span className="text-xs font-black text-accent-purple bg-accent-purple/10 border border-accent-purple/20 px-6 py-2 rounded-full uppercase tracking-widest">
                    {user.role} Access
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
                  <div className="p-4 bg-bg-900/50">
                     <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Orders</p>
                     <p className="text-2xl font-black text-white">{orders.filter(o => o.customerId === user.id).length}</p>
                  </div>
                  <div className="p-4 bg-bg-900/50">
                     <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Saved Items</p>
                     <p className="text-2xl font-black text-white">{wishlist.length}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* ACTION GROUP */}
            <div className="space-y-4">
              <button 
                onClick={() => navigate('/orders')}
                className="w-full h-16 flex items-center justify-center gap-4 rounded-[1.5rem] bg-white/5 text-gray-400 hover:bg-accent-cyan hover:text-bg-900 border border-white/5 hover:border-accent-cyan transition-all duration-300 font-black uppercase text-xs tracking-[0.4em] group shadow-xl hover:shadow-accent-cyan/20"
              >
                <Package className="h-5 w-5 group-hover:scale-110 transition-transform" /> My Orders History
              </button>
              <button 
                onClick={logout}
                className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white border border-white/5 hover:border-red-500 transition-all duration-300 font-black uppercase text-[10px] tracking-[0.3em] group shadow-xl hover:shadow-red-500/20"
              >
                <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
              </button>
              <div className="flex items-center justify-center gap-3 text-xs font-black text-gray-600 uppercase tracking-[0.5em] opacity-50">
                <ShieldAlert className="h-4 w-4" /> Secure Connection
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Details and Security */}
          <div className="lg:col-span-8 space-y-8">
            {/* Account Details Card */}
            <Card className="bg-bg-800/40 border-white/5 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl border border-white/5 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                      <User className="h-6 w-6" />
                   </div>
                   <div>
                     <h2 className="text-xl font-black text-white uppercase tracking-widest italic">Profile Info</h2>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">Manage your personal details</p>
                   </div>
                 </div>
                 <button 
                   onClick={() => setIsEditing(!isEditing)}
                   className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl ${isEditing ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-accent-cyan/50 hover:text-accent-cyan hover:bg-accent-cyan/5'}`}
                 >
                   {isEditing ? 'Discard Changes' : 'Update Profile'}
                 </button>
              </div>

              {message.text && (
                <div className={`mb-10 p-5 rounded-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] ml-2">User Name</label>
                    <div className="relative group">
                       <input 
                         type="text" 
                         disabled={!isEditing}
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-white/[0.03] border border-white/10 text-sm font-bold text-white px-6 py-5 rounded-[1.5rem] outline-none focus:border-accent-cyan/40 focus:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                       />
                       <User className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-accent-cyan transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Email Address</label>
                    <div className="relative group">
                       <input 
                         type="email" 
                         disabled={!isEditing}
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full bg-white/[0.03] border border-white/10 text-sm font-bold text-white px-6 py-5 rounded-[1.5rem] outline-none focus:border-accent-cyan/40 focus:bg-white/[0.05] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                       />
                       <Mail className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-accent-cyan transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                   <div className="flex items-center gap-4 text-gray-500 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="h-10 w-10 rounded-xl bg-bg-900 border border-white/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-accent-purple" />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Account Type</p>
                        <p className="text-[10px] font-black text-white uppercase tracking-wider">{user.role === 'admin' ? 'Admin Access' : 'Standard Access'}</p>
                      </div>
                   </div>
                   
                   {isEditing && (
                     <Button type="submit" variant="accent" className="w-full h-16 font-black italic tracking-tighter uppercase text-lg shadow-2xl shadow-accent-cyan/20 group rounded-[1.5rem]">
                        <Save className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" /> Save Changes
                     </Button>
                   )}
                </div>
              </form>
            </Card>

            {/* SECURITY ACCESS SECTION */}
            <Card className="bg-gradient-to-br from-accent-purple/10 to-transparent border border-accent-purple/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group backdrop-blur-xl">
               <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-2xl bg-bg-900 border border-accent-purple/30 flex items-center justify-center text-accent-purple shadow-2xl group-hover:shadow-accent-purple/20 transition-all duration-500">
                     <Key className="h-8 w-8 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                     <h4 className="text-xl font-black text-white uppercase tracking-tight italic">Security</h4>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">Update your password</p>
                  </div>
               </div>
               <button className="h-14 px-8 rounded-2xl bg-accent-purple text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-bg-900 transition-all shadow-xl shadow-accent-purple/20 active:scale-95">
                  Change Password
               </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
