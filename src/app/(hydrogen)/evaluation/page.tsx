'use client';

import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import EvaluatorSearch from '@/app/shared/evaluation/evaluator-search';

const pageHeader = {
  title: 'Évaluation',
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: 'Évaluation' },
  ],
};

export default function EvaluationPage() {
  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <EvaluatorSearch />
    </div>
  );
}
