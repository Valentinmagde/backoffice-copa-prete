'use client';

import { usersData } from '@/data/users-data';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import { usersColumns } from './columns';
import Table from '@core/components/table';
import TableFooter from '@core/components/table/footer';
import TablePagination from '@core/components/table/pagination';
import Filters from './filters';
import { useEffect, useState } from 'react';
import { UsersFilters } from '@/lib/api/types/users.types';
import { useAdminStaff, useDeleteUser, useDeleteUsers } from '@/lib/api/hooks/use-users';

export type UsersTableDataType = (typeof usersData)[number];

export default function UsersTable() {
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 10,
    search: '',
  });

  const { data, isLoading } = useAdminStaff(filters);
  const { mutate: deleteUser }  = useDeleteUser();
  const { mutate: deleteUsers } = useDeleteUsers();

  const { table, setData } = useTanStackTable<UsersTableDataType>({
    tableData: data?.data ?? [],
    columnConfig: usersColumns,
    options: {
      initialState: {
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
      },
      meta: {
        handleDeleteRow: (row) => {
          setData((prev) => prev.filter((r) => r.id !== row.id));
          table.resetRowSelection();
        },
        handleMultipleDelete: (rows) => {
          setData((prev) => prev.filter((r) => !rows.includes(r)));
          table.resetRowSelection();
        },
      },
      globalFilterFn: (row, columnId, filterValue) => {
        const fullName = `${row.original.firstName} ${row.original.lastName}`.toLowerCase();

        return fullName.includes(filterValue.toLowerCase());
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
