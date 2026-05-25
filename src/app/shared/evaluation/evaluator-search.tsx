'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Text, Loader, Badge, Flex, ActionIcon, Tooltip } from 'rizzui';
import { PiMagnifyingGlassBold, PiClipboardText, PiArrowRight, PiCheckCircle } from 'react-icons/pi';
import { createColumnHelper } from '@tanstack/react-table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { useBusinessPlans } from '@/lib/api/hooks/use-business-plan';
import { useMyEvaluations } from '@/lib/api/hooks/use-evaluateurs';
import { TOTAL_MAX } from '@/lib/api/types/evaluateur.types';
import type { Evaluation } from '@/lib/api/types/evaluateur.types';
import { routes } from '@/config/routes';
import type { BusinessPlan } from '@/lib/api/endpoints/business-plan.api';

const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  DRAFT:            { label: 'Brouillon',             dot: 'bg-gray-400',   text: 'text-gray-500' },
  SUBMITTED:        { label: 'Soumis',                dot: 'bg-blue-500',   text: 'text-blue-600' },
  UNDER_EVALUATION: { label: "En cours d'évaluation", dot: 'bg-orange-400', text: 'text-orange-600' },
  EVALUATED:        { label: 'Évalué',                dot: 'bg-green-500',  text: 'text-green-700' },
  SELECTED:         { label: 'Sélectionné',           dot: 'bg-green-600',  text: 'text-green-800' },
  REJECTED:         { label: 'Rejeté',                dot: 'bg-red-500',    text: 'text-red-600' },
};

const fmtAmount = (n?: number | null) =>
  n != null ? `${Number(n).toLocaleString('fr-FR')} BIF` : '—';

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

// ── Colonnes table de recherche ──────────────────────────────────────────────

const planColumnHelper = createColumnHelper<BusinessPlan>();

const buildPlanColumns = (onEvaluate: (id: number) => void) => [
  planColumnHelper.accessor('referenceNumber', {
    id: 'referenceNumber',
    header: 'Référence',
    cell: ({ getValue, row }) => (
      <span className="font-mono text-sm font-semibold text-gray-700">
        {getValue() || `#${row.original.id}`}
      </span>
    ),
  }),
  planColumnHelper.accessor('projectTitle', {
    id: 'projectTitle',
    header: 'Titre',
    cell: ({ getValue }) => (
      <span className="max-w-xs truncate text-sm font-medium text-gray-800">{getValue() ?? '—'}</span>
    ),
  }),
  planColumnHelper.accessor('submittedAt', {
    id: 'submittedAt',
    header: 'Soumis le',
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-600">{fmtDate(getValue())}</span>
    ),
  }),
  planColumnHelper.accessor('beneficiary', {
    id: 'totalProjectCost',
    header: 'Coût total',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-gray-700">
        {fmtAmount(getValue()?.totalProjectCost)}
      </span>
    ),
  }),
  planColumnHelper.accessor('beneficiary', {
    id: 'requestedSubsidyAmount',
    header: 'Subvention demandée',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-gray-700">
        {fmtAmount(getValue()?.requestedSubsidyAmount)}
      </span>
    ),
  }),
  planColumnHelper.accessor('status', {
    id: 'status',
    header: 'Statut',
    cell: ({ getValue }) => {
      const status = getValue();
      const meta = status
        ? (STATUS_META[status.code] ?? { label: status.name, dot: 'bg-gray-400', text: 'text-gray-500' })
        : null;
      return meta ? (
        <Flex align="center" gap="2" className="w-auto">
          <Badge renderAsDot className={meta.dot} />
          <Text className={`font-medium ${meta.text}`}>{meta.label}</Text>
        </Flex>
      ) : <span>—</span>;
    },
  }),
  planColumnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Tooltip content="Évaluer ce plan" placement="top">
          <ActionIcon size="sm" variant="outline" onClick={() => onEvaluate(row.original.id)}>
            <PiArrowRight className="size-4" />
          </ActionIcon>
        </Tooltip>
      </div>
    ),
  }),
];

