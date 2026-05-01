'use client';

import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { cohortsColumns } from './columns';
import Table from '@core/components/table';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { useEffect, useState } from 'react';
import { useCohorts, useDeleteCohort } from '@/lib/api/hooks/use-cohorts';

export type CohortDataType = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  participantCount: number;
  createdAt: string;
};

export default function CohortsTable() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: '',
  });

  const { data, isLoading } = useCohorts(filters);
  const { mutate: deleteCohort } = useDeleteCohort();

  const { table, setData } = useTanStackTable<CohortDataType>({
    tableData: data?.data ?? [],
    columnConfig: cohortsColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: (row) => {
          deleteCohort(row.id, {
            onSuccess: () => {
              setData((prev) => prev.filter((r) => r.id !== row.id));
              table.resetRowSelection();
            },
          });
        },
        handleMultipleDelete: (rows) => {
          const ids = rows.map((row) => row.id);
          // Appel API pour suppression multiple
          setData((prev) => prev.filter((r) => !ids.includes(r.id)));
          table.resetRowSelection();
        },
      },
      enableColumnResizing: false,
    },
  });

  useEffect(() => {
    if (data?.data) setData(data.data);
  }, [data?.data]);

  return (
    <div className="mt-14">
      <Filters table={table} />
      <Table
        table={table}
        variant="modern"
        isLoading={isLoading}
        classNames={{
          container: 'border border-muted rounded-md',
          rowClassName: 'last:border-0',
        }}
      />
      <TableFooter table={table} />
      <TablePagination table={table} className="py-4" />
    </div>
  );
}