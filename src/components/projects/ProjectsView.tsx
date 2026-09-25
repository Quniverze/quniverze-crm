'use client';

import React, { useState, useMemo } from 'react';
import { useCRM } from '@/lib/store';
import { Project, ProjectCategory } from '@/types/crm';
import {
  FolderGit2,
  ExternalLink,
  Plus,
  Layers,
  Code2,
  Calendar,
  DollarSign
} from 'lucide-react';

export function ProjectsView() {
  const { projects, addProject, setCurrentView } = useCRM();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  const filteredProjects = useMemo(() => {
    if (filterCategory === 'All') return projects;
    return projects.filter((p) => p.category === filterCategory);
  }, [projects, filterCategory]);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || filteredProjects[0];

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-[#F4F6F9]">
      
      {/* LEFT COLUMN: PROJECTS LIST */}
      <div className="w-full md:w-[380px] h-full border-r border-[#E5E7EB] bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#E5E7EB] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="section-label">STUDIO ECOSYSTEM</span>
              <h1 className="text-[18px] font-bold text-[#12151C] tracking-tight mt-0.5">
                Projects ({projects.length})
              </h1>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-[11.5px]">
            {['All', 'product', 'client', 'venture'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded border transition-colors capitalize ${
                  filterCategory === cat
                    ? 'bg-[#12151C] text-white border-[#12151C] font-semibold'
                    : 'bg-[#F4F6F9] text-[#4B5563] border-[#E5E7EB] hover:border-[#12151C]'
                }`}
              >
                {cat === 'product' ? 'Products' : cat === 'client' ? 'Client Work' : cat === 'venture' ? 'Ventures' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E5E7EB]">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-[#6B7280] text-[12.5px]">
              No projects found in this category.
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isSelected = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#EBF3FE] font-medium border-l-2 border-[#3B82F6]'
                      : 'hover:bg-[#F4F6F9]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[14px] text-[#12151C]">
                      {p.name}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] px-1.5 py-0.2 bg-[#F4F6F9] border border-[#E5E7EB] rounded">
                      {p.category === 'product' ? 'Product' : p.category === 'client' ? 'Client Work' : 'Venture'}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#4B5563] mt-1 leading-snug">
                    {p.tagline}
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-2 flex items-center justify-between font-mono">
                    <span>{p.status}</span>
                    {p.monthly_revenue ? (
                      <span className="text-[#12151C] font-semibold">₹{p.monthly_revenue.toLocaleString()}/mo</span>
                    ) : p.contract_value ? (
                      <span className="text-[#12151C] font-semibold">₹{p.contract_value.toLocaleString()}</span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: PROJECT DETAIL PANE */}
      <div className="flex-1 h-full bg-[#F4F6F9] overflow-y-auto p-4 md:p-8">
        {activeProject ? (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="p-5 bg-white border border-[#E5E7EB] rounded space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="section-label">PROJECT SPECIFICATION</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[#12151C] uppercase">
                      {activeProject.category}
                    </span>
                  </div>
                  <h2 className="text-[22px] font-bold text-[#12151C] tracking-tight mt-1">
                    {activeProject.name}
                  </h2>
                  <div className="text-[13px] text-[#4B5563] mt-0.5">
                    {activeProject.tagline}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[18px] font-bold text-[#12151C] font-mono">
                    {activeProject.monthly_revenue ? (
                      `₹${activeProject.monthly_revenue.toLocaleString()}/mo`
                    ) : activeProject.contract_value ? (
                      `₹${activeProject.contract_value.toLocaleString()}`
                    ) : (
                      'Strategic'
                    )}
                  </div>
                  <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">
                    {activeProject.monthly_revenue ? 'Monthly Recurring' : 'Contract Value'}
                  </div>
                </div>
              </div>
            </div>

            {/* Overview & Architecture */}
            <div className="p-4 bg-white border border-[#E5E7EB] rounded space-y-3">
              <span className="section-label">SCOPE &amp; PURPOSE</span>
              <p className="text-[13px] text-[#12151C] leading-relaxed">
                {activeProject.description}
              </p>
            </div>

            {/* Technical Stack */}
            <div className="p-4 bg-white border border-[#E5E7EB] rounded space-y-3">
              <span className="section-label">ENGINEERING STACK</span>
              <div className="flex flex-wrap gap-2">
                {activeProject.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-[11.5px] font-mono bg-[#F4F6F9] border border-[#E5E7EB] rounded text-[#12151C]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Studio Values Linkage */}
            <div className="p-4 bg-white border border-[#E5E7EB] rounded space-y-2">
              <span className="section-label">STUDIO PRINCIPLE</span>
              <div className="text-[12.5px] text-[#4B5563] leading-relaxed">
                {activeProject.category === 'product'
                  ? 'Product Owners First: We build and operate internal SaaS products so our engineering standards and uptime discipline remain proven in production.'
                  : 'Selective Partnerships: Decisive, measurable impact over volume. Building software for businesses that move forward.'}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[13px] text-[#6B7280]">
            Select a project to inspect details.
          </div>
        )}
      </div>

    </div>
  );
}