// ── Colonnes table mes évaluations ───────────────────────────────────────────

const evalColumnHelper = createColumnHelper<Evaluation>();

const buildEvalColumns = (onView: (businessPlanId: number) => void) => [
  evalColumnHelper.accessor('businessPlan', {
    id: 'referenceNumber',
    header: 'Référence',
    cell: ({ getValue, row }) => (
      <span className="font-mono text-sm font-semibold text-gray-700">
        {getValue()?.referenceNumber || `#${row.original.businessPlanId}`}
      </span>
    ),
  }),
  evalColumnHelper.accessor('businessPlan', {
    id: 'projectTitle',
    header: 'Titre',
    cell: ({ getValue }) => (
      <span className="max-w-xs truncate text-sm font-medium text-gray-800">
        {getValue()?.projectTitle ?? '—'}
      </span>
    ),
  }),
  evalColumnHelper.accessor('businessPlan', {
    id: 'totalProjectCost',
    header: 'Coût total',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-gray-700">
        {fmtAmount(getValue()?.beneficiary?.totalProjectCost)}
      </span>
    ),
  }),
  evalColumnHelper.accessor('businessPlan', {
    id: 'requestedSubsidyAmount',
    header: 'Subvention demandée',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-gray-700">
        {fmtAmount(getValue()?.beneficiary?.requestedSubsidyAmount)}
      </span>
    ),
  }),
  evalColumnHelper.accessor('totalScore', {
    id: 'totalScore',
    header: 'Score',
    cell: ({ getValue }) => {
      const score = getValue() ?? 0;
      const pct = Math.round((score / TOTAL_MAX) * 100);
      const color = pct >= 70 ? 'text-green-600' : pct >= 40 ? 'text-amber-500' : 'text-red-500';
      return (
        <span>
          <span className={`font-bold ${color}`}>{score}</span>
          <span className="text-xs text-gray-400">/{TOTAL_MAX}</span>
        </span>
      );
    },
  }),
  evalColumnHelper.accessor('evaluationDate', {
    id: 'evaluationDate',
    header: "Date d'évaluation",
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-gray-600">{fmtDate(getValue())}</span>
    ),
  }),
  evalColumnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Tooltip content="Voir le plan" placement="top">
          <ActionIcon size="sm" variant="outline" onClick={() => onView(row.original.businessPlanId)}>
            <PiArrowRight className="size-4" />
          </ActionIcon>
        </Tooltip>
      </div>
    ),
  }),
];

// ── Composant principal ───────────────────────────────────────────────────────

const LIMIT = 20;

