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
  UserCheck
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F6F9] text-[#12151C] font-sans">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setCurrentView('today')}
            className="cursor-pointer select-none flex items-baseline"
          >
            <span className="text-[17px] font-bold tracking-tight text-[#12151C]">
              Quniverze
            </span>
            <span className="text-[17px] font-bold text-[#3B82F6]">.</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`px-3 py-1.5 text-[12.5px] font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-[#12151C] border-b-2 border-[#3B82F6]'
                      : 'text-[#12151C]/60 hover:text-[#12151C]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Search, Team Roster, + Add Lead */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 text-[12px] text-[#12151C]/60 hover:text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C]/40 transition-colors"
            title="Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-[10px] font-mono text-[#12151C]/40 px-1 border border-[#E5E7EB]">
              ⌘K
            </kbd>
          </button>

          {/* Team Roster Trigger */}
          <button
            onClick={() => setTeamModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium text-[#12151C]/80 hover:text-[#12151C] border border-[#E5E7EB] hover:border-[#12151C] bg-white transition-colors"
            title="Manage Team Roster"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="hidden sm:inline">Team</span>
            <span className="font-mono text-[11px] text-[#12151C]/60">
              ({teamMembers.length})
            </span>
          </button>

          {/* Add Lead Primary CTA */}
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lead</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden h-14 bg-white border-t border-[#E5E7EB] flex items-center justify-around px-2 shrink-0 z-20">
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-50 px-4 py-2 bg-[#12151C] text-white text-[12px] font-mono shadow-lg border border-[#3B82F6]/40 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#3B82F6]"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
