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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/40 backdrop-blur-none p-4"
      onClick={() => setImportModalOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#E5E5E5] rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111111]">Import Leads (CSV)</h2>
            <p className="text-[12px] text-[#6B6B6B]">Automatic duplicate detection by phone number &amp; business name.</p>
          </div>
          <button
            onClick={() => setImportModalOpen(false)}
            className="p-1 text-[#6B6B6B] hover:text-[#111111] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#E5E5E5] hover:border-[#111111] rounded-lg cursor-pointer bg-[#F7F7F5] transition-colors">
              <UploadCloud className="w-6 h-6 text-[#6B6B6B] mb-1.5" />
              <span className="text-[13px] font-medium text-[#111111]">Upload .CSV file</span>
              <span className="text-[11.5px] text-[#6B6B6B]">or paste raw CSV text below</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11.5px] font-medium text-[#6B6B6B] uppercase tracking-wider">
                CSV Content
              </label>
              <button
                type="button"
                onClick={() => setCsvText(sampleCsv)}
                className="text-[11.5px] text-[#111111] underline hover:text-[#6B6B6B]"
              >
                Load sample
              </button>
            </div>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Business,Contact Person,Phone,Website,Industry,Location..."
              className="w-full px-3 py-2 text-[12.5px] font-mono text-[#111111] border border-[#E5E5E5] rounded focus:outline-none focus:border-[#111111] bg-[#FFFFFF] resize-none"
            />
          </div>

          {result && (
            <div className="p-3 bg-[#F7F7F5] border border-[#E5E5E5] rounded text-[13px] flex items-center justify-between">
              <span className="font-medium text-[#16803C]">
                ✓ Successfully imported {result.imported} leads
              </span>
              {result.duplicates > 0 && (
                <span className="text-[#B7791F]">
                  ({result.duplicates} duplicates skipped)
                </span>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setImportModalOpen(false)}
              className="px-3.5 py-1.5 text-[13px] text-[#6B6B6B] hover:text-[#111111] rounded border border-[#E5E5E5]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleParseAndImport}
              disabled={!csvText.trim()}
              className="px-4 py-1.5 text-[13px] font-medium text-white bg-[#111111] hover:bg-black rounded disabled:opacity-40 transition-colors"
            >
              Import Leads
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
