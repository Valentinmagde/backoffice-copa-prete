'use client';

import { useEffect, useState } from 'react';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { publicDocumentsColumns } from './columns';
import Table from '@core/components/table';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import {
  usePublicDocuments,
  useDeletePublicDocument,
} from '@/lib/api/hooks/use-public-documents';
import type { PublicDocument } from '@/lib/api/types/public-documents.types';

export default function PublicDocumentsTable() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
  });

  const { data, isLoading } = usePublicDocuments(filters);
  const { mutate: deleteDocument } = useDeletePublicDocument();

  const { table, setData } = useTanStackTable<PublicDocument>({
    tableData: data?.data ?? [],
    columnConfig: publicDocumentsColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: (row) => {
          deleteDocument(row.id, {
            onSuccess: () => {
              setData((prev) => prev.filter((r) => r.id !== row.id));
              table.resetRowSelection();
            },
          });
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
      <Filters
        table={table}
        category={filters.category}
        onCategoryChange={(category) =>
          setFilters((prev) => ({ ...prev, category, page: 1 }))
        }
      />
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
