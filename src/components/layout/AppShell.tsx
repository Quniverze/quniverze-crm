'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import { CRMView } from '@/types/crm';
import {
  Calendar,
  Users,
  Clock,
  Kanban,
  Briefcase,
  Search,
  Plus,
  UserCheck,
  LogOut
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    currentView,
    setCurrentView,
    setQuickAddOpen,
    setSearchOpen,
    setTeamModalOpen,
    teamMembers,
    currentUser,
    logout,
    toast
  } = useCRM();

  const navItems: { view: CRMView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { view: 'today', label: 'Today', icon: Calendar },
    { view: 'leads', label: 'Leads', icon: Users },
    { view: 'followups', label: 'Follow-ups', icon: Clock },
    { view: 'pipeline', label: 'Pipeline', icon: Kanban },
    { view: 'clients', label: 'Clients', icon: Briefcase }
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F6F9] text-[#12151C] font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="h-[52px] bg-white border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Left: Wordmark & Navigation */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentView('today')}
            className="flex items-baseline focus:outline-none group"
            title="Quniverze Lead Management"
          >
            <span className="text-[16px] font-bold tracking-tight text-[#12151C]">
              Quniverze
            </span>
            <span className="text-[16px] font-bold text-[#3B82F6] ml-0.5">.</span>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`px-3 py-1.5 text-[12.5px] font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#12151C] text-white'
                      : 'text-[#12151C]/70 hover:text-[#12151C] hover:bg-[#F4F6F9]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, User, Team, Primary Action, Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 text-[12px] text-[#12151C]/60 hover:text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C]/30 transition-colors"
            title="Search leads, contacts, phones (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[9.5px] font-mono text-[#12151C]/50 px-1 border border-[#E5E7EB] bg-white">
              ⌘K
            </kbd>
          </button>

          {/* User Badge */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-[11.5px] font-mono text-[#12151C] border border-[#E5E7EB] bg-white">
              <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full"></span>
              <span className="font-semibold">{currentUser.name}</span>
              <span className="text-[#12151C]/40 uppercase text-[9.5px]">
                ({currentUser.role})
              </span>
            </div>
          )}

          {/* Team Roster Button */}
          <button
            onClick={() => setTeamModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#12151C]/80 hover:text-[#12151C] border border-[#E5E7EB] hover:border-[#12151C] bg-white transition-colors"
            title="Manage Team Roster & Credentials"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="hidden sm:inline">Team</span>
            <span className="font-mono text-[11px] text-[#12151C]/50">
              ({teamMembers.length})
            </span>
          </button>

          {/* Primary Action Button: + Lead */}
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12151C] hover:bg-[#3B82F6] text-white text-[12px] font-medium transition-colors"
            title="Add Lead"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lead</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="p-1.5 text-[#12151C]/40 hover:text-[#12151C] hover:bg-[#F4F6F9] transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden h-[54px] bg-white border-t border-[#E5E7EB] flex items-center justify-around px-2 shrink-0 z-30 select-none">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          const Icon = item.icon;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#3B82F6]'
                  : 'text-[#12151C]/60 hover:text-[#12151C]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Crisp Toast Notification */}
      {toast && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-50 px-4 py-2.5 bg-[#12151C] text-white text-[12px] font-mono shadow-xl border border-[#3B82F6]/50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-1.5 h-1.5 bg-[#3B82F6] shrink-0"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
