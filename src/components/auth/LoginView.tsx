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
    <div className="min-h-screen w-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white border border-[#E5E7EB] shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-baseline">
            <span className="text-[22px] font-bold tracking-tight text-[#12151C]">
              Quniverze
            </span>
            <span className="text-[22px] font-bold text-[#3B82F6]">.</span>
          </div>
          <p className="text-[12.5px] text-[#12151C]/60">
            Internal Sales Cockpit • Sign in to continue
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-[#12151C] text-white text-[12px] font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#3B82F6] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#12151C]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. abid or member username"
                className="w-full pl-9 pr-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#12151C]/40 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#12151C] text-white text-[13px] font-medium hover:bg-[#3B82F6] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer Hint */}
        <div className="pt-4 border-t border-[#E5E7EB] text-center">
          <p className="text-[11px] font-mono text-[#12151C]/50">
            Initial Admin: <span className="text-[#12151C] font-bold">abid</span> / <span className="text-[#12151C] font-bold">password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
