'use client';

import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import EvaluateursTable from '@/app/shared/evaluateurs/evaluateurs-table';

const pageHeader = {
  title: 'Gestion des évaluateurs',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Évaluateurs' },
  ],
};

export default function EvaluateursPage() {
  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <EvaluateursTable />
    </div>
  );
}
