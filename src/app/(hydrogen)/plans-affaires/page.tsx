'use client';

import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import BusinessPlansList from '@/app/shared/business-plans/business-plans-list';

const pageHeader = {
  title: "Plans d'affaires",
  breadcrumb: [
    { href: routes.executive.dashboard, name: 'Tableau de bord' },
    { name: "Plans d'affaires" },
  ],
};

export default function BusinessPlansPage() {
  return (
    <div className="@container">
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <BusinessPlansList />
    </div>
  );
}
