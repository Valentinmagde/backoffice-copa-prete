'use client';

import { Loader, Text } from 'rizzui';
import { PiWarning } from 'react-icons/pi';
import { useBusinessPlanById } from '@/lib/api/hooks/use-business-plan';
import FormGroup from '@/app/shared/form-group';

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtAmount = (n?: number | null) =>
  n ? `${Number(n).toLocaleString('fr-FR')} BIF` : '—';

function InfoRow({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
      <Text className="text-sm font-medium tracking-wider text-gray-400">{label}</Text>
      <Text className="text-sm text-gray-800">{value ?? '—'}</Text>
    </div>
  );
}

export default function BusinessPlanDetail({ businessPlanId }: { businessPlanId: number }) {
  const { data: businessPlan, isLoading } = useBusinessPlanById(businessPlanId);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader variant="spinner" size="lg" /></div>;
  }

  if (!businessPlan) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <PiWarning className="mb-3 size-10 text-amber-400" />
        <Text className="text-base font-medium text-gray-700">Plan d'affaires introuvable</Text>
      </div>
    );
  }

  return (
    <>
      {/* ── Informations générales ── */}
      <FormGroup
        title="Plan d'affaires"
        description="Résumé et informations générales du plan soumis"
        className="@3xl:grid-cols-12"
      >
        <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
          {businessPlan.referenceNumber && (
            <InfoRow
              label="Référence"
              value={<span className="font-mono font-semibold">{businessPlan.referenceNumber}</span>}
            />
          )}
          <InfoRow label="Secteur d'activité" value={businessPlan.businessSector?.name} />
          <InfoRow label="Financement demandé" value={fmtAmount(businessPlan.requestedFundingAmount)} />
          <InfoRow label="Apport personnel" value={fmtAmount(businessPlan.personalContributionAmount)} />
          <InfoRow label="Emplois prévus" value={businessPlan.expectedJobsCount} />
          <InfoRow label="Emplois femmes prévus" value={businessPlan.expectedWomenJobsCount} />
          <InfoRow label="Édition COPA" value={businessPlan.copaEdition?.name} />
          <InfoRow label="Soumis le" value={fmtDate(businessPlan.submittedAt)} />
        </div>
      </FormGroup>

      {/* ── Description ── */}
      {businessPlan.projectDescription && (
        <FormGroup
          title="Description du projet"
          description="Présentation générale du projet d'affaires"
          className="@3xl:grid-cols-12"
        >
          <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{businessPlan.projectDescription}</p>
          </div>
        </FormGroup>
      )}

      {/* ── Sections du plan ── */}
      {businessPlan.sections && businessPlan.sections.length > 0 && (
        <FormGroup
          title="Sections du plan"
          description="Contenu détaillé des différentes sections du plan d'affaires"
          className="@3xl:grid-cols-12"
        >
          <div className="space-y-3 @3xl:col-span-8">
            {businessPlan.sections.map((s) => (
              <div key={s.id} className="rounded-lg border border-muted bg-white p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {s.sectionType?.name ?? `Section ${s.sectionOrder}`}
                </p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{s.content ?? '—'}</p>
              </div>
            ))}
          </div>
        </FormGroup>
      )}
    </>
  );
}
