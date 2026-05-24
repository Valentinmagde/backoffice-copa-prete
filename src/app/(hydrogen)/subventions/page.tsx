'use client';

import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import SubventionsTable from '@/app/shared/subventions/subventions-table';
import { useSubventionStats } from '@/lib/api/hooks/use-subventions';

const pageHeader = {
  title: 'Gestion des subventions',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Subventions' },
  ],
};

function StatsBar() {
  const { data: stats } = useSubventionStats();
  if (!stats) return null;

  const fmtBIF = (n: number) => Number(n).toLocaleString('fr-FR') + ' BIF';

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[
        { label: 'Subventions actives', value: stats.totalSubventions, suffix: '' },
        { label: 'Montant total accordé', value: fmtBIF(stats.totalAwardedAmount), suffix: '' },
        { label: 'Montant libéré', value: fmtBIF(stats.totalReleasedAmount), suffix: '' },
      ].map((card, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function SubventionsPage() {
  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <StatsBar />
      <SubventionsTable />
    </div>
  );
}
