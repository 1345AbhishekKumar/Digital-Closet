'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Loader2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

type AuthMode = 'sign-in' | 'sign-up';
type Strategy = 'oauth_google' | 'oauth_apple';

function AuthContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'sign-up' ? 'sign-up' : 'sign-in';
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Sync mode with URL if it changes
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'sign-up' || urlMode === 'sign-in') {
      setMode(urlMode);
    }
  }, [searchParams]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setPendingVerification(false);
    // Update URL without full reload
    router.replace(`/auth?mode=${newMode}`);
  };

  const handleSSO = async (strategy: Strategy) => {
    if (mode === 'sign-in') {
      if (!signIn) return;
      try {
        const { error: ssoError } = await signIn.sso({
          strategy: strategy as any,
          redirectUrl: '/',
          redirectCallbackUrl: '/sso-callback',
        });
        if (ssoError) {
          setError((ssoError as any).errors?.[0]?.longMessage || ssoError.message || `An error occurred during ${strategy} sign in`);
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage || err.message || `An error occurred during ${strategy} sign in`);
      }
    } else {
      if (!signUp) return;
      try {
        const { error: ssoError } = await signUp.sso({
          strategy: strategy as any,
          redirectUrl: '/',
          redirectCallbackUrl: '/sso-callback',
        });
        if (ssoError) {
          setError((ssoError as any).errors?.[0]?.longMessage || ssoError.message || `An error occurred during ${strategy} sign up`);
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.longMessage || err.message || `An error occurred during ${strategy} sign up`);
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error: signInError } = await signIn.password({
        identifier: emailAddress,
        password,
      });

      if (signInError) {
        setError((signInError as any).errors?.[0]?.longMessage || signInError.message || 'An error occurred during sign in');
        if ((signInError as any).errors?.[0]?.code === 'form_identifier_not_found') {
          setTimeout(() => switchMode('sign-up'), 2000);
        }
        setIsLoading(false);
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl('/');
            if (url.startsWith('http')) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          }
        });
      } else {
        console.log(signIn);
        setError('Additional steps required. Please check console.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || 'An error occurred during sign in');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress,
        password,
      });

      if (signUpError) {
        setError((signUpError as any).errors?.[0]?.longMessage || signUpError.message || 'An error occurred during registration');
        setIsLoading(false);
        return;
      }

      const { error: verifyError } = await signUp.verifications.sendEmailCode();
      if (verifyError) {
        setError((verifyError as any).errors?.[0]?.longMessage || verifyError.message || 'Error sending verification code');
        setIsLoading(false);
        return;
      }

      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;

    setIsLoading(true);
    setError('');

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });

      if (verifyError) {
        setError((verifyError as any).errors?.[0]?.longMessage || verifyError.message || 'Invalid verification code');
        setIsLoading(false);
        return;
      }

      if (signUp.status === 'complete') {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl('/');
            if (url.startsWith('http')) {
              window.location.href = url;
            } else {
              router.push(url);
            }
          }
        });
      } else {
        console.log(signUp);
        setError('Verification incomplete. Please check console.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Invalid verification code');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505]">
      {/* Left Side - Branding */}
      <div className={`w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-black transition-colors duration-500 ${mode === 'sign-in' ? 'bg-[#CCFF00] text-black' : 'bg-white text-black'}`}>
        <div>
          <motion.h1
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-7xl md:text-9xl tracking-tighter leading-[0.8] mb-6"
          >
            {mode === 'sign-in' ? (
              <>WARDROBE<br/>OS</>
            ) : (
              <>NEW<br/>USER</>
            )}
          </motion.h1>
          <p className="font-mono text-sm uppercase tracking-widest font-bold">
            {mode === 'sign-in' ? 'System Authentication // V1.0' : 'System Registration // V1.0'}
          </p>
        </div>

        <div className="hidden md:block font-mono text-xs uppercase tracking-widest opacity-50">
          {mode === 'sign-in' ? (
            <>
              <p>Authorized personnel only.</p>
              <p>Digital styling interface.</p>
            </>
          ) : (
            <>
              <p>Initialize your digital closet.</p>
              <p>AI-powered styling awaits.</p>
            </>
          )}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-[#050505] p-8 md:p-16 flex flex-col justify-center items-center relative overflow-y-auto">
        <div className="w-full max-w-md">
          
          {/* Tabs */}
          {!pendingVerification && (
            <div className="flex gap-4 mb-12">
              <button
                onClick={() => switchMode('sign-in')}
                className={`flex-1 py-4 font-mono text-sm uppercase tracking-widest border-2 transition-colors ${mode === 'sign-in' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('sign-up')}
                className={`flex-1 py-4 font-mono text-sm uppercase tracking-widest border-2 transition-colors ${mode === 'sign-up' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'}`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-red-500/10 border border-red-500 text-red-500 font-mono text-xs p-4 uppercase tracking-widest flex items-start gap-3">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          {pendingVerification ? (
            <motion.form 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleVerify} 
              className="space-y-6"
            >
              <div>
                <h2 className="font-display text-5xl tracking-tighter text-[#CCFF00] mb-2">VERIFY</h2>
                <p className="font-mono text-xs uppercase tracking-widest text-white/50 mb-8">Enter the 6-digit code sent to your email.</p>
                
                <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">Verification Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-transparent border-2 border-white/20 text-white font-mono text-3xl p-4 focus:border-[#CCFF00] focus:outline-none w-full text-center tracking-[0.5em] transition-colors"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#CCFF00] text-black font-display text-3xl uppercase tracking-tighter py-4 hover:bg-transparent hover:text-[#CCFF00] border-2 border-transparent hover:border-[#CCFF00] transition-colors flex justify-center items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <>VERIFY SYSTEM <ArrowRight size={24} /></>}
              </button>
              <button
                type="button"
                onClick={() => setPendingVerification(false)}
                className="w-full text-center font-mono text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors mt-4"
              >
                Cancel Verification
              </button>
            </motion.form>
          ) : mode === 'sign-in' ? (
            <motion.div
              key="sign-in-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <form onSubmit={handleSignIn} className="space-y-6">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="bg-transparent border-2 border-white/20 text-white font-mono text-lg p-4 focus:border-[#CCFF00] focus:outline-none w-full transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent border-2 border-white/20 text-white font-mono text-lg p-4 focus:border-[#CCFF00] focus:outline-none w-full transition-colors pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#CCFF00] text-black font-display text-3xl uppercase tracking-tighter py-4 hover:bg-transparent hover:text-[#CCFF00] border-2 border-transparent hover:border-[#CCFF00] transition-colors flex justify-center items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>ACCESS SYSTEM <ArrowRight size={24} /></>}
                </button>
              </form>

              <div className="mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-white/20 flex-1"></div>
                  <span className="font-mono text-xs text-white/50 uppercase tracking-widest">or continue with</span>
                  <div className="h-px bg-white/20 flex-1"></div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleSSO('oauth_google')}
                    className="flex-1 border-2 border-white/20 py-3 font-mono text-xs uppercase tracking-widest text-white hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors flex justify-center items-center gap-2"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSSO('oauth_apple')}
                    className="flex-1 border-2 border-white/20 py-3 font-mono text-xs uppercase tracking-widest text-white hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors flex justify-center items-center gap-2"
                  >
                    Apple
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sign-up-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <form onSubmit={handleSignUp} className="space-y-6">
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="bg-transparent border-2 border-white/20 text-white font-mono text-lg p-4 focus:border-[#CCFF00] focus:outline-none w-full transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent border-2 border-white/20 text-white font-mono text-lg p-4 focus:border-[#CCFF00] focus:outline-none w-full transition-colors pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#CCFF00] text-black font-display text-3xl uppercase tracking-tighter py-4 hover:bg-transparent hover:text-[#CCFF00] border-2 border-transparent hover:border-[#CCFF00] transition-colors flex justify-center items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : <>INITIALIZE <ArrowRight size={24} /></>}
                </button>
              </form>

              <div className="mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-white/20 flex-1"></div>
                  <span className="font-mono text-xs text-white/50 uppercase tracking-widest">or continue with</span>
                  <div className="h-px bg-white/20 flex-1"></div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleSSO('oauth_google')}
                    className="flex-1 border-2 border-white/20 py-3 font-mono text-xs uppercase tracking-widest text-white hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors flex justify-center items-center gap-2"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSSO('oauth_apple')}
                    className="flex-1 border-2 border-white/20 py-3 font-mono text-xs uppercase tracking-widest text-white hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors flex justify-center items-center gap-2"
                  >
                    Apple
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          <div id="clerk-captcha" />
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-[#CCFF00]" size={48} /></div>}>
      <AuthContent />
    </Suspense>
  );
}
