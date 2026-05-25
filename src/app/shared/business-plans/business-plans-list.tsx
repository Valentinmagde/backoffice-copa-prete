'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ActionIcon, Badge, Flex, Input, Text, Tooltip } from 'rizzui';
import { PiEye, PiMagnifyingGlassBold, PiShieldCheck } from 'react-icons/pi';
import { createColumnHelper } from '@tanstack/react-table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { useBusinessPlans, useAnonymizeBusinessPlan } from '@/lib/api/hooks/use-business-plan';
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

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const LIMIT = 20;

const columnHelper = createColumnHelper<BusinessPlan>();

const buildColumns = (onAnonymize: (id: number) => void, onView: (plan: BusinessPlan) => void) => [
  columnHelper.accessor('referenceNumber', {
    id: 'referenceNumber',
    header: 'Référence',
    cell: ({ getValue, row }) => (
      <span className="font-mono text-sm font-semibold text-gray-700">
        {getValue() || `#${row.original.id}`}
      </span>
    ),
  }),
  columnHelper.accessor('beneficiary', {
    id: 'beneficiary',
    header: 'Représentant',
    cell: ({ getValue }) => {
      const b = getValue();
      const fullName = b?.user ? `${b.user.firstName} ${b.user.lastName}` : null;
      return <span className="text-sm font-medium text-gray-800">{fullName ?? '—'}</span>;
    },
  }),
  columnHelper.accessor('beneficiary', {
    id: 'applicationCode',
    header: 'Code',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm font-semibold text-gray-700">
        {getValue()?.applicationCode ?? '—'}
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
      ) : (
        <span>—</span>
      );
    },
  }),
  columnHelper.accessor('submittedAt', {
    id: 'submittedAt',
    header: 'Soumis le',
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-gray-700">{fmtDate(getValue())}</span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex items-center justify-end gap-1">
          <Tooltip
            content={plan.isAnonymized ? "Annuler l'anonymisation" : 'Marquer comme anonymisé'}
            placement="top"
          >
            <ActionIcon
              size="sm"
              variant="outline"
              className={plan.isAnonymized ? 'text-blue-600 hover:text-blue-800' : 'text-gray-500 hover:text-primary-600'}
              onClick={() => onAnonymize(plan.id)}
            >
              <PiShieldCheck className="size-4" />
            </ActionIcon>
          </Tooltip>
          <Tooltip content="Voir le détail" placement="top">
            <ActionIcon size="sm" variant="outline" onClick={() => onView(plan)}>
              <PiEye className="size-4" />
            </ActionIcon>
          </Tooltip>
        </div>
      );
    },
  }),
];

export default function BusinessPlansList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: LIMIT });

  const { data, isLoading, isFetching } = useBusinessPlans({
    search: search || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const { mutate: anonymize } = useAnonymizeBusinessPlan();

  const plans = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / pagination.pageSize));

  const columns = useMemo(
    () =>
      buildColumns(
        (id) => anonymize(id),
        (plan) => router.push(routes.businessPlans.details(plan.id)),
      ),
    [anonymize, router],
  );

  const { table, setData } = useTanStackTable<BusinessPlan>({
    tableData: plans,
    columnConfig: columns,
    options: {
      manualPagination: true,
      pageCount: totalPages,
      initialState: { pagination },
      onPaginationChange: (updater: any) => {
        setPagination((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          return next;
        });
      },
    } as any,
  });

  useEffect(() => {
    setData(plans);
  }, [plans]);

  useEffect(() => {
    table.setPageIndex(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Rechercher par référence..."
          value={search}
          onClear={() => setSearch('')}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          inputClassName="h-9"
          clearable
          prefix={<PiMagnifyingGlassBold className="size-4" />}
          className="flex-1 max-w-lg"
        />
        {total > 0 && (
          <Text className="text-sm text-gray-500">{total} plan(s) d'affaires</Text>
        )}
      </div>

      <Table
        table={table}
        variant="modern"
        isLoading={isLoading || isFetching}
        classNames={{
          container: 'border border-muted rounded-md border-t-0',
          rowClassName: 'last:border-0',
          rowStyle: (row: any) => {
            if (row.original?.isAnonymized) return { backgroundColor: '#eff6ff' };
            return {};
          },
        }}
      />
      <TablePagination table={table} className="py-4" />
    </div>
  );
}
