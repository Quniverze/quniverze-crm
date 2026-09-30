'use client';

import React from 'react';
import { useCRM } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { LoginView } from '@/components/auth/LoginView';
import { TodayView } from '@/components/today/TodayView';
import { LeadsView } from '@/components/leads/LeadsView';
import { FollowUpsView } from '@/components/followups/FollowUpsView';
import { PipelineView } from '@/components/pipeline/PipelineView';
import { ClientsView } from '@/components/clients/ClientsView';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { QuickAddLeadModal } from '@/components/leads/QuickAddLeadModal';
import { TeamManageModal } from '@/components/common/TeamManageModal';

export default function CRMApp() {
  const { currentView, currentUser } = useCRM();

  // If not logged in, show the clean login screen
  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <AppShell>
      {currentView === 'today' && <TodayView />}
      {currentView === 'leads' && <LeadsView />}
      {currentView === 'followups' && <FollowUpsView />}
      {currentView === 'pipeline' && <PipelineView />}
      {currentView === 'clients' && <ClientsView />}

      {/* Global Modals */}
      <GlobalSearchModal />
      <QuickAddLeadModal />
      <TeamManageModal />
    </AppShell>
  );
}
