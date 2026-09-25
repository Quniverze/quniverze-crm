'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { X } from 'lucide-react';

export function QuickAddLeadModal() {
  const { quickAddOpen, setQuickAddOpen, addLead, setSelectedLeadId, setCurrentView } = useCRM();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Restaurant');
  const [location, setLocation] = useState('Kozhikode');
  const [observation, setObservation] = useState('');

  if (!quickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const newLead = addLead({
      business_name: businessName.trim(),
      contact_name: contactName.trim(),
      phone: phone.trim(),
      website: website.trim(),
      industry,
      location: location.trim(),
      observation: observation.trim()
    });

    // Reset & close
    setBusinessName('');
    setContactName('');
    setPhone('');
    setWebsite('');
    setObservation('');
    setQuickAddOpen(false);

    // Focus on new lead
    setSelectedLeadId(newLead.id);
    setCurrentView('leads');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/50 backdrop-blur-none p-4"
      onClick={() => setQuickAddOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white border border-[#E5E7EB] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F4F6F9]/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#3B82F6]">01 Pipeline</span>
              <span className="text-[#E5E7EB]">/</span>
              <h2 className="text-[14px] font-bold text-[#12151C] uppercase tracking-wide">Quick Add Prospect</h2>
            </div>
            <p className="text-[12px] text-[#12151C]/60 mt-0.5">Rapid intake for studio prospects &amp; client leads.</p>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1 text-[#12151C]/60 hover:text-[#12151C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Paragon Restaurant"
              className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Rahul K."
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white transition-colors"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Café">Café</option>
                <option value="Healthcare">Healthcare / Clinic</option>
                <option value="Interior Design">Interior Design / Architecture</option>
                <option value="Hotels">Hotels &amp; Resorts</option>
                <option value="Salons">Salons &amp; Spas</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Retail">Retail &amp; Boutique</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kozhikode"
                className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Website / Social URL
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. company.com or @handle"
              className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70 mb-1">
              Observation / Studio Angle
            </label>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="e.g. Outdated design, missing mobile experience, target for modern web rebuild..."
              className="w-full px-3 py-2 text-[13px] text-[#12151C] bg-[#F4F6F9] border border-[#E5E7EB] focus:outline-none focus:border-[#3B82F6] focus:bg-white resize-none transition-colors"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="px-4 py-2 text-[12px] font-mono uppercase tracking-wider text-[#12151C]/70 hover:text-[#12151C] border border-[#E5E7EB] hover:bg-[#F4F6F9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[12px] font-medium tracking-wide text-white bg-[#12151C] hover:bg-[#3B82F6] transition-colors flex items-center gap-1.5"
            >
              <span>Add Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
