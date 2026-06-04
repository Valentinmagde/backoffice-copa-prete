'use client';

import { Loader, Text, Badge } from 'rizzui';
import { PiWarning } from 'react-icons/pi';
import { useBusinessPlanById } from '@/lib/api/hooks/use-business-plan';
import FormGroup from '@/app/shared/form-group';

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

const fmtAmount = (n?: number | null) =>
  n != null ? `${Number(n).toLocaleString('fr-FR')} BIF` : null;

const fmtUSD = (n?: number | null) =>
  n != null ? `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD` : null;

const sectorMap = (sector: string) => {
  switch (sector) {
    case 'agriculture': return 'Agri-business';
    case 'milk': return 'Agro-industrie — Lait';
    case 'poultry': return 'Agro-industrie — Volaille';
    case 'fish': return 'Agro-industrie — Pisciculture';
    case 'tropicalFruit': return 'Agro-industrie — Fruits tropicaux';
    case 'otherAgro': return "Agro-industrie — Autres secteurs à fort potentiel";
    case 'mining': return 'Industrie minière';
    case 'tourism': return "Services connexes à l'agri-business (y compris le tourisme et le numérique)";
    default: return sector;
  }
};

function InfoRow({ label, value }: { label: string; value?: any }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
      <Text className="text-sm font-medium tracking-wider text-gray-400">{label}</Text>
      <Text className="text-sm text-gray-800">{value}</Text>
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
          <InfoRow
            label="Référence"
            value={businessPlan.referenceNumber ? <span className="font-mono font-semibold">{businessPlan.referenceNumber}</span> : null}
          />
          {businessPlan.beneficiary?.projectSectors?.length ? (
            <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
              <Text className="text-sm font-medium tracking-wider text-gray-400">{"Secteur d'activité"}</Text>
              <div className="flex flex-wrap gap-2 mt-1">
                {businessPlan.beneficiary.projectSectors.map((s) => (
                  <Badge key={s} variant="flat" color="primary">{sectorMap(s)}</Badge>
                ))}
              </div>
            </div>
          ) : null}
          <InfoRow label="Financement demandé" value={fmtAmount(businessPlan.beneficiary?.requestedSubsidyAmount)} />
          <InfoRow
            label="Apport personnel"
            value={fmtAmount(
              businessPlan.beneficiary?.totalProjectCost != null && businessPlan.beneficiary?.requestedSubsidyAmount != null
                ? Number(businessPlan.beneficiary.totalProjectCost) - Number(businessPlan.beneficiary.requestedSubsidyAmount)
                : null
            )}
          />
          <InfoRow
            label="Emplois prévus"
            value={
              businessPlan.beneficiary?.plannedEmployeesFemale != null || businessPlan.beneficiary?.plannedEmployeesMale != null
                ? (businessPlan.beneficiary?.plannedEmployeesFemale ?? 0) + (businessPlan.beneficiary?.plannedEmployeesMale ?? 0)
                : null
            }
          />
          <InfoRow label="Emplois femmes prévus" value={businessPlan.beneficiary?.plannedEmployeesFemale ?? null} />
          <InfoRow label="Édition COPA" value={businessPlan.copaEdition?.name} />
          <InfoRow label="Soumis le" value={fmtDate(businessPlan.submittedAt)} />
        </div>
      </FormGroup>

      {/* ── Données financières vérifiées ── */}
      {(businessPlan.verifiedInvestmentSubsidy != null ||
        businessPlan.verifiedExploitationSubsidy != null ||
        businessPlan.verifiedFundingAmount != null ||
        businessPlan.verifiedTotalProjectCost != null) && (
      <FormGroup
        title="Données financières vérifiées"
        description="Montants validés par l'évaluateur désigné"
        className="@3xl:grid-cols-12"
      >
        <div className="rounded-lg border border-muted bg-white p-6 @3xl:col-span-8">
          <InfoRow label="Subvention en investissement" value={fmtUSD(businessPlan.verifiedInvestmentSubsidy)} />
          <InfoRow label="Subvention pour exploitation" value={fmtUSD(businessPlan.verifiedExploitationSubsidy)} />
          <InfoRow label="Subvention totale" value={fmtUSD(businessPlan.verifiedFundingAmount)} />
          <InfoRow label="Coût total du projet" value={fmtUSD(businessPlan.verifiedTotalProjectCost)} />
          {(() => {
            const total = businessPlan.verifiedFundingAmount;
            const exp = businessPlan.verifiedExploitationSubsidy;
            if (total == null || exp == null || total === 0) return null;
            const ratio = (exp / total) * 100;
            return (
              <div className="flex flex-col gap-1 py-3 border-b border-dashed border-gray-200 last:border-0">
                <Text className="text-sm font-medium tracking-wider text-gray-400">Ratio exploitation</Text>
                <Text className={`text-sm font-semibold ${ratio > 30 ? 'text-red-600' : 'text-green-600'}`}>
                  {ratio.toFixed(1)} %
                </Text>
              </div>
            );
          })()}
        </div>
      </FormGroup>
      )}

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
