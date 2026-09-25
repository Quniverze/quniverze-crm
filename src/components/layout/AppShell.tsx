'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { CRMView } from '@/types/crm';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CalendarClock,
  Briefcase,
  FolderGit2,
  Activity as ActivityIcon,
  Settings,
  Search,
  Plus,
  RotateCcw,
  UserCheck,
  PhoneCall,
  Menu,
  X
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
    followUps,
    clients,
    projects,
    refreshSync,
    toastMessage
  } = useCRM();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active counts
  const overdueCount = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at).getTime() < Date.now()
  ).length;

  const activeOppsCount = opportunities.filter(
    (o) => o.stage !== 'Won' && o.stage !== 'Lost'
  ).length;

  const navigateTo = (view: CRMView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F4F6F9] text-[#12151C]">
      
      {/* TOP COMMAND BAR */}
      <header className="h-[52px] bg-white border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between z-20 flex-shrink-0">
        
        {/* Left: Brand Wordmark & Global Search */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigateTo('overview')}
            className="flex items-center gap-1.5 text-left group focus:outline-none"
          >
            <span className="text-[17px] font-bold tracking-tight text-[#12151C] select-none">
              Quniverze<span className="text-[#3B82F6]">.</span>
            </span>
            <span className="text-[11px] font-medium text-[#6B7280] hidden sm:inline pl-2 border-l border-[#E5E7EB] tracking-normal">
              Operating System
            </span>
          </button>

          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[12px] text-[#4B5563] hover:text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] hover:border-[#12151C] transition-colors"
            title="Global Search (Cmd/Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-[#6B7280]" />
            <span className="hidden md:inline">Search CRM...</span>
            <kbd className="kbd-pill hidden sm:inline-block">⌘K</kbd>
          </button>
        </div>

        {/* Right: Cloud Sync, Role Switcher, Quick Action, Mobile Menu */}
        <div className="flex items-center gap-2.5">
          
          {/* Live Sync Status Indicator */}
          <button
            type="button"
            onClick={refreshSync}
            title="Cloud synchronization active. Click to refresh."
            className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium text-[#4B5563] hover:text-[#12151C] border border-transparent hover:border-[#E5E7EB] hover:bg-[#F4F6F9] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            <span>Live Sync</span>
          </button>

          {/* Role Switcher (Founder vs Outreach Executive) */}
          <div className="hidden sm:flex items-center p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[11.5px]">
            <button
              type="button"
              onClick={() => setRole('founder')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
                currentUser.role === 'founder'
                  ? 'bg-white text-[#12151C] border border-[#E5E7EB] font-semibold'
                  : 'text-[#6B7280] hover:text-[#12151C]'
              }`}
            >
              <UserCheck className="w-3 h-3 text-[#3B82F6]" />
              <span>Founder</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('outreach')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
                currentUser.role === 'outreach'
                  ? 'bg-white text-[#12151C] border border-[#E5E7EB] font-semibold'
                  : 'text-[#6B7280] hover:text-[#12151C]'
              }`}
            >
              <PhoneCall className="w-3 h-3 text-[#12151C]" />
              <span>Outreach</span>
            </button>
          </div>

          {/* Quick Add Lead Primary Action */}
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium text-white bg-[#12151C] hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Lead</span>
          </button>

          {/* Cloud Sync Manual Trigger */}
          <button
            type="button"
            onClick={refreshSync}
            title="Synchronize with cloud"
            className="p-1.5 text-[#6B7280] hover:text-[#12151C] rounded border border-transparent hover:border-[#E5E7EB] hover:bg-[#F4F6F9] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#12151C] md:hidden rounded border border-[#E5E7EB]"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER: SIDEBAR + CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR */}
        <aside
          style={{ width: 230, minWidth: 230 }}
          className="w-[230px] min-w-[230px] bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-3 hidden md:flex flex-shrink-0"
        >
          <div className="space-y-4">
            
            {/* Overview / Command Center */}
            <div>
              <button
                type="button"
                onClick={() => navigateTo('overview')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'overview'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-3.5 h-3.5 ${currentView === 'overview' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Overview</span>
                </div>
                {currentUser.role === 'founder' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#12151C] text-white">
                    HQ
                  </span>
                )}
              </button>
            </div>

            {/* CRM SECTION */}
            <div className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                CRM
              </div>

              {/* Leads */}
              <button
                type="button"
                onClick={() => navigateTo('leads')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'leads'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-3.5 h-3.5 ${currentView === 'leads' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Leads</span>
                </div>
                <span className="text-[11px] font-medium text-[#6B7280] font-mono">
                  {leads.length}
                </span>
              </button>

              {/* Opportunities / Pipeline */}
              <button
                type="button"
                onClick={() => navigateTo('opportunities')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'opportunities'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Kanban className={`w-3.5 h-3.5 ${currentView === 'opportunities' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Opportunities</span>
                </div>
                {activeOppsCount > 0 && (
                  <span className="text-[11px] font-medium text-[#12151C] font-mono">
                    {activeOppsCount}
                  </span>
                )}
              </button>

              {/* Follow-ups */}
              <button
                type="button"
                onClick={() => navigateTo('followups')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'followups'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarClock className={`w-3.5 h-3.5 ${currentView === 'followups' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Follow-ups</span>
                </div>
                {overdueCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#12151C] text-white font-mono">
                    {overdueCount}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[#6B7280] font-mono">
                    {followUps.filter(f => f.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>

            {/* WORK SECTION */}
            <div className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Work
              </div>

              {/* Clients */}
              <button
                type="button"
                onClick={() => navigateTo('clients')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'clients'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className={`w-3.5 h-3.5 ${currentView === 'clients' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Clients</span>
                </div>
                <span className="text-[11px] font-medium text-[#6B7280] font-mono">
                  {clients.length}
                </span>
              </button>

              {/* Projects */}
              <button
                type="button"
                onClick={() => navigateTo('projects')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'projects'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderGit2 className={`w-3.5 h-3.5 ${currentView === 'projects' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Projects</span>
                </div>
                <span className="text-[11px] font-medium text-[#6B7280] font-mono">
                  {projects.length}
                </span>
              </button>
            </div>

            {/* OPERATIONS SECTION */}
            <div className="space-y-1">
              <div className="px-2.5 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">
                Operations
              </div>

              {/* Activity Stream */}
              <button
                type="button"
                onClick={() => navigateTo('activity')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'activity'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ActivityIcon className={`w-3.5 h-3.5 ${currentView === 'activity' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Activity</span>
                </div>
              </button>

              {/* Settings */}
              <button
                type="button"
                onClick={() => navigateTo('settings')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                  currentView === 'settings'
                    ? 'bg-[#F4F6F9] text-[#12151C] font-semibold border-l-2 border-[#3B82F6]'
                    : 'text-[#4B5563] hover:text-[#12151C] hover:bg-[#F4F6F9]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className={`w-3.5 h-3.5 ${currentView === 'settings' ? 'text-[#3B82F6]' : 'text-[#6B7280]'}`} />
                  <span>Settings</span>
                </div>
              </button>
            </div>
          </div>

          {/* STUDIO PROCESS LANGUAGE MOTIF */}
          <div className="pt-3 border-t border-[#E5E7EB] space-y-1">
            <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider px-1">
              STUDIO PROCESS
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10.5px] text-[#4B5563] px-1 py-1 bg-[#F4F6F9] rounded border border-[#E5E7EB]">
              <div><span className="font-mono text-[#3B82F6] font-semibold">01</span> Understand</div>
              <div><span className="font-mono text-[#3B82F6] font-semibold">02</span> Design</div>
              <div><span className="font-mono text-[#3B82F6] font-semibold">03</span> Build</div>
              <div><span className="font-mono text-[#3B82F6] font-semibold">04</span> Improve</div>
            </div>
          </div>
        </aside>

        {/* MOBILE SLIDE-OUT DRAWER */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#12151C]/40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-[260px] h-full bg-white border-r border-[#E5E7EB] p-4 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <span className="text-[17px] font-bold text-[#12151C]">
                    Quniverze<span className="text-[#3B82F6]">.</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-[#6B7280]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Role Switcher in Mobile Drawer */}
                <div className="flex items-center p-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[11.5px]">
                  <button
                    type="button"
                    onClick={() => setRole('founder')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded ${
                      currentUser.role === 'founder'
                        ? 'bg-white text-[#12151C] font-semibold border border-[#E5E7EB]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    Founder
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('outreach')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded ${
                      currentUser.role === 'outreach'
                        ? 'bg-white text-[#12151C] font-semibold border border-[#E5E7EB]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    Outreach
                  </button>
                </div>

                {/* Nav Links */}
                <div className="space-y-1 text-[13px]">
                  <button
                    type="button"
                    onClick={() => navigateTo('overview')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded ${
                      currentView === 'overview' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#3B82F6]" />
                    <span>Overview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('leads')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                      currentView === 'leads' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#3B82F6]" />
                      <span>Leads</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#6B7280]">{leads.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('opportunities')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                      currentView === 'opportunities' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Kanban className="w-4 h-4 text-[#3B82F6]" />
                      <span>Opportunities</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#6B7280]">{activeOppsCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('followups')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                      currentView === 'followups' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarClock className="w-4 h-4 text-[#3B82F6]" />
                      <span>Follow-ups</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#6B7280]">{followUps.filter(f => f.status === 'pending').length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('clients')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                      currentView === 'clients' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-4 h-4 text-[#3B82F6]" />
                      <span>Clients</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#6B7280]">{clients.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('projects')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                      currentView === 'projects' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-4 h-4 text-[#3B82F6]" />
                      <span>Projects</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#6B7280]">{projects.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('activity')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded ${
                      currentView === 'activity' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <ActivityIcon className="w-4 h-4 text-[#3B82F6]" />
                    <span>Activity</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('settings')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded ${
                      currentView === 'settings' ? 'bg-[#F4F6F9] text-[#12151C] font-semibold' : 'text-[#4B5563]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-[#3B82F6]" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-[#6B7280] pt-3 border-t border-[#E5E7EB]">
                Products. Services. Real impact.
              </div>
            </div>
          </div>
        )}

        {/* MAIN STAGE CONTENT */}
        <main className="flex-1 h-full overflow-hidden bg-[#F4F6F9]">
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="h-[52px] bg-white border-t border-[#E5E7EB] flex items-center justify-around md:hidden z-20 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigateTo('overview')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
            currentView === 'overview' ? 'text-[#12151C] font-bold' : 'text-[#6B7280]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo('leads')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
            currentView === 'leads' ? 'text-[#12151C] font-bold' : 'text-[#6B7280]'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Leads</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo('opportunities')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] ${
            currentView === 'opportunities' ? 'text-[#12151C] font-bold' : 'text-[#6B7280]'
          }`}
        >
          <Kanban className="w-4 h-4 mb-0.5" />
          <span>Pipeline</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo('followups')}
          className={`flex flex-col items-center justify-center flex-1 h-full text-[10px] relative ${
            currentView === 'followups' ? 'text-[#12151C] font-bold' : 'text-[#6B7280]'
          }`}
        >
          <CalendarClock className="w-4 h-4 mb-0.5" />
          <span>Follow-ups</span>
          {overdueCount > 0 && (
            <span className="absolute top-2 right-6 w-1.5 h-1.5 rounded-full bg-[#12151C]" />
          )}
        </button>
      </nav>

      {/* RESTRAINED TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 bg-[#12151C] text-white px-4 py-2.5 rounded text-[12.5px] font-medium border border-[#E5E7EB]/20">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
