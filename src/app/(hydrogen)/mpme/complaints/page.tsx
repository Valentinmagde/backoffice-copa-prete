'use client';

import { useState } from 'react';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ComplaintsTable from '@/app/shared/mpme/complaints/complaints-table';
import CohortSelect from '@/app/shared/cohorts/cohort-select';

const pageHeader = {
  title: 'Gestion des plaintes',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Plaintes' },
  ],
};

export default function ComplaintsPage() {
  const [editionId, setEditionId] = useState<number | undefined>(undefined);

  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 @lg:mt-0">
          <CohortSelect value={editionId} onChange={setEditionId} />
        </div>
      </PageHeader>
      <ComplaintsTable editionId={editionId} />
    </div>
  );
}
