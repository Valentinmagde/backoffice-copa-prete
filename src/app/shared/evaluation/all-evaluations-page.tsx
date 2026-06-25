'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { Loader, Text, Button } from 'rizzui';
import { PiMicrosoftExcelLogoDuotone, PiWarning, PiFolderOpen } from 'react-icons/pi';
import { createColumnHelper } from '@tanstack/react-table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { useAllEvaluations } from '@/lib/api/hooks/use-evaluateurs';
import { evaluateurApi } from '@/lib/api/endpoints/evaluateur.api';
import CohortSelect from '@/app/shared/cohorts/cohort-select';
import { SCORE_CRITERIA, TOTAL_MAX, RECOMMENDATION_OPTIONS } from '@/lib/api/types/evaluateur.types';
import type { Evaluation } from '@/lib/api/types/evaluateur.types';

// Référence stable : un nouveau tableau `[]` créé à chaque rendu (valeur par
// défaut de déstructuration) ferait croire à useMemo/useEffect que les
// données ont changé à chaque passage, provoquant une boucle de rendu infinie.
const EMPTY_EVALUATIONS: Evaluation[] = [];

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtUSD = (n?: number | null) =>
  n != null
    ? `${Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
    : '—';

const RECO_LABELS: Record<string, string> = Object.fromEntries(
  RECOMMENDATION_OPTIONS.map((o) => [o.value, o.label]),
);

function evalTotal(ev: Evaluation): number {
  return SCORE_CRITERIA.reduce((s, c) => s + ((ev as any)[c.key as string] ?? 0) * c.coefficient, 0);
}

function evalName(ev: Evaluation): string {
  const u = ev.evaluator?.user;
  return u ? `${u.firstName} ${u.lastName}` : `#${ev.evaluatorId}`;
}

// ── Type ligne ──────────────────────────────────────────────────────────────

type PlanRow = {
  businessPlanId: number;
  // Identifiants
  referenceNumber: string;
  applicationCode: string;
  edition: string;
  status: string;
  documentUrl: string | null;
  // Infos personnelles
  beneficiary: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  age: number | null;
  category: string;
  maritalStatus: string;
  educationLevel: string;
  position: string;
  province: string;
  commune: string;
  quartier: string;
  rue: string;
  // Infos entreprise
  companyName: string;
  companyType: string;
  legalStatus: string;
  taxIdNumber: string;
  companySector: string;
  companyCreationDate: string;
  permanentEmployees: number | null;
  totalEmployees: number | null;
  revenueYearN1: number | null;
  companyPhone: string;
  companyEmail: string;
  // Infos projet / financement
  projectTitle: string;
  totalProjectCostRequested: number | null;
  requestedSubsidyAmount: number | null;
  plannedWomen: number | null;
  plannedMen: number | null;
  verifiedInvestmentSubsidy: number | null;
  verifiedExploitationSubsidy: number | null;
  verifiedFundingAmount: number | null;
  verifiedTotalProjectCost: number | null;
  // Évaluations
  evaluations: Evaluation[];
  avgTotal: number | null;
};

