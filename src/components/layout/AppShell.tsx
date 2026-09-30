'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { CRMView } from '@/types/crm';
import {
  LayoutGrid,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Search,
  Bell,
  Mail,
  Plus,
  Menu,
  X,
  Sparkles
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
    leads,
    teamMembers,
    currentUser,
    logout,
    toast
  } = useCRM();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLeadsCount = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost').length;

  const menuItems = [
    { view: 'today' as CRMView, label: 'Dashboard', icon: LayoutGrid },
    { view: 'leads' as CRMView, label: 'Tasks', icon: CheckSquare, badge: activeLeadsCount > 0 ? `${activeLeadsCount}+` : undefined },
    { view: 'followups' as CRMView, label: 'Calendar', icon: Calendar },
    { view: 'pipeline' as CRMView, label: 'Analytics', icon: BarChart3 },
    { view: 'team' as any, label: 'Team', icon: Users, isAction: true, onClick: () => setTeamModalOpen(true) },
  ];

  const generalItems = [
    { view: 'clients' as CRMView, label: 'Accounts', icon: Briefcase },
    { label: 'Settings', icon: Settings, isAction: true, onClick: () => setTeamModalOpen(true) },
    { label: 'Logout', icon: LogOut, isAction: true, onClick: logout },
  ];

  const handleNav = (item: any) => {
    if (item.isAction && item.onClick) {
      item.onClick();
    } else if (item.view) {
      setCurrentView(item.view);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F3F4F7] text-[#111827] font-sans antialiased">
      {/* ========================================================
          LEFT SIDEBAR (Desktop)
          ======================================================== */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#EAECEF] flex-col justify-between p-5 shrink-0 z-30 select-none">
        <div className="space-y-6">
          {/* Logo & Brand matching reference */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] border border-[#34D399]/30 flex items-center justify-center text-[#1A5336] shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div className="flex items-baseline">
              <span className="text-[19px] font-bold tracking-tight text-[#111827]">
                Quniverze
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A5336] ml-0.5"></span>
            </div>
          </div>

          {/* MENU Section */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              Menu
            </div>
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const isActive = !item.isAction && currentView === item.view;
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all group relative ${
                      isActive
                        ? 'text-[#1A5336] font-semibold bg-[#E8F5EE]/60'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#1A5336] rounded-r-full" />
                      )}
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#1A5336]' : 'text-[#9CA3AF] group-hover:text-[#111827]'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10.5px] font-bold bg-[#1A5336] text-white rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* GENERAL Section */}
          <div className="space-y-1 pt-2">
            <div className="px-3 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
              General
            </div>
            <nav className="space-y-0.5">
              {generalItems.map((item) => {
                const isActive = !item.isAction && item.view && currentView === item.view;
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors group ${
                      isActive
                        ? 'text-[#1A5336] font-semibold bg-[#E8F5EE]/60'
                        : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#111827]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Promo / Quick Action Card */}
        <div className="p-4 rounded-2xl bg-[#0F2D1F] text-white relative overflow-hidden pattern-organic shadow-md">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
          </div>
          <h4 className="text-[13px] font-bold tracking-tight">Quniverze Sales</h4>
          <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
            NivaOps &amp; Client Deals
          </p>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="w-full mt-3 py-2 bg-[#1A5336] hover:bg-[#236B46] text-white rounded-full text-[11.5px] font-medium transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3 h-3" />
            <span>New Lead</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MOBILE DRAWER
          ======================================================== */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 bg-white h-full p-5 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] flex items-center justify-center text-[#1A5336] font-bold">
                    Q
                  </div>
                  <span className="text-[18px] font-bold text-[#111827]">Quniverze</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase mb-2">Menu</div>
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <item.icon className="w-4 h-4 text-gray-500" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase mb-2">General</div>
                {generalItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <item.icon className="w-4 h-4 text-gray-500" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          RIGHT CONTENT WRAPPER (Top Bar + Main Scroll View)
          ======================================================== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-[68px] px-4 md:px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Pill Input */}
            <div
              onClick={() => setSearchOpen(true)}
              className="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-full border border-gray-200 shadow-xs hover:border-gray-300 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 text-gray-400 text-[13px]">
                <Search className="w-4 h-4" />
                <span>Search task, lead, phone...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-50 rounded border border-gray-200">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right User & Quick Icons */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Quick Action: Messages */}
            <button
              onClick={() => setCurrentView('followups')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-xs"
              title="Touchpoints"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Quick Action: Notifications */}
            <button
              onClick={() => setCurrentView('today')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-xs relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#1A5336] absolute top-2.5 right-2.5"></span>
            </button>

            {/* User Profile Capsule */}
            <div
              onClick={() => setTeamModalOpen(true)}
              className="flex items-center gap-2.5 pl-2 cursor-pointer group"
              title="Manage Profile & Team"
            >
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-[#E8F5EE] border-2 border-[#1A5336]/20 flex items-center justify-center text-[#1A5336] font-bold text-sm overflow-hidden shadow-xs">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'AB'}
              </div>

              {/* Name & Email / Role */}
              <div className="hidden sm:block text-left">
                <div className="text-[13px] font-bold text-[#111827] leading-tight group-hover:text-[#1A5336] transition-colors">
                  {currentUser?.name || 'Abid'}
                </div>
                <div className="text-[11px] text-gray-400 leading-tight">
                  {currentUser?.username ? `${currentUser.username}@quniverze.com` : 'admin@quniverze.com'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-8">
          {children}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-[#1A5336] text-white text-[12.5px] font-medium shadow-xl rounded-full border border-[#34D399]/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-[#34D399] shrink-0 animate-ping"></span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
