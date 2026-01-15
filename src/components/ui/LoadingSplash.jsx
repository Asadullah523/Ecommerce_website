import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Premium Splash Screen Component
 * Displayed during initial data hydration from MongoDB
 */
const LoadingSplash = () => {
  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-bg-900 transition-opacity duration-1000">
      {/* Decorative Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-purple/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <div className="relative mb-12 group">
          <div className="absolute inset-0 bg-accent-cyan/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-bg-800 to-bg-900 border-2 border-accent-cyan/30 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-accent-cyan transition-colors duration-500">
             <div className="absolute inset-0 bg-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative flex items-center justify-center">
                {/* Hexagon Clip Icon Placeholder or Website Logo */}
                <div className="h-12 w-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Sparkles className="h-6 w-6 text-accent-cyan animate-bounce" />
                </div>
             </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="text-center space-y-4">
           <div className="flex items-center justify-center gap-3">
              <span className="h-[2px] w-8 bg-accent-cyan rounded-full animate-grow-x" />
              <span className="text-[10px] font-black text-accent-cyan uppercase tracking-[0.4em] animate-fade-in">Neural Link Establishing</span>
              <span className="h-[2px] w-8 bg-accent-cyan rounded-full animate-grow-x" />
           </div>
           
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              NEON <span className="text-accent-cyan">MARKET</span>
           </h1>
           
           <div className="flex items-center justify-center gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className="h-1.5 w-1.5 rounded-full bg-accent-cyan/40 animate-bounce" 
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
           </div>
        </div>

        {/* System Status Display (Tech Aesthetic) */}
        <div className="mt-20 grid grid-cols-2 gap-8 border-t border-white/5 pt-8 w-64 opacity-50">
           <div className="space-y-1">
              <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Database</div>
              <div className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-2">
                 <div className="h-1 w-1 bg-green-500 rounded-full animate-ping" />
                 Synchronized
              </div>
           </div>
           <div className="space-y-1">
              <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Interface</div>
              <div className="text-[10px] font-bold text-accent-cyan uppercase">Optimized</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSplash;
