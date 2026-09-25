'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import {
  Settings,
  Database,
  Users,
  Shield,
  RotateCcw,
  Download,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export function SettingsView() {
  const { leads, opportunities, followUps, activities, clients, projects, refreshSync, showToast } = useCRM();

  const handleExportData = () => {
    const data = {
      exported_at: new Date().toISOString(),
      brand_version: 'Quniverze Brand System v4.0',
      leads,
      opportunities,
      followUps,
      activities,
      clients,
      projects
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quniverze_crm_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported as JSON');
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F4F6F9]">
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-20 space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-4">
          <span className="section-label">CONFIGURATION</span>
          <h1 className="page-title mt-0.5">Settings &amp; System Status</h1>
          <p className="text-[12.5px] text-[#6B7280] mt-0.5">
            Internal operating system configurations, infrastructure status, and team assignments.
          </p>
        </div>

        {/* 1. Studio Identity & Brand Kit */}
        <div className="p-5 bg-white border border-[#E5E7EB] rounded space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-label">BRAND SYSTEM</span>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded font-semibold text-[#12151C]">
              LOCKED v4.0
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-bold text-[#12151C]">
              Quniverze<span className="text-[#3B82F6]">.</span>
            </span>
            <span className="text-[12.5px] text-[#6B7280]">
              Products. Services. Real impact.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded">
              <div className="w-3.5 h-3.5 rounded-full bg-[#12151C] mb-1.5" />
              <div className="text-[11.5px] font-semibold text-[#12151C]">Graphite</div>
              <div className="text-[10.5px] font-mono text-[#6B7280]">#12151C</div>
            </div>
            <div className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded">
              <div className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] mb-1.5" />
              <div className="text-[11.5px] font-semibold text-[#12151C]">Electric Blue</div>
              <div className="text-[10.5px] font-mono text-[#6B7280]">#3B82F6</div>
            </div>
            <div className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded">
              <div className="w-3.5 h-3.5 rounded-full bg-[#F4F6F9] border border-[#D1D5DB] mb-1.5" />
              <div className="text-[11.5px] font-semibold text-[#12151C]">Cloud</div>
              <div className="text-[10.5px] font-mono text-[#6B7280]">#F4F6F9</div>
            </div>
            <div className="p-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded">
              <div className="w-3.5 h-3.5 rounded-full bg-[#E5E7EB] mb-1.5" />
              <div className="text-[11.5px] font-semibold text-[#12151C]">Slate</div>
              <div className="text-[10.5px] font-mono text-[#6B7280]">#E5E7EB</div>
            </div>
          </div>
        </div>

        {/* 2. Infrastructure & Cloud Sync */}
        <div className="p-5 bg-white border border-[#E5E7EB] rounded space-y-4">
          <div className="flex items-center justify-between">
            <span className="section-label">INFRASTRUCTURE &amp; SYNC</span>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#12151C]">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span>Supabase Cloud Connected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12.5px]">
            <div className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded space-y-1">
              <span className="text-[10.5px] text-[#6B7280] block">Database Engine</span>
              <span className="font-semibold text-[#12151C]">PostgreSQL 15</span>
              <span className="text-[10.5px] text-[#6B7280] block font-mono">zywupfscusexymqekgkf</span>
            </div>

            <div className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded space-y-1">
              <span className="text-[10.5px] text-[#6B7280] block">Realtime Layer</span>
              <span className="font-semibold text-[#12151C]">WebSockets Channel</span>
              <span className="text-[10.5px] text-[#6B7280] block font-mono">crm-realtime-sync</span>
            </div>

            <div className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded space-y-1">
              <span className="text-[10.5px] text-[#6B7280] block">Architecture</span>
              <span className="font-semibold text-[#12151C]">Dual-Mode Resilient</span>
              <span className="text-[10.5px] text-[#6B7280] block">Supabase + LocalStorage</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={refreshSync}
              className="px-3 py-1.5 text-[12px] font-medium bg-[#12151C] text-white hover:bg-black rounded transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Synchronize Database Now</span>
            </button>
            <button
              type="button"
              onClick={handleExportData}
              className="px-3 py-1.5 text-[12px] font-medium text-[#12151C] bg-white border border-[#E5E7EB] hover:bg-[#F4F6F9] rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full JSON Backup</span>
            </button>
          </div>
        </div>

        {/* 3. Team Profiles & Responsibilities */}
        <div className="p-5 bg-white border border-[#E5E7EB] rounded space-y-4">
          <span className="section-label">TEAM ASSIGNMENTS &amp; ROLES</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-4 bg-[#F4F6F9] border border-[#E5E7EB] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[14px] text-[#12151C]">Faslu</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#12151C] text-white uppercase">
                  Founder
                </span>
              </div>
              <p className="text-[12px] text-[#4B5563] leading-relaxed">
                Owns qualified opportunities, client discovery sessions, bespoke proposals, contract negotiation, closing, and software delivery.
              </p>
              <div className="text-[11px] font-mono text-[#6B7280]">
                founder@quniverze.com
              </div>
            </div>

            <div className="p-4 bg-[#F4F6F9] border border-[#E5E7EB] rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[14px] text-[#12151C]">Adil</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#12151C] border border-[#E5E7EB] uppercase">
                  Outreach Executive
                </span>
              </div>
              <p className="text-[12px] text-[#4B5563] leading-relaxed">
                Responsible for lead sourcing, initial cold calling, recording outcomes, managing follow-up queues, and handing off interested prospects.
              </p>
              <div className="text-[11px] font-mono text-[#6B7280]">
                outreach@quniverze.com
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
