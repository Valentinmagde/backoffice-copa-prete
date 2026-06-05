'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Loader, Text, Select, Button } from 'rizzui';
import { PiMicrosoftExcelLogoDuotone, PiWarning } from 'react-icons/pi';
import { createColumnHelper } from '@tanstack/react-table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { useAllEvaluations } from '@/lib/api/hooks/use-evaluateurs';
import { useCohorts } from '@/lib/api/hooks/use-cohorts';
import { SCORE_CRITERIA, TOTAL_MAX, RECOMMENDATION_OPTIONS } from '@/lib/api/types/evaluateur.types';
import type { Evaluation } from '@/lib/api/types/evaluateur.types';

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
  referenceNumber: string;
  beneficiary: string;
  companyName: string;
  gender: string;
  category: string;
  age: number | null;
  province: string;
  commune: string;
  rue: string;
  quartier: string;
  plannedWomen: number | null;
  plannedMen: number | null;
  edition: string;
  evaluations: Evaluation[];
  avgTotal: number | null;
  verifiedInvestmentSubsidy: number | null;
  verifiedExploitationSubsidy: number | null;
  verifiedFundingAmount: number | null;
  verifiedTotalProjectCost: number | null;
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
    const u = bp?.beneficiary?.user;
    return {
      businessPlanId: id,
      referenceNumber: bp?.referenceNumber ?? `#${id}`,
      beneficiary: u ? `${u.firstName} ${u.lastName}` : '—',
      companyName: bp?.beneficiary?.company?.companyName ?? bp?.projectTitle ?? '—',
      gender: bp?.beneficiary?.user?.gender?.code === 'M' ? 'Masculin' : bp?.beneficiary?.user?.gender?.code === 'F' ? 'Féminin' : '—',
      category: bp?.beneficiary?.category === 'REFUGEE' ? 'Réfugié(e)' : bp?.beneficiary?.category === 'BURUNDIAN' ? 'Burundais(e)' : bp?.beneficiary?.category === 'OTHER' ? 'Autre' : '—',
      age: (() => {
        const bd = bp?.beneficiary?.user?.birthDate;
        if (!bd) return null;
        const diff = Date.now() - new Date(bd).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      })(),
      province: bp?.beneficiary?.user?.primaryAddress?.commune?.province?.name ?? '—',
      commune:  bp?.beneficiary?.user?.primaryAddress?.commune?.name ?? '—',
      rue:      bp?.beneficiary?.user?.primaryAddress?.street ?? '—',
      quartier: bp?.beneficiary?.user?.primaryAddress?.neighborhood ?? '—',
      plannedWomen: bp?.beneficiary?.plannedEmployeesFemale ?? null,
      plannedMen: bp?.beneficiary?.plannedEmployeesMale ?? null,
      edition: bp?.copaEdition?.name ?? '—',
      evaluations: slots,
      avgTotal,
      verifiedInvestmentSubsidy: bp?.verifiedInvestmentSubsidy ?? null,
      verifiedExploitationSubsidy: bp?.verifiedExploitationSubsidy ?? null,
      verifiedFundingAmount: bp?.verifiedFundingAmount ?? null,
      verifiedTotalProjectCost: bp?.verifiedTotalProjectCost ?? null,
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

    const cost = row.verifiedTotalProjectCost;
    const funding = row.verifiedFundingAmount;

    return {
      'Référence': row.referenceNumber,
      'Représentant': row.beneficiary,
      "Nom de l'entreprise": row.companyName,
      'Sexe': row.gender,
      'Statut': row.category,
      'Âge': row.age ?? '',
      'Province': row.province,
      'Commune': row.commune,
      'Rue': row.rue,
      'Quartier': row.quartier,
      'Nb. femmes prévues': row.plannedWomen ?? '',
      'Nb. hommes prévus': row.plannedMen ?? '',
      ...evaluatorCols,
      'Moyenne /160': row.avgTotal != null ? +row.avgTotal.toFixed(2) : '',
      '% moyen': row.avgTotal != null ? +((row.avgTotal / TOTAL_MAX) * 100).toFixed(2) : '',
      'Subv. investissement (USD)': row.verifiedInvestmentSubsidy ?? '',
      'Subv. exploitation (USD)': row.verifiedExploitationSubsidy ?? '',
      'Ratio exploitation (%)': row.verifiedExploitationSubsidy != null && row.verifiedFundingAmount != null && row.verifiedFundingAmount > 0
        ? +((row.verifiedExploitationSubsidy / row.verifiedFundingAmount) * 100).toFixed(1)
        : '',
      'Subvention totale (USD)': funding ?? '',
      'Coût total vérifié (USD)': cost ?? '',
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

  const { data: evaluations = [], isLoading } = useAllEvaluations(editionId);
  const { data: cohortsData } = useCohorts();

  const editionOptions = useMemo(() => {
    const editions = cohortsData?.data ?? [];
    return [
      { label: 'Toutes les éditions', value: '' },
      ...editions.map((e: any) => ({ label: e.name, value: String(e.id) })),
    ];
  }, [cohortsData]);

  const rows = useMemo(() => buildRows(evaluations), [evaluations]);

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
          <Select
            options={editionOptions}
            value={editionId != null ? String(editionId) : ''}
            onChange={(v: any) => setEditionId(v ? +v : undefined)}
            className="w-52"
            selectClassName="h-9 text-sm"
          />
          <Button
            variant="outline"
            onClick={() => exportExcel(rows)}
            disabled={rows.length === 0}
            className="flex items-center gap-2 h-9"
          >
            <PiMicrosoftExcelLogoDuotone className="size-5 text-green-600" />
            Exporter Excel
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
