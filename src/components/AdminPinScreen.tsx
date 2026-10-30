'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Delete, 
  ShieldCheck, 
  Store,
  RefreshCw,
  X,
  HelpCircle
} from 'lucide-react';

type AdminPinScreenProps = {
  onSuccess: () => void;
};

export default function AdminPinScreen({ onSuccess }: AdminPinScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [showDigits, setShowDigits] = useState<boolean>(false);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isDefaultPin, setIsDefaultPin] = useState<boolean>(true);

  // Change PIN modal state
  const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState<boolean>(false);

  // Check initial security status
  useEffect(() => {
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.isDefaultPin === 'boolean') {
          setIsDefaultPin(data.isDefaultPin);
        }
      })
      .catch(() => {});
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.([50, 50, 50]);
      } catch {}
    }
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleVerify = useCallback(async (pinToVerify: string) => {
    if (pinToVerify.length !== 6 || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          pin: pinToVerify,
          rememberDays: rememberDevice ? 30 : 1
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store persistent session in localStorage
        const sessionData = {
          token: data.token,
          expiresAt: data.expiresAt,
          savedAt: Date.now()
        };
        localStorage.setItem('vishwakarma_admin_session', JSON.stringify(sessionData));
        onSuccess();
      } else {
        setErrorMsg(data.error || 'Incorrect PIN. Please try again.');
        triggerShake();
        setPin('');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection.');
      triggerShake();
      setPin('');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, rememberDevice, onSuccess]);

  // Handle keypad digit press
  const handleDigitPress = (digit: string) => {
    if (pin.length >= 6 || isLoading) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg(null);

    // Auto submit on 6th digit
    if (nextPin.length === 6) {
      handleVerify(nextPin);
    }
  };

  const handleBackspace = () => {
    if (isLoading) return;
    setPin(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    if (isLoading) return;
    setPin('');
    setErrorMsg(null);
  };

  // Keyboard navigation listener (Laptop/Desktop or physical keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showChangeModal) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter' && pin.length === 6) {
        e.preventDefault();
        handleVerify(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, showChangeModal, handleVerify]);

  // Handle Change PIN submission
  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (newPinInput.length !== 6 || !/^\d{6}$/.test(newPinInput)) {
      setChangeError('New PIN must be exactly 6 digits.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setChangeError('New PIN and Confirm PIN do not match.');
      return;
    }

    setIsChanging(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_pin',
          currentPin: currentPinInput,
          newPin: newPinInput,
          confirmPin: confirmPinInput
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setChangeSuccess('PIN updated successfully! Signing you in...');
        setIsDefaultPin(false);

        // Store refreshed session
        const sessionData = {
          token: data.token,
          expiresAt: data.expiresAt,
          savedAt: Date.now()
        };
        localStorage.setItem('vishwakarma_admin_session', JSON.stringify(sessionData));

        setTimeout(() => {
          setShowChangeModal(false);
          onSuccess();
        }, 1200);
      } else {
        setChangeError(data.error || 'Failed to update PIN. Please verify current PIN.');
      }
    } catch {
      setChangeError('Server connection error. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-[#042015] bg-gradient-to-b from-[#062e1e] via-[#042015] to-[#02130c] text-white p-4 sm:p-6 overflow-y-auto font-sans antialiased select-none">
      
      {/* Top Header / Branding */}
      <header className="w-full max-w-sm flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-400/30 shadow-md bg-[#021d13]">
            <Image 
              src="/images/logo.png" 
              alt="Vishwakarma Logo" 
              fill 
              sizes="36px"
              className="object-cover" 
            />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white leading-tight">
              Vishwakarma Atta Chakki
            </h1>
            <p className="text-[10px] text-emerald-300/80 font-medium tracking-wide">
              Admin Security Panel
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-[11px] font-semibold text-emerald-300 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 transition flex items-center gap-1"
        >
          <Store size={13} />
          <span>Store</span>
        </Link>
      </header>

      {/* Main PIN Container */}
      <main className="w-full max-w-sm flex flex-col items-center justify-center my-auto py-2">
        
        {/* Security Shield Icon */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0b482d] to-[#10b981] flex items-center justify-center shadow-lg border border-emerald-400/40 text-amber-300">
            {isLoading ? (
              <RefreshCw size={28} className="animate-spin text-white" />
            ) : (
              <Lock size={28} className="text-amber-300" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-[#062e1e] rounded-full p-1 shadow-sm">
            <KeyRound size={12} />
          </div>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight text-center">
          Enter 6-Digit Admin PIN
        </h2>
        <p className="text-xs text-emerald-200/70 text-center mt-1 max-w-xs font-medium">
          Enter your secure 6-digit access code to manage orders, customers, and chakki rates.
        </p>

        {/* 6 PIN Indicators */}
        <div 
          className={`flex items-center justify-center gap-3 my-6 transition-transform ${
            isShaking ? 'translate-x-[-8px] animate-shake' : ''
          }`}
        >
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const hasDigit = pin.length > idx;
            const digitChar = pin[idx];
            return (
              <div 
                key={idx}
                className={`w-11 h-12 rounded-xl flex items-center justify-center text-lg font-black transition-all duration-150 border-2 ${
                  hasDigit 
                    ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_12px_rgba(52,211,153,0.35)] scale-105' 
                    : idx === pin.length
                    ? 'border-amber-400/80 bg-white/5 animate-pulse'
                    : 'border-emerald-900/60 bg-black/20 text-emerald-700'
                }`}
              >
                {hasDigit ? (
                  showDigits ? digitChar : '●'
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-700/40" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error / Status Messages */}
        <div className="h-6 mb-2 flex items-center justify-center text-center">
          {errorMsg ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-300 bg-red-950/60 border border-red-500/40 px-3 py-1 rounded-full animate-fadeIn">
              <AlertCircle size={13} className="shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          ) : isLoading ? (
            <span className="text-xs text-emerald-300 font-medium animate-pulse flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" /> Verifying PIN...
            </span>
          ) : isDefaultPin ? (
            <span className="text-[11px] text-amber-300/90 font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              Default PIN: <strong className="font-mono text-amber-200">123456</strong>
            </span>
          ) : null}
        </div>

        {/* Visibility & Session Row */}
        <div className="w-full flex items-center justify-between text-xs text-emerald-200/80 mb-4 px-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={rememberDevice}
              onChange={e => setRememberDevice(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-500 rounded cursor-pointer"
            />
            <span className="text-[11px] font-semibold text-emerald-200/90">
              Keep Logged In (30 Days)
            </span>
          </label>

          <button
            type="button"
            onClick={() => setShowDigits(prev => !prev)}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-300 hover:text-white transition py-1 px-2 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            {showDigits ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{showDigits ? 'Hide' : 'Show'}</span>
          </button>
        </div>

        {/* Touch Numeric Keypad (Optimized for Mobile Thumbs) */}
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitPress(num)}
              disabled={isLoading}
              className="h-14 sm:h-15 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-emerald-600/40 text-xl font-bold text-white shadow-sm border border-emerald-500/20 active:scale-95 transition-all duration-100 flex items-center justify-center cursor-pointer touch-manipulation disabled:opacity-40"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading || pin.length === 0}
            className="h-14 sm:h-15 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-xs font-bold text-emerald-300 border border-emerald-500/10 active:scale-95 transition-all duration-100 flex items-center justify-center cursor-pointer touch-manipulation disabled:opacity-30"
          >
            Clear
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            disabled={isLoading}
            className="h-14 sm:h-15 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-emerald-600/40 text-xl font-bold text-white shadow-sm border border-emerald-500/20 active:scale-95 transition-all duration-100 flex items-center justify-center cursor-pointer touch-manipulation disabled:opacity-40"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isLoading || pin.length === 0}
            className="h-14 sm:h-15 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 text-white border border-emerald-500/10 active:scale-95 transition-all duration-100 flex items-center justify-center cursor-pointer touch-manipulation disabled:opacity-30"
            aria-label="Delete last digit"
          >
            <Delete size={20} className="text-emerald-300" />
          </button>
        </div>

        {/* Change PIN / Forgot PIN Links */}
        <div className="w-full flex items-center justify-between mt-5 pt-3 border-t border-emerald-900/50 text-xs">
          <button
            type="button"
            onClick={() => {
              setShowChangeModal(true);
              setCurrentPinInput(pin || '');
              setChangeError(null);
              setChangeSuccess(null);
            }}
            className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 py-1 cursor-pointer"
          >
            <KeyRound size={13} />
            <span>Change 6-Digit PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorMsg('Default PIN is 123456. You can change it anytime with "Change 6-Digit PIN".');
            }}
            className="text-emerald-300/80 hover:text-emerald-100 font-medium flex items-center gap-1 py-1 cursor-pointer"
          >
            <HelpCircle size={13} />
            <span>Forgot PIN?</span>
          </button>
        </div>

      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-sm text-center py-2 text-[11px] text-emerald-400/60 font-medium">
        Vishwakarma Atta Chakki &bull; Secure Mobile Portal
      </footer>

      {/* Change PIN Modal */}
      {showChangeModal && (
        <div 
          className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowChangeModal(false)}
        >
          <div 
            className="bg-[#062e1e] border border-emerald-500/30 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-white relative space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-emerald-900/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <KeyRound size={16} />
                </div>
                <h3 className="font-bold text-base text-white">Change Admin PIN</h3>
              </div>
              <button 
                onClick={() => setShowChangeModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Set a new 6-digit numeric PIN for securing your Vishwakarma Admin Panel.
            </p>

            {changeError && (
              <div className="p-2.5 rounded-xl bg-red-900/50 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                <span>{changeError}</span>
              </div>
            )}

            {changeSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>{changeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  Current 6-Digit PIN *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={currentPinInput}
                  onChange={e => setCurrentPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-white font-mono text-center tracking-widest text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  New 6-Digit PIN *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPinInput}
                  onChange={e => setNewPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6 new digits"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-white font-mono text-center tracking-widest text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-emerald-300 font-bold mb-1">
                  Confirm New PIN *
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPinInput}
                  onChange={e => setConfirmPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Re-enter 6 new digits"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-white font-mono text-center tracking-widest text-sm focus:border-amber-400 outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChanging}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#062e1e] font-black flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isChanging ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                  <span>Save New PIN</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
