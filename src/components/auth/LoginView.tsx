'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { ArrowRight, Lock, User, AlertCircle } from 'lucide-react';

export function LoginView() {
  const { login } = useCRM();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F3F4F7] flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-[28px] shadow-xl p-7 sm:p-9 space-y-6">
        {/* Brand Header */}
        <div className="space-y-2 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5EE] border border-[#34D399]/30 flex items-center justify-center text-[#1A5336] shadow-sm mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="inline-flex items-baseline">
            <span className="text-[22px] font-bold tracking-tight text-[#111827]">
              Quniverze
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A5336] ml-1"></span>
          </div>
          <p className="text-[13px] text-gray-500">
            Internal Sales Cockpit • Sign in to continue
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[12px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. abid"
                className="w-full pl-10 pr-4 py-2.5 text-[13.5px] text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-[13.5px] font-mono text-[#111827] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim() || !password.trim()}
            className="w-full py-3 bg-[#1A5336] text-white text-[13px] font-medium rounded-full hover:bg-[#14422B] disabled:opacity-40 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11.5px] text-gray-400 border-t border-gray-100">
          Initial setup: <strong className="text-gray-700">abid</strong> / <strong className="text-gray-700">password123</strong>
        </div>
      </div>
    </div>
  );
}
