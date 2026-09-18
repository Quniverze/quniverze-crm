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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/40 backdrop-blur-none p-4"
      onClick={() => setQuickAddOpen(false)}
    >
      <div
        className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111111]">Quick Add Lead</h2>
            <p className="text-[12px] text-[#6B6B6B]">Add a prospect in seconds. Details can be expanded later.</p>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1 text-[#6B6B6B] hover:text-[#111111] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1">
              Business Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Paragon Restaurant"
              className="w-full px-3 py-2 text-[14px] text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Rahul K."
                className="w-full px-3 py-2 text-[14px] text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF]"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3 py-2 text-[14px] text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 text-[13.5px] text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF]"
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
              <label className="block text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kozhikode"
                className="w-full px-3 py-2 text-[14px] text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1">
              Website / Social
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. business.com or @instagram_handle"
              className="w-full px-3 py-2 text-[14px] text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider mb-1">
              Observation / Sales Angle
            </label>
            <textarea
              rows={2}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="e.g. Outdated website, no mobile ordering, active Instagram..."
              className="w-full px-3 py-2 text-[13.5px] text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF] resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setQuickAddOpen(false)}
              className="px-3.5 py-1.5 text-[13px] text-[#6B6B6B] hover:text-[#111111] rounded border border-[#E5E5E5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#111111] hover:bg-black rounded transition-colors"
            >
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