function buildRows(evaluations: Evaluation[]): PlanRow[] {
  const map = new Map<number, Evaluation[]>();
  for (const ev of evaluations) {
    const arr = map.get(ev.businessPlanId) ?? [];
    arr.push(ev);
    map.set(ev.businessPlanId, arr);
  }

  return Array.from(map.entries()).map(([id, evs]) => {
    const bp = evs[0]?.businessPlan;
    const slots = evs.slice(0, 3);
    const totals = slots.map(evalTotal);
    const avgTotal = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : null;
    const ben = bp?.beneficiary;
    const u   = ben?.user;
    const co  = ben?.company;
    const bd  = u?.birthDate;
    const age = bd ? Math.floor((Date.now() - new Date(bd).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null;

    const mapLegal = (code?: string | null, other?: string | null) => {
      switch (code) {
        case 'php':  return 'Personne physique';
        case 'snc':  return 'Société en Nom Collectif (SNC)';
        case 'sprl': return 'Société de Personnes à Responsabilité Limitée (SPRL)';
        case 'scs':  return 'Société en Commandite Simple (SCS)';
        case 'su':   return 'Société Unipersonnelle (SU)';
        case 'sa':   return 'Société Anonyme (SA)';
        case 'coop': return 'Société Coopérative';
        default:     return other ?? code ?? '—';
      }
    };

    const mapMarital = (code?: string | null) => {
      switch (code) {
        case 'single':   return 'Célibataire';
        case 'married':  return 'Marié(e)';
        case 'divorced': return 'Divorcé(e)';
        case 'widowed':  return 'Veuf(ve)';
        default:         return '—';
      }
    };

    const mapEducation = (code?: string | null) => {
      switch (code) {
        case 'none':       return 'Non scolarisé(e)';
        case 'primary':    return 'Primaire';
        case 'secondary':  return 'Secondaire';
        case 'university': return 'Universitaire';
        default:           return '—';
      }
    };

    return {
      businessPlanId: id,
      referenceNumber: bp?.referenceNumber ?? `#${id}`,
      applicationCode: ben?.applicationCode ?? '—',
      edition: bp?.copaEdition?.name ?? '—',
      status: ben?.status?.nameFr ?? ben?.status?.name ?? '—',
      documentUrl: bp?.documentUrl ?? null,
      // Infos personnelles
      beneficiary:      u ? `${u.firstName} ${u.lastName}` : '—',
      email:            u?.email            ?? '—',
      phone:            u?.phoneNumber      ?? '—',
      gender:           u?.gender?.code === 'M' ? 'Masculin' : u?.gender?.code === 'F' ? 'Féminin' : '—',
      birthDate:        bd ? new Date(bd).toLocaleDateString('fr-FR') : '—',
      age,
      category:         ben?.category === 'REFUGEE' ? 'Réfugié(e)' : ben?.category === 'BURUNDIAN' ? 'Burundais(e)' : ben?.category === 'OTHER' ? 'Autre' : '—',
      maritalStatus:    mapMarital(ben?.maritalStatus),
      educationLevel:   mapEducation(ben?.educationLevel),
      position:         ben?.position ?? '—',
      province:  u?.primaryAddress?.commune?.province?.name ?? '—',
      commune:   u?.primaryAddress?.commune?.name           ?? '—',
      quartier:  u?.primaryAddress?.neighborhood            ?? '—',
      rue:       u?.primaryAddress?.street                  ?? '—',
      // Infos entreprise
      companyName:       co?.companyName ?? bp?.projectTitle ?? '—',
      companyType:       co?.companyType === 'formal' ? 'Formel' : co?.companyType === 'informal' ? 'Informel' : co?.companyType === 'project' ? 'Projet' : '—',
      legalStatus:       mapLegal(co?.legalStatus, co?.legalStatusOther),
      taxIdNumber:       co?.taxIdNumber   ?? '—',
      companySector:     co?.primarySector?.nameFr ?? co?.otherCompanySector ?? '—',
      companyCreationDate: co?.creationDate ? new Date(co.creationDate).toLocaleDateString('fr-FR') : '—',
      permanentEmployees: co?.permanentEmployees ?? null,
      totalEmployees:     co?.totalEmployees     ?? null,
      revenueYearN1:      co?.revenueYearN1      ?? null,
      companyPhone:       co?.companyPhone ?? '—',
      companyEmail:       co?.companyEmail ?? '—',
      // Infos projet / financement
      projectTitle:               bp?.projectTitle              ?? '—',
      totalProjectCostRequested:  ben?.totalProjectCost         ?? null,
      requestedSubsidyAmount:     ben?.requestedSubsidyAmount   ?? null,
      plannedWomen:               ben?.plannedEmployeesFemale   ?? null,
      plannedMen:                 ben?.plannedEmployeesMale     ?? null,
      verifiedInvestmentSubsidy:  bp?.verifiedInvestmentSubsidy ?? null,
      verifiedExploitationSubsidy:bp?.verifiedExploitationSubsidy ?? null,
      verifiedFundingAmount:      bp?.verifiedFundingAmount     ?? null,
      verifiedTotalProjectCost:   bp?.verifiedTotalProjectCost  ?? null,
      evaluations: slots,
      avgTotal,
    };
  });
}

// ── Colonnes table ───────────────────────────────────────────────────────────

const colHelper = createColumnHelper<PlanRow>();

const columns = [
  colHelper.accessor('referenceNumber', {
    id: 'referenceNumber',
    header: 'Référence',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm font-semibold text-gray-700">{getValue()}</span>
    ),
  }),
  colHelper.accessor('beneficiary', {
    id: 'beneficiary',
    header: 'Représentant',
    cell: ({ getValue }) => <span className="text-sm text-gray-700">{getValue()}</span>,
  }),
  colHelper.accessor('verifiedFundingAmount', {
    id: 'verifiedFundingAmount',
    header: 'Subv. totale',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-gray-700">{fmtUSD(getValue())}</span>
    ),
  }),
  colHelper.accessor('verifiedTotalProjectCost', {
    id: 'verifiedTotalProjectCost',
    header: 'Coût total',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-gray-700">{fmtUSD(getValue())}</span>
    ),
  }),
  colHelper.display({
    id: 'apport',
    header: 'Apport personnel',
    cell: ({ row }) => {
      const cost = row.original.verifiedTotalProjectCost;
      const funding = row.original.verifiedFundingAmount;
      return (
        <span className="whitespace-nowrap text-sm text-gray-700">
          {cost != null && funding != null ? fmtUSD(cost - funding) : '—'}
        </span>
      );
    },
  }),
  colHelper.accessor('avgTotal', {
    id: 'avgTotal',
    header: 'Moyenne /160',
    cell: ({ getValue }) => {
      const v = getValue();
      if (v == null) return <span className="text-gray-400">—</span>;
      const pct = (v / TOTAL_MAX) * 100;
      const color = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500';
      return (
        <span>
          <span className={`font-bold ${color}`}>{v.toFixed(2)}</span>
          <span className="text-xs text-gray-400">/{TOTAL_MAX}</span>
        </span>
      );
    },
  }),
];

