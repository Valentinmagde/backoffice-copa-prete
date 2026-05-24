'use client';

import { use } from 'react';
import BusinessPlanDetail from '@/app/shared/business-plans/business-plan-detail';

export default function BusinessPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="@container space-y-8">
      <BusinessPlanDetail businessPlanId={Number(id)} />
    </div>
  );
}
