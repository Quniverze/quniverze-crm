'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { CallQueueView } from '@/components/queue/CallQueueView';
import { FounderOverview } from '@/components/overview/FounderOverview';
import { LeadsView } from '@/components/leads/LeadsView';
import { PipelineView } from '@/components/pipeline/PipelineView';
import { ClientsView } from '@/components/clients/ClientsView';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { QuickAddLeadModal } from '@/components/leads/QuickAddLeadModal';
import { LeadImportModal } from '@/components/leads/LeadImportModal';

export default function CRMApp() {
  const { currentView } = useCRM();

  return (
    <AppShell>
      {currentView === 'overview' && <FounderOverview />}
      {currentView === 'queue' && <CallQueueView />}
      {currentView === 'leads' && <LeadsView />}
      {currentView === 'pipeline' && <PipelineView />}
      {currentView === 'clients' && <ClientsView />}

      {/* Global Modals */}
      <GlobalSearchModal />
      <QuickAddLeadModal />
      <LeadImportModal />
    </AppShell>
  );
}