export default function EvaluatorSearch() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [evalSearch, setEvalSearch] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: LIMIT });

  const { data, isLoading: loadingPlans, isFetching: fetchingPlans } = useBusinessPlans(
    search ? { search, page: pagination.pageIndex + 1, limit: pagination.pageSize } : undefined,
  );
  const { data: myEvaluationsData, isLoading: loadingMine } = useMyEvaluations();

  const plans = useMemo(
    () => (search ? (data?.data ?? []) : []),
    [search, data?.data],
  );
  const myEvaluations = useMemo(
    () => myEvaluationsData ?? [],
    [myEvaluationsData],
  );

  const filteredEvaluations = useMemo(() => {
    if (!evalSearch.trim()) return myEvaluations;
    const q = evalSearch.toLowerCase();
    return myEvaluations.filter((ev) => {
      const ref = (ev.businessPlan?.referenceNumber ?? String(ev.businessPlanId)).toLowerCase();
      const title = (ev.businessPlan?.projectTitle ?? '').toLowerCase();
      return ref.includes(q) || title.includes(q);
    });
  }, [myEvaluations, evalSearch]);
  const total = search ? (data?.total ?? 0) : 0;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  const planColumns = useMemo(
    () => buildPlanColumns((id) => router.push(routes.evaluation.evaluate(id))),
    [router],
  );
  const evalColumns = useMemo(
    () => buildEvalColumns((id) => router.push(routes.evaluation.evaluate(id))),
    [router],
  );

  const { table: planTable, setData: setPlanData } = useTanStackTable<BusinessPlan>({
    tableData: plans,
    columnConfig: planColumns,
    options: {
      manualPagination: true,
      pageCount: totalPages,
      initialState: { pagination },
      onPaginationChange: (updater: any) =>
        setPagination((prev) => (typeof updater === 'function' ? updater(prev) : updater)),
    } as any,
  });

  const { table: evalTable, setData: setEvalData } = useTanStackTable<Evaluation>({
    tableData: filteredEvaluations,
    columnConfig: evalColumns,
  });

  useEffect(() => { setPlanData(plans); }, [plans]);
  useEffect(() => { setEvalData(filteredEvaluations); }, [filteredEvaluations]);

  useEffect(() => {
    planTable.setPageIndex(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  return (
    <div className="space-y-10">
      {/* ── Recherche ── */}
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            type="search"
            placeholder="Rechercher par référence ou titre..."
            value={search}
            onClear={() => setSearch('')}
            onChange={(e) => setSearch(e.target.value)}
            inputClassName="h-9"
            clearable
            prefix={<PiMagnifyingGlassBold className="size-4" />}
            className="flex-1 max-w-lg"
          />
          {search && (
            <Text className="text-sm text-gray-500">{total} évaluation(s) trouvée(s)</Text>
          )}
        </div>

        {loadingPlans && search && (
          <div className="flex justify-center py-12">
            <Loader variant="spinner" />
          </div>
        )}

        {!search && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <PiMagnifyingGlassBold className="mb-3 size-10 text-gray-300" />
            <Text className="text-sm text-gray-500">
              Saisissez une référence ou un titre pour rechercher une évaluation
            </Text>
          </div>
        )}

        {!loadingPlans && !fetchingPlans && search && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center">
            <PiClipboardText className="mb-3 size-10 text-gray-300" />
            <Text className="text-sm text-gray-500">Aucune évaluation trouvée pour « {search} »</Text>
          </div>
        )}

        {search && (plans.length > 0 || fetchingPlans) && (
          <div className="rounded-xl border border-muted">
            <Table table={planTable} isLoading={loadingPlans || fetchingPlans} variant="modern" />
            <TablePagination table={planTable} className="p-4" />
          </div>
        )}
      </div>

      {/* ── Mes évaluations ── */}
      <div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <PiCheckCircle className="size-5 text-green-500" />
            <h2 className="text-base font-semibold text-gray-700">Mes évaluations</h2>
            {myEvaluations.length > 0 && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                {myEvaluations.length}
              </span>
            )}
          </div>
          {myEvaluations.length > 0 && (
            <Input
              type="search"
              placeholder="Filtrer par référence ou titre..."
              value={evalSearch}
              onClear={() => setEvalSearch('')}
              onChange={(e) => setEvalSearch(e.target.value)}
              inputClassName="h-9"
              clearable
              prefix={<PiMagnifyingGlassBold className="size-4" />}
              className="flex-1 max-w-sm"
            />
          )}
          {evalSearch && (
            <Text className="text-sm text-gray-500">{filteredEvaluations.length} résultat(s)</Text>
          )}
        </div>

        {loadingMine && (
          <div className="flex justify-center py-10">
            <Loader variant="spinner" />
          </div>
        )}

        {!loadingMine && myEvaluations.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
            <PiClipboardText className="mb-3 size-10 text-gray-300" />
            <Text className="text-sm text-gray-500">Vous n'avez pas encore évalué de plan d'affaires</Text>
          </div>
        )}

        {!loadingMine && myEvaluations.length > 0 && (
          <div className="rounded-xl border border-muted">
            <Table table={evalTable} isLoading={loadingMine} variant="modern" />
            <TablePagination table={evalTable} className="p-4" />
          </div>
        )}
      </div>
    </div>
  );
}
