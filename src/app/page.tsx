'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { FounderOverview } from '@/components/overview/FounderOverview';
import { LeadsView } from '@/components/leads/LeadsView';
import { PipelineView } from '@/components/pipeline/PipelineView';
import { CallQueueView } from '@/components/queue/CallQueueView';
import { ClientsView } from '@/components/clients/ClientsView';
import { ProjectsView } from '@/components/projects/ProjectsView';
import { ActivityView } from '@/components/activity/ActivityView';
import { SettingsView } from '@/components/settings/SettingsView';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { QuickAddLeadModal } from '@/components/leads/QuickAddLeadModal';
import { LeadImportModal } from '@/components/leads/LeadImportModal';

export default function CRMApp() {
  const { currentView } = useCRM();

  return (
    <AppShell>
      {currentView === 'overview' && <FounderOverview />}
      {currentView === 'leads' && <LeadsView />}
      {(currentView === 'opportunities' || (currentView as string) === 'pipeline') && <PipelineView />}
      {(currentView === 'followups' || (currentView as string) === 'queue') && <CallQueueView />}
      {currentView === 'clients' && <ClientsView />}
      {currentView === 'projects' && <ProjectsView />}
      {currentView === 'activity' && <ActivityView />}
      {currentView === 'settings' && <SettingsView />}

      {/* Global Modals */}
      <GlobalSearchModal />
      <QuickAddLeadModal />
      <LeadImportModal />
    </AppShell>
  );
}
