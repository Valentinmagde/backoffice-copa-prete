'use client';

import { use } from 'react';
import EvaluateBusinessPlan from '@/app/shared/mpme/candidatures/evaluate-business-plan';
import { useMPMECandidature } from '@/lib/api/hooks/use-mpme';

export default function EvaluatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: candidature } = useMPMECandidature(Number(id));

  const fullName = candidature
    ? `${candidature.user?.firstName} ${candidature.user?.lastName}`
    : `Candidature #${id}`;

  return (
    <EvaluateBusinessPlan beneficiaryId={Number(id)} beneficiaryName={fullName} />
  );
}
