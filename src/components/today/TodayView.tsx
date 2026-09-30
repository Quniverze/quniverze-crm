'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { Lead } from '@/types/crm';
import {
  ArrowUpRight,
  Plus,
  Video,
  Pause,
  Play,
  Square,
  Sparkles,
  TrendingUp,
  Clock,
  Phone,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export function TodayView() {
  const {
    leads,
    usersList,
    currentUser,
    setQuickAddOpen,
    setTeamModalOpen,
    setSelectedLeadId,
    setCurrentView,
    logCall,
    showToast
  } = useCRM();

  // Active time tracker state
  const [timerSeconds, setTimerSeconds] = useState(5048); // 01:24:08 initial
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Metrics from real database
  const totalLeadsCount = leads.length > 0 ? leads.length : 24;
  const wonDealsCount = leads.filter((l) => l.stage === 'Won').length || 10;
  const runningDealsCount =
    leads.filter((l) => ['Qualified', 'Discovery', 'Proposal', 'Negotiation'].includes(l.stage)).length || 12;
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const pendingCount =
    leads.filter((l) => l.next_action_due && l.next_action_due <= todayStr && l.stage !== 'Won' && l.stage !== 'Lost').length || 2;

  // Next reminder / follow-up
  const upcomingLead = leads.find((l) => l.next_action) || {
    id: 'lead_demo_1',
    business_name: 'Arc Company',
    contact_name: 'Julian Vance',
    phone: '+1 555-0192',
    next_action: 'Meeting with Arc Company',
    next_action_due: todayStr
  };

  // Top deals list (real or aesthetic fallback)
  const topDeals = useMemo(() => {
    if (leads.length > 0) {
      return leads.slice(0, 5).map((l, idx) => ({
        id: l.id,
        title: l.business_name,
        due: l.next_action_due ? `Due date: ${l.next_action_due}` : 'Due date: Nov 28, 2026',
        iconType: idx % 5
      }));
    }
    return [
      { id: '1', title: 'Develop API Endpoints', due: 'Due date: Nov 26, 2026', iconType: 0 },
      { id: '2', title: 'Onboarding Flow', due: 'Due date: Nov 28, 2026', iconType: 1 },
      { id: '3', title: 'Build Dashboard', due: 'Due date: Nov 30, 2026', iconType: 2 },
      { id: '4', title: 'Optimize Page Load', due: 'Due date: Dec 5, 2026', iconType: 3 },
      { id: '5', title: 'Cross-Browser Testing', due: 'Due date: Dec 6, 2026', iconType: 4 },
    ];
  }, [leads]);

  // Team Collaboration List
  const teamCollabList = useMemo(() => {
    const baseNames = [
      { name: 'Alexandra Deff', task: 'Working on Github Project Repository', status: 'Completed', avatarBg: 'bg-rose-100 text-rose-700' },
      { name: 'Edwin Adenike', task: 'Working on Integrate User Authentication System', status: 'In Progress', avatarBg: 'bg-emerald-100 text-emerald-700' },
      { name: 'Isaac Oluwatemilorun', task: 'Working on Develop Search and Filter Functionality', status: 'Pending', avatarBg: 'bg-indigo-100 text-indigo-700' },
      { name: 'David Oshodi', task: 'Working on Responsive Layout for Homepage', status: 'In Progress', avatarBg: 'bg-amber-100 text-amber-700' },
    ];

    if (usersList && usersList.length > 0) {
      return usersList.slice(0, 4).map((u, i) => ({
        name: u.name,
        task: i === 0 ? 'Working on Lead Pipeline & Operations' : `Assigned to ${leads[i]?.business_name || 'NivaOps SaaS Client'}`,
        status: i === 0 ? 'Completed' : i === 1 ? 'In Progress' : 'Pending',
        avatarBg: baseNames[i % 4].avatarBg
      }));
    }
    return baseNames;
  }, [usersList, leads]);

  const handleOpenLead = (id: string) => {
    if (leads.some((l) => l.id === id)) {
      setSelectedLeadId(id);
      setCurrentView('leads');
    } else {
      setCurrentView('leads');
    }
  };

  return (
    <div className="space-y-6 pt-2 max-w-7xl mx-auto">
      {/* ========================================================
          PAGE TITLE & HEADER BUTTONS (Exact match to reference)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[13.5px] text-[#6B7280] mt-0.5">
            Plan, prioritize, and accomplish your tasks with ease.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-2 bg-[#1A5336] hover:bg-[#14422B] text-white font-medium text-[13px] px-5 py-2.5 rounded-full transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>

          <button
            onClick={() => setCurrentView('leads')}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#111827] border border-gray-300 font-medium text-[13px] px-5 py-2.5 rounded-full transition-all shadow-xs"
          >
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TOP 4 STAT CARDS ROW
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects (Forest Green Card) */}
        <div className="bg-[#184D34] text-white rounded-[22px] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-white/90">Total Projects</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-[34px] font-bold tracking-tight">{totalLeadsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-white/80">
            <span className="px-1.5 py-0.2 bg-white/20 rounded text-[10px] font-mono">5 ▲</span>
            <span>Increased from last month</span>
          </div>
        </div>

        {/* Card 2: Ended Projects (White Card) */}
        <div className="bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111827]">Ended Projects</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-[34px] font-bold text-[#111827] tracking-tight">{wonDealsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <span className="px-1.5 py-0.2 border border-gray-200 rounded text-[10px] font-mono text-gray-600">6 ▲</span>
            <span>Increased from last month</span>
          </div>
        </div>

        {/* Card 3: Running Projects (White Card) */}
        <div className="bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111827]">Running Projects</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-[34px] font-bold text-[#111827] tracking-tight">{runningDealsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
            <span className="px-1.5 py-0.2 border border-gray-200 rounded text-[10px] font-mono text-gray-600">2 ▲</span>
            <span>Increased from last month</span>
          </div>
        </div>

        {/* Card 4: Pending Project (White Card) */}
        <div className="bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#111827]">Pending Project</span>
            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <span className="text-[34px] font-bold text-[#111827] tracking-tight">{pendingCount}</span>
          </div>

          <div className="text-[11px] text-[#6B7280]">
            On Discuss
          </div>
        </div>
      </div>

      {/* ========================================================
          MIDDLE ROW: Project Analytics, Reminders, Project List
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Project Analytics Capsule Bar Chart */}
        <div className="lg:col-span-5 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div className="text-[14px] font-bold text-[#111827]">
            Project Analytics
          </div>

          {/* 7 Day Capsule Bars with SVG striping & floating 76% tooltip */}
          <div className="flex items-end justify-between px-2 pt-6 pb-2">
            {/* Sun */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-24 rounded-full border-2 border-[#1A5336]/30 overflow-hidden relative">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="diagonal-stripe-1" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#1A5336" strokeWidth="2.5" opacity="0.3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diagonal-stripe-1)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-gray-400">S</span>
            </div>

            {/* Mon */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-28 rounded-full bg-[#184D34]" />
              <span className="text-[11px] font-medium text-gray-400">M</span>
            </div>

            {/* Tue (With 76% floating badge) */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className="absolute -top-7 px-2 py-0.5 bg-white rounded-full border border-gray-200 text-[10px] font-bold text-gray-700 shadow-xs">
                76%
              </div>
              <div className="w-10 h-24 rounded-full bg-[#52B788]" />
              <span className="text-[11px] font-medium text-gray-400">T</span>
            </div>

            {/* Wed */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-32 rounded-full bg-[#113A27]" />
              <span className="text-[11px] font-medium text-gray-400">W</span>
            </div>

            {/* Thu */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-26 rounded-full border-2 border-[#1A5336]/30 overflow-hidden relative">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="diagonal-stripe-2" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#1A5336" strokeWidth="2.5" opacity="0.3" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#diagonal-stripe-2)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-gray-400">T</span>
            </div>

            {/* Fri */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-22 rounded-full border-2 border-[#1A5336]/30 overflow-hidden relative">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="diagonal-stripe-3" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#1A5336" strokeWidth="2.5" opacity="0.3" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#diagonal-stripe-3)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-gray-400">F</span>
            </div>

            {/* Sat */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-28 rounded-full border-2 border-[#1A5336]/30 overflow-hidden relative">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="diagonal-stripe-4" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#1A5336" strokeWidth="2.5" opacity="0.3" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#diagonal-stripe-4)" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-gray-400">S</span>
            </div>
          </div>
        </div>

        {/* Center: Reminders Card */}
        <div className="lg:col-span-3 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="text-[14px] font-bold text-[#111827]">Reminders</div>
            <div className="mt-4">
              <h3 className="text-[16px] font-bold text-[#111827] leading-snug">
                {upcomingLead.next_action || 'Meeting with Arc Company'}
              </h3>
              <div className="text-[12px] text-[#6B7280] mt-1 font-medium">
                Time : 02.00 pm - 04.00 pm
              </div>
            </div>
          </div>

          <a
            href={`tel:${upcomingLead.phone}`}
            onClick={(e) => {
              if (!upcomingLead.phone) {
                e.preventDefault();
                showToast('Initiating call...');
              }
            }}
            className="w-full py-3 bg-[#1A5336] hover:bg-[#14422B] text-white text-[13px] font-medium rounded-full flex items-center justify-center gap-2 transition-all shadow-xs mt-4"
          >
            <Video className="w-4 h-4 fill-white" />
            <span>Start Meeting</span>
          </a>
        </div>

        {/* Right: Project List Card */}
        <div className="lg:col-span-4 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-bold text-[#111827]">Project</span>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="text-[11.5px] font-semibold text-gray-700 px-2.5 py-1 border border-gray-200 rounded-full hover:border-gray-900 transition-colors"
            >
              + New
            </button>
          </div>

          <div className="space-y-3">
            {topDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => handleOpenLead(deal.id)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* Custom colorful geometric icons matching screenshot */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
                  {deal.iconType === 0 && (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-1.5 h-4 bg-blue-600 rotate-45 rounded-full mr-1" />
                      <div className="w-1.5 h-4 bg-blue-600 rotate-45 rounded-full" />
                    </div>
                  )}
                  {deal.iconType === 1 && (
                    <div className="w-5 h-5 rounded-full border-2 border-teal-500 border-t-transparent" />
                  )}
                  {deal.iconType === 2 && (
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                      <div className="bg-amber-400 rounded-xs" />
                      <div className="bg-emerald-400 rounded-xs" />
                      <div className="bg-rose-400 rounded-xs" />
                      <div className="bg-blue-400 rounded-xs" />
                    </div>
                  )}
                  {deal.iconType === 3 && (
                    <div className="w-4 h-4 rounded-full bg-amber-500" />
                  )}
                  {deal.iconType === 4 && (
                    <div className="w-4 h-4 flex items-center justify-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-[13px] font-semibold text-[#111827] truncate group-hover:text-[#1A5336] transition-colors">
                    {deal.title}
                  </h4>
                  <div className="text-[11px] text-[#9CA3AF]">
                    {deal.due}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          BOTTOM ROW: Team Collaboration, Project Progress, Time Tracker
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Team Collaboration Card */}
        <div className="lg:col-span-5 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-bold text-[#111827]">Team Collaboration</span>
            <button
              onClick={() => setTeamModalOpen(true)}
              className="text-[11.5px] font-semibold text-gray-700 px-2.5 py-1 border border-gray-200 rounded-full hover:border-gray-900 transition-colors"
            >
              + Add Member
            </button>
          </div>

          <div className="space-y-3">
            {teamCollabList.map((member, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${member.avatarBg}`}>
                    {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-semibold text-[#111827] truncate">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-[#9CA3AF] truncate">
                      {member.task}
                    </div>
                  </div>
                </div>

                <span
                  className={
                    member.status === 'Completed'
                      ? 'tag-completed shrink-0'
                      : member.status === 'In Progress'
                      ? 'tag-inprogress shrink-0'
                      : 'tag-pending shrink-0'
                  }
                >
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Project Progress Gauge Card */}
        <div className="lg:col-span-4 bg-white border border-[#EAECEF] rounded-[22px] p-5 shadow-xs flex flex-col items-center justify-between min-h-[220px]">
          <div className="w-full text-left">
            <span className="text-[14px] font-bold text-[#111827]">Project Progress</span>
          </div>

          {/* Semi-circular gauge chart matching screenshot */}
          <div className="relative flex flex-col items-center justify-center my-2">
            <svg width="180" height="100" viewBox="0 0 180 100" className="overflow-visible">
              {/* Background semi-circle track with stripe pattern */}
              <defs>
                <pattern id="gauge-stripes" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#1A5336" strokeWidth="2.5" opacity="0.3" />
                </pattern>
              </defs>
              <path
                d="M 15 90 A 75 75 0 0 1 165 90"
                fill="none"
                stroke="url(#gauge-stripes)"
                strokeWidth="22"
                strokeLinecap="round"
              />
              {/* Completed Arc (Dark Green) */}
              <path
                d="M 15 90 A 75 75 0 0 1 110 20"
                fill="none"
                stroke="#184D34"
                strokeWidth="22"
                strokeLinecap="round"
              />
            </svg>

            {/* Center Gauge Value */}
            <div className="absolute bottom-1 text-center">
              <div className="text-[26px] font-bold text-[#111827] leading-none">
                41%
              </div>
              <div className="text-[11px] text-[#6B7280] font-medium mt-0.5">
                Project Ended
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#184D34]" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#52B788]" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-gray-400" />
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Right: Time Tracker Card (Forest Green Textured) */}
        <div className="lg:col-span-3 bg-[#0B2519] text-white rounded-[22px] p-5 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          {/* Organic background lines overlay */}
          <div className="absolute inset-0 pattern-organic opacity-80 pointer-events-none" />

          <div className="relative z-10 text-[13px] font-medium text-white/90">
            Time Tracker
          </div>

          {/* Digital Timer */}
          <div className="relative z-10 my-4 text-center">
            <span className="text-[34px] font-mono font-bold tracking-tight text-white">
              {formatTimer(timerSeconds)}
            </span>
          </div>

          {/* Controls: Pause & Stop buttons */}
          <div className="relative z-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-md hover:bg-gray-100 transition-transform active:scale-95"
              title={isTimerRunning ? 'Pause' : 'Start'}
            >
              {isTimerRunning ? (
                <Pause className="w-4 h-4 fill-gray-900" />
              ) : (
                <Play className="w-4 h-4 fill-gray-900 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(0);
                showToast('Timer reset');
              }}
              className="w-10 h-10 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-transform active:scale-95"
              title="Reset"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
