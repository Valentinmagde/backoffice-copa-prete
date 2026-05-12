'use client';

import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import ComplaintsTable from '@/app/shared/mpme/complaints/complaints-table';

const pageHeader = {
  title: 'Gestion des plaintes',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Plaintes' },
  ],
};

export default function ComplaintsPage() {
  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ComplaintsTable />
    </div>
  );
}
