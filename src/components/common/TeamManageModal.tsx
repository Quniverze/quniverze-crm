'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { UserRole, UserAccount } from '@/types/crm';
import { X, UserPlus, Trash2, Key, Shield, Copy, Check, Edit2 } from 'lucide-react';

export function TeamManageModal() {
  const {
    teamModalOpen,
    setTeamModalOpen,
    usersList,
    addTeamMember,
    updateUserAccount,
    removeTeamMember,
    currentUser,
    showToast
  } = useCRM();

  // Create form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit account state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('member');

  if (!teamModalOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) return;

    await addTeamMember(name.trim(), username.trim(), password.trim(), role);
    setName('');
    setUsername('');
    setPassword('');
    setRole('member');
  };

  const handleStartEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditPassword(user.password || '');
    setEditRole(user.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId || !editName.trim() || !editUsername.trim() || !editPassword.trim()) return;

    await updateUserAccount(editingUserId, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
      password: editPassword.trim(),
      role: editRole
    });

    setEditingUserId(null);
  };

  const handleCopyCredentials = (uName: string, pass: string, id: string) => {
    navigator.clipboard.writeText(`Username: ${uName}\nPassword: ${pass}`);
    setCopiedId(id);
    showToast(`Copied credentials for ${uName}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/50 p-4"
      onClick={() => setTeamModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F4F6F9]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#3B82F6]">
                Settings
              </span>
              <span className="text-[#E5E7EB]">/</span>
              <h3 className="text-[14.5px] font-semibold text-[#12151C] tracking-tight">
                Team
              </h3>
            </div>
            <p className="text-[12px] text-[#12151C]/60 mt-0.5">
              Manage team members, update usernames and passwords, and assign roles.
            </p>
          </div>
          <button
            onClick={() => setTeamModalOpen(false)}
            className="h-8 w-8 rounded-md flex items-center justify-center text-[#12151C]/50 hover:text-[#12151C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Add Member Form (Admin only) - Uniform Inputs & Buttons */}
          {isAdmin ? (
            <form onSubmit={handleAdd} className="space-y-3 p-3.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-lg">
              <h4 className="text-[11.5px] font-mono uppercase tracking-wider font-semibold text-[#12151C] flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Add Member</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-[#12151C]/60 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!username) {
                        setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                      }
                    }}
                    placeholder="e.g. Adil"
                    className="w-full h-8.5 px-2.5 text-[12.5px] bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-[#12151C]/60 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. adil"
                    className="w-full h-8.5 px-2.5 text-[12.5px] font-mono bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-[#12151C]/60 mb-1">
                    Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. adil2026"
                    className="w-full h-8.5 px-2.5 text-[12.5px] font-mono bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono uppercase text-[#12151C]/60 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full h-8.5 px-2.5 text-[12.5px] bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!name.trim() || !username.trim() || !password.trim()}
                  className="h-8.5 px-4 bg-[#12151C] text-white text-[12px] font-medium hover:bg-[#3B82F6] disabled:opacity-40 transition-colors flex items-center gap-1.5 rounded-md shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] rounded-lg text-[12px] text-[#12151C]/70">
              Only admins can create or delete team members.
            </div>
          )}

          {/* Members List with Credentials and Edit capability */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/50">
              Team Members ({usersList.length})
            </h4>

            <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-lg overflow-hidden">
              {usersList.map((user) => {
                const isAbid = user.name.toLowerCase() === 'abid';
                const isEditing = editingUserId === user.id;

                if (isEditing) {
                  return (
                    <form
                      key={user.id}
                      onSubmit={handleSaveEdit}
                      className="p-3 bg-[#F4F6F9] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase font-bold text-[#12151C]">
                          Edit Credentials: {user.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="text-[11px] text-[#12151C]/60 hover:text-[#12151C]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#12151C]/50 mb-0.5">
                            Name
                          </label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full h-8 px-2 text-[12px] bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#12151C]/50 mb-0.5">
                            Username
                          </label>
                          <input
                            type="text"
                            required
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="w-full h-8 px-2 text-[12px] font-mono bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#12151C]/50 mb-0.5">
                            Password
                          </label>
                          <input
                            type="text"
                            required
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full h-8 px-2 text-[12px] font-mono bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono uppercase text-[#12151C]/50 mb-0.5">
                            Role
                          </label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="w-full h-8 px-2 text-[12px] bg-white border border-[#E5E7EB] rounded-md focus:outline-none"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="h-8 px-3 text-[11.5px] border border-[#E5E7EB] rounded-md hover:border-[#12151C]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="h-8 px-3.5 bg-[#12151C] text-white text-[11.5px] font-medium rounded-md hover:bg-[#3B82F6]"
                        >
                          Save Credentials
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={user.id}
                    className="p-3 bg-white flex items-center justify-between text-[12.5px] hover:bg-[#F4F6F9] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#12151C]">{user.name}</span>
                        <span
                          className={`text-[9.5px] font-mono uppercase px-1 rounded border ${
                            user.role === 'admin'
                              ? 'bg-[#12151C] text-white border-[#12151C]'
                              : 'bg-[#F4F6F9] text-[#12151C] border-[#E5E7EB]'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>

                      {/* Username & Password Display */}
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#12151C]/60 mt-0.5">
                        <span>User: <strong className="text-[#12151C]">{user.username}</strong></span>
                        <span>•</span>
                        <span>Pass: <strong className="text-[#12151C]">{user.password || '••••••'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Edit Button - Uniform 30px (h-7.5) */}
                      {isAdmin && (
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="h-7.5 px-2.5 text-[11px] font-mono border border-[#E5E7EB] text-[#12151C] hover:border-[#12151C] rounded-md flex items-center gap-1 transition-colors"
                          title="Update username, password, or role"
                        >
                          <Edit2 className="w-3 h-3 text-[#3B82F6]" />
                          <span>Edit</span>
                        </button>
                      )}

                      {/* Copy Credentials Button - Uniform 30px (h-7.5) */}
                      {user.password && (
                        <button
                          onClick={() => handleCopyCredentials(user.username, user.password || '', user.id)}
                          className="h-7.5 px-2.5 text-[11px] font-mono border border-[#E5E7EB] text-[#12151C] hover:border-[#12151C] rounded-md flex items-center gap-1 transition-colors"
                          title="Copy login details to send to member"
                        >
                          {copiedId === user.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#3B82F6]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete Member (Admin only, not Abid) */}
                      {isAdmin && !isAbid && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove account for ${user.name}?`)) {
                              removeTeamMember(user.id);
                            }
                          }}
                          className="h-7.5 w-7.5 rounded-md border border-[#E5E7EB] hover:border-[#12151C] flex items-center justify-center text-[#12151C]/40 hover:text-[#12151C] transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setTeamModalOpen(false)}
              className="h-8.5 px-4 text-[12px] bg-[#12151C] text-white font-medium hover:bg-[#3B82F6] transition-colors rounded-md shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
