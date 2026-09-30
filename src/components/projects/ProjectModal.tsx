'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/lib/store';
import { Project, ProjectCategory, ProjectStatus } from '@/types/crm';
import {
  X,
  Briefcase,
  Calendar,
  DollarSign,
  User,
  Tag,
  Trash2,
  Check,
  FolderPlus
} from 'lucide-react';

export function ProjectModal() {
  const {
    projectModalOpen,
    setProjectModalOpen,
    editingProject,
    setEditingProject,
    addProject,
    updateProject,
    deleteProject,
    teamMembers,
    showToast
  } = useCRM();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Tech');
  const [status, setStatus] = useState<ProjectStatus>('Running');
  const [budgetRevenue, setBudgetRevenue] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title || '');
      setClientName(editingProject.client_name || '');
      setCategory(editingProject.category || 'Tech');
      setStatus(editingProject.status || 'Running');
      setBudgetRevenue(editingProject.budget_revenue ? String(editingProject.budget_revenue) : '');
      setDueDate(editingProject.due_date || '');
      setAssignedTo(editingProject.assigned_to || (teamMembers[0] || 'Abid'));
      setDescription(editingProject.description || '');
    } else {
      // Defaults for new project
      setTitle('');
      setClientName('');
      setCategory('Tech');
      setStatus('Running');
      setBudgetRevenue('');
      const defaultDue = new Date();
      defaultDue.setDate(defaultDue.getDate() + 14);
      setDueDate(defaultDue.toISOString().split('T')[0]);
      setAssignedTo(teamMembers[0] || 'Abid');
      setDescription('');
    }
  }, [editingProject, projectModalOpen, teamMembers]);

  if (!projectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Project title is required');
      return;
    }

    const payload = {
      title: title.trim(),
      client_name: clientName.trim() || undefined,
      category,
      status,
      budget_revenue: budgetRevenue ? Number(budgetRevenue) : undefined,
      due_date: dueDate || new Date().toISOString().split('T')[0],
      assigned_to: assignedTo || (teamMembers[0] || 'Abid'),
      description: description.trim() || undefined
    };

    if (editingProject) {
      updateProject(editingProject.id, payload);
    } else {
      addProject(payload);
    }

    setEditingProject(null);
    setProjectModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingProject) return;
    if (confirm(`Are you sure you want to delete "${editingProject.title}"?`)) {
      deleteProject(editingProject.id);
      setEditingProject(null);
      setProjectModalOpen(false);
    }
  };

  const handleClose = () => {
    setEditingProject(null);
    setProjectModalOpen(false);
  };

  const categories: ProjectCategory[] = ['Sales', 'Design', 'Tech', 'Meeting', 'Operations'];
  const statuses: { label: ProjectStatus; color: string }[] = [
    { label: 'Running', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Ended', color: 'bg-gray-100 text-gray-700 border-gray-200' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFB] border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F5EE] text-[#1A5336] flex items-center justify-center">
              {editingProject ? <Briefcase className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] tracking-tight">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h3>
              <p className="text-[11.5px] text-gray-500">
                {editingProject ? 'Update deliverable scope and timeline' : 'Create a new client or internal deliverable'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-gray-700">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Develop API Endpoints, Onboarding Flow..."
              className="w-full px-3.5 py-2.5 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white text-[#111827] transition-all"
            />
          </div>

          {/* Client / Business Name */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-gray-700">
              Client / Account Association
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Arc Company, NivaOps, Stripe..."
              className="w-full px-3.5 py-2.5 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] focus:bg-white text-[#111827] transition-all"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2.5 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2.5 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              >
                {statuses.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Revenue */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-[12.5px] font-mono bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-gray-700">Budget / Value (₹)</label>
              <input
                type="number"
                value={budgetRevenue}
                onChange={(e) => setBudgetRevenue(e.target.value)}
                placeholder="e.g. 120000"
                className="w-full px-3 py-2 text-[12.5px] font-mono bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
              />
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-gray-700">Assigned Lead / Owner</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
            >
              {teamMembers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-gray-700">Scope / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key deliverables, sprint objectives, tech stack..."
              className="w-full px-3.5 py-2 text-[12.5px] bg-[#F8F9FA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A5336] text-[#111827]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {editingProject ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Project</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-[12.5px] font-medium text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1A5336] hover:bg-[#14422B] text-white text-[13px] font-medium rounded-full shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