// ── Export Excel ─────────────────────────────────────────────────────────────

function exportExcel(rows: PlanRow[]) {
  const data = rows.map((row) => {
    const slots = [...row.evaluations, null, null, null].slice(0, 3) as (Evaluation | null)[];

    const evaluatorCols: Record<string, any> = {};
    slots.forEach((ev, i) => {
      const prefix = `Éval. ${i + 1}`;
      evaluatorCols[`${prefix} — Évaluateur`] = ev ? evalName(ev) : '';
      evaluatorCols[`${prefix} — Total /160`] = ev ? +evalTotal(ev).toFixed(2) : '';
      evaluatorCols[`${prefix} — Recommandation`] = ev?.recommendation
        ? (RECO_LABELS[ev.recommendation] ?? ev.recommendation)
        : '';
    });

    const cost    = row.verifiedTotalProjectCost;
    const funding = row.verifiedFundingAmount;

    return {
      // ── Identifiants ──
      'Référence':        row.referenceNumber,
      'Code bénéficiaire': row.applicationCode,
      'Édition':           row.edition,
      'Statut candidature': row.status,
      'Lien plan d\'affaires': row.documentUrl ?? '',

      // ── Informations personnelles ──
      'Représentant':          row.beneficiary,
      'Email':                 row.email,
      'Téléphone':             row.phone,
      'Sexe':                  row.gender,
      'Date de naissance':     row.birthDate,
      'Âge':                   row.age ?? '',
      'Statut':                row.category,
      'Situation matrimoniale':row.maritalStatus,
      "Niveau d'éducation":    row.educationLevel,
      'Fonction':              row.position,
      'Province':              row.province,
      'Commune':               row.commune,
      'Quartier':              row.quartier,
      'Rue':                   row.rue,

      // ── Informations sur l'entreprise ──
      "Nom de l'entreprise":   row.companyName,
      "Type d'entreprise":     row.companyType,
      'Statut légal':          row.legalStatus,
      'NIF':                   row.taxIdNumber,
      "Secteur d'activité":    row.companySector,
      "Date de création":      row.companyCreationDate,
      'Employés permanents':   row.permanentEmployees ?? '',
      'Employés total':        row.totalEmployees     ?? '',
      'CA N-1 (BIF)':          row.revenueYearN1      ?? '',
      'Tél. entreprise':       row.companyPhone,
      'Email entreprise':      row.companyEmail,

      // ── Informations sur le projet ──
      'Titre du projet':             row.projectTitle,
      'Coût total demandé (BIF)':    row.totalProjectCostRequested ?? '',
      'Subvention demandée (BIF)':   row.requestedSubsidyAmount    ?? '',
      'Femmes prévues':              row.plannedWomen ?? '',
      'Hommes prévus':               row.plannedMen   ?? '',

      // ── Évaluations ──
      ...evaluatorCols,
      'Moyenne /160': row.avgTotal != null ? +row.avgTotal.toFixed(2) : '',
      '% moyen':      row.avgTotal != null ? +((row.avgTotal / TOTAL_MAX) * 100).toFixed(2) : '',

      // ── Financement vérifié ──
      'Subv. investissement vérifiée (USD)': row.verifiedInvestmentSubsidy  ?? '',
      'Subv. exploitation vérifiée (USD)':   row.verifiedExploitationSubsidy ?? '',
      'Ratio exploitation (%)': row.verifiedExploitationSubsidy != null && funding != null && funding > 0
        ? +((row.verifiedExploitationSubsidy / funding) * 100).toFixed(1) : '',
      'Subvention totale vérifiée (USD)': funding ?? '',
      'Coût total vérifié (USD)':         cost    ?? '',
      'Apport personnel (USD)': cost != null && funding != null ? +(cost - funding).toFixed(2) : '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Notes');
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace('T', '_').replace(':', 'h').replace(':', '');
  XLSX.writeFile(wb, `toutes-les-notes_${stamp}.xlsx`);
}

// ── Composant ────────────────────────────────────────────────────────────────

export default function AllEvaluationsPage() {
  const [editionId, setEditionId] = useState<number | undefined>(undefined);
  const [isExportingDossiers, setIsExportingDossiers] = useState(false);

  const { data: evaluations = EMPTY_EVALUATIONS, isLoading } = useAllEvaluations(editionId);

  const rows = useMemo(() => buildRows(evaluations), [evaluations]);

  const handleDownloadDossiers = async () => {
    setIsExportingDossiers(true);
    try {
      const blob = await evaluateurApi.exportDossiersZip(editionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dossiers-candidats_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast.error('Erreur lors du téléchargement des dossiers');
    } finally {
      setIsExportingDossiers(false);
    }
  };

  const { table, setData } = useTanStackTable<PlanRow>({
    tableData: rows,
    columnConfig: columns,
  });

  useEffect(() => { setData(rows); }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Toutes les notes</h1>
          {!isLoading && (
            <Text className="text-sm text-gray-500 mt-0.5">{rows.length} plan(s)</Text>
          )}
        </div>
        <div className="flex items-center gap-3">
          <CohortSelect value={editionId} onChange={setEditionId} />
          <Button
            variant="outline"
            onClick={() => exportExcel(rows)}
            disabled={rows.length === 0}
            className="flex items-center gap-2 h-9"
          >
            <PiMicrosoftExcelLogoDuotone className="size-5 text-green-600" />
            Exporter Excel
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadDossiers}
            disabled={rows.length === 0}
            isLoading={isExportingDossiers}
            className="flex items-center gap-2 h-9"
          >
            <PiFolderOpen className="size-5 text-primary-600" />
            Télécharger les dossiers (ZIP)
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader variant="spinner" size="lg" />
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
          <PiWarning className="mb-3 size-10 text-amber-400" />
          <Text className="text-base font-medium text-gray-700">Aucune évaluation trouvée</Text>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="rounded-xl border border-muted">
          <Table table={table} variant="modern" />
          <TablePagination table={table} className="p-4" />
        </div>
      )}
    </div>
  );
}
