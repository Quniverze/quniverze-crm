'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { X, UserPlus, Trash2, Shield } from 'lucide-react';

export function TeamManageModal() {
  const { teamModalOpen, setTeamModalOpen, teamMembers, addTeamMember, removeTeamMember } = useCRM();
  const [newName, setNewName] = useState('');

  if (!teamModalOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addTeamMember(newName.trim());
    setNewName('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/50 p-4"
      onClick={() => setTeamModalOpen(false)}
    >
      <div
        className="w-full max-w-sm bg-white border border-[#E5E7EB] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F4F6F9]">
          <div>
            <h3 className="text-[14px] font-bold text-[#12151C] uppercase tracking-wide">
              Team Roster
            </h3>
            <p className="text-[12px] text-[#12151C]/60 mt-0.5">
              People who can be assigned to leads.
            </p>
          </div>
          <button
            onClick={() => setTeamModalOpen(false)}
            className="p-1 text-[#12151C]/60 hover:text-[#12151C]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Add form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add team member name..."
              className="flex-1 px-3 py-1.5 text-[13px] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6]"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="px-3 py-1.5 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Members List */}
          <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB]">
            {teamMembers.map((member) => (
              <div
                key={member}
                className="p-2.5 flex items-center justify-between bg-white text-[13px]"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#12151C] text-white text-[11px] font-mono flex items-center justify-center font-bold">
                    {member[0]?.toUpperCase()}
                  </span>
                  <span className="font-medium text-[#12151C]">{member}</span>
                  {member === 'Abid' && (
                    <span className="text-[10px] font-mono uppercase bg-[#F4F6F9] border border-[#E5E7EB] px-1 text-[#12151C]/60">
                      Admin
                    </span>
                  )}
                </div>

                {member !== 'Abid' && (
                  <button
                    onClick={() => removeTeamMember(member)}
                    className="p-1 text-[#12151C]/40 hover:text-[#12151C]"
                    title="Remove from roster"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setTeamModalOpen(false)}
              className="px-4 py-1.5 text-[12px] bg-[#12151C] text-white font-medium hover:bg-[#3B82F6] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
