'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { Lead, Project } from '@/types/crm';
import {
  X,
  MoreVertical,
  Calendar as CalendarIcon,
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  Video,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface MinimalDashboardProps {
  modeSwitch?: React.ReactNode;
}

export function MinimalDashboard({ modeSwitch }: MinimalDashboardProps = {}) {
  const {
    leads,
    projects,
    setQuickAddOpen,
    setProjectModalOpen,
    setEditingProject,
    setLeadModalOpen,
    setEditingLead,
    deleteProject,
    deleteLead,
    setSelectedLeadId,
    setCurrentView,
    addActivity,
    showToast
  } = useCRM();

  // Active sub-filters & state
  const [activeDate, setActiveDate] = useState(16);
  const [calendarSubTab, setCalendarSubTab] = useState<'today' | 'calendar'>('calendar');
  const [tasksSubTab, setTasksSubTab] = useState<'today' | 'calendar'>('today');
  const [financeTimeframe, setFinanceTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const [darkBackdrop, setDarkBackdrop] = useState(true);

  // Active Category selection
  const [selectedCategory, setSelectedCategory] = useState<'Sales' | 'Design' | 'Meeting' | null>(null);

  // Active calculations
  const totalTasksCount = leads.length > 0 ? leads.length : 36;
  const activePipelineValue = leads
    .filter((l) => ['Qualified', 'Discovery', 'Proposal', 'Negotiation'].includes(l.stage))
    .reduce((sum, l) => sum + (l.value || 0), 0);
  const wonValue = leads
    .filter((l) => l.stage === 'Won')
    .reduce((sum, l) => sum + (l.value || 0), 0);

  const handleStartLeadMeeting = (lead: Lead) => {
    addActivity(lead.id, 'call', `Virtual meeting initiated with ${lead.business_name} (${lead.contact_name})`);
    showToast(`Starting meeting with ${lead.business_name}...`);
    window.open('https://meet.google.com/new', '_blank');
  };

  return (
    <div className="space-y-6 pt-1 max-w-7xl mx-auto">
      {/* ========================================================
          TOP ACTION BAR & THEME CONTROLS
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
              Minimal Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#D8F231] text-[#132A1C] text-[11px] font-bold shadow-xs">
              Theme v4.0
            </span>
          </div>
          <p className="text-[13.5px] text-[#6B7280] mt-0.5">
            Ultra-clean, engineering-grade view of Calendar, Tasks, and Finance Overview.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {modeSwitch}

          {/* Backdrop Mode Switcher */}
          <button
            onClick={() => setDarkBackdrop(!darkBackdrop)}
            className="px-3.5 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-[12px] font-medium hover:border-gray-900 transition-colors shadow-xs flex items-center gap-1.5"
            title="Toggle atmospheric backdrop"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A5336]"></span>
            <span>{darkBackdrop ? 'Dark Atmosphere' : 'Light Canvas'}</span>
          </button>

          <button
            onClick={() => {
              setEditingProject(null);
              setProjectModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#1A5336] hover:bg-[#14422B] text-white font-medium text-[12.5px] px-4 py-2 rounded-full transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 font-medium text-[12.5px] px-4 py-2 rounded-full transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-gray-500" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          3-PANEL COMPANION DASHBOARD (Exact Match to Image)
          ======================================================== */}
      <div
        className={`rounded-[36px] transition-all p-4 sm:p-6 lg:p-8 ${
          darkBackdrop
            ? 'bg-gradient-to-br from-[#1C2E22] via-[#142319] to-[#0D1812] shadow-2xl border border-[#2A4833]/40'
            : 'bg-[#F2F4EF] border border-[#E2E6DD] shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* ====================================================
              PANEL 1: CALENDAR
              ==================================================== */}
          <div className="bg-[#EEF1EB] rounded-[36px] p-5 sm:p-6 shadow-xl border border-white/80 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentView('today')}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-[17px] font-bold text-[#111827] tracking-tight">
                  Calendar
                </h3>
                <button
                  onClick={() => setCurrentView('followups')}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-Pills */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setCalendarSubTab('today')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    calendarSubTab === 'today'
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setCalendarSubTab('calendar')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    calendarSubTab === 'calendar'
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  Calender
                </button>
                <button
                  onClick={() => setCurrentView('followups')}
                  className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Month Calendar Card */}
              <div className="bg-white rounded-[26px] p-4 shadow-xs border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-bold text-[#111827]">May, 2025</span>
                  <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    <CalendarIcon className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <span key={d} className="text-[10px] font-semibold text-gray-400 py-0.5">
                      {d}
                    </span>
                  ))}

                  {/* Past Days in Soft Sage */}
                  {['27', '28', '29', '30'].map((d) => (
                    <div
                      key={d}
                      className="w-7 h-7 mx-auto rounded-full bg-[#AAB89F]/30 text-[#132A1C] flex items-center justify-center text-[11px] font-medium"
                    >
                      {d}
                    </div>
                  ))}

                  {['01', '02', '03'].map((d) => (
                    <div
                      key={d}
                      onClick={() => setActiveDate(Number(d))}
                      className="w-7 h-7 mx-auto rounded-full text-gray-700 flex items-center justify-center text-[11px] font-medium hover:bg-gray-100 cursor-pointer"
                    >
                      {d}
                    </div>
                  ))}

                  {['04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'].map((d) => (
                    <div
                      key={d}
                      onClick={() => setActiveDate(Number(d))}
                      className="w-7 h-7 mx-auto rounded-full text-gray-700 flex items-center justify-center text-[11px] font-medium hover:bg-gray-100 cursor-pointer"
                    >
                      {d}
                    </div>
                  ))}

                  {/* Active Date 16 in Neon Lime */}
                  <div
                    onClick={() => setActiveDate(16)}
                    className="w-7 h-7 mx-auto rounded-xl bg-[#D8F231] text-[#132A1C] font-bold flex items-center justify-center text-[11.5px] shadow-xs cursor-pointer ring-2 ring-[#132A1C]"
                  >
                    16
                  </div>

                  {['17', '18', '19', '20', '21', '22', '23', '24'].map((d) => (
                    <div
                      key={d}
                      onClick={() => setActiveDate(Number(d))}
                      className="w-7 h-7 mx-auto rounded-full text-gray-700 flex items-center justify-center text-[11px] font-medium hover:bg-gray-100 cursor-pointer"
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Tasks Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#111827]">Monthly Tasks</span>
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day 16 Timeline */}
              <div className="p-3 bg-white/70 border border-gray-200/80 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
                <div>
                  <span className="text-[20px] font-bold text-gray-900 leading-none block">16</span>
                  <span className="text-[10px] font-medium text-gray-500">May, Friday</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <div className="px-2.5 py-1 bg-gray-200/70 text-gray-800 text-[10.5px] font-semibold rounded-xl shrink-0">
                    <span className="text-[8.5px] font-mono opacity-70 block">9 AM</span>
                    <span>Gym Session</span>
                  </div>
                  <div className="px-2.5 py-1 bg-[#D8F231] text-[#132A1C] text-[10.5px] font-bold rounded-xl shrink-0">
                    <span className="text-[8.5px] font-mono opacity-70 block">6 PM</span>
                    <span>Design</span>
                  </div>
                  <button
                    onClick={() => setQuickAddOpen(true)}
                    className="w-7 h-7 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-500 shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Day 17 Timeline */}
              <div className="p-3 bg-white/70 border border-gray-200/80 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
                <div>
                  <span className="text-[20px] font-bold text-gray-900 leading-none block">17</span>
                  <span className="text-[10px] font-medium text-gray-500">May, Saturday</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <div className="px-2.5 py-1 bg-gray-200/70 text-gray-800 text-[10.5px] font-semibold rounded-xl shrink-0">
                    <span className="text-[8.5px] font-mono opacity-70 block">10 AM</span>
                    <span>Playing Cricket</span>
                  </div>
                  <div className="px-2.5 py-1 bg-[#AAB89F] text-[#132A1C] text-[10.5px] font-bold rounded-xl shrink-0">
                    <span>Design</span>
                  </div>
                  <button
                    onClick={() => setQuickAddOpen(true)}
                    className="w-7 h-7 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-500 shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              PANEL 2: TASKS
              ==================================================== */}
          <div className="bg-[#EEF1EB] rounded-[36px] p-5 sm:p-6 shadow-xl border border-white/80 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentView('today')}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-[17px] font-bold text-[#111827] tracking-tight">
                  Tasks
                </h3>
                <button
                  onClick={() => setCurrentView('leads')}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-Pills */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setTasksSubTab('today')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    tasksSubTab === 'today'
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTasksSubTab('calendar')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    tasksSubTab === 'calendar'
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  Calender
                </button>
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Section: All Time Completed */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                  <span>All time Completed</span>
                  <span className="font-mono text-gray-400">&lt;&gt;</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* Card 1: Sage Card */}
                  <div className="bg-[#AAB89F] text-[#132A1C] rounded-[22px] p-3 flex flex-col justify-between min-h-[92px] shadow-xs">
                    <div className="text-[26px] font-bold leading-none tracking-tight">
                      {totalTasksCount}
                    </div>
                    <div className="text-[10.5px] font-medium opacity-90 mt-2">
                      Total Tasks
                    </div>
                  </div>

                  {/* Card 2: Neon Lime Card */}
                  <div className="bg-[#D8F231] text-[#132A1C] rounded-[22px] p-3 flex flex-col justify-between min-h-[92px] shadow-xs">
                    <div className="text-[26px] font-bold leading-none tracking-tight">
                      2h
                    </div>
                    <div className="text-[10.5px] font-medium opacity-90 mt-2">
                      Avg Per Day
                    </div>
                  </div>

                  {/* Card 3: White Card */}
                  <div className="bg-white text-[#111827] rounded-[22px] p-3 border border-gray-100 shadow-xs flex flex-col justify-between min-h-[92px]">
                    <div className="text-[26px] font-bold leading-none tracking-tight">
                      72h
                    </div>
                    <div className="text-[10.5px] font-medium text-gray-500 mt-2">
                      Total Tasks
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Today Tasks Stacked Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#111827]">Today Tasks</span>
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setProjectModalOpen(true);
                    }}
                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card 1: Sales (White Card) */}
                <div
                  onClick={() => setSelectedCategory(selectedCategory === 'Sales' ? null : 'Sales')}
                  className={`p-4 rounded-[24px] transition-all cursor-pointer flex items-center justify-between border ${
                    selectedCategory === 'Sales'
                      ? 'bg-white border-[#1A5336] ring-2 ring-[#1A5336]'
                      : 'bg-white border-gray-100 shadow-xs hover:border-gray-300'
                  }`}
                >
                  <div>
                    <h4 className="text-[28px] font-bold text-gray-900 tracking-tight leading-none">
                      Sales
                    </h4>
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      Product Leads ({leads.filter((l) => l.type === 'Product').length})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-gray-400 block">Start</span>
                    <span className="text-[12px] font-bold text-gray-800">03:20 PM</span>
                  </div>
                </div>

                {/* Card 2: Design (Neon Lime Card) */}
                <div
                  onClick={() => setSelectedCategory(selectedCategory === 'Design' ? null : 'Design')}
                  className={`p-4 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    selectedCategory === 'Design'
                      ? 'bg-[#D8F231] text-[#132A1C] ring-2 ring-[#132A1C]'
                      : 'bg-[#D8F231] text-[#132A1C] shadow-sm hover:opacity-95'
                  }`}
                >
                  <div>
                    <h4 className="text-[28px] font-bold tracking-tight leading-none">
                      Design
                    </h4>
                    <span className="text-[11px] font-medium opacity-80 mt-1 block">
                      Client Sprints ({projects.filter((p) => p.category === 'Design').length})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono opacity-80 block">Start</span>
                    <span className="text-[12px] font-bold">06:20 PM</span>
                  </div>
                </div>

                {/* Card 3: Meeting (Sage Card) */}
                <div
                  onClick={() => setSelectedCategory(selectedCategory === 'Meeting' ? null : 'Meeting')}
                  className={`p-4 rounded-[24px] transition-all cursor-pointer flex items-center justify-between ${
                    selectedCategory === 'Meeting'
                      ? 'bg-[#AAB89F] text-[#132A1C] ring-2 ring-[#132A1C]'
                      : 'bg-[#AAB89F] text-[#132A1C] shadow-sm hover:opacity-95'
                  }`}
                >
                  <div>
                    <h4 className="text-[28px] font-bold tracking-tight leading-none">
                      Meeting
                    </h4>
                    <span className="text-[11px] font-medium opacity-80 mt-1 block">
                      Upcoming Calls ({leads.filter((l) => l.next_action).length})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono opacity-80 block">Start</span>
                    <span className="text-[12px] font-bold">08:10 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Open full view button */}
            <button
              onClick={() => setCurrentView('leads')}
              className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#111827] text-[12px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-colors shadow-2xs border border-gray-200 mt-2"
            >
              <span>Open All Tasks &amp; Leads</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ====================================================
              PANEL 3: FINANCE OVERVIEW
              ==================================================== */}
          <div className="bg-[#EEF1EB] rounded-[36px] p-5 sm:p-6 shadow-xl border border-white/80 flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentView('today')}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-[17px] font-bold text-[#111827] tracking-tight">
                  Finance Overview
                </h3>
                <button
                  onClick={() => setCurrentView('pipeline')}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Sub-Pills */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setFinanceTimeframe('monthly')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    financeTimeframe === 'monthly'
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setFinanceTimeframe('yearly')}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    financeTimeframe === 'yearly'
                      ? 'bg-white text-gray-900 shadow-xs font-semibold'
                      : 'bg-white/60 text-gray-600 hover:bg-white'
                  }`}
                >
                  Yearly
                </button>
              </div>

              {/* Section: ConneQ Revenue */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-gray-600">
                    ConneQ Revenue
                  </span>
                  <button
                    onClick={() => setCurrentView('pipeline')}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[34px] font-bold text-[#111827] tracking-tight leading-none">
                  {activePipelineValue > 0 ? `₹${activePipelineValue.toLocaleString()}` : '$2598'}
                </div>

                {/* Monthly Revenue Bars */}
                <div className="space-y-2 pt-2">
                  {/* April Bar (Sage) */}
                  <div className="p-3 bg-[#AAB89F]/50 rounded-[20px] flex items-center justify-between text-gray-900">
                    <div>
                      <span className="text-[11px] font-medium opacity-80 block">April</span>
                      <span className="text-[14px] font-bold">$605</span>
                    </div>
                  </div>

                  {/* May Revenue Bar (Neon Lime) with 20% Overdue Pill */}
                  <div className="p-3 bg-[#D8F231] text-[#132A1C] rounded-[20px] flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[11px] font-semibold opacity-80 block">May Revenue</span>
                      <span className="text-[15px] font-bold">$1,026</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#B8DC1E] px-2.5 py-1 rounded-xl text-[10.5px] font-bold">
                      <span className="opacity-70">Overdue</span>
                      <span>20%</span>
                    </div>
                  </div>

                  {/* June Bar (Sage) */}
                  <div className="p-3 bg-[#AAB89F]/50 rounded-[20px] flex items-center justify-between text-gray-900">
                    <div>
                      <span className="text-[11px] font-medium opacity-80 block">June</span>
                      <span className="text-[14px] font-bold">$967</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Yearly Revenue Goal */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[12px] font-semibold text-gray-600">
                  <span>Yearly Revenue Goal</span>
                  <span className="font-mono text-gray-400">&lt;&gt;</span>
                </div>

                <div className="text-[32px] font-bold text-[#111827] tracking-tight leading-none">
                  $8,367
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-600">
                    <span>Revenue goal not Achieved 69%</span>
                    <span className="font-semibold text-[#1A5336]">Earned 31%</span>
                  </div>

                  {/* Capsule with vertical ticks & dot pattern */}
                  <div className="h-6 rounded-full bg-white/80 border border-gray-300 overflow-hidden flex items-center px-1">
                    <div
                      className="h-4 bg-[#184D34] rounded-full flex items-center overflow-hidden"
                      style={{ width: '31%' }}
                    >
                      <div className="w-full h-full opacity-30 flex items-center justify-around">
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-around opacity-40 px-2">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-[1px] h-3 bg-gray-500 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Open Analytics button */}
            <button
              onClick={() => setCurrentView('pipeline')}
              className="w-full py-2.5 bg-white hover:bg-gray-100 text-[#111827] text-[12px] font-medium rounded-full flex items-center justify-center gap-1.5 transition-colors shadow-2xs border border-gray-200 mt-2"
            >
              <span>Open Analytics &amp; Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
