'use client';

import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import FormationsTable from '@/app/shared/formations/formations-table';

const pageHeader = {
  title: 'Gestion des formations',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Formations' },
  ],
};

export default function FormationsPage() {
  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <FormationsTable />
    </div>
  );
}
