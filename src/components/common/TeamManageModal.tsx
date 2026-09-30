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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={() => setTeamModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white border border-gray-100 rounded-[28px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#EAECEF] bg-[#FAFAFB]">
          <div>
            <h3 className="text-[17px] font-bold text-[#111827] tracking-tight">
              Team &amp; Access
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Manage team members, update usernames and passwords, and assign roles.
            </p>
          </div>
          <button
            onClick={() => setTeamModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Add form (Only for Admin) */}
          {isAdmin ? (
            <form onSubmit={handleAdd} className="space-y-3 p-4 bg-[#F8FAF9] border border-[#1A5336]/20 rounded-2xl">
              <h4 className="text-[12.5px] font-bold text-[#1A5336] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#1A5336]" />
                <span>Add Team Member</span>
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Full Name *
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
                    className="w-full px-3 py-1.5 text-[12.5px] bg-white border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. adil"
                    className="w-full px-3 py-1.5 text-[12.5px] font-mono bg-white border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Password *
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. adil2026"
                    className="w-full px-3 py-1.5 text-[12.5px] font-mono bg-white border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-1.5 text-[12.5px] bg-white border border-gray-200 rounded-xl focus:outline-none"
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
                  className="px-4 py-2 bg-[#1A5336] text-white text-[12px] font-medium rounded-full hover:bg-[#14422B] disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[12px] text-gray-600">
              Only admins can create or delete team members.
            </div>
          )}

          {/* Members List with Credentials and Edit capability */}
          <div className="space-y-2">
            <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              Active Team Accounts ({usersList.length})
            </h4>

            <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
              {usersList.map((user) => {
                const isAbid = user.name.toLowerCase() === 'abid';
                const isEditing = editingUserId === user.id;

                if (isEditing) {
                  return (
                    <form
                      key={user.id}
                      onSubmit={handleSaveEdit}
                      className="p-3.5 bg-[#F8FAF9] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-[#1A5336]">
                          Edit Credentials: {user.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="text-[11px] text-gray-500 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10.5px] font-medium text-gray-500 mb-0.5">
                            Name
                          </label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-medium text-gray-500 mb-0.5">
                            Username
                          </label>
                          <input
                            type="text"
                            required
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-gray-200 rounded-lg focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10.5px] font-medium text-gray-500 mb-0.5">
                            Password
                          </label>
                          <input
                            type="text"
                            required
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="w-full px-2.5 py-1 text-[12px] font-mono bg-white border border-gray-200 rounded-lg focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-medium text-gray-500 mb-0.5">
                            Role
                          </label>
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as UserRole)}
                            className="w-full px-2.5 py-1 text-[12px] bg-white border border-gray-200 rounded-lg focus:outline-none"
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
                          className="px-3 py-1 text-[11.5px] border border-gray-300 rounded-full hover:border-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1 bg-[#1A5336] text-white text-[11.5px] font-medium rounded-full hover:bg-[#14422B]"
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
                    className="p-3.5 bg-white flex items-center justify-between text-[13px] hover:bg-[#F8FAF9] transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111827]">{user.name}</span>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            user.role === 'admin'
                              ? 'bg-[#E8F5EE] text-[#1A5336] font-bold'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>

                      {/* Username & Password Display */}
                      <div className="flex items-center gap-2 text-[11.5px] font-mono text-gray-500 mt-1">
                        <span>User: <strong className="text-[#111827]">{user.username}</strong></span>
                        <span>•</span>
                        <span>Pass: <strong className="text-[#111827]">{user.password || '••••••'}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Edit Button */}
                      {isAdmin && (
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="px-3 py-1 text-[11.5px] border border-gray-200 rounded-full text-gray-700 hover:border-gray-900 flex items-center gap-1 transition-colors"
                          title="Update username, password, or role"
                        >
                          <Edit2 className="w-3 h-3 text-[#1A5336]" />
                          <span>Edit</span>
                        </button>
                      )}

                      {/* Copy Credentials Button */}
                      {user.password && (
                        <button
                          onClick={() => handleCopyCredentials(user.username, user.password || '', user.id)}
                          className="px-3 py-1 text-[11.5px] border border-gray-200 rounded-full text-gray-700 hover:border-gray-900 flex items-center gap-1 transition-colors"
                          title="Copy login details"
                        >
                          {copiedId === user.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#1A5336]" />
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

                      {/* Delete Member */}
                      {isAdmin && !isAbid && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove account for ${user.name}?`)) {
                              removeTeamMember(user.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
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
              className="btn-pill-primary py-2 px-5"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
