'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ActionIcon, Badge, Flex, Input, Text, Tooltip } from 'rizzui';
import { PiEye, PiMagnifyingGlassBold } from 'react-icons/pi';
import { createColumnHelper } from '@tanstack/react-table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { useBusinessPlans } from '@/lib/api/hooks/use-business-plan';
import { useMyEvaluations } from '@/lib/api/hooks/use-evaluateurs';
import { routes } from '@/config/routes';
import type { BusinessPlan } from '@/lib/api/endpoints/business-plan.api';

const STATUS_META: Record<string, { label: string; dot: string; text: string }> = {
  DRAFT:            { label: 'Brouillon',             dot: 'bg-gray-400',    text: 'text-gray-500' },
  SUBMITTED:        { label: 'Soumis',                dot: 'bg-blue-500',    text: 'text-blue-600' },
  UNDER_EVALUATION: { label: "En cours d'évaluation", dot: 'bg-orange-dark', text: 'text-orange-dark' },
  EVALUATED:        { label: 'Évalué',                dot: 'bg-green-dark',  text: 'text-green-dark' },
  SELECTED:         { label: 'Sélectionné',           dot: 'bg-green-dark',  text: 'text-green-dark' },
  REJECTED:         { label: 'Rejeté',                dot: 'bg-red-dark',    text: 'text-red-dark' },
};

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const LIMIT = 20;

const columnHelper = createColumnHelper<BusinessPlan>();

const columns = [
  columnHelper.accessor('referenceNumber', {
    id: 'referenceNumber',
    header: 'Référence',
    cell: ({ getValue, row }) => (
      <span className="font-mono text-sm font-semibold text-gray-700">
        {getValue() || `#${row.original.id}`}
      </span>
    ),
  }),
  columnHelper.accessor('status', {
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
  columnHelper.accessor('submittedAt', {
    id: 'submittedAt',
    header: 'Soumis le',
    cell: ({ getValue }) => (
      <span className="text-xs text-gray-500">{fmtDate(getValue())}</span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row, table: t }) => (
      <div className="flex justify-end">
        <Tooltip content="Voir le détail" placement="top">
          <ActionIcon
            size="sm"
            variant="outline"
            onClick={() => (t.options.meta as any)?.onView?.(row.original)}
          >
            <PiEye className="size-4" />
          </ActionIcon>
        </Tooltip>
      </div>
    ),
  }),
];

export default function BusinessPlansList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBusinessPlans({ search: search || undefined, page, limit: LIMIT });
  const { data: myEvaluations = [] } = useMyEvaluations();

  const plans = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const evaluatedIds = useMemo(
    () => new Set(myEvaluations.map((e) => e.businessPlanId)),
    [myEvaluations]
  );

  const { table, setData } = useTanStackTable<BusinessPlan>({
    tableData: plans,
    columnConfig: columns,
    options: {
      manualPagination: true,
      pageCount: totalPages,
      initialState: { pagination: { pageIndex: 0, pageSize: LIMIT } },
      meta: { onView: (plan: BusinessPlan) => router.push(routes.businessPlans.details(plan.id)) },
      onPaginationChange: (updater: any) => {
        const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: LIMIT }) : updater;
        setPage(next.pageIndex + 1);
      },
    } as any,
  });

  useEffect(() => {
    setData(plans);
  }, [plans]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Rechercher par référence..."
          value={search}
          onClear={() => { setSearch(''); setPage(1); }}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          inputClassName="h-9"
          clearable
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="flex-1 max-w-lg"
        />
        <Text className="text-sm text-gray-500">{total} plan(s) d'affaires</Text>
      </div>

      <Table
        table={table}
        variant="modern"
        isLoading={isLoading}
        classNames={{
          container: 'border border-muted rounded-md border-t-0',
          rowClassName: (row: any) =>
            `last:border-0 ${evaluatedIds.has(row.original.id) ? 'bg-green-50' : ''}`,
        }}
      />
      <TablePagination table={table} className="mt-4" />
    </div>
  );
}
