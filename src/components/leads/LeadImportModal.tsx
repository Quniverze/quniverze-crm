'use client';

import React, { useState } from 'react';
import { useCRM } from '@/lib/store';
import { X, UploadCloud, FileText } from 'lucide-react';

export function LeadImportModal() {
  const { importModalOpen, setImportModalOpen, importLeads } = useCRM();
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<{ imported: number; duplicates: number } | null>(null);

  if (!importModalOpen) return null;

  const sampleCsv = `Business,Contact Person,Phone,Website,Industry,Location
Calicut Biriyani Hub,Fayiz,9895123401,calicutbiriyanihub.com,Restaurant,Kozhikode
Greenwood Architecture,Shreya,9895123402,greenwoodarch.in,Interior Design,Kochi
Smile Dental Care,Dr. Vinod,9895123403,smiledental.in,Healthcare,Kozhikode`;

  const handleParseAndImport = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    // Detect header
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    const leadsToImport = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (row.length === 0 || !row[0]) continue;

      const leadData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        leadData[h] = row[idx] || '';
      });

      leadsToImport.push({
        business_name: leadData['business'] || leadData['business name'] || leadData['company'] || row[0],
        contact_name: leadData['contact person'] || leadData['contact'] || leadData['name'] || row[1],
        phone: leadData['phone'] || leadData['mobile'] || row[2],
        website: leadData['website'] || row[3],
        industry: leadData['industry'] || row[4] || 'Other',
        location: leadData['location'] || leadData['city'] || row[5] || 'Kozhikode'
      });
    }

    const res = importLeads(leadsToImport);
    setResult(res);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151C]/50 backdrop-blur-none p-4"
      onClick={() => setImportModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#E5E7EB] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] bg-[#F4F6F9]/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#3B82F6]">02 Pipeline</span>
              <span className="text-[#E5E7EB]">/</span>
              <h2 className="text-[14px] font-bold text-[#12151C] uppercase tracking-wide">Import Leads (CSV)</h2>
            </div>
            <p className="text-[12px] text-[#12151C]/60 mt-0.5">Deduplication active by phone number and business name.</p>
          </div>
          <button
            onClick={() => setImportModalOpen(false)}
            className="p-1 text-[#12151C]/60 hover:text-[#12151C] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-[#E5E7EB] hover:border-[#3B82F6] cursor-pointer bg-[#F4F6F9] transition-colors">
              <UploadCloud className="w-6 h-6 text-[#12151C]/60 mb-1.5" />
              <span className="text-[13px] font-medium text-[#12151C]">Upload .CSV file</span>
              <span className="text-[11px] text-[#12151C]/60">or paste raw CSV text below</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#12151C]/70">
                CSV Content
              </label>
              <button
                type="button"
                onClick={() => setCsvText(sampleCsv)}
                className="text-[11px] font-mono uppercase text-[#3B82F6] hover:underline"
              >
                Load sample
              </button>
            </div>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Business,Contact Person,Phone,Website,Industry,Location..."
              className="w-full px-3 py-2 text-[12px] font-mono text-[#12151C] border border-[#E5E7EB] bg-[#F4F6F9] focus:outline-none focus:border-[#3B82F6] focus:bg-white resize-none transition-colors"
            />
          </div>

          {result && (
            <div className="p-3 bg-[#F4F6F9] border border-[#E5E7EB] text-[12px] flex items-center justify-between font-mono">
              <span className="font-semibold text-[#12151C] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#3B82F6]"></span>
                Imported {result.imported} leads successfully
              </span>
              {result.duplicates > 0 && (
                <span className="text-[#12151C]/60">
                  ({result.duplicates} duplicates skipped)
                </span>
              )}
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setImportModalOpen(false)}
              className="px-4 py-2 text-[12px] font-mono uppercase tracking-wider text-[#12151C]/70 hover:text-[#12151C] border border-[#E5E7EB] hover:bg-[#F4F6F9] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleParseAndImport}
              disabled={!csvText.trim()}
              className="px-4 py-2 text-[12px] font-medium tracking-wide text-white bg-[#12151C] hover:bg-[#3B82F6] disabled:opacity-40 transition-colors"
            >
              Import Leads
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
