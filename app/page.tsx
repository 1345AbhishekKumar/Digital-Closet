'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Show } from '@clerk/nextjs';

const ClosetApp = dynamic(() => import('@/components/ClosetApp'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Show when="signed-in">
        <ClosetApp />
      </Show>
      <Show when="signed-out">
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#CCFF00]/5 rounded-full blur-3xl -z-10"></div>
          
          <h1 className="font-display text-7xl md:text-9xl tracking-tighter mb-8 leading-[0.8]">WARDROBE<br/>OS</h1>
          <p className="font-mono text-white/50 uppercase tracking-widest mb-16 max-w-md">
            Your experimental digital stylist. Authentication required to access the system.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <Link 
              href="/auth?mode=sign-in" 
              className="flex-1 font-display text-2xl uppercase tracking-tighter bg-[#CCFF00] text-black px-8 py-6 hover:bg-white transition-colors border-2 border-transparent hover:border-white"
            >
              SIGN IN
            </Link>
            <Link 
              href="/auth?mode=sign-up" 
              className="flex-1 font-display text-2xl uppercase tracking-tighter bg-transparent border-2 border-white/20 text-white px-8 py-6 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
            >
              REGISTER
            </Link>
          </div>
        </div>
      </Show>
    </>
  );
}
