'use client';

import { use } from 'react';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import EvaluationFormPage from '@/app/shared/evaluation/evaluation-form-page';
import { useBusinessPlanById } from '@/lib/api/hooks/use-business-plan';

function EvaluatePage({ id }: { id: string }) {
  const { data: businessPlan } = useBusinessPlanById(Number(id));
  const title = businessPlan?.projectTitle ?? 'Évaluation';

  const pageHeader = {
    title,
    breadcrumb: [
      { href: routes.executive.dashboard, name: 'Tableau de bord' },
      { href: routes.evaluation.search, name: 'Évaluation' },
      { name: title },
    ],
  };

  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <EvaluationFormPage businessPlanId={Number(id)} />
    </div>
  );
}

export default function EvaluatePageWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EvaluatePage id={id} />;
}
