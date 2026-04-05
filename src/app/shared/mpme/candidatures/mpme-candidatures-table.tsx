'use client';

import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import Table from '@core/components/table';
import TablePagination from '@core/components/table/pagination';
import { TableVariantProps } from 'rizzui';
import { useEffect } from 'react';
import { MPMECandidature, MPMEFilters } from '@/lib/api/types/mpme.types';
import { candidatesColumns } from './columns';
import Filters from './mpme-candidatures-filters';

export default function MPMECandidaturesTable({
  data,
  isLoading,
  className,
  variant = 'modern',
  hideFilters = false,
  hidePagination = false,
  totalItems,
  onPaginationChange,
  pagination,
  totalPages,
  filters,
  onFilterChange,
  onResetFilters,
}: {
  data: MPMECandidature[];
  isLoading?: boolean;
  className?: string;
  hideFilters?: boolean;
  hidePagination?: boolean;
  variant?: TableVariantProps;
  totalItems?: number;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  pagination: {
    pageIndex: number;
    pageSize: number;
  },
  totalPages?: number;
  filters?: MPMEFilters;
  onFilterChange?: (f: Partial<MPMEFilters>) => void;
  onResetFilters?: () => void;
}) {
  const { table, setData } = useTanStackTable<MPMECandidature>({
    tableData: data,
    columnConfig: candidatesColumns(false),
    options: {
      initialState: {
        pagination: {
          pageIndex: pagination?.pageIndex || 0,
          pageSize: pagination?.pageSize || 10,
        },
      },
      manualPagination: !!onPaginationChange,
      pageCount: totalPages,
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
        },
      },
      enableColumnResizing: false,
      onPaginationChange: (updater) => {
        if (!onPaginationChange) return;
        const current = table.getState().pagination;
        const next = typeof updater === 'function' ? updater(current) : updater;
        // ✅ On passe l'objet entier, cohérent avec handlePaginationChange du parent
        onPaginationChange({ pageIndex: next.pageIndex, pageSize: next.pageSize });
      },
    },
  });

  // Mettre à jour les données quand elles changent
  useEffect(() => {
    setData(data);
  }, [data]);

  useEffect(() => {
    if (pagination) {
      table.setPageIndex(pagination.pageIndex);
      table.setPageSize(pagination.pageSize);
    }
  }, [pagination?.pageIndex, pagination?.pageSize]);

  return (
    <div className={className}>
      {!hideFilters && (
        <Filters
          table={table}
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      )}
      <Table
        table={table}
        variant={variant}
        isLoading={isLoading}
        classNames={{
          container: 'border border-muted rounded-md border-t-0',
          rowClassName: 'last:border-0',
        }}
      />
      {!hidePagination && (
        <TablePagination
          table={table}
          className="py-4"
          // total={totalItems}
          // showTotal={true}
        />
      )}
    </div>
  );
}