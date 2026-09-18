'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import {
  PhoneCall,
  LayoutDashboard,
  Users,
  Kanban,
  CheckCircle2,
  Search,
  Plus,
  RotateCcw,
  UserCheck
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    currentUser,
    setRole,
    currentView,
    setCurrentView,
    setSearchModalOpen,
    setQuickAddOpen,
    leads,
    opportunities,
    clients,
    resetToDemoData,
    toastMessage
  } = useCRM();

  // Active counts
  const queueCount = leads.filter(
    (l) => l.status === 'To Call' || l.status === 'New' || l.status === 'Contacted'
  ).length;
  const activeOppsCount = opportunities.filter(
    (o) => o.stage !== 'Won' && o.stage !== 'Lost'
  ).length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F7F7F5] text-[#111111]">
      
      {/* TOP COMMAND BAR */}
      <header className="h-[52px] bg-white border-b border-[#E5E5E5] px-4 md:px-6 flex items-center justify-between z-20 flex-shrink-0">
        
        {/* Left: Brand Identity & Global Search */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-[0.14em] text-[13.5px] text-[#111111] uppercase font-mono">
              QUNIVERZE
            </span>
            <span className="text-[11px] font-semibold text-[#737373] pl-3 border-l border-[#D4D4D0] uppercase tracking-wider hidden sm:inline">
              Sales Cockpit
            </span>
          </div>

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-[12.5px] text-[#6B6B6B] hover:text-[#111111] bg-[#F7F7F5] border border-[#E5E5E5] hover:border-[#111111] transition-all"
            title="Global Search (Cmd/Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Search CRM</span>
            <kbd className="kbd-pill hidden sm:inline-block">⌘K</kbd>
          </button>
        </div>

        {/* Right: Operational Role Switcher & Actions */}
        <div className="flex items-center gap-3">
          
          {/* TWO ROLES SWITCHER (Founder vs Outreach Executive) */}
          <div className="flex items-center p-1 bg-[#EFEFED] border border-[#E0E0DC] rounded-md text-[12px]">
            <button
              type="button"
              onClick={() => setRole('outreach')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
                currentUser.role === 'outreach'
                  ? 'bg-white text-[#111111] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Outreach Executive</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('founder')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-all ${
                currentUser.role === 'founder'
                  ? 'bg-white text-[#111111] shadow-xs font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Founder</span>
            </button>
          </div>

          {/* Quick Add Lead */}
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[12.5px] font-semibold text-white bg-[#111111] hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Lead</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={resetToDemoData}
            title="Reset to default seed scenario"
            className="p-2 text-[#6B6B6B] hover:text-[#111111] rounded border border-transparent hover:border-[#E5E5E5] hover:bg-[#F7F7F5]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER: SIDEBAR + CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside
          style={{ width: 240, minWidth: 240 }}
          className="w-[240px] min-w-[240px] bg-white border-r border-[#E5E5E5] flex flex-col justify-between p-3.5 hidden md:flex flex-shrink-0"
        >
          <nav className="space-y-1.5">
            
            {/* 1. Overview (Command Center) */}
            <button
              type="button"
              onClick={() => setCurrentView('overview')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                currentView === 'overview'
                  ? 'bg-[#F4F4F1] text-[#111111] font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </div>
              {currentUser.role === 'founder' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#111111] text-white flex-shrink-0">
                  HQ
                </span>
              )}
            </button>

            {/* 2. Call Queue (Primary for Outreach) */}
            <button
              type="button"
              onClick={() => setCurrentView('queue')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                currentView === 'queue'
                  ? 'bg-[#F4F4F1] text-[#111111] font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4" />
                <span>Call Queue</span>
              </div>
              {queueCount > 0 && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    currentUser.role === 'outreach'
                      ? 'bg-[#111111] text-white'
                      : 'bg-[#EEEEEC] text-[#6B6B6B]'
                  }`}
                >
                  {queueCount}
                </span>
              )}
            </button>

            {/* 3. Leads Database */}
            <button
              type="button"
              onClick={() => setCurrentView('leads')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                currentView === 'leads'
                  ? 'bg-[#F4F4F1] text-[#111111] font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Leads</span>
              </div>
              <span className="text-[11px] font-semibold text-[#6B6B6B] bg-[#EEEEEC] px-1.5 py-0.5 rounded flex-shrink-0">
                {leads.length}
              </span>
            </button>

            {/* 4. Pipeline */}
            <button
              type="button"
              onClick={() => setCurrentView('pipeline')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                currentView === 'pipeline'
                  ? 'bg-[#F4F4F1] text-[#111111] font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Kanban className="w-4 h-4" />
                <span>Pipeline</span>
              </div>
              {activeOppsCount > 0 && (
                <span className="text-[11px] font-semibold text-[#111111] px-1.5 py-0.5 bg-[#EEEEEC] rounded flex-shrink-0">
                  {activeOppsCount}
                </span>
              )}
            </button>

            {/* 5. Clients */}
            <button
              type="button"
              onClick={() => setCurrentView('clients')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-[13px] font-medium transition-colors text-left ${
                currentView === 'clients'
                  ? 'bg-[#F4F4F1] text-[#111111] font-semibold'
                  : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Clients</span>
              </div>
              <span className="text-[11px] font-semibold text-[#6B6B6B] bg-[#EEEEEC] px-1.5 py-0.5 rounded flex-shrink-0">
                {clients.length}
              </span>
            </button>
          </nav>

          {/* Operational Context Card in Sidebar Bottom */}
          <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E5] rounded-md space-y-1">
            <div className="font-semibold text-[#111111] uppercase tracking-wider text-[10px] whitespace-nowrap">
              {currentUser.role === 'founder' ? 'Founder Priority' : 'Outreach Priority'}
            </div>
            <div className="text-[#6B6B6B] text-[11.5px] leading-tight">
              {currentUser.role === 'founder'
                ? 'Review hot proposals, conduct meetings & close contracts.'
                : 'Work through call queue, record outcomes & schedule follow-ups.'}
            </div>
          </div>
        </aside>

        {/* MAIN STAGE CONTENT */}
        <main className="flex-1 h-full overflow-hidden bg-[#F7F7F5]">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION (Section 23) */}
      <nav className="h-[54px] bg-white border-t border-[#E5E5E5] flex items-center justify-around md:hidden z-20 flex-shrink-0">
        <button
          type="button"
          onClick={() => setCurrentView('overview')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10.5px] font-medium ${
            currentView === 'overview' ? 'text-[#111111] font-bold' : 'text-[#6B6B6B]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('queue')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10.5px] font-medium relative ${
            currentView === 'queue' ? 'text-[#111111] font-bold' : 'text-[#6B6B6B]'
          }`}
        >
          <PhoneCall className="w-4 h-4 mb-0.5" />
          <span>Calls</span>
          {queueCount > 0 && (
            <span className="absolute top-1.5 right-6 w-2 h-2 rounded-full bg-[#C62828]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('leads')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10.5px] font-medium ${
            currentView === 'leads' ? 'text-[#111111] font-bold' : 'text-[#6B6B6B]'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Leads</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('pipeline')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10.5px] font-medium ${
            currentView === 'pipeline' ? 'text-[#111111] font-bold' : 'text-[#6B6B6B]'
          }`}
        >
          <Kanban className="w-4 h-4 mb-0.5" />
          <span>Pipeline</span>
        </button>
      </nav>

      {/* RESTRAINED TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-2.5 rounded shadow-lg text-[13px] font-medium animate-in fade-in slide-in-from-bottom-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
